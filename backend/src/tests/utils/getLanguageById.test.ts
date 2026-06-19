import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../config/db.js';
import { getLanguageById } from '../../utils/getLanguageById.js';

vi.mock('../../config/db.js', () => ({
    default: { query: vi.fn() }
}));

const ERREUR_404 = "Aucune donnée trouvée";

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getLanguageById', () => {

    it('cas fonctionnel : donnée trouvée', async () => {
        const row = { id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' };
        (db.query as Mock).mockResolvedValueOnce({ rows: [row] });

        await expect(getLanguageById(1)).resolves.toEqual(row);
    });

    it('cas dysfonctionnel : donnée non trouvée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(getLanguageById(99)).rejects.toThrow(ERREUR_404);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(getLanguageById(1)).rejects.toThrow('Connexion BDD perdue');
    });
});
