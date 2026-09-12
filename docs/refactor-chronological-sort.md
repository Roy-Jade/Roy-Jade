# Tri chronologique des expériences et formations

**Statut : terminé.**

## Objectif

Les expériences et formations étaient rendues dans l'ordre naturel de la requête SQL (pas d'`ORDER BY`, ordre proche de l'id). Objectif : trier par date de fin/obtention décroissante (plus récent en premier), un poste/formation toujours en cours (pas de date de fin) passant en tête.

## Décisions actées

1. **Tri applicatif, pas SQL.** `end_date`/`obtention_date` restent des `VARCHAR` à précision variable (`jj/mm/aaaa` | `mm/aaaa` | `aaaa`, voir `docs/refactor-date-format.md`) — un `ORDER BY` SQL sur le texte brut comparerait lexicographiquement, ce qui est faux entre précisions différentes. Le tri se fait en JS après récupération des lignes, comme anticipé dans le chantier date.
2. **Expériences : regroupées par type d'abord** (toutes les `detail` avant toutes les `summary`), **puis triées par date de fin décroissante à l'intérieur de chaque groupe.** Décision reprise du chantier dashboard (`docs/refactor-cv-dashboard-edit.md`), confirmée explicitement avant implémentation (un premier passage en tri plat, sans distinction de type, a été fait puis corrigé après vérification avec l'utilisateur).
3. **Formations : tri simple par date d'obtention décroissante**, pas de dimension type à regrouper (les formations n'ont pas de champ `type`).
4. **Poste/formation en cours (pas de date de fin) : en tête** du groupe, traité comme "le plus récent" — convention CV habituelle.
5. **Même tri partout** : CV public (`experienceService.fetchExperience`, `formationService.fetchFormation`) et liste du dashboard (`dashboardService.fetchDashboard`, `getDashboardOverview` — actuellement non consommée par le front, mais gardée cohérente si réutilisée un jour).

## Implémentation

`backend/src/utils/sortByDate.ts` (nouveau) :
- `compareByDateDesc(a, b)` — comparateur de deux dates au format `jj/mm/aaaa`/`mm/aaaa`/`aaaa` (ou `null`/`undefined`), converties en entier `aaaammjj` pour comparaison ; une date absente passe toujours avant une date renseignée.
- `sortByDateDesc(items, getDate)` — tri générique par date décroissante (formations).
- `sortByTypeThenDateDesc(items, getType, getDate)` — tri composite type (`detail` avant `summary`) puis date décroissante (expériences).

Branché dans `experienceService.fetchExperience`, `formationService.fetchFormation`, et les deux listes de `dashboardService.fetchDashboard`. Testé (`backend/src/tests/utils/sortByDate.test.ts`). Tests existants `experienceService.test.ts`/`formationService.test.ts` mis à jour (ordre des lignes attendu inversé pour refléter le tri).

## Bugs corrigés dans la foulée (découverts en testant le chantier slug)

Deux bugs distincts, révélés par le fait que le slug d'un domaine se régénère désormais à chaque édition (voir `docs/refactor-slug-generation.md`) — pas de lien direct avec le tri chronologique, mais corrigés dans la même session.

### Expérience de type `summary` impossible à éditer

`ExperienceForm.tsx` demande volontairement les deux types (`detail` et `summary`) pour chaque domaine, afin de pouvoir éditer n'importe quelle expérience indépendamment du filtre CV actuellement affiché. Mais `groupExperienceFilters.ts` utilisait une `Map<domaine, type>` — structure qui ne peut représenter qu'un seul type par domaine — avec une règle implicite "detail gagne toujours". Résultat : les expériences `summary` d'un domaine aussi demandé en `detail` n'étaient jamais récupérées, et leur formulaire d'édition restait bloqué sur "Chargement…".

**Fix :** `groupExperienceFilters.ts` réécrit pour permettre à un domaine d'apparaître dans les deux groupes de sortie (`detail` et `summary`) si les deux sont demandés. Sans effet sur le CV public (`CvFilters.tsx` n'envoie jamais qu'un seul type par domaine, via un bouton radio). 2 tests réécrits pour refléter le nouveau comportement (`detail` et `summary` coexistent), 1 test ajouté (dédoublonnage d'un même domaine demandé deux fois pour le même type).

### Le scroll ne suit pas jusqu'au formulaire pour domaine/identité/soft skill

Ces trois catégories ne sont pas rendues sur le CV — leur formulaire d'édition passe par un `<EditShell>` nu rendu en bas de `CV.tsx` (`menuOnlyEditing`), sans la logique de positionnement/scroll qu'utilisent les catégories ancrées sur le CV (`EditOverlay`/`useEditAnchor`, qui appelle `scrollIntoView`).

**Fix :** `EditShell.tsx` accepte désormais un `ref` (pattern React 19, comme les items de CV) transmis à sa `<section>` racine. `CV.tsx` lui passe un `ref` stable qui appelle `scrollIntoView({behavior:'smooth', block:'center'})`, et ajoute une `key` unique par cible d'édition (`category-mode-itemId`) pour forcer un remount (donc un nouvel appel du `ref`) à chaque changement de cible, même sans fermeture intermédiaire.

## Vérification

`tsc` propre (back). Suite de tests back : 239 passants / 3 échecs pré-existants sans rapport (`profileController.test.ts`).
