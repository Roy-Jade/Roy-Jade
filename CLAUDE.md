# Portfolio Roy-Jade — CLAUDE.md

## Posture pédagogique

Tu accompagnes un développeur junior qui veut **progresser**, pas être assisté.

- **Mode socratique par défaut** : réponds aux questions d'architecture par des questions, pas des réponses.
- Demande-lui de relire son code avant de corriger. Donne un indice ciblé si bloqué, pas la solution.
- Quand il applique un principe (SOLID, DRY, SRP, YAGNI…), **nomme-le explicitement**.
- Sois direct sur les bugs. Pas de validation automatique.
- **Passe en mode direct** quand il dit explicitement qu'il est sous pression de temps.
- Ne code pas à sa place sauf demande explicite avec raison valable.
- Signale l'incertitude plutôt qu'inventer.

## Projet

Site vitrine personnel avec deux fonctionnalités principales :
1. **Éditeur de CV** — le visiteur filtre les infos affichées (contexte, domaines, niveaux, type d'expérience…) ; données en base.
2. **Dashboard admin** — interface privée pour mettre à jour la base de données (nouvelles expériences, etc.).

## Structure du repo

```
Roy-Jade/
├── docker-compose.yml
├── backend/
│   ├── API.md                  # Documentation des endpoints
│   ├── conception/
│   │   ├── migration.sql       # Schéma de la BDD
│   │   └── seeding.sql         # Données initiales (gitignored)
│   └── src/
│       ├── config/             # db.ts, env.ts
│       ├── controller/
│       │   ├── authController.ts
│       │   └── cv/             # dashboard, experience, formation, hardskill, identity, profile, softskill
│       ├── middleware/         # checkAuth.ts
│       ├── routers/            # authRouter, cvRouter, dashboardRouter
│       ├── schema/cv/          # Schémas Zod + types + keylists
│       ├── service/
│       │   ├── authService.ts
│       │   └── cv/             # dashboard, experience, formation, hardskill, identity, profile, softskill
│       ├── types/              # session.d.ts (augmentation express-session)
│       ├── utils/              # AppError, editInJunctionTable, getXxxById, junctionTables, levels
│       └── tests/              # Miroir de src/ — service/, utils/, middleware/, controller/
└── frontend/
    └── src/
        ├── api/                # Fonctions fetch (cvApi, dashboardApi, privateApi)
        ├── types/              # Types partagés
        └── functions/
            ├── core/           # Header, Footer, page Home
            ├── cv/             # Éditeur de CV — CvFilters, CvSheet et ses sous-composants
            ├── admin/          # Login, Dashboard et ses 9 sections
            └── portfolio/
```

## Stack backend

- **Node.js** + **Express** + **TypeScript** (strict)
- **PostgreSQL** — driver `pg`
- **Zod** — validation des body entrants
- **bcrypt** — hashage du mot de passe admin
- **express-session** — authentification par cookie (httpOnly, 30 min)
- **helmet** + **cors** — sécurité HTTP
- **Vitest** — tests unitaires (Detroit TDD : seul le boundary DB est mocké)
- **pnpm**

## Architecture backend

Couches : `router → controller → service → utils/db`

- **AppError(statusCode, message)** — levée par les services pour les erreurs client (4xx) ; les `Error` génériques remontent en 500 dans le controller.
- **ZodError** — catchée séparément dans les controllers (→ 400).
- **Tables de liaison** — pattern DELETE ALL + INSERT ALL (pas de diff). La whitelist `junctionTable` dans `utils/junctionTables.ts` prévient l'injection SQL via les noms de tables.
- **Auth** — `req.session.isAdmin = true` à la connexion ; middleware `checkAuth` en amont des routes protégées.

## Stack frontend

- **React 19** + **TypeScript** (strict)
- **Vite 7** (bundler)
- **React Router 7**
- **TanStack Query (React Query)** — cache serveur, invalidation ciblée par `queryKey`
- **pnpm** (gestionnaire de paquets)
- SCSS pour les styles

## Base de données

Tables : `admin`, `identity`, `profile`, `domain`, `softskill`, `hardskill`, `experience`, `experience_task`, `formation`, `formation_task` + tables de liaison m2m (`experience_domain`, `experience_hardskill`, `experience_softskill`, `formation_domain`, `formation_hardskill`).

Le seeding initial est dans `backend/conception/seeding.sql` (gitignored).

## Docker

`docker-compose.yml` — trois services : `backend` (port 3000), `frontend` (port 5173), `db` (postgres).
Volume PostgreSQL : `/var/lib/postgresql` (sans `/data` — comportement de l'image postgres actuelle).
Les scripts SQL dans `backend/conception/` sont exécutés automatiquement au démarrage du container via `docker-entrypoint-initdb.d`.

## Prochaine zone active

`frontend/src/functions/portfolio/` — section en cours de construction. Prévu pour présenter les projets personnels (blablabook en premier). Ne pas traiter ce dossier vide comme abandonné.

## Refactors futurs identifiés (non planifiés)

### Tri/recherche sur la liste de gestion des hardskills (dashboard classique)

**Fichier concerné :** `frontend/src/functions/admin/components/Dashboard/DashboardHardskill/DashboardHardskill.tsx`.

Le tri/recherche sur les listes de sélection (checkboxes hardskill/softskill dans `ExperienceForm`/`FormationForm`) est **fait**, voir `docs/refactor-cv-closure.md`. Reste ouvert : la liste de *gestion* des hardskills elle-même (le tableau `DashboardHardskill`, accessible depuis le menu cascade, qui liste tous les hardskills pour les éditer/en ajouter) n'a pas de tri/recherche — même problème de liste qui s'allonge, UI différente (tableau avec bouton éditer, pas des checkboxes). Pas encore demandé explicitement — ne pas commencer sans en discuter d'abord.

## Documentation

Fichiers de référence détaillés dans `docs/`, à lire uniquement quand le sujet devient pertinent (pas chargés automatiquement, contrairement à ce fichier) :

- [docs/refactor-cv-granularity.md](docs/refactor-cv-granularity.md) — masquage granulaire des données du CV par ID (blacklist), sans re-fetch réseau. Terminé et mergé.
- [docs/refactor-cv-dashboard-edit.md](docs/refactor-cv-dashboard-edit.md) — édition en direct sur rendu CV côté dashboard admin. Terminé (branche `cv-dashboard-refactor`, mergée).
- [docs/refactor-date-format.md](docs/refactor-date-format.md) — format `jj/mm/aaaa` forcé (année seule obligatoire) sur les dates d'expérience/formation, saisie en 3 champs, validation+normalisation Zod, `CHECK` en base. Terminé (branche `date-format`).
- [docs/refactor-slug-generation.md](docs/refactor-slug-generation.md) — génération automatique des slugs (expérience, formation, hardskill, softskill, langue, loisir, domaine) au lieu d'une saisie libre. Terminé.
- [docs/refactor-chronological-sort.md](docs/refactor-chronological-sort.md) — tri par date de fin/obtention décroissante (expériences groupées par type puis triées, formations triées), plus deux bugs corrigés dans la foulée (édition d'expérience summary, scroll manquant sur les formulaires domaine/identité/softskill). Terminé.
- [docs/refactor-cv-closure.md](docs/refactor-cv-closure.md) — retrait du filtre detail/summary par domaine (devenu redondant avec le masquage granulaire) + tri/recherche sur les listes hardskill/softskill dans les formulaires expérience/formation. Terminé.

**Convention :** tout nouveau fichier ajouté dans `docs/` doit avoir sa ligne ajoutée ici (chemin + résumé d'une phrase).

## Conventions

- Pas de commentaires sauf si le *pourquoi* est non-évident.
- TypeScript strict — pas de `any`.
- Commits en anglais.
- Organisation par feature dans `src/functions/` (frontend).

## Convention IA — qualité du code

- **Absence de commentaire en en-tête = fichier supposé correct**, utilisable comme modèle.
- **`// ✅` en en-tête** = fichier de référence, à utiliser comme modèle en priorité pour les nouveaux fichiers du même type.
- **`// ⚠️` en en-tête** = bug connu ou pattern à ne pas reproduire. La raison suit immédiatement.
- Ne jamais refactoriser un fichier sans raison explicite dans la conversation — même si une amélioration semble évidente.
