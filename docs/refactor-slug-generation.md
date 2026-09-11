# Génération automatique des slugs

**Statut : terminé.** Implémenté sur `cv-dashboard-refactor` à la suite du chantier "format de date forcé" (`docs/refactor-date-format.md`), qui débloquait le budget de caractères du segment date.

## Objectif (rappel de la demande initiale)

Le champ `slug` est aujourd'hui un simple `<input>` texte dans chaque formulaire d'ajout/édition (domaine, expérience, formation, hardskill, softskill, langue, loisir), sans aucune contrainte de format côté Zod (`z.string()` nu) — un utilisateur peut y taper n'importe quel caractère. Objectif : le générer côté back à partir d'autres champs déjà saisis, avec gestion des collisions (contrainte `VARCHAR(100) UNIQUE NOT NULL` en base sur les 7 tables concernées).

## Où le slug est réellement utilisé

Investigation faite avant de décider quoi que ce soit : le slug n'est lu/affiché ou utilisé pour une correspondance nulle part côté front, **sauf pour `domain`** — `domain.slug` est la valeur embarquée telle quelle dans les URLs de filtre du CV public (`CvFilters.tsx` : `experienceFilters`, `formationDomain`, valeurs de checkbox). Pour toutes les autres catégories, l'`id` numérique suffit déjà partout où le slug est aussi présent ; seul le tableau `domains: string[]` imbriqué dans une expérience/formation ne renvoie que des slugs (pas d'id), ce qui a motivé son usage dans la logique de résolution des formulaires — mais ça reste un usage interne, pas une exposition au visiteur.

## Décisions actées

1. **Séparateur : le tiret** (`-`), cohérent avec les slugs déjà en base (`academie-hyrule`, `temple-temps`) plutôt que l'underscore.

2. **Domaine : slug retiré du formulaire, généré depuis le libellé, ré-généré à chaque édition du libellé — instabilité acceptée.** Les domaines changent rarement (uniquement quand la nature de la carrière de l'admin évolue) et quand un libellé change (ex. "tech" → "front-end" pour laisser apparaître "back-end"/"devops"), l'ancien CV filtré par l'ancien slug devient de toute façon obsolète — un lien cassé a un impact jugé négligeable. Pas de mécanisme de gel/stabilisation du slug de domaine.

3. **Autres catégories (expérience, formation, hardskill, softskill, langue, loisir) : slug totalement retiré du formulaire front, généré uniquement en back.** Confirmé inutile côté client (voir section précédente).

4. **Champs agrégés par catégorie :**
   - `domain` : `label` seul.
   - `experience` : `title` + `company` (optionnel) + `end_date` (pas `start_date`, contrairement à la convention manuelle actuelle).
   - `formation` : `title` + `institution` (optionnel) + `obtention_date` (un seul champ date, pas d'ambiguïté).
   - `hardskill`, `softskill`, `language`, `hobby` : `label` seul.
   - Si un champ optionnel (`company`/`institution`) est absent, son segment **et** son séparateur sont omis (pas de double-tiret).

5. **Budget de caractères** (contrainte `VARCHAR(100)`) :
   - Titre : 60
   - Entreprise/établissement : 25
   - Date : 10 (suppose le format `DD/MM/YYYY` forcé du chantier date, voir dépendance ci-dessous)
   - Incrémental de collision : `-NN` (2 chiffres, jusqu'à 99 — au-delà jugé impossible en pratique : ni un CV ni une carrière ne comportent 99 expériences identiques finissant la même année dans la même entreprise)
   - Calcul du pire cas : `60 + 25 + 10 + 2 (séparateurs entre les 3 segments) + 3 ("-NN") = 100` — tient exactement dans la limite, y compris quand les 3 segments sont à leur maximum et qu'une collision survient au 99ᵉ essai.
   - Catégories à `label` seul (`domain`, `hardskill`, `softskill`, `language`, `hobby`) : pas de budget dédié discuté au départ — tranché en implémentation à 97 caractères (`100 - 3` pour `-NN`), même marge de sécurité que les autres catégories.

6. **Régénération à chaque `add` ET `edit`**, jamais figé après création — plus simple, sans risque puisque rien côté front ne dépend de la stabilité du slug (sauf domaine, dont l'instabilité est explicitement acceptée au point 2).

7. **Collision : vérification séquentielle simple**, pas d'extraction en masse ni de parsing du plus haut suffixe existant (jugé overengineering vu le volume du site — un site vitrine personnel, pas des milliers de lignes). Algorithme : générer le slug de base (sans suffixe), vérifier son existence (`SELECT 1 ... WHERE slug = $1`, indexé via la contrainte `UNIQUE`) ; si pris, essayer `-02`, `-03`... jusqu'au premier libre.

8. **Une fonction `slugify` unique, à paramètres facultatifs** (`label`, `title`, `company`, `date`, longueurs max par segment), réutilisée par les 7 services concernés plutôt que dupliquée — cohérent avec la préférence déjà actée pour les dispatchs/utilitaires centralisés ([[feedback_code_style]]).

## Point non décidé au départ : translittération des accents

Investigation faite avant d'écrire `slugify` : recherche de convention côté package npm `slugify` (mode `lower:true, strict:true` — normalisation Unicode NFD, suppression des marques diacritiques, minuscule forcée, tout non-alphanumérique remplacé par un tiret). Retenu tel quel mais **réimplémenté à la main** plutôt qu'ajouté comme dépendance (cohérent avec `normalizeDate.ts`, fait main lui aussi). Exemple : `"Développeur & Intégrateur Web"` → `developpeur-integrateur-web`.

## Implémentation

**Back (`backend/`) :**
- `src/utils/slugify.ts` (nouveau) — fonction pure `slugify({label?, title?, company?, date?})`. Normalisation par segment (NFD + suppression diacritiques + minuscule + non-alphanumérique→tiret + trim), troncature dure (pas de recul au dernier mot complet, jugé superflu — cas rarement atteint) à 60/25/10/97 caractères selon le segment. Testé (`src/tests/utils/slugify.test.ts`).
- `src/utils/generateUniqueSlug.ts` (nouveau) — vérification séquentielle de collision (`SELECT 1 FROM <table> WHERE slug = $1 [AND id != $2]`, essaie `-02`, `-03`...), whitelist des 7 tables autorisées (même logique de sécurité que `junctionTables.ts`). `excludeId` exclut la ligne éditée elle-même de la vérification de collision (sinon une édition qui ne change pas le slug se percuterait elle-même à chaque sauvegarde). Testé (`src/tests/utils/generateUniqueSlug.test.ts`).
- `schema/cv/{experience,formation,domain,skill,language,hobby}.ts` — champ `slug` retiré des 7 schémas Zod d'entrée. Le slug n'est donc plus accepté depuis le client ; toute valeur envoyée est silencieusement ignorée (comportement par défaut de Zod sur les clés inconnues d'un `z.object()`).
- `service/cv/{domain,hardskill,softskill,language,hobby}Service.ts` — `add`/`edit` : slug calculé via `slugify({label})` + `generateUniqueSlug`. En édition, recalculé **uniquement si `label` fait partie du payload** (pas de re-fetch systématique de la ligne existante à chaque édition, même sans rapport avec le libellé — plus simple, cohérent avec le refus déjà acté de l'approche "extraction en masse" pour les collisions).
- `service/cv/experienceService.ts` / `formationService.ts` — même logique, agrégeant `title` + `company`/`institution` (optionnel) + `end_date`/`obtention_date`. Recalculé si l'un des trois champs est présent dans le payload d'édition. **Hypothèse posée** : le formulaire front soumet toujours le bloc complet (pas de patch partiel d'un seul champ) — vérifié dans `ExperienceForm.tsx`/`FormationForm.tsx` (le `useEffect` de préremplissage charge tous les champs existants avant toute soumission), donc `title` est systématiquement présent dès qu'un champ source change. Si cette hypothèse devait changer (ex. futur formulaire d'édition rapide inline, un seul champ à la fois), il faudrait revoir cette logique (aller chercher la ligne actuelle en base pour compléter les segments manquants).

**Front (`frontend/`) :**
- `api/dashboardApi.ts` — `slug` retiré de `ExperienceInput`/`FormationInput` ; les types d'entrée POST/PATCH des 5 autres catégories passent de `Omit<X, 'id'>` à `Omit<X, 'id' | 'slug'>`. Les types de lecture (`Domain`, `Hardskill`, etc.) gardent `slug` inchangé — toujours renvoyé par le back, notamment pour `domain.slug` utilisé dans les filtres du CV public.
- Les 7 formulaires (`DomainForm`, `SoftskillForm`, `HardskillForm`, `LanguageForm`, `HobbyForm`, `ExperienceForm`, `FormationForm`) — champ `slug` retiré de `FormData`, du préremplissage, du payload envoyé, et de l'aperçu live (`onPreviewChange` utilise `existing?.slug ?? ''` comme valeur de substitution, puisque l'aperçu ne l'affiche jamais).

## Bug découvert au test utilisateur : cache front après renommage d'un domaine

Renommer le libellé d'un domaine (ex. "tech" → "technologie") régénère son slug (point 2). Deux effets constatés :

1. **Corrigé** — `DomainForm.tsx` n'invalidait que le cache `['filters']` après édition, jamais `['experience']`/`['formation']`. Une expérience taguée uniquement avec le domaine renommé devenait introuvable (le tableau de filtres envoyé au back contenait encore l'ancien slug) et son formulaire d'édition restait bloqué sur "Chargement…" — alors qu'une expérience taguée aussi avec un domaine non touché restait éditable (trouvée via ce second groupe de filtre). Fix : `DomainForm.tsx` invalide désormais aussi `['experience']` et `['formation']`.
2. **Corrigé** — bug distinct, repéré après le premier correctif : `CvFilters.tsx` (CV public) exposait le choix `detail`/`summary` par domaine via `setExperienceType(domain, type)`, qui ne faisait que `.map()` sur le tableau `experienceFilters` déjà présent dans l'URL — si aucune entrée n'existait pour ce slug de domaine (systématique après un renommage, puisque l'entrée figée dans l'URL référence l'ancien slug), le clic sur le radio ne modifiait rien, silencieusement. Les formations n'étaient pas concernées : `toggleFormationDomain` fonctionne sur une liste plate de slugs et ajoute l'entrée manquante au lieu de se contenter de mettre à jour une entrée existante. Fix : `setExperienceType` fait maintenant un upsert (ajoute l'entrée si absente) comme `toggleFormationDomain`.
3. **Non corrigé, risque accepté** — l'entrée `experienceFilters`/`formationDomain` initiale dans l'URL du CV public n'est jamais resynchronisée avec les slugs actuels une fois posée (seedée une seule fois au premier chargement). Un lien déjà partagé/en cache avec l'ancien slug d'un domaine renommé ne matche plus rien après un renommage (il reste juste un résidu inerte dans le tableau, sans crash). C'est le risque explicitement accepté en décision 2 ("un lien avec l'ancien slug devient obsolète") — confirmé plus large que prévu à l'origine (déclenché à chaque renommage, pas seulement en cas d'usage externe rare), mais l'utilisateur a choisi de ne pas le traiter maintenant.

## Vérification

`tsc` propre (front et back). Suite de tests back : 229 passants / 3 échecs pré-existants sans rapport (`profileController.test.ts`). `eslint` sur les fichiers touchés : aucun import/variable inutilisé ; les erreurs `set-state-in-effect` relevées sont un motif préexistant partagé par tous les formulaires du dossier (y compris `IdentityForm.tsx`, non touché par ce chantier) — hors périmètre.
