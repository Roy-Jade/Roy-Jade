import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchHobby, addHobby, editHobby } from '../../../service/cv/hobbyService.js';

vi.mock('../../../config/db.js', () => ({
    default: { query: vi.fn() }
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('fetchHobby', () => {

    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [
                { id: 1, slug: 'modelisme', label: 'Modélisme', supplement: 'Montage et peinture de figurines' },
                { id: 2, slug: 'lecture', label: 'Lecture', supplement: null },
            ]
        });

        await expect(fetchHobby()).resolves.toEqual([
            { id: 1, slug: 'modelisme', label: 'Modélisme', supplement: 'Montage et peinture de figurines' },
            { id: 2, slug: 'lecture', label: 'Lecture', supplement: null },
        ]);
    });

    it('cas dysfonctionnel : aucune donnée en base', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(fetchHobby()).rejects.toThrow('Aucune donnée trouvée');
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchHobby()).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('addHobby', () => {

    it('cas fonctionnel : donnée ajoutée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: 'modelisme', label: 'Modélisme', supplement: null }] });

        await expect(addHobby({ label: 'Modélisme' })).resolves.toEqual(
            { id: 1, slug: 'modelisme', label: 'Modélisme', supplement: null }
        );
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(addHobby({ label: 'Modélisme' })).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('editHobby', () => {

    it('cas fonctionnel : donnée modifiée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: 'modelisme', label: 'Modélisme', supplement: 'Wargame' }] });

        await expect(editHobby(1, { supplement: 'Wargame' })).resolves.toEqual(
            { id: 1, slug: 'modelisme', label: 'Modélisme', supplement: 'Wargame' }
        );
    });

    it('cas dysfonctionnel : id non fourni', async () => {
        await expect(editHobby(0, { label: 'Modélisme' })).rejects.toThrow("Erreur : aucun id n'a été fourni");
    });

    it('cas dysfonctionnel : pas de champ donné', async () => {
        await expect(editHobby(1, {})).rejects.toThrow("Erreur : aucun champ à modifier n'a été fourni");
    });

    it('cas dysfonctionnel : champ hors liste blanche', async () => {
        await expect(editHobby(1, { identity: 'test' } as any)).rejects.toThrow(
            "Erreur : au moins l'un des champs à modifier n'existe pas"
        );
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(editHobby(1, { label: 'Modélisme' })).rejects.toThrow('Connexion BDD perdue');
    });
});
