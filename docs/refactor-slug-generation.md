# Génération automatique des slugs

**Statut :** décisions actées, implémentation pas commencée. Le chantier "format de date forcé" (voir plus bas) est désormais **terminé** (`docs/refactor-date-format.md`) — plus rien ne bloque le démarrage de celui-ci.

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

6. **Régénération à chaque `add` ET `edit`**, jamais figé après création — plus simple, sans risque puisque rien côté front ne dépend de la stabilité du slug (sauf domaine, dont l'instabilité est explicitement acceptée au point 2).

7. **Collision : vérification séquentielle simple**, pas d'extraction en masse ni de parsing du plus haut suffixe existant (jugé overengineering vu le volume du site — un site vitrine personnel, pas des milliers de lignes). Algorithme : générer le slug de base (sans suffixe), vérifier son existence (`SELECT 1 ... WHERE slug = $1`, indexé via la contrainte `UNIQUE`) ; si pris, essayer `-02`, `-03`... jusqu'au premier libre.

8. **Une fonction `slugify` unique, à paramètres facultatifs** (`label`, `title`, `company`, `date`, longueurs max par segment), réutilisée par les 7 services concernés plutôt que dupliquée — cohérent avec la préférence déjà actée pour les dispatchs/utilitaires centralisés ([[feedback_code_style]]).

## Dépendance — chantier "format de date forcé" — résolue

Le budget de 10 caractères pour le segment date (point 5) supposait un format `jj/mm/aaaa` forcé, avec seulement l'année obligatoire. **C'est fait** — voir `docs/refactor-date-format.md` pour le détail complet (validation+normalisation Zod, `CHECK` en base, saisie en 3 champs, affichage public tronqué à `mm/aaaa`). Plus rien ne bloque le démarrage de ce chantier.

## Prochaine étape

1. Chantier "format de date forcé" (prioritaire, bloquant).
2. Implémentation de la génération de slug (fonction `slugify` partagée + intégration dans les 7 services `add`/`edit`, retrait du champ `slug` des formulaires front concernés).

Note : les catégories sans dépendance à une date (`domain`, `hardskill`, `softskill`, `language`, `hobby`) pourraient techniquement être traitées indépendamment du chantier date, sans attendre. Pas fait pour l'instant par souci de cohérence (une seule vague d'implémentation plutôt que deux) — à reconsidérer si le chantier date traîne.
