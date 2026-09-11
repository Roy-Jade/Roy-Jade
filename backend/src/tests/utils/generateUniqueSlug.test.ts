import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { generateUniqueSlug, type SlugTable } from '../../utils/generateUniqueSlug.js';

const client = { query: vi.fn() };

beforeEach(() => {
    vi.clearAllMocks();
});

describe('generateUniqueSlug', () => {

    it('cas fonctionnel : slug de base libre, renvoyé tel quel', async () => {
        (client.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(generateUniqueSlug(client, 'experience', 'developpeur-2027')).resolves.toBe('developpeur-2027');
        expect(client.query).toHaveBeenCalledWith(
            'SELECT 1 FROM experience WHERE slug = $1',
            ['developpeur-2027']
        );
    });

    it('cas fonctionnel : collision, essaie -02', async () => {
        (client.query as Mock)
            .mockResolvedValueOnce({ rows: [{}] })
            .mockResolvedValueOnce({ rows: [] });

        await expect(generateUniqueSlug(client, 'experience', 'developpeur-2027')).resolves.toBe('developpeur-2027-02');
    });

    it('cas fonctionnel : deux collisions, essaie -03', async () => {
        (client.query as Mock)
            .mockResolvedValueOnce({ rows: [{}] })
            .mockResolvedValueOnce({ rows: [{}] })
            .mockResolvedValueOnce({ rows: [] });

        await expect(generateUniqueSlug(client, 'experience', 'developpeur-2027')).resolves.toBe('developpeur-2027-03');
    });

    it('cas fonctionnel : exclut son propre id lors d\'une édition (pas de faux positif sur soi-même)', async () => {
        (client.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(generateUniqueSlug(client, 'experience', 'developpeur-2027', 5)).resolves.toBe('developpeur-2027');
        expect(client.query).toHaveBeenCalledWith(
            'SELECT 1 FROM experience WHERE slug = $1 AND id != $2',
            ['developpeur-2027', 5]
        );
    });

    it('cas dysfonctionnel : table non autorisée', async () => {
        await expect(generateUniqueSlug(client, 'inconnue' as SlugTable, 'x')).rejects.toThrow('Table non autorisée pour la génération de slug : inconnue');
        expect(client.query).not.toHaveBeenCalled();
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (client.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(generateUniqueSlug(client, 'domain', 'x')).rejects.toThrow('Connexion BDD perdue');
    });
});
