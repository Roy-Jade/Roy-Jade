import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { PoolClient } from 'pg';
import { deleteInJunctionTable, insertInJunctionTable, insertTasks } from '../../utils/editInJunctionTable.js';

const ERREUR_ID = "Erreur : aucun id n'a été fourni";
const ERREUR_TABLE = "Erreur : la table de liaison cible n'existe pas";
const ERREUR_ELEMENTS = "Erreur : aucun élément à ajouter n'a été fourni";

const client = { query: vi.fn() } as unknown as PoolClient;

beforeEach(() => {
    vi.clearAllMocks();
});

describe('deleteInJunctionTable', () => {

    it('cas fonctionnel : suppression effectuée', async () => {
        (client.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(deleteInJunctionTable("experience", "domain", 1, client)).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : id invalide', async () => {
        await expect(deleteInJunctionTable("experience", "domain", 0, client)).rejects.toThrow(ERREUR_ID);
    });

    it('cas dysfonctionnel : combinaison de tables invalide', async () => {
        await expect(deleteInJunctionTable("experience", "inconnue", 1, client)).rejects.toThrow(ERREUR_TABLE);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (client.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(deleteInJunctionTable("experience", "domain", 1, client)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('insertInJunctionTable', () => {

    it('cas fonctionnel : insertion effectuée', async () => {
        (client.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(insertInJunctionTable("experience", "domain", 1, [2, 3], client)).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : id invalide', async () => {
        await expect(insertInJunctionTable("experience", "domain", 0, [2, 3], client)).rejects.toThrow(ERREUR_ID);
    });

    it('cas dysfonctionnel : combinaison de tables invalide', async () => {
        await expect(insertInJunctionTable("experience", "inconnue", 1, [2, 3], client)).rejects.toThrow(ERREUR_TABLE);
    });

    it('cas dysfonctionnel : aucun élément fourni', async () => {
        await expect(insertInJunctionTable("experience", "domain", 1, [], client)).rejects.toThrow(ERREUR_ELEMENTS);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (client.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(insertInJunctionTable("experience", "domain", 1, [2, 3], client)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('insertTasks', () => {

    it('cas fonctionnel : insertion effectuée', async () => {
        (client.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(insertTasks("experience", 1, ["Tâche 1", "Tâche 2"], client)).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : id invalide', async () => {
        await expect(insertTasks("experience", 0, ["Tâche 1"], client)).rejects.toThrow(ERREUR_ID);
    });

    it('cas dysfonctionnel : combinaison de tables invalide', async () => {
        await expect(insertTasks("inconnue", 1, ["Tâche 1"], client)).rejects.toThrow(ERREUR_TABLE);
    });

    it('cas dysfonctionnel : aucune tâche fournie', async () => {
        await expect(insertTasks("experience", 1, [], client)).rejects.toThrow(ERREUR_ELEMENTS);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (client.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(insertTasks("experience", 1, ["Tâche 1"], client)).rejects.toThrow('Connexion BDD perdue');
    });
});
