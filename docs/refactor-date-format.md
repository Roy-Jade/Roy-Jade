# Format de date forcé

**Statut : terminé** (branche `date-format`). Prérequis du chantier de génération de slug (`docs/refactor-slug-generation.md`), dont le budget du segment date (10 caractères) suppose ce format.

## Objectif

`experience.start_date`, `experience.end_date` et `formation.obtention_date` étaient des `VARCHAR` libres côté Zod (`z.string()`, aucune contrainte) — les fixtures de test utilisaient même des dates fantaisistes ("An 1872", thème Zelda/Forgotten Realms). Objectif : forcer un format `jj/mm/aaaa`, avec seulement l'année obligatoire (le jour nécessite le mois — formats valides : `aaaa`, `mm/aaaa`, `jj/mm/aaaa`).

## Décisions actées

1. **Saisie en trois champs séparés** (jour, mois, année), pas de sélecteur natif du navigateur. `<input type="date">` exige un jour+mois+année complets — incompatible avec la saisie partielle (année seule, mois+année) qu'on doit supporter. Composant `DateInput` (`frontend/src/functions/admin/components/DateInput/`), autonome, parse une chaîne `jj/mm/aaaa`/`mm/aaaa`/`aaaa` en trois champs et réassemble au changement — vidage automatique du jour si le mois est effacé (le jour seul n'a pas de sens).

2. **Stockage en base inchangé : `VARCHAR`, pas de type `DATE`.** Un vrai `DATE` Postgres ne peut pas représenter une date partielle. Contrainte `CHECK` ajoutée à la place (regex miroir de la validation Zod), sur `experience.start_date`, `experience.end_date`, `formation.obtention_date` dans `backend/conception/migration.sql`. Le tri par date (chantier séparé, pas encore fait) se fera en extrayant/parsant le texte brut applicativement, pas via une comparaison SQL native.

3. **Jour/mois tolérés avec ou sans zéro de tête à la saisie** (`3/2020` et `03/2020` acceptés), **normalisés en back** avant écriture en base (toujours 2 chiffres). Validation **purement formelle** (regex de forme), pas de vérification calendaire (pas de rejet de `31/02/2020` — jugé superflu pour un site à faible volume, saisi uniquement par l'admin).

4. **Affichage public du CV tronqué à `mm/aaaa` au maximum**, même si une date complète `jj/mm/aaaa` est enregistrée — le jour précis n'a pas d'utilité sur un CV professionnel. `formatDisplayDate` (`frontend/src/utils/formatDisplayDate.ts`) : `date.split('/').slice(-2).join('/')`, gère les trois précisions en une ligne (une date déjà à `mm/aaaa` ou `aaaa` ressort inchangée).

## Implémentation

**Back (`backend/`) :**
- `src/utils/normalizeDate.ts` (nouveau) — exporte `DATE_REGEX` (`^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{1,2}\/\d{4}$|^\d{4}$`, tolère 1 ou 2 chiffres en entrée) et `normalizeDate()` (ajoute le zéro de tête, laisse l'année intacte). Testé (`src/tests/utils/normalizeDate.test.ts`).
- `src/schema/cv/experience.ts` / `formation.ts` — `start_date`/`end_date`/`obtention_date` passent de `z.string().optional()` à `z.string().regex(DATE_REGEX, ...).transform(normalizeDate).optional()`. La validation **et** la normalisation se font en un seul passage Zod, au moment du `.parse()` dans les controllers — aucun changement nécessaire dans `experienceService.ts`/`formationService.ts`, ils reçoivent déjà la valeur normalisée.
- `conception/migration.sql` — `CHECK` ajouté sur les 3 colonnes, regex stricte (toujours 2 chiffres, puisque la normalisation applicative garantit ce format avant l'écriture) : `^\d{2}\/\d{2}\/\d{4}$|^\d{2}\/\d{4}$|^\d{4}$`.
- Fixtures de test (`experienceService.test.ts`, `formationService.test.ts`) — dates fantaisistes ("1396 DR", "An 1872") remplacées par leur seule partie numérique valide (année seule) ; ces tests mockent `db.query` donc ne passaient de toute façon pas par Zod, changement fait par cohérence avec le nouveau format réel.

**Front (`frontend/`) :**
- `functions/admin/components/DateInput/` — composant réutilisable, branché dans `ExperienceForm.tsx` (début/fin) et `FormationForm.tsx` (date d'obtention).
- `utils/formatDisplayDate.ts` — branché dans `ExperienceItem.tsx` et `FormationItem.tsx` (rendu public du CV).

**Non touché délibérément :** la contrainte `CHECK` n'a été ajoutée qu'à `migration.sql` (source de vérité pour une installation neuve) — **pas appliquée via `ALTER TABLE` sur la base de dev déjà initialisée**, puisque les données actuellement seedées ne respectent probablement pas encore ce format (l'utilisateur gère `seeding.sql`, gitignored, lui-même). Un `ALTER TABLE ... ADD CONSTRAINT` échouerait sur des lignes non conformes existantes. À appliquer une fois `seeding.sql` mis à jour — soit via reset complet du volume Postgres (le plus simple, `docker-entrypoint-initdb.d` rejoue `migration.sql` à la création), soit via un `ALTER TABLE` manuel une fois les données conformes.

## Vérification

`tsc` propre (front et back), suite de tests back : 216 passants / 3 échecs pré-existants sans rapport (`profileController.test.ts`, déjà connus d'une session précédente). Rechargement à chaud (front) et redémarrage (back, `tsx watch`) sans erreur sur tous les fichiers modifiés.

## Prochaine étape

Génération automatique des slugs (`docs/refactor-slug-generation.md`), dont ce chantier était le seul bloqueur.
