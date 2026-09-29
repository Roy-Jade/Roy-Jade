# Backend Roy-Jade — Notes pour Claude

## Transactions sur les services d'édition — corrigé

**Fichiers concernés :** `src/config/db.ts`, `src/utils/editInJunctionTable.ts`, `src/service/cv/experienceService.ts`, `src/service/cv/formationService.ts`

`addExperience`/`editExperience`/`addFormation`/`editFormation` enveloppent désormais toutes leurs opérations dans une transaction :

```ts
const client = await pool.connect();
try {
    await client.query('BEGIN');
    // ... toutes les opérations avec client.query(...)
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

`pool` est exporté nommément depuis `src/config/db.ts` (en plus de l'export par défaut `{ query }`, toujours utilisé pour les lectures simples type `fetchExperience`/`getExperienceById`).

`editInJunctionTable.ts` (`deleteInJunctionTable`, `insertInJunctionTable`, `insertTasks`) prend un `client: PoolClient` obligatoire en dernier paramètre — c'est l'appelant qui fournit sa connexion transactionnelle, la fonction ne va plus chercher `db` elle-même. Choix délibéré (plutôt qu'un paramètre optionnel retombant sur `db`) : rend impossible d'appeler ces fonctions hors transaction par oubli.

Couvert par `src/tests/service/cv/experienceService.test.ts` / `formationService.test.ts` (cas nominal : `BEGIN` → opérations → `COMMIT` → `client.release()` ; cas d'échec : `ROLLBACK`, `COMMIT` jamais atteint, `client.release()` quand même appelé, aucune donnée exposée) et `src/tests/utils/editInJunctionTable.test.ts`.

## Bug connu : ligne fantôme sur les JSON_AGG sans FILTER (tasks/hardskills/softskills) — corrigé

**Symptôme (avant correctif) :** une formation (ou expérience) sans tâche renvoyait `tasks: [{ id: null, content: null, position: null }]` au lieu de `tasks: []`. S'affichait comme une ligne de tâche vide/"null" côté CV et dans le dashboard.

**Cause :** `JSON_AGG(DISTINCT jsonb_build_object(...))` sur un `LEFT JOIN ..._task` sans ligne correspondante produit une ligne "tout NULL" issue du LEFT JOIN, que `JSON_AGG` enveloppe quand même en tableau à un élément au lieu de renvoyer un tableau vide.

**Fix appliqué :** `COALESCE(JSON_AGG(...) FILTER (WHERE <clé de jointure> IS NOT NULL), '[]')` sur chaque `JSON_AGG` bâti sur un `LEFT JOIN`, sur le modèle déjà en place dans `dashboardService.fetchDashboard`. Appliqué dans `experienceService.fetchExperience` (tasks/softskills/hardskills), `formationService.fetchFormation` (tasks/hardskills), `utils/getExperienceById.ts` (tasks/softskills/hardskills), `utils/getFormationById.ts` (tasks/hardskills). Les `JOIN` sur `domain` restent en `INNER JOIN`, non concernés (toujours au moins une ligne).

Vérifié via `GET /api/cv/formation?data=science` (formations id 2/3/4, sans tâche dans le seed actuel) : `tasks: []` propre. Suite de tests (`experienceService.test.ts`, `formationService.test.ts`) et `tsc` propres.

## `dashboardService.fetchDashboard` / `GET /dashboard` (`getOverview`) — code mort

Découvert pendant le chantier de réorganisation des listes (`docs/refactor-list-reordering.md`, phase 3) : cet endpoint et son service ne sont appelés par **aucun composant frontend**, ni l'admin ni le CV public. Le vrai chemin de données pour hardskill/softskill/langue/loisir passe par `hardskillService`/`softskillService`/`languageService`/`hobbyService` (montés sous `/aside`, `/hardskill`, `/softskill`).

**Conséquence importante :** un correctif antérieur ([[project_ordering_bug]] côté mémoire IA) avait ajouté `ORDER BY id` dans `dashboardService.ts` pour régler un bug d'ordre — mais comme ce fichier n'est pas sur le vrai chemin, **le bug est resté actif** sur les endpoints réellement utilisés (qui n'avaient aucun `ORDER BY`) jusqu'à la phase 3 de la réorganisation des listes, qui l'a corrigé pour de bon via une vraie colonne `position` + `ORDER BY position` sur les 4 services réels.

**Non traité :** `dashboardService.ts`/`getOverview`/la route `GET /dashboard` n'ont pas été supprimés — hors périmètre du chantier qui a fait cette découverte. Code mort à supprimer un jour, avec ses tests dédiés.
