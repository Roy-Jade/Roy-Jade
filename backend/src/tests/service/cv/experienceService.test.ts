import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db, { pool } from '../../../config/db.js';
import { fetchExperience, addExperience, editExperience } from '../../../service/cv/experienceService.js'
import type { Experience } from '../../../schema/cv/experience.js';

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() },
  pool: { connect: vi.fn() }
}));

describe('fetchExperience', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données récupérées en une seule requête, sans doublon', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [
                {
                    id:1,
                    slug:"ranger",
                    type:"detail",
                    title:"Chevalier ranger mercenaire",
                    company:"Poing enflammé",
                    location:"Porte de Baldur",
                    start_date:"1396",
                    end_date:"1401",
                    description:"En association du Point enflammé, la mission consistait à démanteler un culte maléfique qui prenait ces racines dans les profondeurs de la Porte de Baldur.",
                    tasks :[
                        {content:"Dépistage des cellules de cultistes", position:1},
                        {content:"Suppresion des leaders du culte", position:2},
                    ],
                    softskills: [
                        {slug:"autonomie", label:"Autonomie"}
                    ],
                    hardskills: [
                        {slug:"traque-urbain", label:"Capacités de traque en milieu urbain", level:"expert", category:"Survie", sub_category:"Pistage"}
                    ]
                },
                {
                    id:2,
                    slug:"occultiste",
                    type:"detail",
                    title:"Occultiste de la Grande Fée Verte",
                    company:"Cour de la Fée Verte",
                    location:"Domaine Féérique vert",
                    start_date:"1402",
                    end_date:"1406",
                    description:"Au sein de la cour de la Grande Fée Verte, réduction des menaces invasives qui se développement dans le domaine féérique.",
                    tasks :[
                        {content:"Suppression des menaces invasives", position:1},
                        {content:"Entrainement des jeunes recrues", position:2},
                    ],
                    softskills: [
                        {slug:"empathie", label:"Empathie"},
                        {slug:"formation", label:"Formation"}
                    ],
                    hardskills: [
                        {slug:"occultisme", label:"Compétences de combat d'occultiste", level:"intermédiaire", category:"Magie", sub_category:"Occultisme"}
                    ]
                }
            ]});

        await expect(fetchExperience([{"domains":["combattant", "magicien"], "type":"detail"}])).resolves.toEqual([
                { 
                    id:1,
                    slug:"ranger",
                    type:"detail",
                    title:"Chevalier ranger mercenaire",
                    company:"Poing enflammé",
                    location:"Porte de Baldur",
                    start_date:"1396",
                    end_date:"1401",
                    description:"En association du Point enflammé, la mission consistait à démanteler un culte maléfique qui prenait ces racines dans les profondeurs de la Porte de Baldur.",
                    tasks :[
                        {content:"Dépistage des cellules de cultistes", position:1},
                        {content:"Suppresion des leaders du culte", position:2},
                    ],
                    softskills: [
                        {slug:"autonomie", label:"Autonomie"}
                    ],
                    hardskills: [
                        {slug:"traque-urbain", label:"Capacités de traque en milieu urbain", level:"expert", category:"Survie", sub_category:"Pistage"}
                    ]
                },
                { 
                    id:2,
                    slug:"occultiste",
                    type:"detail",
                    title:"Occultiste de la Grande Fée Verte",
                    company:"Cour de la Fée Verte",
                    location:"Domaine Féérique vert",
                    start_date:"1402",
                    end_date:"1406",
                    description:"Au sein de la cour de la Grande Fée Verte, réduction des menaces invasives qui se développement dans le domaine féérique.",
                    tasks :[
                        {content:"Suppression des menaces invasives", position:1},
                        {content:"Entrainement des jeunes recrues", position:2},
                    ],
                    softskills: [
                        {slug:"empathie", label:"Empathie"},
                        {slug:"formation", label:"Formation"}
                    ],
                    hardskills: [
                        {slug:"occultisme", label:"Compétences de combat d'occultiste", level:"intermédiaire", category:"Magie", sub_category:"Occultisme"}
                    ]
                },
            ]);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('dom.slug = ANY($1)'),
            [["combattant", "magicien"], "detail"]
        );
    });

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchExperience([{"domains":["voleur"], "type":"summary"}])).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchExperience([{"domains":["voleur"], "type":"summary"}])).rejects.toThrow('Connexion BDD perdue');
    });
})

describe('addExperience', () => {
    let client: { query: Mock; release: Mock };

    beforeEach(() => {
        vi.clearAllMocks();
        client = { query: vi.fn(), release: vi.fn() };
        (pool.connect as Mock).mockResolvedValue(client);
    });

    it('cas fonctionnel : transaction complète, commit et libération du client', async () => {
        client.query.mockImplementation((sql: string) => {
            if (sql.includes('INSERT INTO experience (')) return Promise.resolve({ rows: [{ id: 10 }] });
            return Promise.resolve({ rows: [] });
        });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 10, slug: "ranger", title: "Chevalier ranger" }] });

        const result = await addExperience(
            { slug: "ranger", type: "detail", title: "Chevalier ranger" } as Experience,
            [1, 2], ["Tâche 1"], [3], [4]
        );

        expect(result).toEqual({ id: 10, slug: "ranger", title: "Chevalier ranger" });
        expect(client.query.mock.calls[0][0]).toBe('BEGIN');
        expect(client.query.mock.calls.at(-1)?.[0]).toBe('COMMIT');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO experience_domain'), expect.anything());
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO experience_task'), expect.anything());
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO experience_hardskill'), expect.anything());
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO experience_softskill'), expect.anything());
        expect(client.release).toHaveBeenCalledOnce();
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE exp.id = $1'), [10]);
    });

    it("cas dysfonctionnel : une insertion échoue, rollback complet et aucune donnée exposée", async () => {
        client.query.mockImplementation((sql: string) => {
            if (sql.includes('INSERT INTO experience (')) return Promise.resolve({ rows: [{ id: 10 }] });
            if (sql.includes('INSERT INTO experience_domain')) return Promise.reject(new Error('Violation de contrainte : domaine inconnu'));
            return Promise.resolve({ rows: [] });
        });

        await expect(addExperience(
            { slug: "ranger", type: "detail", title: "Chevalier ranger" } as Experience,
            [999], ["Tâche 1"], [3], [4]
        )).rejects.toThrow('Violation de contrainte : domaine inconnu');

        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(client.query).not.toHaveBeenCalledWith('COMMIT');
        expect(client.release).toHaveBeenCalledOnce();
        expect(db.query).not.toHaveBeenCalled();
    });
});

describe('editExperience', () => {
    let client: { query: Mock; release: Mock };

    beforeEach(() => {
        vi.clearAllMocks();
        client = { query: vi.fn(), release: vi.fn() };
        (pool.connect as Mock).mockResolvedValue(client);
    });

    it('cas fonctionnel : transaction complète, commit et libération du client', async () => {
        client.query.mockResolvedValue({ rows: [] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 5, title: "Nouveau titre" }] });

        const result = await editExperience(5, { title: "Nouveau titre" }, [1, 2], null, null, null);

        expect(result).toEqual({ id: 5, title: "Nouveau titre" });
        expect(client.query.mock.calls[0][0]).toBe('BEGIN');
        expect(client.query.mock.calls.at(-1)?.[0]).toBe('COMMIT');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE experience SET'), [5, "Nouveau titre"]);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM experience_domain'), [5]);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO experience_domain'), expect.anything());
        expect(client.release).toHaveBeenCalledOnce();
    });

    it("cas dysfonctionnel : l'insertion des domaines échoue, rollback complet (le titre déjà modifié n'est pas conservé)", async () => {
        client.query.mockImplementation((sql: string) => {
            if (sql.includes('INSERT INTO experience_domain')) return Promise.reject(new Error('Violation de contrainte'));
            return Promise.resolve({ rows: [] });
        });

        await expect(editExperience(5, { title: "Nouveau titre" }, [999], null, null, null))
            .rejects.toThrow('Violation de contrainte');

        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(client.query).not.toHaveBeenCalledWith('COMMIT');
        expect(client.release).toHaveBeenCalledOnce();
        expect(db.query).not.toHaveBeenCalled();
    });

    it('cas dysfonctionnel : champ invalide, rollback avant toute écriture', async () => {
        client.query.mockResolvedValue({ rows: [] });

        await expect(editExperience(5, { unknownField: "x" } as unknown as Partial<Experience>, null, null, null, null))
            .rejects.toThrow("Erreur : au moins l'un des champs à modifier n'existe pas");

        expect(client.query).toHaveBeenCalledWith('BEGIN');
        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(client.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE experience SET'), expect.anything());
        expect(client.release).toHaveBeenCalledOnce();
    });
});