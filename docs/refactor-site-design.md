# Refonte design du site

**Statut : terminé** (hors Mentions légales et Portfolio, traités à part — voir « Hors périmètre »).

## Problème

Hors de la feuille CV, le site n'avait quasiment pas de style : couleurs codées en dur (gris, bleu indigo par défaut), pas de typographie commune, dashboard admin squelettique, formulaires d'édition en texte blanc sur fond blanc, pages Contact et 404 vides.

## Décisions actées

- **Thème sombre unique**, sans bascule clair/sombre (YAGNI).
- **Palette vert + orange**, relevée sur les bannières LinkedIn (le bleu, trop commun en tech, est écarté). L'orange `--color-spark` est réservé au CTA principal et au focus clavier ; `--color-accent-fill` (vert pétrole) ne sert qu'en remplissage, car il ne tient que 2:1 en texte sur fond sombre.
- **Polices** : Outfit (titres), Figtree (texte), JetBrains Mono (détails), auto-hébergées via `@fontsource-variable` (pas de requête vers Google Fonts).
- **Logo** : symbole en couleur d'accent, rotation d'un demi-tour au chargement et au survol (le symbole a une symétrie centrale).
- **Décor** : reflet diagonal et quadrillage « papier millimétré », fondus sur les bords.
- **Boutons en pilule**, filet orange sous le titre de l'accueil.
- **La feuille CV A4 garde sa propre identité** (palette bleue, Arial) : c'est un document, pas une page du site. Seul son décor (scène, ombre, boutons autour) suit le site.
- **Le dashboard garde sa structure** (un cadre par section, une ligne par élément) ; seul son style change.

## Fondations — `frontend/src/styles/`

- `tokens.scss` — toutes les valeurs du design en propriétés personnalisées sur `:root` : couleurs, polices, échelle typographique, espacements, rayons, durées. Les durées passent à 0 sous `prefers-reduced-motion`. Les points de rupture y sont aussi publiés en `--bp-*` pour le JS.
- `_breakpoints.scss` — table des points de rupture et mixin `up()`. Importable partout par `@use "breakpoints"` grâce aux `loadPaths` déclarés dans `vite.config.ts`.
- `global.scss` — fond et décor communs, footer collé en bas des pages courtes, focus clavier, corrections du reset.
- `forms.scss` — style de base de tous les formulaires (connexion, édition admin, contact).
- `utils/matchesBreakpoint.ts` — lit les `--bp-*` pour tester un point de rupture en TS, sans dupliquer les valeurs.

Aucune couleur n'est codée en dur hors de `tokens.scss`, à deux exceptions voulues : la palette propre à la feuille CV (`CvSheet/variables.css`) et les couleurs de marque des logos de réseaux.

## Pièges rencontrés

- **Protéger la feuille CV des styles globaux.** Les règles de `global.scss` l'excluent par `:where(…):not(:where(.cv-a4 *))`, et la feuille repose sa propre couleur de texte, qu'elle hériterait sinon du `body` clair-sur-sombre. C'est ce qui causait le texte blanc sur blanc des formulaires d'édition.
- **Spécificité nulle pour les styles de base.** `forms.scss` et `global.scss` écrivent tout dans `:where()` : n'importe quelle classe d'un composant l'emporte, sans `!important` ni course à la spécificité.
- **`[hidden]` doit être renforcé.** L'attribut ne masque que par la feuille du navigateur, que n'importe quel `display` d'une classe écrase. `global.scss` le force donc.
- **`<dialog>` modal** : le reset `* { margin: 0 }` annule le `margin: auto` qui le centre ; `global.scss` le rétablit.
- **Colonnes de grille du dashboard.** Une colonne de données en `auto` prend la largeur de son texte le plus long et écrase ses voisines jusqu'à zéro (un loisir avec un long complément disparaissait). Règle : colonnes de données en `minmax(0, 1fr)`, colonne d'actions en `auto` (variable `--list-cols` de chaque section, commentée dans `Dashboard.scss`).

## Page CV

- **Centrage de la feuille** : le conteneur de `react-zoom-pan-pinch` fait la largeur de son contenu ; c'est lui qu'on centre, avec `max-width: 100%` pour devenir une fenêtre de la largeur de l'écran sur mobile.
- **Panneau des éléments masqués** : sur grand écran, la feuille glisse (`translate`, via `:has()`) pour lui laisser la place ; rien n'est recalculé. En dessous de `xl`, il passe par-dessus la feuille.
- **Impression** : le fond vert du site est neutralisé, la feuille s'imprime seule.
- **Boutons d'action sur la feuille (`HoverAction`)** : couleurs du site (pas celles du CV), pour qu'on ne les confonde pas avec le contenu ; contraste 7:1 sur le blanc. Masqués à l'impression.
- **Logique tactile** : sans survol au doigt, les boutons sont toujours visibles (`pointer: coarse`), sauf quand le zoom les rend plus petits que 24 px (critère WCAG 2.5.8). `useSmallTargetFlag` pose alors `data-small-targets` sur la feuille, et le CSS les rend invisibles et inertes au toucher, pour qu'un doigt qui fait glisser la feuille ne les déclenche pas. Ils restent atteignables au clavier. Le drapeau est écrit directement dans le DOM : appelé à chaque image d'un zoom, un état React re-rendrait toute la feuille.
- **`useDisclosure`** (`core/hooks/`) : ouverture/fermeture d'un panneau, avec fermeture par Échap et rappel pour rendre le focus au bouton déclencheur.

## Pages ajoutées

### Page 404 — `core/pages/NotFound/`

Une molécule tirée au sort, dessinée en SVG sans librairie.

- `molecules.ts` — chaque molécule est décrite par ses **atomes** (position `x`, `y` en longueurs de liaison, étiquette facultative : absente = carbone) et ses **liaisons** (indices des deux atomes, ordre 1 à 3). Chaque liaison n'est écrite qu'une fois. Les hydrogènes ne sont pas modélisés : ceux des hétéroatomes font partie de l'étiquette (`OH`, `NH2`).
- `MoleculeDrawing.tsx` — rendu générique : une liaison étiquetée recule de `LABEL_GAP` le long de son vecteur unitaire pour ne pas barrer le texte ; les liaisons multiples sont décalées le long de la perpendiculaire. Le `viewBox` s'ajuste aux atomes, et l'échelle est fixe (60 px par liaison) pour que toutes les molécules aient la même taille de trait.
- Tirage au sort par **initialiseur paresseux** de `useState` : la molécule est choisie dès le premier rendu (ni molécule par défaut, ni affichage vide), puis ne change plus.
- Molécules : éthanol, aspirine, caféine. Pour en ajouter une, seules les données changent. Coordonnées : grille à 120° (multiples de cos 30° ≈ 0,866 et de 0,5) ; un pentagone (caféine) se calcule à part, depuis son apothème et son rayon.

Options écartées : lire un nom IUPAC (deux problèmes difficiles empilés : nom → structure, puis structure → mise en page 2D) ; librairie de chimie (centaines de Ko pour une 404) ; `div` pivotées en CSS (chaque angle à la main).

Simplifications acceptées : `OH` centré sur l'atome (et non aligné sur le O), écart identique dans toutes les directions avant une étiquette, doubles liaisons de cycle centrées sur l'axe.

### Page Contact — `core/pages/Contact/`

- Coordonnées issues de `identity` (même `queryKey` que le footer : aucune requête supplémentaire).
- Squelette toujours affiché ; « Chargement… » puis « Erreur » dans chaque valeur, et message d'excuse si aucune donnée n'est disponible. Une donnée déjà en cache reste affichée si un rafraîchissement échoue.
- Balisage : `<address>` contenant une `<dl>` (type en `<dt>`, valeur en `<dd>`). Icônes masquées aux lecteurs d'écran, le type étant écrit en clair.
- Téléphone en `tel:+33…` (numéros supposés français, le 0 initial devient +33). E-mail en `mailto:`.
- Réseaux : « pseudo sur Réseau ». Le pseudo vient de `getUsername` (dernier segment de l'URL), partagé avec le footer du CV. Exception déclarée dans la table `socialLinks` (`showsRealName`) : LinkedIn affiche prénom et nom.

Pas de formulaire ni d'envoi d'e-mail : chantier reporté à l'obtention d'un nom de domaine personnel et de sa boîte mail. Limites connues de `mailto:` : sans logiciel de messagerie configuré (visiteur sur webmail seul), le clic n'ouvre rien d'utile — un bouton « copier » couvrirait ce cas. Pas d'e-mail de secours codé en dur : il serait lisible en clair dans le bundle JS.

## Bugs connus non résolus

- **Safari, impression** : il faut imprimer à 99 % pour que la feuille tienne sur une page (cherché sans succès, voir le commentaire de `templatesCSS/default.scss`). Firefox et Chrome : 100 % correct.
- **Mobile, dézoom** : impossible de descendre sous la taille normale de la feuille pour la voir en entier (`react-zoom-pan-pinch`, `minScale` par défaut = 1). Piste : `minScale` (voire `initialScale` sur mobile) = largeur de la fenêtre / largeur de la feuille ; à ce zoom, les boutons d'action passent sous 24 px et sont désactivés au doigt, ce qui est cohérent.
- **Feuille décalée après zoom** (sporadique, desktop et mobile) : après un zoom au pavé tactile et un déplacement, la feuille reste décalée, son haut inaccessible, les côtés corrects. Faire glisser la feuille ou recharger la page corrige (les filtres sont dans l'URL, rien n'est perdu). Pas de marche à suivre pour reproduire ; cause probable côté librairie (recalcul des limites au déplacement). Laissé en l'état.
- **Logique tactile des boutons d'action** : testée seulement en mode appareil de Firefox, à revérifier sur un vrai téléphone une fois le site en ligne.

## Pistes notées

- Ajouter le profil Malt à `socialLinks` (avec `showsRealName: true`).
- `useIdentityData` est rangé dans `cv/hooks/` mais sert aussi `core` (page Contact) : un dossier partagé serait plus logique. Le footer du site refait sa propre `useQuery` au lieu de l'utiliser.
- La correction du logo GitHub (`filter: invert(1)`) est dupliquée entre `Footer.scss` et `Contact.scss`.
- Variante `tech` du composant `Tag` : couleurs codées en dur, prévue pour le Portfolio, à reprendre avec lui.
- Animation de la molécule de la 404 (tracé progressif en `stroke-dasharray`) : non faite, le support de `pathLength` sur `<line>` restant à vérifier dans les trois moteurs.

## Hors périmètre

- **Mentions légales** : contenu à rédiger avant de styler la page.
- **Portfolio** : chantier séparé (`functions/portfolio/`).

## Vérification

`tsc -p tsconfig.app.json` propre et compilation SCSS sans erreur à chaque étape. Validé visuellement par l'utilisateur dans le navigateur, page par page (accueil, CV, dashboard, connexion, toasts, 404, contact), y compris les états de chargement et d'erreur de la page Contact (backend arrêté). Aucun test automatisé cross-browser : Safari reste à surveiller en priorité (focus, transitions, impression).
