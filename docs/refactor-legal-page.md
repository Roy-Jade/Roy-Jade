# Page mentions légales

**Statut : en cours — il reste l'hébergeur à renseigner.**

## Reste à faire

- **Hébergeur** (mention obligatoire LCEN) : non choisi. Une fois connu, remplacer la constante `HOST` (nom, adresse, téléphone) en haut de `frontend/src/functions/core/pages/Legal/Legal.tsx`, marquée d'un `TODO`. Les valeurs provisoires « à définir » sont volontairement visibles sur la page.
- **Durée de conservation des logs** : à ajouter dans la rubrique « Données personnelles » si l'hébergeur (ou le reverse proxy) la précise.
- Critères de choix de l'hébergeur discutés : budget faible, pas de machine allumée 24 h/24, peu de maintenance, hébergement en France apprécié, Docker abandonnable. Piste principale : alwaysdata (frontend, Node et PostgreSQL chez un même hébergeur, donc même domaine). Vérifier que l'offre gratuite inclut PostgreSQL.
- **Piège à garder en tête au déploiement** : si frontend et API sont sur deux domaines différents, le cookie de session admin devient un cookie tiers, bloqué par défaut sous Safari. Garder une racine de domaine commune ou passer par un proxy.

## Constat de départ

Le site ne collecte aucune donnée personnelle de visiteurs :
- aucun cookie visiteur (`saveUninitialized: false` dans `backend/src/app.ts`) ; le cookie de session n'existe qu'après connexion admin ;
- seul stockage navigateur : le dernier chemin visité en `sessionStorage` (redirection post-login), jamais transmis ;
- pas de service tiers (polices hébergées localement, pas de mesure d'audience), pas de formulaire (page Contact en liens `mailto:`/`tel:`).

Conséquence : pas de bandeau de consentement (exemption CNIL des traceurs strictement nécessaires).

## Décisions actées

- **Site considéré comme professionnel** : il sert à la fois à la recherche d'emploi salarié et aux missions de la micro-entreprise. L'exception du particulier non professionnel (ne pas publier son adresse) ne s'applique donc pas. L'adresse affichée est une adresse de domiciliation, pas le domicile.
- **Infos éditeur lues depuis la table `identity` via fetch**, pas codées en dur : freine le scraping par les robots de masse (pas contre un robot ciblé, l'endpoint JSON étant public). Si le fetch échoue, seul le bloc concerné affiche « Informations momentanément indisponibles », le reste de la page s'affiche.
- **SIRET et domiciliation ajoutés à `identity`**, nullables (un fork sans micro-entreprise n'en a pas). Le bloc micro-entreprise de la page n'apparaît que si `siret` est renseigné.
  - Base : `CHECK` de format (14 chiffres), `CHECK` adresse non blanche, `CHECK ((siret IS NULL) = (domiciliation IS NULL))` pour imposer « les deux ou aucun ». Un `CHECK` qui vaut `NULL` passe, d'où des colonnes nullables sans clause supplémentaire.
  - Zod : `""` converti en `null` (le frontend envoie `""` pour un champ vide ; `undefined` aurait fait disparaître la clé du JSON et rendu le SIRET impossible à vider avec l'`UPDATE` partiel). Zod ne vérifie pas la règle « les deux ou aucun » : sur une modification partielle, seule la base voit la ligne complète.
  - Controller : `DatabaseError` sur la contrainte `siret_domiciliation_together` renvoie 400 au lieu de 500.
  - Formulaire : chaque champ devient `required` dès que l'autre est rempli ; adresse en `<textarea>` (un `<input>` supprime les retours à la ligne) et affichage en `white-space: pre-line`.
- **Licence AGPL-3.0-only** : usage libre (y compris pour une vitrine commerciale), mais toute version modifiée mise en ligne doit publier son code. Ne pas interdire la revente comme template, mais la rendre peu viable. `-only` plutôt que `-or-later` pour ne pas déléguer à la FSF le droit de changer les règles. Texte complet dans `LICENSE` (obligatoire, section 4), champ `license` des deux `package.json`, notice de copyright dans le README.
- `postal_code` retiré du type frontend `Identity` (n'existait pas en base).

## Implémentation

- `backend/conception/migration.sql` — colonnes et contraintes `siret`/`domiciliation`.
- `backend/src/schema/cv/identity.ts` — `emptyToNull` et validation des deux champs.
- `backend/src/controller/cv/identityController.ts` — 400 sur violation de `siret_domiciliation_together`.
- `backend/src/tests/controller/cv/identityController.test.ts` — normalisation, formats invalides, contrainte BDD.
- `backend/API.md` — routes `identity` mises à jour.
- `frontend/src/types/Identity.ts`, `IdentityForm.tsx`, `DashboardIdentity.tsx/.scss` — champs et affichage côté dashboard.
- `frontend/src/functions/core/pages/Legal/Legal.tsx/.scss` — page : éditeur, directeur de publication, hébergement, données personnelles, cookies et stockage local, liens externes, propriété intellectuelle (lien vers le dépôt via la constante `SOURCE_CODE_URL`, modifiable par un fork).

## Vérification

`tsc -p tsconfig.app.json` propre, 15 tests du controller `identity` verts. Rendu de la page non vérifié visuellement dans cette session (pas d'outil de capture) : à contrôler sous Safari, Chrome et Firefox.

## Limite

Contenu juridique rédigé avec Claude, sans avis d'un professionnel. Sources consultées : entreprendre.service-public.fr (mentions obligatoires de l'entrepreneur individuel), texte de l'AGPL-3.0.
