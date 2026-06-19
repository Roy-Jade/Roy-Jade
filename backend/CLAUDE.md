# Backend Roy-Jade — Notes pour Claude

## Bug connu : absence de transactions dans les services d'édition

**Fichiers concernés :** `src/service/cv/experienceService.ts`, `src/service/cv/formationService.ts`

**Symptôme :** Si `editExperience` ou `editFormation` échoue en cours de route (erreur sur une des opérations de liaison), les opérations SQL déjà exécutées (UPDATE, DELETE) sont commitées en base malgré l'erreur retournée au client. Pas d'atomicité.

**Cause :** Les requêtes s'exécutent via `db.query()` (connexions indépendantes du pool). Aucun `BEGIN`/`COMMIT`/`ROLLBACK` n'enveloppe l'ensemble des opérations.

**Fix à implémenter :**

1. Exporter `pool` depuis `src/config/db.ts` :
```ts
export const pool = new Pool({ ... });
```

2. Dans chaque fonction `editX`, sortir un client du pool et envelopper dans une transaction :
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

3. Adapter `src/utils/editInJunctionTable.ts` pour accepter un `client` en paramètre (ou le pool) au lieu d'utiliser `db` directement.

**Priorité :** Moyenne — le bug est bénin en pratique depuis la correction des `AppError(400)` sur tableaux vides (le cas pathologique ne se produit plus), mais l'atomicité reste une garantie fondamentale à respecter.
