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

## Bug connu : ligne fantôme sur les JSON_AGG sans FILTER (tasks/hardskills/softskills)

**Symptôme :** une formation (ou expérience) sans tâche renvoie `tasks: [{ id: null, content: null, position: null }]` au lieu de `tasks: []`. S'affiche comme une ligne de tâche vide/"null" côté CV et dans le dashboard. Confirmé via `GET /api/cv/formation` (formations sans tâche, ex. id 2/3/4 du seed actuel).

**Cause :** `JSON_AGG(DISTINCT jsonb_build_object(...))` sur un `LEFT JOIN ..._task` sans ligne correspondante produit une ligne "tout NULL" issue du LEFT JOIN, que `JSON_AGG` enveloppe quand même en tableau à un élément au lieu de renvoyer un tableau vide. `dashboardService.fetchDashboard` évite déjà ce problème via `COALESCE(JSON_AGG(...) FILTER (WHERE task.content IS NOT NULL), '[]')` — mais `experienceService.fetchExperience`, `formationService.fetchFormation`, `getExperienceById` et `getFormationById` n'ont pas ce traitement (ni sur `tasks`, ni sur `hardskills`/`softskills`, potentiellement affectés par le même bug si un item n'a aucune compétence liée).

**Fix à appliquer (non fait) :** ajouter `FILTER (WHERE <clé de jointure> IS NOT NULL)` + `COALESCE(..., '[]')` sur chaque `JSON_AGG` bâti sur un `LEFT JOIN` dans ces quatre fichiers, sur le modèle de `dashboardService.fetchDashboard`. Les `JOIN` sur `domain` sont en `INNER JOIN`, non concernés.

**Priorité :** cosmétique (affichage), pas un problème d'intégrité des données. Repéré pendant `cv-dashboard-refactor`, sans lien avec ce chantier — pas encore corrigé.
