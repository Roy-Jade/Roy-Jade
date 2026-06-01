import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../config/db.js';
import { deleteInJunctionTable, insertInJunctionTable, insertTasks } from '../../utils/editInJunctionTable.js';

vi.mock('../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

const ERREUR_ID = "Erreur : aucun id n'a été fourni";
const ERREUR_TABLE = "Erreur : la table de liaison cible n'existe pas";
const ERREUR_ELEMENTS = "Erreur : aucun élément à ajouter n'a été fourni";

beforeEach(() => {
    vi.clearAllMocks();
});

describe('deleteInJunctionTable', () => {

    it('cas fonctionnel : suppression effectuée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(deleteInJunctionTable("experience", "domain", 1)).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : id invalide', async () => {
        await expect(deleteInJunctionTable("experience", "domain", 0)).rejects.toThrow(ERREUR_ID);
    });

    it('cas dysfonctionnel : combinaison de tables invalide', async () => {
        await expect(deleteInJunctionTable("experience", "inconnue", 1)).rejects.toThrow(ERREUR_TABLE);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(deleteInJunctionTable("experience", "domain", 1)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('insertInJunctionTable', () => {

    it('cas fonctionnel : insertion effectuée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(insertInJunctionTable("experience", "domain", 1, [2, 3])).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : id invalide', async () => {
        await expect(insertInJunctionTable("experience", "domain", 0, [2, 3])).rejects.toThrow(ERREUR_ID);
    });

    it('cas dysfonctionnel : combinaison de tables invalide', async () => {
        await expect(insertInJunctionTable("experience", "inconnue", 1, [2, 3])).rejects.toThrow(ERREUR_TABLE);
    });

    it('cas dysfonctionnel : aucun élément fourni', async () => {
        await expect(insertInJunctionTable("experience", "domain", 1, [])).rejects.toThrow(ERREUR_ELEMENTS);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(insertInJunctionTable("experience", "domain", 1, [2, 3])).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('insertTasks', () => {

    it('cas fonctionnel : insertion effectuée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(insertTasks("experience", 1, ["Tâche 1", "Tâche 2"])).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : id invalide', async () => {
        await expect(insertTasks("experience", 0, ["Tâche 1"])).rejects.toThrow(ERREUR_ID);
    });

    it('cas dysfonctionnel : combinaison de tables invalide', async () => {
        await expect(insertTasks("inconnue", 1, ["Tâche 1"])).rejects.toThrow(ERREUR_TABLE);
    });

    it('cas dysfonctionnel : aucune tâche fournie', async () => {
        await expect(insertTasks("experience", 1, [])).rejects.toThrow(ERREUR_ELEMENTS);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(insertTasks("experience", 1, ["Tâche 1"])).rejects.toThrow('Connexion BDD perdue');
    });
});
