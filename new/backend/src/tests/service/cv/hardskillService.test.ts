import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchHardskill, addHardskill, editHardskill } from '../../../service/cv/hardskillService.js'

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

describe('fetchHardskill', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: [
                {
                    id: 1,
                    slug: "dressage",
                    label: "Dressage Pokémon",
                    level: "maitrise",
                    category: "terrain",
                    sub_category: "capture"
                },
                {
                    id: 2,
                    slug: "combat-stratégique",
                    label: "Combat stratégique",
                    level: "courant",
                    category: "terrain",
                    sub_category: "combat"
                },
                {
                    id: 3,
                    slug: "soins-pokemon",
                    label: "Soins aux Pokémon",
                    level: "notions",
                    category: "medical",
                    sub_category: null
                }
            ]});

        await expect(fetchHardskill(["dressage", "soins-pokemon"], "notions")).resolves.toEqual([
            {
                id: 1,
                slug: "dressage",
                label: "Dressage Pokémon",
                level: "maitrise",
                category: "terrain",
                sub_category: "capture"
            },
            {
                id: 2,
                slug: "combat-stratégique",
                label: "Combat stratégique",
                level: "courant",
                category: "terrain",
                sub_category: "combat"
            },
            {
                id: 3,
                slug: "soins-pokemon",
                label: "Soins aux Pokémon",
                level: "notions",
                category: "medical",
                sub_category: null
            }
        ]);
        expect(db.query).toHaveBeenCalledWith(`
        SELECT 
            hard.id,
            hard.slug,
            hard.label,
            hard.level,
            hard.category,
            hard.sub_category
            FROM hardskill hard
            WHERE hard.category = ANY($1)
            AND hard.level = ANY($2)
            `, [["dressage", "soins-pokemon"], ["notions", "courant", "maitrise"]]);
    });

    it('cas dysfonctionnel : level invalide', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchHardskill(["combat", "exploration"], "nul")).rejects.toThrow("Le niveau demandé n'existe pas");
    })

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchHardskill(["combat", "exploration"], "maitrise")).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchHardskill(["dressage", "soins-pokemon"], "notions")).rejects.toThrow('Connexion BDD perdue');
    });
})

describe('addHardskill', () => {

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
                    id: 1,
                    slug: "dressage",
                    label: "Dressage Pokémon",
                    level: "maitrise",
                    category: "terrain",
                    sub_category: "capture"
                }]});

        await expect(addHardskill({slug:"dressage", label:"Dressage Pokémon", level:"maitrise", category:"terrain", sub_category:"capture"})).resolves.toEqual({
                    id: 1,
                    slug: "dressage",
                    label: "Dressage Pokémon",
                    level: "maitrise",
                    category: "terrain",
                    sub_category: "capture"
                });
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(addHardskill({slug:"dressage", label:"Dressage Pokémon", level:"maitrise", category:"terrain", sub_category:"capture"})).rejects.toThrow('Connexion BDD perdue');
    });
})

describe('editHardskill', () => {

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
                    id: 1,
                    slug: "dressage",
                    label: "Dressage Pokémon",
                    level: "maitrise",
                    category: "terrain",
                    sub_category: "capture"
                }]});

        await expect(editHardskill(18, {label:"Autonome"})).resolves.toEqual({
                    id: 1,
                    slug: "dressage",
                    label: "Dressage Pokémon",
                    level: "maitrise",
                    category: "terrain",
                    sub_category: "capture"
                });
    });

    it('cas dysfonctionnel : id non fourni', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(editHardskill(0, {label:"Dressage Pokémon"})).rejects.toThrow("Erreur : aucun id n'a été fourni");
    })

    it('cas dysfonctionnel : pas de champ donné', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(editHardskill(1, {})).rejects.toThrow("Erreur : aucun champ à modifier n'a été fourni");
    })

    it('cas dysfonctionnel : champ hors liste blanche', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(editHardskill(1, {identity:"Rival"} as any)).rejects.toThrow(
            "Erreur : au moins l'un des champs à modifier n'existe pas"
        );
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(editHardskill(18, {label:"Autonome"})).rejects.toThrow('Connexion BDD perdue');
    });
})
