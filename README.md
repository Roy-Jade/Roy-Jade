# Portfolio Roy-Jade — Grégoire Portier

CV interactif et filtrable, administrable sans toucher au code. Ce projet est autant une démonstration de compétences techniques qu'un outil fonctionnel : le visiteur configure l'affichage du CV selon son contexte, et les données sont mises à jour via un dashboard admin.

---

## Ce que fait le projet

### Éditeur de CV (public)
Le visiteur accède au CV via une interface avec un panneau de filtres :
- **Contexte** : choisir le profil cible (générique, labo, alternance) pour afficher l'accroche correspondante
- **Type d'expérience** : filtrer entre vue détaillée et vue synthétique
- **Domaines et compétences** : affiner les expériences et formations affichées
- **Niveau de hard skill** : masquer les compétences en dessous d'un certain niveau
- **Nombre max** d'expériences / formations affichées

Les filtres sont synchronisés dans l'URL (query params), ce qui rend le CV partageable dans n'importe quelle configuration.

### Dashboard admin (privé)
Interface protégée par session pour administrer les données du CV sans déploiement. 9 sections éditables :

| Section | Ce qu'on y gère |
|---|---|
| Identité | Prénom, nom, email, téléphone, liens GitHub / GitLab / LinkedIn |
| Profils | Contextes d'accroche (labo, alternance, générique) avec tagline et description |
| Expériences | Titre, entreprise, lieu, dates, type, description, tâches, soft/hard skills, domaines |
| Formations | Titre, établissement, lieu, date, niveau, description, tâches, hard skills, domaines |
| Hard skills | Compétence, catégorie / sous-catégorie, niveau |
| Soft skills | Libellé |
| Domaines | Libellé et slug |
| Loisirs | Libellé et complément |
| Langues | Langue et niveau |

---

## Pourquoi ces choix techniques

### Stack et architecture générale

**TypeScript strict partout** — la sécurité de type n'est pas optionnelle sur un projet qu'on reprend de temps en temps. Strict mode coupe le recours aux `any` et force à exprimer correctement les cas nullables.

**PostgreSQL plutôt qu'un fichier JSON** — la version précédente du CV était en vanilla JS avec les données en dur dans des fichiers JS. Passer à une vraie base relationnelle permet de mettre à jour le CV depuis le dashboard sans toucher au code, et modélise correctement les relations m2m (une expérience a plusieurs domaines, hard skills, soft skills).

**Docker pour le développement** — un seul `docker compose up` démarre backend, frontend et base. Pas de dépendance à l'environnement local.

**pnpm** — plus strict que npm sur les dépendances fantômes, et plus rapide.

### Frontend

**React 19 + Vite 7** — React 19 pour les dernières API (notamment la gestion des formulaires), Vite pour la vitesse de développement (HMR quasi instantané) par rapport à l'ancien Parcel.

**React Router 7** — gestion des routes et des query params. Les filtres du CV vivent dans l'URL plutôt qu'en state React : le CV est partageable dans sa configuration exacte, et le bouton retour du navigateur fonctionne naturellement.

**React Query (TanStack Query)** — gestion du cache serveur et des états de chargement/erreur, sans boilerplate. L'invalidation ciblée par `queryKey` permet de rafraîchir uniquement la section modifiée après un PATCH dashboard.

**Pas de gestionnaire d'état global (Redux, Zustand…)** — l'état local React + React Query couvre tous les besoins. Un state manager global aurait été de la complexité non justifiée pour ce volume de fonctionnalités.

**Organisation par feature dans `src/functions/`** — chaque feature (`cv`, `admin`, `core`) est autonome avec ses composants, pages, types et API calls. L'alternative (organisation par type de fichier : `components/`, `pages/`…) devient difficile à naviguer dès que le projet grossit.

**SCSS avec CSS custom properties pour les tableaux** — les sections du dashboard avec des listes (langues, loisirs, hard skills…) utilisent une propriété CSS `--list-cols` définie sur la section et héritée par l'en-tête et les lignes. Cela garantit l'alignement des colonnes sans `inline styles` ni duplication.

---

## Structure du repo

```
Roy-Jade/
├── docker-compose.yml
├── backend/
│   ├── API.md              # Documentation complète des endpoints
│   ├── conception/
│   │   ├── migration.sql   # Schéma de la base
│   │   └── seeding.sql     # Données initiales (gitignored)
│   └── src/
│       ├── config/         # db.ts, env.ts
│       ├── controller/cv/  # Un controller par entité
│       ├── middleware/     # checkAuth.ts
│       ├── routers/        # authRouter, cvRouter, dashboardRouter
│       ├── schema/cv/      # Schémas Zod + types + keylists
│       ├── service/cv/     # Logique métier
│       ├── utils/          # AppError, gestion des tables de liaison
│       └── tests/          # Miroir de src/
└── frontend/
    └── src/
        ├── api/            # Fonctions fetch (cvApi, dashboardApi, privateApi)
        ├── types/          # Types partagés
        └── functions/
            ├── core/       # Header, Footer, page Home
            ├── cv/         # Éditeur de CV (CvFilters, CvSheet et ses sous-composants)
            └── admin/      # Login, Dashboard et ses 9 sections
```

---

## Frontend — détail

### Éditeur de CV (`functions/cv/`)

```
cv/
├── pages/CV/          # Page principale — gère les searchParams, orchestre Filters + Sheet
├── components/
│   ├── CvFilters/     # Panneau de filtres (fetch des valeurs valides depuis l'API)
│   └── CvSheet/       # Rendu du CV
│       ├── CvAside/
│       ├── CvHeader/
│       ├── CvPresentation/
│       ├── CvExperiences/
│       ├── CvFormations/
│       ├── CvFooter/
│       ├── templatesCSS/   # Feuilles de style du CV (default.scss…)
│       └── variables.css   # Variables CSS du CV
```

Les filtres sont construits dynamiquement depuis l'API (`GET /api/cv/filters`) — le frontend ne hard-code aucune valeur possible. Si un domaine est ajouté en base, il apparaît automatiquement dans les filtres.

### Dashboard (`functions/admin/`)

Chaque section du dashboard est un composant autonome qui reçoit ses données en props (chargées une seule fois par la page `Dashboard` via React Query) et gère son propre état d'édition en local.

Le pattern est uniforme sur les 9 sections :
- **Lecture** : liste ou carte selon la complexité de l'entité
- **Édition** : inline (formulaire qui remplace ou s'insère sous l'item)
- **Ajout** : formulaire en bas de section
- **Annulation** : remet l'état local à zéro, pas de requête

---

## Backend — détail

### Stack

- **Node.js** + **Express** + **TypeScript strict**
- **PostgreSQL** — driver `pg` (pas d'ORM)
- **Zod** — validation des corps entrants
- **bcrypt** — hashage du mot de passe admin
- **express-session** — auth par cookie httpOnly (30 min)
- **helmet** + **cors** — sécurité HTTP
- **Vitest** — tests unitaires
- **pnpm**

### Architecture

Couches : `router → controller → service → utils/db`

La Clean Architecture préconise une couche **Use Case** entre controller et service, qui isolerait l'orchestration métier du transport HTTP. Ce projet n'en a pas : chaque controller appelle un seul service, il n'y a pas d'orchestration multi-service à isoler. YAGNI s'applique — la couche serait introduite sur un projet futur dès que la complexité le justifie.

Documentation complète des endpoints : [`backend/API.md`](backend/API.md)

### Base de données

Tables principales : `admin`, `identity`, `profile`, `domain`, `softskill`, `hardskill`, `experience`, `experience_task`, `formation`, `formation_task`

Tables de liaison m2m : `experience_domain`, `experience_hardskill`, `experience_softskill`, `formation_domain`, `formation_hardskill`

Schéma complet : [`backend/conception/migration.sql`](backend/conception/migration.sql)

### Pourquoi pas d'ORM

`pg` est utilisé directement à la place d'un ORM (Prisma, TypeORM…) :

- **Contrôle total du SQL** — les requêtes du dashboard agrègent plusieurs tables avec des `JSON_AGG` imbriqués et des `COALESCE` sur des filtres `WHERE IS NOT NULL`. Exprimer ça via un ORM produit soit du SQL sous-optimal, soit une fuite de complexité dans la couche applicative.
- **Pas d'abstraction superflue** — pour un projet mono-dev avec un schéma stable, la friction de l'ORM (définitions dupliquées, migrations générées, types générés) n'apporte rien par rapport à du SQL explicite.
- **Paramétrage natif** — toutes les requêtes utilisent des paramètres positionnels (`$1`, `$2`…), ce qui prévient l'injection SQL sans couche supplémentaire.

### Gestion des erreurs — pattern AppError

`AppError(statusCode, message)` est la seule classe d'erreur applicative. Les services la lèvent pour tous les cas client (4xx) ; les erreurs génériques (erreurs DB, cas imprévus) ne sont pas catchées dans le service et remontent en 500 dans le controller.

```ts
// Dans un service :
throw new AppError(404, "Aucune donnée trouvée")

// Dans le controller — trois branches systématiques :
} catch (error) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    if (error instanceof ZodError)  return res.status(400).json({ message: error.message });
    return res.status(500).json({ message: "Erreur serveur" });
}
```

Les `ZodError` sont catchées séparément car Zod ne produit pas d'`AppError` — elles résultent de la validation des corps entrants (→ 400).

### Tables de liaison — pattern DELETE ALL + INSERT ALL

Toutes les mises à jour de relations m2m (ex : modifier les domaines d'une expérience) suivent le même pattern :

1. `DELETE FROM experience_domain WHERE experience_id = $1` — on efface tout
2. `INSERT INTO experience_domain (...) VALUES ...` — on réinsère les nouvelles valeurs

Pas de diff entre l'état actuel et le nouvel état. C'est plus simple, pas plus lent sur ce volume, et élimine toute possibilité de désynchronisation.

**Protection contre l'injection SQL via les noms de tables** : les noms de tables (`experience_domain`, etc.) sont interpolés directement dans le SQL — on ne peut pas les paramétrer avec `$1`. Pour éviter l'injection, [`utils/junctionTables.ts`](backend/src/utils/junctionTables.ts) maintient une whitelist statique de toutes les combinaisons valides. Toute combinaison non listée lève une `AppError(400)` avant la requête.

### Authentification — session plutôt que JWT

L'auth repose sur `express-session` avec un cookie `httpOnly` (durée : 30 min).

À la connexion (mot de passe + bcrypt), le controller pose `req.session.isAdmin = true`. Le middleware `checkAuth`, placé en amont de toutes les routes protégées, vérifie ce flag :

```ts
if (!req.session.isAdmin) throw new AppError(401, "Accès non autorisé");
```

**Pourquoi session et pas JWT ?** Ce dashboard n'a qu'un seul utilisateur et tourne sur un seul serveur. Les avantages du JWT (stateless, multi-serveur, pas de stockage côté serveur) ne s'appliquent pas ici. La session permet en revanche une invalidation immédiate : logout = destruction de la session. Avec un JWT signé, le token reste valide jusqu'à expiration sans liste de révocation côté serveur.

### Stratégie de test — Detroit TDD

Les tests suivent la philosophie Detroit TDD : seul le boundary DB est mocké (`vi.mock` sur `db.query`). Le reste — logique de service, utilitaires, transformations — s'exécute réellement.

**Pourquoi ce choix ?**
- Mocker les services dans les tests de controller produirait des tests qui passent même quand le service est cassé.
- Mocker uniquement `db.query` force à exercer le code réel tout en restant rapide (pas de base de données au moment des tests).
- Les erreurs attrapées sont réelles : une mauvaise requête SQL ou un mauvais traitement du résultat fait échouer le test, pas une signature de mock qui ne correspond plus.

La structure des tests est un miroir de `src/` dans `src/tests/` (un fichier de test par fichier source).

---

## Lancer le projet

```bash
docker compose up
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Base : port 5432

Le schéma et les données initiales sont injectés automatiquement au premier démarrage via `docker-entrypoint-initdb.d`.

---

## Bugs connus

### Transactions manquantes dans les services d'édition

**Fichiers :** [`experienceService.ts`](backend/src/service/cv/experienceService.ts), [`formationService.ts`](backend/src/service/cv/formationService.ts)

**Symptôme :** Si `editExperience` ou `editFormation` échoue en cours de route (ex : erreur sur l'insertion dans une table de liaison), les opérations SQL déjà exécutées (UPDATE, DELETE) sont commitées en base malgré l'erreur retournée au client. Pas d'atomicité.

**Cause :** Chaque appel `db.query()` utilise une connexion indépendante du pool. Aucun `BEGIN`/`COMMIT`/`ROLLBACK` n'enveloppe l'ensemble des opérations.

**Fix à implémenter :** exporter le `pool` depuis `db.ts`, sortir un client dans chaque `editX`, envelopper dans une transaction, et adapter `editInJunctionTable.ts` pour accepter ce client en paramètre.

**Priorité :** Moyenne — en pratique, le bug ne se déclenche plus depuis la correction des `AppError(400)` sur les tableaux vides (le cas pathologique ne se produit plus), mais l'atomicité reste une garantie fondamentale.

---

## État actuel

| Feature | État |
|---|---|
| Dashboard admin (9 sections) | ✅ Fonctionnel |
| Éditeur de CV avec filtres | ✅ Fonctionnel |
| Auth admin (session) | ✅ Fonctionnel |
| API publique CV | ✅ Fonctionnelle |
| API dashboard | ✅ Fonctionnelle |
| Tests backend | ✅ Écrits (couverture services + utils + middleware + controllers) |

### Prévu (V2)

- Authentification OIDC via GitLab.com (en parallèle du login mot de passe)
- Suppression des domaines (nécessite vérification des dépendances avant suppression + UI)
- Fix transactions manquantes (voir section Bugs connus)
- Déploiement public
