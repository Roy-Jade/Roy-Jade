import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchLanguage, addLanguage, editLanguage } from '../../../service/cv/languageService.js';

vi.mock('../../../config/db.js', () => ({
    default: { query: vi.fn() }
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('fetchLanguage', () => {

    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [
                { id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' },
                { id: 2, slug: 'espagnol', label: 'Espagnol', level: 'notions' },
            ]
        });

        await expect(fetchLanguage()).resolves.toEqual([
            { id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' },
            { id: 2, slug: 'espagnol', label: 'Espagnol', level: 'notions' },
        ]);
    });

    it('cas dysfonctionnel : aucune donnée en base', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(fetchLanguage()).rejects.toThrow('Aucune donnée trouvée');
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchLanguage()).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('addLanguage', () => {

    it('cas fonctionnel : donnée ajoutée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' }] });

        await expect(addLanguage({ slug: 'anglais', label: 'Anglais', level: 'courant' })).resolves.toEqual(
            { id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' }
        );
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(addLanguage({ slug: 'anglais', label: 'Anglais' })).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('editLanguage', () => {

    it('cas fonctionnel : donnée modifiée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: 'anglais', label: 'Anglais', level: 'maîtrise' }] });

        await expect(editLanguage(1, { level: 'maîtrise' })).resolves.toEqual(
            { id: 1, slug: 'anglais', label: 'Anglais', level: 'maîtrise' }
        );
    });

    it('cas dysfonctionnel : id non fourni', async () => {
        await expect(editLanguage(0, { label: 'Anglais' })).rejects.toThrow("Erreur : aucun id n'a été fourni");
    });

    it('cas dysfonctionnel : pas de champ donné', async () => {
        await expect(editLanguage(1, {})).rejects.toThrow("Erreur : aucun champ à modifier n'a été fourni");
    });

    it('cas dysfonctionnel : champ hors liste blanche', async () => {
        await expect(editLanguage(1, { identity: 'test' } as any)).rejects.toThrow(
            "Erreur : au moins l'un des champs à modifier n'existe pas"
        );
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(editLanguage(1, { label: 'Anglais' })).rejects.toThrow('Connexion BDD perdue');
    });
});
