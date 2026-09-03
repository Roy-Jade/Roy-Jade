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
