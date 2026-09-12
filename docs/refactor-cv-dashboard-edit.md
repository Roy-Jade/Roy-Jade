# Refactor dashboard — édition en direct sur rendu CV

**Statut : terminé** (branche `cv-dashboard-refactor`), confirmé fonctionnel par test utilisateur sur tous les points. Décisions prises : option 2 (réutilisation de `CvFilters`/endpoints publics filtrés), menu cascade scope au filtre CV courant, formulaire = vrai `<form>` classique + aperçu réactif (pas de `contentEditable`), coquille d'édition en overlay `position: fixed` hors du sous-arbre pan-zoom (suit pan/zoom/scroll en direct), positionnement sous la zone concernée du CV pour expérience/formation/hardskill/langue/loisir/profil, menu uniquement pour identité/domaine/softskill. Les 9 formulaires sont branchés et fonctionnels, avec aperçu live (le brouillon remplace l'item réel pendant l'édition, à chaque frappe), boutons Éditer/Ajouter directement sur le CV (en plus du menu cascade), et toast de confirmation après sauvegarde. Suite logique du refactor granularité CV (`docs/refactor-cv-granularity.md`, terminé et mergé).

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

- **`domains` manquant sur `GET /api/cv/experience`/`GET /api/cv/formation` — corrigé.** La table `domain` n'était jointe que pour filtrer (`WHERE dom.slug = ANY(...)`), jamais projetée dans le SELECT, alors que `types/Experience.ts`/`types/Formation.ts` et `API.md` promettaient tous les deux un champ `domains: string[]`. Provoquait un crash de `ExperienceForm`/`FormationForm` (`existing.domains.map` sur `undefined`) et aurait silencieusement effacé les domaines à la sauvegarde (tableau vide envoyé). Ajouté `JSON_AGG(DISTINCT dom.slug) AS domains` aux deux requêtes (`experienceService.fetchExperience`, `formationService.fetchFormation`) — sûr sans `FILTER`/`COALESCE` puisque la jointure est `INNER JOIN` (toujours au moins une ligne).
- **`getExperienceById`/`getFormationById`** (`backend/src/utils/`, utilisés par `addExperience`/`editExperience`/`addFormation`/`editFormation` du dashboard) n'exposent pas les IDs de tâches/liaisons hardskill/softskill qu'on a ajoutés côté lecture publique (`experienceService.ts`/`formationService.ts`, fait en partie 1). Si le dashboard réutilise les composants de rendu du CV, il faudra le même traitement SQL sur ces deux fichiers (ajouter `task.id`, l'ID de liaison hardskill/softskill au `jsonb_build_object`).
- **Bug de transaction — corrigé** (branche `transactionnal-fix`, avant de démarrer ce chantier). `addExperience`/`editExperience`/`addFormation`/`editFormation` sont maintenant enveloppés dans une transaction (`BEGIN`/`COMMIT`/`ROLLBACK`), `editInJunctionTable.ts` prend un `client` obligatoire. Détails dans `backend/CLAUDE.md`. L'édition en direct peut s'appuyer dessus sans risque d'état partiel.
- **`EditButton`** (`frontend/src/functions/admin/components/ui/EditButton.tsx`), utilisé aujourd'hui dans les 9 sections du dashboard classique — contexte différent de `HoverAction` (bouton toujours visible dans une grille de gestion, pas de survol/focus). L'utilisateur a confirmé qu'il sera probablement remplacé/unifié avec `HoverAction` paramétré en "edit" une fois la transformation de l'affichage admin faite — pas maintenant, à garder en tête.

## Positionnement de la coquille — résolu

Ancien problème : insérée dans le flux normal du document (un `<li>`/élément sibling dans la liste), la coquille faisait déborder le contenu de `.cv-a4` (page CV à taille fixe, `height: 822pt`/`width: 575pt`) — les boutons Enregistrer/Annuler et la fin du formulaire devenaient inaccessibles. Repéré dès les formulaires simples de l'aside, devenu bloquant avec les formulaires complexes (expérience/formation).

**Solution implémentée :** point de montage unique, `EditOverlay` (`frontend/src/functions/admin/components/EditOverlay/`), rendu en sibling de `<TransformWrapper>` dans `CvSheet.tsx` — hors du sous-arbre transformé par `react-zoom-pan-pinch`, donc immunisé contre son `overflow: hidden` et son `transform: scale()`. Positionné en `position: fixed` via les coordonnées écran (`getBoundingClientRect()`) de l'item ancré, avec suivi en direct du pan/zoom via le hook `useEditAnchor` (`frontend/src/functions/admin/hooks/useEditAnchor.ts`) : `transformRef.current.instance.onChange(...)` (callback natif de la lib, se déclenche à chaque changement de transform) + `ResizeObserver` sur le nœud ancré + écouteur `resize` fenêtre. `EditOverlay.scss` gère le scroll indépendant (`overflow-y: auto`, `max-height: calc(100vh - 2rem)`).

Chaque conteneur (`CvExperiences`, `CvFormations`, `CvAside`, `CvPresentation`) ne rend plus `<EditShell>` lui-même — il attache juste `ref={setAnchor}` (prop reçue depuis `CvSheet`) sur le `<li>`/élément concerné quand c'est celui en cours d'édition ou le placeholder d'ajout. Simplification notable : plus besoin des `<Fragment>`/`<li>` sibling supplémentaires pour l'édition d'un item existant (le ref se pose directement sur l'élément d'affichage).

**Point accepté, à surveiller à l'usage plutôt qu'à corriger maintenant :** la taille de la coquille est indépendante du niveau de zoom du CV (nécessaire pour rester lisible) — l'utilisateur a jugé ce décrochage visuel tolérable vu le faible volume d'usage admin attendu.

**Non traité (pas bloquant) :** pas de clamp aux bords de l'écran si l'item ancré sort du viewport pendant l'édition (pan/zoom extrême) — l'overlay suit et peut sortir de l'écran avec lui.

**Vérification :** confirmée par test réel utilisateur (desktop). Trois ajustements faits suite à ce premier test :
- Mesure passée de `useEffect` à `useLayoutEffect` dans `useEditAnchor` — la coquille n'apparaissait qu'après un pan/zoom (mesure trop tardive, après peinture).
- Ajout d'un écouteur `scroll` (capture) — la coquille ne suivait que le pan/zoom interne du CV, pas le scroll de la page (alors qu'elle est en `position: fixed`, donc sensible aux deux).
- `max-height` réduite de `calc(100vh - 2rem)` à `50vh`, + `scrollIntoView({block:'center'})` sur l'item ancré à l'ouverture d'une édition, + focus automatique de la coquille au montage — la coquille pouvait déborder en bas sans que le scroll de page permette d'atteindre les boutons.

Non testé sur affichage mobile/portable — pas une priorité tant que le besoin ne se fait pas sentir (fonctions admin, faible volume d'usage), passe en V2+.

## Autres points reportés (repérés en testant les 7 premiers formulaires)

- **Réorganisation des listes** : pas de mécanisme pour réordonner hardskills/langues/loisirs dans l'aside, ni les tâches/skills à l'intérieur d'une expérience/formation. Probablement lié à un besoin de champ `position` explicite (déjà présent sur les tâches, absent sur hardskill/langue/hobby). À concevoir une fois le formulaire expérience/formation en place, pour couvrir les deux cas ensemble.
- ~~**Tri des expériences/formations**~~ — **fait**, voir `docs/refactor-chronological-sort.md`.

Aucun de ces trois points n'est bloquant pour la suite (formulaires expérience/formation) — notés pour une session future dédiée au design de ces interactions.

## Aperçu live — fait

Chaque formulaire concerné (profile, hardskill, language, hobby, experience, formation — les seules catégories avec un ancrage CV) calcule à chaque frappe une projection de son état interne dans la forme d'affichage publique (résolution des ids de relations → slugs/labels via les listes déjà chargées par le formulaire) et la remonte via `onPreviewChange`. État `preview` (nouveau type `EditPreview`, union discriminée par catégorie) porté par `CV.tsx`, même chemin que `editing`/`onCloseEdit`.

A nécessité d'extraire le JSX de rendu d'un item hors des `.map()` de `CvExperiences`/`CvFormations`/`CvAside` en sous-composants (`ExperienceItem`, `FormationItem`, `HardskillItem`, `LanguageItem`, `HobbyItem`) — mécanique, sans changement de comportement — pour pouvoir les appeler avec la donnée réelle ou le brouillon. S'applique aussi au mode ajout : le placeholder minimal ("Nouvelle expérience"...) est remplacé par le vrai gabarit dès que le formulaire émet sa première preview.

Confirmé fonctionnel par test utilisateur.

## Boutons edit/add directement sur le CV — fait

En plus du menu cascade, chaque item du CV (expérience, formation, hardskill, langue, loisir, profil) a maintenant son propre bouton "Éditer" au survol/focus (pattern `HoverAction`, comme les boutons "Masquer"), qui déclenche directement l'édition de cet item — sans passer par le menu. Chaque catégorie à liste (compétences, langues, centres d'intérêts, expériences, formations) a aussi un bouton "Ajouter" au survol/focus de son titre `<h2>`. Les deux boutons appellent exactement `onEdit`/`onAdd` (mêmes handlers que `DashboardMenu`), threadés depuis `CV.tsx` à travers `CvSheet` jusqu'aux composants d'item.

Détail technique : `.hover-action` est positionné en `absolute; top:0; right:0` — deux boutons dans la même zone (masquer + éditer) se superposaient. Ajout d'un wrapper `.hover-actions` (flex, `position:absolute` sur le groupe, `position:static` sur chaque bouton à l'intérieur) dans `HoverAction.scss`, utilisé uniquement là où deux actions coexistent.

Icône réutilisée : `assets/edit.svg` (déjà utilisée par `EditButton` du dashboard classique). Pas d'icône dédiée pour "Ajouter" — texte `+`, comme `AddButton` du dashboard classique.

Profil : bouton Éditer ajouté (cohérent, l'ancrage existait déjà) ; pas de bouton Ajouter (pas dans la liste demandée, et le mode ajout du profil n'a de toute façon pas d'ancrage CV — un nouveau contexte n'est pas affiché sur le CV courant).

## Toast de confirmation — fait

`ToastContext` (Context React, `frontend/src/functions/admin/context/ToastContext.tsx`) + `ToastStack` (rendu une fois dans `CV.tsx`, en haut de l'écran, `position: fixed`). Choix Context plutôt que callback-prop (contrairement à l'aperçu live) : pas de pattern de prop-drilling existant à respecter ici, et il aurait fallu traverser ~8 niveaux (`CV.tsx` → `CvSheet` → 4 conteneurs → `EditOverlay` → `EditShell` → 9 formulaires, dont 3 rendus hors de cette chaîne pour identité/domaine/softskill) pour un simple signal ponctuel.

`showToast(text, variant?)` appelé dans les 9 formulaires juste après la résolution de la mutation (donc un état réel, pas optimiste) et juste avant `onClose()`. Variante `success` (`role="status"`, `aria-live="polite"`) seule câblée pour l'instant ; variante `error` prête (`role="alert"`, assertive) mais pas encore déclenchée — les erreurs restent affichées inline dans le formulaire (`dash-error`), pas dupliquées en toast, pour rester dans le périmètre demandé (confirmation de succès uniquement). Auto-disparition à 4s, clic pour fermer immédiatement.

Confirmé fonctionnel par test utilisateur (tests visuels).

## État du chantier

**Le refactor dashboard est terminé.** Les 9 formulaires, l'aperçu live, la coquille en overlay, les boutons edit/add sur le CV et le toast sont tous fonctionnels et confirmés par test utilisateur réel. Points volontairement non traités, listés ci-dessus, pour une session future si le besoin se fait sentir : réorganisation des listes (aside + tâches/skills), tri des expériences/formations par date, clamp de la coquille aux bords d'écran, responsive mobile de l'admin, routes DELETE (branche séparée), variante toast d'erreur.
