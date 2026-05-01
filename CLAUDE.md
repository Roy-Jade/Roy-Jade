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
1. **Éditeur de CV** — reprend la base de `old/`, le visiteur filtre les infos affichées ; données en base.
2. **Dashboard admin** — interface privée pour mettre à jour la base de données (nouvelles expériences, etc.).

## Structure du repo

```
Roy-Jade/
├── old/          # Ancienne version : CV site web vanilla JS + Parcel (référence)
│   └── src/
│       ├── assets/data/    # experiences.js, skills.js, courses.js, personalInfos.js
│       └── components/     # App, Aside, Courses, Experiences, Footer, Header, Presentation
└── new/
    └── frontend/           # Réécriture — React 19 + TypeScript + Vite + pnpm
        └── src/
            └── functions/
                └── core/
                    ├── components/  # Header, Footer
                    └── pages/       # Home
```

## Stack `new/frontend`

- **React 19** + **TypeScript** (strict)
- **Vite 7** (bundler)
- **React Router 7**
- **pnpm** (gestionnaire de paquets)
- SCSS pour les styles

## Données CV

Le fichier `data.js` (racine du repo) contient la structure complète des données CV, pensée pour une migration SQL :
- `profiles` — accroches par cible (labo, alternance, générique)
- `experiences` — expériences pro avec `type: "detail" | "summary"`, `domain`, `hardSkills`, `softSkills`
- `formations` — diplômes et formations
- `skills` — compétences hard et soft avec `category`, `level`, `domain`

Tables SQL prévues : `experiences`, `skills`, `experience_hardskills` (m2m), `experience_softskills` (m2m), `experience_domains` (m2m).

## Conventions

- Pas de commentaires sauf si le *pourquoi* est non-évident.
- TypeScript strict — pas de `any`.
- Commits en français, conventionnels.
- Organisation par feature dans `src/functions/`.
