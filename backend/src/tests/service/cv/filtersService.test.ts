import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchFilters } from '../../../service/cv/filtersService.js';

vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

const mockFullResults = () => {
    (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, context: 'generique', tagline: 'Tagline', description: 'Description' }] });
    (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: 'web', label: 'Développement web' }] });
    (db.query as Mock).mockResolvedValueOnce({ rows: [{ category: 'frontend' }] });
    (db.query as Mock).mockResolvedValueOnce({ rows: [{ level: 'avancé' }] });
};

describe('fetchFilters', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cas fonctionnel : données récupérées', async () => {
        mockFullResults();

        await expect(fetchFilters()).resolves.toEqual({
            type: ['detail', 'summary'],
            context: ['generique'],
            domain: [{ id: 1, slug: 'web', label: 'Développement web' }],
            category: ['frontend'],
            level: ['avancé'],
            profile: [{ id: 1, context: 'generique', tagline: 'Tagline', description: 'Description' }],
        });
    });

    it('cas dysfonctionnel : au moins une requête sans résultat', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, context: 'generique', tagline: 'Tagline', description: 'Description' }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ category: 'frontend' }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ level: 'avancé' }] });

        await expect(fetchFilters()).rejects.toThrow('Aucune donnée trouvée');
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchFilters()).rejects.toThrow('Connexion BDD perdue');
    });
});
