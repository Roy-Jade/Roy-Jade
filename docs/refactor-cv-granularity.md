# Refactor CV — granularité d'affichage sans re-fetch

**Statut :** logique et accessibilité implémentées et vérifiées (compilation, lint, tests backend, scénarios manuels via navigateur piloté). CSS/mise en forme volontairement pas traité — voir "Design restant" en bas de fichier.

## Objectif

Le CV filtré ramène souvent trop de données pour tenir sur une page, sans permettre de choisir précisément quoi afficher (ex: masquer Node/Express pour un poste Python/IA, ou choisir quelles 3 expériences parmi 6 matchant les filtres). Le but : garder le dégrossissage serveur actuel, ajouter une sélection fine côté front qui n'entraîne aucun appel réseau supplémentaire.

## Principe retenu

- Les filtres serveur existants (`domain`, `type`, `level`, `category`, `context`) ne changent pas — ils réduisent le volume avant que ça arrive en mémoire front. Nécessaire : la volumétrie peut monter fort (CV d'un profil senior).
- Au-dessus, une couche de sélection fine front : des tableaux d'IDs **masqués** stockés dans l'URL, à côté des filtres existants.

## Pourquoi une blacklist (IDs masqués) plutôt qu'une whitelist (IDs affichés)

- **Whitelist** : lien partagé garanti stable dans le temps (immunisé aux ajouts futurs en base), mais il faut ajouter manuellement chaque nouvel item pertinent à la liste.
- **Blacklist** : URL plus courte par défaut, comportement naturel ("tout ce qui matche les filtres s'affiche, sauf ce que j'ai explicitement masqué"), mais un lien déjà envoyé peut légèrement changer si de nouvelles données matchant les mêmes filtres sont ajoutées après l'envoi.
- Décision : **blacklist**. Risque jugé maîtrisé — ajout de hardskills fréquent mais impact négligeable (peu de chances de surcharger la page) ; ajout d'expériences/formations rare, et très improbable de tomber dans la fenêtre entre l'envoi d'un lien et sa lecture par un recruteur.
- Rejeté : marqueur temporel de figeage du lien — jugé overengineering pour ce projet.

## Convention de nommage

`hidden[Type]Ids` — un tableau plat d'IDs par type de donnée. Un seul mécanisme partout : présence dans la liste = masqué. Pas de booléen séparé, pas de tableau de tableaux (y compris pour la description d'une expérience : `hiddenExperienceDescriptionIds` traite la présence de l'id de l'expérience comme un signal de masquage, au lieu d'un champ booléen dédié).

## Tableaux prévus

- `hiddenExperienceIds` — expérience entière masquée
- `hiddenExperienceDescriptionIds` — description d'une expérience masquée
- `hiddenExperienceTaskIds` — tâche masquée (`experience_task.id`)
- `hiddenExperienceHardskillIds` — tag hardskill masqué sur une expérience (voir "IDs de liaison" ci-dessous)
- `hiddenExperienceSoftskillIds` — tag softskill masqué sur une expérience (idem)
- `hiddenFormationIds` — formation entière masquée
- `hiddenFormationDescriptionIds` — description d'une formation masquée (symétrie avec l'expérience ajoutée après coup — omission repérée en cours d'implémentation, pas une différence voulue)
- `hiddenFormationTaskIds` — tâche masquée (`formation_task.id`)
- `hiddenFormationHardskillIds` — tag hardskill masqué sur une formation (idem, pas de softskill sur formation)
- `hiddenHardskillIds` — hardskill masqué dans la liste "Compétences" (CvAside), indépendant des tags par expérience/formation (voir décision Kubernetes ci-dessous)

`experience_task`/`formation_task` ont des séquences `SERIAL` indépendantes (deux tables distinctes) : leurs IDs peuvent coïncider, d'où deux tableaux séparés plutôt qu'un seul `hiddenTaskIds`.

## IDs de liaison — pourquoi c'est nécessaire (changement backend)

Les tags hardskill/softskill nichés dans une expérience/formation doivent être masquables **par occurrence**, pas globalement. Exemple concret motivant la décision : avoir fait du Kubernetes sur une expérience précise, sans que ça figure dans la liste globale des compétences maîtrisées (`hiddenHardskillIds` du CvAside).

- `hardskill`/`softskill` sont des tables globales, référencées via des tables de liaison (`experience_hardskill`, `experience_softskill`, `formation_hardskill`) qui ont chacune leur propre PK (`SERIAL`).
- Cette PK de liaison représente déjà exactement "ce skill sur cette expérience/formation précise" — on la réutilise comme identifiant plutôt que d'inventer une paire composite `(experience_id, hardskill_id)`.
- **Changement backend requis** : ni les tâches ni les hardskills/softskills nichés dans une expérience/formation n'exposent actuellement d'ID dans la réponse JSON. Vérifié dans `backend/src/service/cv/experienceService.ts` (`fetchExperience`, lignes ~21-32) : le `JSON_AGG`/`jsonb_build_object` ne contient que `content`/`position` pour les tâches, `slug`/`label`/`level`/`category`/`sub_category` pour les skills — confirmé aussi côté type (`frontend/src/types/Experience.ts`).

À ajouter :
- `task.id` dans le `jsonb_build_object` des tâches (`experience_task.id`, `formation_task.id`)
- l'ID de la ligne de liaison hardskill (alias type `hardexp.id`, i.e. `experience_hardskill.id` / `formation_hardskill.id`) dans le `jsonb_build_object` des hardskills nichés
- l'ID de la ligne de liaison softskill (alias type `softexp.id`, i.e. `experience_softskill.id`) dans le `jsonb_build_object` des softskills nichés

Aucun autre impact : pas de changement sur `addExperience`/`editExperience`, ni sur le pattern DELETE ALL + INSERT ALL des tables de liaison, ni sur la logique de filtrage SQL existante.

## Ce qui NE change PAS côté backend

Les tableaux `hidden[Type]Ids` ne sont **jamais envoyés au backend** — état d'affichage front pur, dérivé de l'URL. `cvApi.ts` construit déjà ses query strings explicitement par endpoint (pas de pass-through générique des `URLSearchParams`), donc aucun changement de schéma Zod, aucun risque de rejet de paramètre inconnu.

## Nettoyage prévu avec ce refactor

Suppression de `maxExperiences`/`maxFormations` et du `.slice()` associé (`CvExperiences.tsx`, `CvFormations.tsx`) — remplacés par le masquage par ID, qui règle le vrai problème (sélection explicite des items pertinents) plutôt que de tronquer par ancienneté.

## Interaction utilisateur (UI)

- Bouton "masquer" par item et sous-élément (expérience/formation entière, description, tâche, tag hardskill/softskill), affiché uniquement au survol/focus — jamais en permanence.
- **Accessibilité — décision actée :** pas de `aria-hidden` sur ces boutons (anti-pattern ARIA sur un élément focusable — règle axe-core `aria-hidden-focus` : le focus clavier resterait possible sans annonce, silence déroutant). Les items masquables (tâches, tags) sont structurés en vraies listes (`<ul>/<li>`), avec un bouton "masquer" en fin d'item façon chip amovible — pattern standard, bien supporté par les lecteurs d'écran. Le masquage visuel du bouton est purement CSS (`:hover`/`:focus-visible`), jamais retiré de l'arbre d'accessibilité. Un seul chemin d'interaction pour tout le monde, pas de parcours séparé clavier/AT vs souris.
- Panneau latéral (côté droit, masquable) listant les éléments actuellement masqués, groupés par catégorie (compétence/expérience/formation). Un sous-élément masqué s'affiche sous le nom de son expérience/formation parente. Permet de démasquer (le CV lui-même ne le permet pas une fois masqué).

## Panneau de démasquage

**Objectif** : seul moyen de réafficher un élément masqué (le CV lui-même ne le permet pas une fois masqué) — sans quoi il faudrait modifier l'URL à la main ou refaire un appel complet.

**Emplacement** : côté droit de la page, bouton d'ouverture/fermeture. Fermé par défaut. Désactivé (grisé, non déployable) tant que rien n'est masqué, avec une description accessible "aucun élément masqué à réafficher" (`aria-describedby`). Redevient actif dès qu'un élément est masqué quelque part.

**Hiérarchie d'affichage** — 3 buckets, avec regroupement par item parent :
- **Compétences** : uniquement les hardskills masqués depuis la liste aside (`hiddenHardskillIds`) — pas de parent, entrées à plat.
- **Expériences** / **Formations** : un item (expérience/formation) apparaît dans le panneau dès qu'un de ses éléments est masqué (lui-même ou l'un de ses sous-éléments) :
  - **Item entièrement masqué** (`hiddenExperienceIds`/`hiddenFormationIds`) → seul le nom + bouton "Afficher" (aucun sous-élément listé — les réafficher un par un n'aurait aucun effet visible tant que le parent reste masqué).
  - **Seulement des sous-éléments masqués** → nom de l'item sans bouton (en-tête de regroupement seulement), puis un en-tête de sous-type non interactif et légèrement grisé par sous-type présent ("Description", "Tâches", "Compétences techniques", "Compétences comportementales"), chacun listant ses entrées avec bouton "Afficher" individuel.
- Un item qui n'a plus aucun élément masqué disparaît du panneau (et de son bucket).

**Troncature du texte** : CSS pur (`text-overflow: ellipsis` / `-webkit-line-clamp`), pas de logique JS de calcul de longueur par largeur de fenêtre — le texte complet reste dans le DOM (accessible aux lecteurs d'écran même tronqué visuellement). Pas de bouton "voir plus" : le texte complet n'est visible qu'en réaffichant l'élément sur le CV lui-même. Valeurs exactes (nb de lignes, largeur) à régler avec le reste du CSS, plus tard.

**Réaffichage groupé** : un "tout réafficher" global en haut du panneau, un par bucket. Nécessite `clearIds` (utilitaire symétrique à `toggleId`, vide plusieurs clés de recherche d'un coup) plutôt que d'appeler `toggleHidden` en boucle.

**Source des données affichées** (titres, contenu de tâche, libellés — pas des IDs bruts) : extraction de hooks partagés `useExperienceData(filters)` / `useFormationData(domains)` / `useHardskillData(level, categories)`, avec les mêmes `queryKey` que `CvExperiences`/`CvFormations`/`CvAside` → le panneau lit le cache React Query existant, aucun appel réseau supplémentaire, aucune donnée remontée à un ancêtre commun.

**Accessibilité — gestion du focus (point critique)** : cliquer "Afficher" retire l'élément cliqué du DOM au re-render suivant (c'est le but de l'action) — le focus du navigateur, qui atterrit nativement sur le bouton cliqué avant l'exécution du `onClick`, se retrouve alors orphelin (repli sur `document.body` par défaut) si rien n'est fait. Ce n'est pas limité au dernier élément du panneau entier : réafficher le seul élément masqué d'un sous-type peut faire disparaître en cascade l'en-tête de sous-type, le nom de l'item, voire le bucket entier.

Stratégie retenue, un seul mécanisme réutilisé à tous les niveaux : au clic, calculer (avant le re-render) le premier ancêtre de la hiérarchie qui va **survivre** à la disparition de l'élément cliqué (en-tête de sous-type s'il reste d'autres entrées, sinon nom de l'item, sinon en-tête de bucket, sinon le bouton d'ouverture du panneau en dernier recours — cas déjà couvert par le repli automatique du panneau vide), et y déplacer le focus explicitement après le re-render (`useEffect`). Chaque en-tête de regroupement est une cible de focus programmable (`tabIndex={-1}` + ref), pas seulement les boutons interactifs.

**Statut** : implémenté et vérifié (compilation, lint, scénarios manuels — cascade complète, cascade partielle, réaffichage groupé par bucket et global). Mise en forme visuelle pas traitée, voir "Design restant" en bas de fichier.

## Design restant (session future)

Points de mise en forme repérés pendant les tests manuels, à traiter avec le reste du CSS, pas maintenant :

- **En-tête de bucket** (`CvHiddenBucket.tsx`, `CvHiddenPanel.tsx`) : le titre du bucket (Compétences/Expériences/Formations) et son bouton "Tout réafficher" doivent s'afficher sur la même ligne — même principe que les entrées masquées, qui ont déjà leur bouton "Afficher" adjacent. Actuellement les deux sont dans le même conteneur (`.cv-hidden-bucket__header`) mais s'affichent l'un sous l'autre faute de CSS (`<h3>` est block par défaut).
- **Icône pour les boutons "Afficher"** : `HoverAction` a déjà une icône pour "masquer" (`hide.svg`, un simple X). Pas encore d'équivalent pour "afficher" dans le panneau — à choisir (Lucide a probablement une convention établie, ex. icône "eye"). Label `aria-label` déjà en place quel que soit le choix visuel final.
- Troncature CSS du texte des entrées (`text-overflow`/`line-clamp`) — structure posée, valeurs pas encore réglées (cf. section "Panneau de démasquage" plus haut).
- Positionnement/CSS général du panneau (largeur, couleur active/inactive, transition d'ouverture) — rien de fait, structure HTML/logique uniquement.

## Lien avec la partie 2 (dashboard — pas commencée)

Le futur dashboard admin (rendu live + édition en place, cf. objectif initial du refactor) doit réutiliser une fenêtre quasi identique à celle du CV visiteur, avec des boutons "ajouter"/"éditer" affichés selon le même mécanisme que "masquer" (icône au survol/focus, même emplacement). **À prendre en compte dès l'implémentation de la partie 1** : le mécanisme d'affichage du bouton d'action au survol (pas l'action elle-même) doit être conçu comme un composant réutilisable généraliste plutôt que spécifique à "masquer", pour éviter de le reconstruire pour la partie 2.

## Repéré mais hors scope

Filtre `detail`/`summary` par domaine (expérience) : probablement redondant une fois le masquage par ID en place, mais nécessite un travail d'agrégation plus important. Ne pas traiter sans revalidation explicite avec l'utilisateur — voir aussi `CLAUDE.md` § Refactors futurs identifiés.

## Implémentation

- [x] Backend : IDs exposés (tâches, liaisons hardskill/softskill) dans `experienceService.ts` et `formationService.ts`, `API.md` mis à jour
- [x] Frontend : types (`ExperienceItem`, `FormationItem`, etc.) avec les nouveaux champs `id`
- [x] Frontend : nouveaux params dans `searchParams.ts` / parsing URL (`CV.tsx`)
- [x] Frontend : masquage top-level et interne câblés dans les 4 composants `CvSheet` enfants (`isHidden`, `toggleId`, `toggleHidden`)
- [x] Frontend : suppression de `maxExperiences`/`maxFormations` et du `.slice()` associé
- [x] Frontend : panneau de démasquage complet (`CvHiddenPanel`, `CvHiddenBucket`, `CvHiddenEntryList`), gestion du focus (`useFocusRegistry`), hooks de données partagés (`useExperienceData`/`useFormationData`/`useHardskillData`), réaffichage groupé (`clearIds`)
- [ ] Dashboard admin (`CvFilters`) : pas encore traité — à voir si une UI de masquage est nécessaire à ce stade, ou si ça se raccroche à la deuxième partie du refactor (prévisualisation dashboard, cf. conversation initiale)
- [ ] CSS/mise en forme — voir "Design restant" plus haut
