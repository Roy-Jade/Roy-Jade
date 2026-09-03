# Refactor dashboard — édition en direct sur rendu CV

**Statut :** réflexion en cours, implémentation pas commencée. Suite logique du refactor granularité CV (`docs/refactor-cv-granularity.md`, terminé et mergé).

## Objectif (rappel de la demande initiale)

L'ajout de nouvelles données sur le dashboard admin actuel n'offre aucune visibilité sur le rendu final. Objectif : afficher directement le rendu, idéalement donner une version du CV constitué avec possibilité de "changer les données" en direct — seule une sauvegarde via un bouton envoie réellement les données au backend.

## Coexistence décidée

Le dashboard actuel (grille de gestion classique, 9 sections, `EditButton`) et une nouvelle vue "CV en direct" vont **partiellement coexister** :
- Grille de gestion classique : reste pertinente pour les compétences (plus pratique en liste qu'en rendu CV).
- Vue CV en direct : pour tout ce qui nécessite de voir la mise en forme exacte — description de profil/contexte, titre principal, la majeure partie des champs d'une expérience/formation.
- Proposition retenue : tout ajouter/éditer possible depuis la vue CV, mais garder une version repliable/déployable de la grille actuelle pour voir la liste complète d'une catégorie au besoin. Le dashboard reste un usage personnel (avec l'espoir à terme que le projet soit forkable/réutilisable par d'autres) — pas besoin d'un niveau de finition/intuitivité équivalent à la vue publique.

## Décision ouverte — reprendre les filtres ou non

Deux options envisagées pour la vue CV en direct de l'admin, **pas encore tranchées** :

**Option 1 — sans filtres.** On ne reprend pas `CvFilters`/le système d'URL de filtrage ; on ajoute juste l'édition/ajout sur ce qui a été construit pour le masquage. Implique de fetcher les données via `GET /api/cv/dashboard` (déjà existant, tout le dataset non filtré) plutôt que les endpoints filtrés.

**Option 2 — structure identique à la vue publique.** On reprend exactement `CvFilters` + URL, avec un flag "authentifié" qui débloque les options d'ajout/édition et un menu des éléments complets. Sous-question non tranchée : ce "menu complet" doit-il fetcher tout le dataset, ou seulement ce que les filtres actuels ramènent (plus léger) ?

**Évaluation de faisabilité (option 2)** — plus faisable qu'il n'y paraît, grâce à des choix déjà faits en partie 1 :
- `HoverAction` (`frontend/src/functions/core/components/HoverAction/`) est générique (icon/label/onClick, aucune logique de masquage codée en dur) — conçu dès le départ pour ce genre de réutilisation. Ajouter des boutons "Éditer"/"Ajouter" au même endroit/mécanisme (survol/focus) ne demande aucun rework du composant.
- Le pattern de prop-threading (`filters`/`toggleHidden` descendus de `CV.tsx` à travers `CvSheet.tsx`) est déjà prouvé trois fois cette session — ajouter un flag `isAdmin` de la même façon n'est pas un nouveau problème.
- L'authentification existe déjà des deux côtés : front (`Dashboard.tsx` gère déjà `needsAuth`/session/login modal), back (`checkAuth` protège déjà `POST`/`PATCH /api/cv/dashboard/*`). Les routes `GET /api/cv/*` sont déjà publiques sans restriction — les réutiliser depuis une page authentifiée ne demande aucun changement backend.

**Ce qui n'est PAS gratuit, quelle que soit l'option retenue** (donc pas un critère de décision entre les deux) :
- Le mécanisme d'édition en direct lui-même : un état de "brouillon" local (titre modifié, tâche ajoutée, tag retiré) distinct des vraies données tant que "Enregistrer" n'est pas cliqué. Structurellement différent du masquage (qui n'est que des IDs dans l'URL) : de l'édition de contenu arbitraire, potentiellement des éléments pas encore créés en base (donc sans ID réel avant sauvegarde). **Aucun design fait sur ce point — c'est le vrai chantier de la partie 2, à concevoir en premier à la prochaine session.**

Argument en faveur de l'option 2 : elle permet de prévisualiser "à quoi ressemble le CV pour telle configuration précise" pendant l'édition — correspond exactement à l'objectif de départ ("voir précisément la mise en forme"). L'option 1 est plus simple à écrire mais perd cette prévisualisation par persona/filtre.

## Mécanisme d'édition retenu

`contentEditable` directement dans le rendu du CV (pas de formulaire/modal séparé par champ). Décidé, pas remis en cause depuis.

## Prérequis technique résolu — sélection de texte / pan-zoom

Le CV est enveloppé dans `TransformWrapper`/`TransformComponent` (`react-zoom-pan-pinch` v4.0.3, dans `CvSheet.tsx`) pour le zoom/pan. Cette lib interceptait toute interaction de type drag, y compris la sélection de texte — un `contentEditable` aurait eu le même problème (besoin d'un `mousedown` pour placer le curseur). **Corrigé et vérifié sur Chromium et Safari**, sur la branche `cv-selection-fix` (l'utilisateur clôt/merge cette branche de son côté). Trois causes distinctes, trouvées successivement :

1. `panning` interceptait le drag → `panning={{ excluded: ['cv-selectable'] }}` sur `TransformWrapper`.
2. `doubleClick` a sa **propre** liste `excluded`, indépendante de `panning` — sans quoi un double-clic sur du texte déclenchait un zoom au lieu d'une sélection de mot → `doubleClick={{ excluded: ['cv-selectable'] }}`.
3. **La vraie cause du blocage réel** (les deux points ci-dessus n'empêchaient rien via `preventDefault`, leurs listeners sont `passive`) : la lib pose `user-select: none` **et toutes ses variantes préfixées** (`-webkit-user-select`, `-moz-user-select`, `-ms-user-select`, `-khtml-user-select`, `-webkit-touch-callout`) sur son wrapper, héritées par toute la descendance. Un override CSS qui ne couvre que la propriété standard suffit sous Chromium mais pas sous Safari (WebKit s'appuie sur sa version préfixée). Correctif complet dans `.cv-selectable` (`frontend/src/functions/cv/components/CvSheet/templatesCSS/default.scss`), toutes les variantes annulées. Voir aussi l'instruction globale ajoutée dans `~/.claude/CLAUDE.md` sur la compatibilité WebKit/Chromium/Gecko à garder en tête systématiquement.

Classe `.cv-selectable` posée sur les conteneurs de contenu textuel : `.cv-header`, `.cv-footer`, `.cv-presentation`, `.cv-experiences`, `.cv-formations`, `.cv-aside`.

**Bonus pour la partie 2** : vérifié dans le code source de la lib — elle exclut déjà nativement tout élément `contenteditable="true"`/`isContentEditable` de son mécanisme de pan (`isPanningStartAllowed`), sans configuration supplémentaire à faire. Le `contentEditable` de l'édition en direct n'aura donc pas besoin d'être ajouté à `cv-selectable` pour cette raison précise (il le sera quand même pour la sélection de texte classique).

## Autres points à traiter avant/pendant l'implémentation

- **`getExperienceById`/`getFormationById`** (`backend/src/utils/`, utilisés par `addExperience`/`editExperience`/`addFormation`/`editFormation` du dashboard) n'exposent pas les IDs de tâches/liaisons hardskill/softskill qu'on a ajoutés côté lecture publique (`experienceService.ts`/`formationService.ts`, fait en partie 1). Si le dashboard réutilise les composants de rendu du CV, il faudra le même traitement SQL sur ces deux fichiers (ajouter `task.id`, l'ID de liaison hardskill/softskill au `jsonb_build_object`).
- **Bug de transaction — corrigé** (branche `transactionnal-fix`, avant de démarrer ce chantier). `addExperience`/`editExperience`/`addFormation`/`editFormation` sont maintenant enveloppés dans une transaction (`BEGIN`/`COMMIT`/`ROLLBACK`), `editInJunctionTable.ts` prend un `client` obligatoire. Détails dans `backend/CLAUDE.md`. L'édition en direct peut s'appuyer dessus sans risque d'état partiel.
- **`EditButton`** (`frontend/src/functions/admin/components/ui/EditButton.tsx`), utilisé aujourd'hui dans les 9 sections du dashboard classique — contexte différent de `HoverAction` (bouton toujours visible dans une grille de gestion, pas de survol/focus). L'utilisateur a confirmé qu'il sera probablement remplacé/unifié avec `HoverAction` paramétré en "edit" une fois la transformation de l'affichage admin faite — pas maintenant, à garder en tête.

## Prochaine étape (session suivante)

Concevoir le mécanisme de "brouillon" d'édition (état local avant sauvegarde) — c'est le point de départ logique, avant même de trancher option 1 vs option 2 puisque ce travail est commun aux deux.
