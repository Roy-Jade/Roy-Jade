import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchSoftskill, addSoftskill, editSoftskill } from '../../../service/cv/softskillService.js'

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

describe('fetchSoftskill', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [
                { id: 1, slug: "autonomie", label: "Autonomie" },
                { id: 2, slug: "empathie", label: "Empathie" }
            ]});

        await expect(fetchSoftskill()).resolves.toEqual([
            { id: 1, slug: "autonomie", label: "Autonomie" },
            { id: 2, slug: "empathie", label: "Empathie" }
        ]);
    });

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchSoftskill()).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchSoftskill()).rejects.toThrow('Connexion BDD perdue');
    });
})

describe('addSoftskill', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données ajoutées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [{id: 18}]
        });
        (db.query as Mock).mockResolvedValueOnce({
            rows: [{
                    id: 18,
                    slug: "autonomie",
                    label: "Autonomie",
                }]});

        await expect(addSoftskill({slug:"autonomie", label:"Autonomie"})).resolves.toEqual({
                    id: 18,
                    slug: "autonomie",
                    label: "Autonomie",
                });
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(addSoftskill({slug:"autonomie", label:"Autonomie"})).rejects.toThrow('Connexion BDD perdue');
    });
})

describe('editSoftskill', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données modifiées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [{id: 18}]
        });
        (db.query as Mock).mockResolvedValueOnce({
            rows: [{
                    id: 18,
                    slug: "autonomie",
                    label: "Autonome",
                }]});

        await expect(editSoftskill(18, {label:"Autonome"})).resolves.toEqual({
                    id: 18,
                    slug: "autonomie",
                    label: "Autonome",
                });
    });

    it('cas dysfonctionnel : id non fourni', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(editSoftskill(0, {label:"Autonome"})).rejects.toThrow("Erreur : aucun id n'a été fourni");
    })

    it('cas dysfonctionnel : pas de champ donné', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(editSoftskill(18, {})).rejects.toThrow("Erreur : aucun champ à modifier n'a été fourni");
    })

    it('cas dysfonctionnel : champ hors liste blanche', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(editSoftskill(1, {niveau:"Nul"} as any)).rejects.toThrow("Erreur : au moins l'un des champs à modifier n'existe pas");
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(editSoftskill(18, {label:"Autonome"})).rejects.toThrow('Connexion BDD perdue');
    });
})