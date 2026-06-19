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

## Bugs connus

### Transactions manquantes — `editExperience` / `editFormation`

**Fichiers :** `backend/src/service/cv/experienceService.ts`, `backend/src/service/cv/formationService.ts`

Chaque `db.query()` utilise une connexion indépendante du pool. Si une opération échoue en cours de route (UPDATE puis DELETE/INSERT sur les tables de liaison), les opérations déjà exécutées sont commitées. Pas d'atomicité.

Ces deux fichiers portent un commentaire `// ⚠️` en en-tête. Ne pas les utiliser comme modèle pour du code nécessitant des transactions.

**Fix prévu :** envelopper dans un `BEGIN`/`COMMIT`/`ROLLBACK` avec un client sorti du pool, et adapter `editInJunctionTable.ts` pour accepter ce client en paramètre.

## Conventions

- Pas de commentaires sauf si le *pourquoi* est non-évident.
- TypeScript strict — pas de `any`.
- Commits en français, conventionnels.
- Organisation par feature dans `src/functions/` (frontend).

## Convention IA — qualité du code

- **Absence de commentaire en en-tête = fichier supposé correct**, utilisable comme modèle.
- **`// ⚠️` en en-tête** = bug connu ou pattern à ne pas reproduire. La raison suit immédiatement.
- Ne jamais refactoriser un fichier sans raison explicite dans la conversation — même si une amélioration semble évidente.
