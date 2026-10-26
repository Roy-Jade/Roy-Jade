# Réduction automatique du titre du CV (tagline)

**Statut : terminé.**

## Problème

Le titre du CV (`profile.tagline`, affiché dans `CvHeader.tsx`) passait sur deux lignes quand il était trop long ; la seconde ligne sortait des ~40pt disponibles sous les contacts de l'en-tête et était quasi invisible, coupant le titre.

## Constat de départ

La feuille CV a une taille fixe en `pt` (575pt × 822pt, en-tête de 90pt) : la largeur disponible pour le titre est **constante**, c'est la **longueur du texte** qui varie (un tagline par contexte, éditable depuis le dashboard, donc de longueur arbitraire).

## Options étudiées

- **Container queries seules (`font-size: Xcqi`)** — écarté : `cqi` proportionne la police à la largeur du *conteneur*, pas à celle du texte ; ici le conteneur ne change jamais, donc la police non plus.
- **CSS natif « fit-text » (`text-grow`/`text-shrink`, CSS Fonts 5)** — écarté : au mieux expérimental dans Chromium, absent de Firefox/Safari. Aucun mécanisme CSS cross-browser ne sait détecter un débordement (les astuces à base de scroll-driven animations ne marchent pas sous Firefox par défaut).
- **SVG `textLength` + `lengthAdjust`** — écarté : déforme les glyphes au lieu de réduire la police, et étire aussi les textes courts.
- **Mesure JS (`scrollWidth` vs `clientWidth`)** — exact, mais du code de mesure à maintenir (attendre `document.fonts.ready`, remesurer au changement de texte). Jugé disproportionné.
- **Estimation depuis le nombre de caractères** — **retenu** : approximatif, mais déclaratif, sans JS au rendu, identique dans les trois moteurs et à l'impression. Une réduction légèrement excessive est acceptable (le texte n'est jamais coupé).

## Décisions actées

- **Une seule ligne** (`white-space: nowrap`) : conforme aux conventions d'un titre de CV ; une erreur d'estimation déborderait sur la marge droite au lieu de couper le bas du texte.
- **Combinaison `cqi` + longueur** : `cqi` fournit la largeur réelle disponible (pas de largeur codée en dur), la longueur vient de React. Séparation des responsabilités : le CSS ne connaît que la mise en page, React transmet la donnée.
- **Coefficient 0.68em par caractère** : moyenne mesurée des majuscules Arial gras (~0.68em, moins avec les espaces). Un premier essai à 0.75 réduisait inutilement (~10 % de place perdue).
- **Centrage vertical** : un texte réduit restait collé en haut de sa ligne ; il est désormais centré dans la hauteur restante sous les contacts.

## Implémentation

- `frontend/src/functions/cv/components/CvSheet/CvHeader/CvHeader.tsx` — le tagline reçoit `style={{ '--tagline-length': Math.max(length, 1) } as CSSProperties}` (minimum 1 pour éviter une division par zéro tant que le profil n'est pas chargé ; le cast est nécessaire car React ne type pas les propriétés personnalisées).
- `frontend/src/functions/cv/components/CvSheet/templatesCSS/default.scss` :
  - `.cv-header__right` : `container-type: inline-size` + colonne flex.
  - `.cv-header__tagline` : `font-size: min(180%, calc((100cqi - 20pt) / (var(--tagline-length) * 0.68)))`, `nowrap`, `flex: 1` + centrage flex dans les deux axes. Les `20pt` de la formule doivent rester égaux à sa `margin-right`.

Pour ajuster : baisser le coefficient donne plus de place (risque de débordement avec des textes riches en M/W) ; réduire la `margin-right` aussi, en répercutant la valeur dans la formule.

Support : `min()`, `cqi`, `container-type` — Chrome 105+, Firefox 110+, Safari 16+.

## Vérification

`tsc -p tsconfig.app.json` propre. Confirmé par test utilisateur réel : pas de débordement même avec un texte très long (fortement réduit), centrage vertical fonctionnel.
