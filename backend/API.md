# API Reference — Portfolio Roy-Jade

Base URL : `http://localhost:3000`

Les routes `/api/cv/dashboard/*` et `POST /api/auth/logout` nécessitent une session admin active (cookie httpOnly, durée 30 min). Toute requête non authentifiée reçoit `401`.

---

## Authentification

### POST /api/auth/login
Ouvre une session admin.

**Body**
```json
{
  "pseudonyme": "string",
  "password": "string"
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ message: "Authentification réussie" }` |
| 401 | `{ message: "Erreur : l'identifiant et le mot de passe ne correspondent pas" }` |
| 500 | `{ message: "Erreur interne" }` |

---

### POST /api/auth/logout
Détruit la session courante. **Authentification requise.**

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ message: "Déconnexion réussie" }` |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### GET /api/auth/session
Indique si la session courante est une session admin. Aucun paramètre requis, aucune authentification requise — répond toujours 200, `isAdmin` vaut `false` pour un visiteur anonyme.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { isAdmin: boolean } }` |

---

## CV (public)

### GET /api/cv/filters
Retourne toutes les valeurs valides pour alimenter les UI de filtres côté front. Aucun paramètre requis.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { type, context, domain, category, level } }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

**Forme du résultat**
```json
{
  "result": {
    "type": ["detail", "summary"],
    "context": ["generique", "labo", "alternance"],
    "domain": [{ "id": 1, "slug": "web", "label": "Développement web" }],
    "category": ["frontend", "backend"],
    "level": ["débutant", "intermédiaire", "avancé"],
    "profile": [{ "id": 1, "context": "generique", "tagline": "...", "description": "..." }]
  }
}
```

`type` est extrait statiquement du schéma Zod (pas de requête DB). Les autres champs viennent de la base. `profile` contient tous les profils (tous contextes confondus) — contenu déjà public un par un via `GET /api/cv/profile?context=...`, ce champ ne fait qu'agréger la même donnée en un seul appel.

---

### GET /api/cv/identity
Retourne les informations personnelles.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, firstname, lastname, email, telephone, github_link, gitlab_link, linkedin_link, rqth } }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

---

### GET /api/cv/profile
Retourne le profil correspondant au contexte demandé.

**Query params**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `context` | string | oui | Ex : `generique`, `labo`, `alternance` |

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, context, tagline, description } }` |
| 400 | `{ message: "Erreur : le niveau est requis" }` |
| 404 | `{ message: "Aucune donnée trouvée" }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

---

### GET /api/cv/hardskill
Retourne les compétences techniques filtrées.

**Query params**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `level` | string | oui | Ex : `avancé`, `intermédiaire` |
| `category` | string ou string[] | non | Ex : `frontend` ou `frontend&category=backend` |

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: [{ id, slug, label, level, category, sub_category }] }` |
| 400 | `{ message: "Erreur : le niveau est requis" }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

---

### GET /api/cv/softskill
Retourne toutes les compétences comportementales. Aucun paramètre requis.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: [{ id, slug, label }] }` |
| 404 | `{ message: "Aucune donnée trouvée" }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

---

### GET /api/cv/experience
Retourne les expériences filtrées par domaine et type.

**Query params**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `data` | string (JSON) | oui | Tableau JSON stringifié de filtres |

Format de `data` :
```json
[{ "domain": "web", "type": "detail" }, { "domain": "science", "type": "summary" }]
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: [{ id, slug, type, title, company, location, start_date, end_date, description, tasks, softskills, hardskills, domains }] }` |
| 400 | `{ message: "..." }` (ZodError si le format de `data` est invalide) |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

**Forme de `tasks`/`softskills`/`hardskills`**
```json
{
  "tasks": [{ "id": 1, "content": "...", "position": 1 }],
  "softskills": [{ "id": 5, "slug": "autonomie", "label": "Autonomie" }],
  "hardskills": [{ "id": 9, "slug": "react", "label": "React", "level": "avancé", "category": "frontend", "sub_category": "framework" }]
}
```
`softskills[].id`/`hardskills[].id` sont les ID de la ligne de liaison (`experience_softskill`/`experience_hardskill`), pas ceux de `softskill`/`hardskill` — un même skill peut apparaître sur plusieurs expériences avec un `id` différent à chaque fois.

---

### GET /api/cv/formation
Retourne les formations, filtrées optionnellement par domaine.

**Query params**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `data` | string ou string[] | non | Slug(s) de domaine. Ex : `data=web` ou `data=web&data=science` |

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: [{ id, slug, title, institution, location, obtention_date, description, level, tasks, hardskills, domains }] }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

**Forme de `tasks`/`hardskills`**
```json
{
  "tasks": [{ "id": 1, "content": "...", "position": 1 }],
  "hardskills": [{ "id": 9, "slug": "react", "label": "React", "level": "avancé", "category": "frontend", "sub_category": "framework" }]
}
```
`hardskills[].id` est l'ID de la ligne de liaison (`formation_hardskill`), pas celui de `hardskill` — un même skill peut apparaître sur plusieurs formations avec un `id` différent à chaque fois.

---

### GET /api/cv/aside
Retourne les langues et les hobbies. Aucun paramètre requis.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { language, hobby } }` |
| 404 | `{ message: "Aucune donnée trouvée" }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

**Forme du résultat**
```json
{
  "result": {
    "language": [{ "id": 1, "slug": "anglais", "label": "Anglais", "level": "courant" }],
    "hobby": [{ "id": 1, "slug": "modelisme", "label": "Modélisme", "supplement": "Montage et peinture de figurines" }]
  }
}
```

---

## Dashboard (authentification requise)

### GET /api/cv/dashboard
Retourne l'ensemble des données de la base (sauf table admin).

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { identity, language[], hobby[], profile[], domain[], softskill[], hardskill[], experience[], formation[] } }` |
| 500 | `{ message: "Erreur lors de la récupération des données" }` |

---

### POST /api/cv/dashboard/experience
Ajoute une expérience avec ses relations.

**Body**
```json
{
  "data": { "slug": "string", "type": "detail|summary", "title": "string", "company": "string?", "location": "string?", "start_date": "string?", "end_date": "string?", "description": "string?" },
  "domain": [1, 2],
  "tasks": ["Tâche 1", "Tâche 2"],
  "hardskill": [3, 4],
  "softskill": [5]
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 201 | `{ result: { id, slug, type, title, ..., tasks, softskills, hardskills, domains } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### POST /api/cv/dashboard/formation
Ajoute une formation avec ses relations.

**Body**
```json
{
  "data": { "slug": "string", "title": "string", "institution": "string?", "location": "string?", "obtention_date": "string?", "description": "string?", "level": "string?" },
  "domain": [1],
  "tasks": ["Tâche 1"],
  "hardskill": [2, 3]
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 201 | `{ result: { id, slug, title, ..., tasks, hardskills, domains } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### POST /api/cv/dashboard/hardskill
Ajoute une compétence technique.

**Body**
```json
{
  "data": { "slug": "string", "label": "string", "level": "string?", "category": "string?", "sub_category": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 201 | `{ result: { id, slug, label, level, category, sub_category } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### POST /api/cv/dashboard/softskill
Ajoute une compétence comportementale.

**Body**
```json
{
  "data": { "slug": "string", "label": "string" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 201 | `{ result: { id, slug, label } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/identity
Modifie les informations personnelles (tous les champs sont optionnels).

**Body**
```json
{
  "data": { "firstname": "string?", "lastname": "string?", "email": "string?", "telephone": "string?", "github_link": "string?", "gitlab_link": "string?", "linkedin_link": "string?", "rqth": "boolean?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, firstname, lastname, email, telephone, github_link, gitlab_link, linkedin_link, rqth } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/experience/:id
Modifie une expérience. Tous les champs sont optionnels — seuls les champs fournis sont mis à jour.

**Params** : `id` — identifiant de l'expérience

**Body**
```json
{
  "experienceData": { "slug": "string?", "type": "detail|summary?", "title": "string?", "company": "string?", "location": "string?", "start_date": "string?", "end_date": "string?", "description": "string?" },
  "domainData": [1, 2],
  "hardskillData": [3],
  "softskillData": [4, 5],
  "taskData": ["Nouvelle tâche"]
}
```

Les tableaux de relations remplacent intégralement les relations existantes si fournis.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, slug, type, title, ..., tasks, softskills, hardskills, domains } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/formation/:id
Modifie une formation. Tous les champs sont optionnels.

**Params** : `id` — identifiant de la formation

**Body**
```json
{
  "formationData": { "slug": "string?", "title": "string?", "institution": "string?", "location": "string?", "obtention_date": "string?", "description": "string?", "level": "string?" },
  "domainData": [1],
  "hardskillData": [2, 3],
  "taskData": ["Nouvelle tâche"]
}
```

Les tableaux de relations remplacent intégralement les relations existantes si fournis.

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, slug, title, ..., tasks, hardskills, domains } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/hardskill/:id
Modifie une compétence technique. Tous les champs sont optionnels.

**Params** : `id` — identifiant de la compétence

**Body**
```json
{
  "data": { "slug": "string?", "label": "string?", "level": "string?", "category": "string?", "sub_category": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, slug, label, level, category, sub_category } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/softskill/:id
Modifie une compétence comportementale. Tous les champs sont optionnels.

**Params** : `id` — identifiant de la compétence

**Body**
```json
{
  "data": { "slug": "string?", "label": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, slug, label } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### POST /api/cv/dashboard/language
Ajoute une langue.

**Body**
```json
{
  "data": { "slug": "string", "label": "string", "level": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 201 | `{ result: { id, slug, label, level } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/language/:id
Modifie une langue. Tous les champs sont optionnels.

**Params** : `id` — identifiant de la langue

**Body**
```json
{
  "data": { "slug": "string?", "label": "string?", "level": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, slug, label, level } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### POST /api/cv/dashboard/hobby
Ajoute un hobby.

**Body**
```json
{
  "data": { "slug": "string", "label": "string", "supplement": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 201 | `{ result: { id, slug, label, supplement } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |

---

### PATCH /api/cv/dashboard/hobby/:id
Modifie un hobby. Tous les champs sont optionnels.

**Params** : `id` — identifiant du hobby

**Body**
```json
{
  "data": { "slug": "string?", "label": "string?", "supplement": "string?" }
}
```

**Réponses**
| Code | Corps |
|------|-------|
| 200 | `{ result: { id, slug, label, supplement } }` |
| 400 | `{ message: "..." }` (ZodError ou AppError) |
| 500 | `{ message: "Erreur lors de la modification des données" }` |
