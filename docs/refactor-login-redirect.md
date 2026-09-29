# Redirection post-login vers la page d'origine

**Statut : terminé.**

## Problème

Après connexion sur `/login`, l'admin était toujours redirigé vers `/cv` (page générique), quelle que soit la page depuis laquelle il avait ouvert `/login` (accueil, CV filtré, etc.). Irritant signalé par l'utilisateur après un test réel.

## Constat de départ

Aucun lien "Se connecter" n'existe dans l'app pour les visiteurs déconnectés (l'édition est entièrement masquée si `!isAdmin`) — `/login` n'est donc atteint qu'en tapant l'URL directement ou via un favori, jamais via une navigation interne. Il n'existait aucune garde de route (`ProtectedRoute`) ni mécanisme de capture de la page d'origine (`location.state`, `?redirect=`).

## Décisions actées

- **Boutons haut/bas hors sujet ici** — ce chantier ne concerne que la redirection post-login, sans rapport avec la réorganisation des listes (voir `docs/refactor-list-reordering.md`).
- **Pas de `navigate(-1)`** (première approche tentée, puis abandonnée) : `navigate(-1)`/`window.history.back()` navigue vers l'entrée précédente de l'historique du navigateur **quelle que soit son origine** — si l'admin arrivait sur `/login` depuis un site externe (lien, onglet précédent), la redirection post-connexion repartait vers ce site externe. Aucune API navigateur ne permet d'inspecter l'URL d'une entrée d'historique avant d'y naviguer réellement (restriction de sécurité/vie privée) — impossible de "vérifier le domaine avant de rediriger" avec cette approche.
- **Solution retenue : suivi applicatif du dernier chemin visité**, via `sessionStorage`, plutôt que de s'appuyer sur l'historique navigateur. Rend un redirect vers un domaine externe **structurellement impossible** : seule l'app elle-même écrit dans cette clé, à chaque changement de route en son sein — un site externe n'a par construction aucun accès au `sessionStorage` de notre origine.

## Implémentation

- `frontend/src/functions/core/hooks/useTrackLastVisitedPath.ts` (nouveau) — `useTrackLastVisitedPath()` : à chaque changement de `useLocation()`, écrit `pathname + search + hash` dans `sessionStorage` sous la clé `lastVisitedPath`, **sauf si le chemin courant est `/login`** (sinon on écraserait la page d'origine par `/login` lui-même juste avant de la lire). `getLastVisitedPath()` : lecture de cette clé, `null` si absente. Les deux accès `sessionStorage` sont enveloppés en `try/catch` (indisponible en navigation privée sur certains navigateurs) — la redirection retombe alors simplement sur `/cv`.
- `frontend/src/App.tsx` — `useTrackLastVisitedPath()` appelé une fois à la racine (le composant est rendu à l'intérieur du `<BrowserRouter>` de `main.tsx`, donc `useLocation()` y est utilisable).
- `frontend/src/functions/admin/pages/Login/Login.tsx` — `goBackOrToCv()` remplace les deux anciens `navigate('/cv', { replace: true })` codés en dur : lit `getLastVisitedPath() ?? '/cv'` et y navigue (`replace: true`). Protégé par un `useRef` (`hasNavigatedBack`) pour n'exécuter la redirection qu'une seule fois — la connexion réussie déclenche deux chemins concurrents vers cette même fonction (le `onClose` du formulaire de connexion, appelé directement après `login()` ; et un `useEffect` qui réagit au passage de `session.isAdmin` à `true` une fois la query `authSession` invalidée et re-fetchée) — sans ce garde-fou, un second appel aurait pu re-déclencher une navigation inutile.

## Vérification

`tsc -p tsconfig.app.json` et `eslint` propres. Confirmé par test utilisateur réel (pas d'accès à un navigateur ni au mot de passe admin dans cette session) : redirection vers la page d'origine fonctionnelle (CV filtré, accueil), et cas du site externe confirmé corrigé (repli sur `/cv` au lieu de rediriger vers le site externe).
