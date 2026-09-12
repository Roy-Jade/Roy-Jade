import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db, { pool } from '../../../config/db.js';
import { fetchFormation, addFormation, editFormation } from '../../../service/cv/formationService.js'
import type { Formation } from '../../../schema/cv/formation.js';

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() },
  pool: { connect: vi.fn() }
}));

describe('fetchFormation', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [
                {
                    id: 1,
                    slug: "academie-hyrule",
                    title: "Maîtrise des Arts Magiques",
                    institution: "Académie Royale d'Hyrule",
                    location: "Château d'Hyrule",
                    obtention_date: "1872",
                    description: "Formation approfondie aux arts magiques de la Triforce.",
                    level: "Maîtrise",
                    tasks: [
                        { content: "Maîtrise des sorts élémentaires", position: 1 },
                        { content: "Invocation des sages", position: 2 }
                    ],
                    hardskills: [
                        { slug: "magie-triforce", label: "Magie de la Triforce", level: "expert", category: "Magie", sub_category: "Triforce" }
                    ],
                    domains: ["hylien"]
                },
                {
                    id: 2,
                    slug: "temple-temps",
                    title: "Gardien du Temple du Temps",
                    institution: "Temple du Temps",
                    location: "Plaine d'Hyrule",
                    obtention_date: "1880",
                    description: "Certification de gardien des artefacts sacrés.",
                    level: "Certification",
                    tasks: [
                        { content: "Protection de l'Épée de Légende", position: 1 }
                    ],
                    hardskills: [
                        { slug: "combat-epee", label: "Combat à l'épée", level: "expert", category: "Combat", sub_category: null }
                    ],
                    domains: ["hylien"]
                }
            ]});

        await expect(fetchFormation(["hylien"])).resolves.toEqual([
            {
                id: 2,
                slug: "temple-temps",
                title: "Gardien du Temple du Temps",
                institution: "Temple du Temps",
                location: "Plaine d'Hyrule",
                obtention_date: "1880",
                description: "Certification de gardien des artefacts sacrés.",
                level: "Certification",
                tasks: [
                    { content: "Protection de l'Épée de Légende", position: 1 }
                ],
                hardskills: [
                    { slug: "combat-epee", label: "Combat à l'épée", level: "expert", category: "Combat", sub_category: null }
                ],
                domains: ["hylien"]
            },
            {
                id: 1,
                slug: "academie-hyrule",
                title: "Maîtrise des Arts Magiques",
                institution: "Académie Royale d'Hyrule",
                location: "Château d'Hyrule",
                obtention_date: "1872",
                description: "Formation approfondie aux arts magiques de la Triforce.",
                level: "Maîtrise",
                tasks: [
                    { content: "Maîtrise des sorts élémentaires", position: 1 },
                    { content: "Invocation des sages", position: 2 }
                ],
                hardskills: [
                    { slug: "magie-triforce", label: "Magie de la Triforce", level: "expert", category: "Magie", sub_category: "Triforce" }
                ],
                domains: ["hylien"]
            }
        ]);
        expect(db.query).toHaveBeenCalledWith(`
        SELECT 
            form.id,
            form.slug,
            form.title,
            form.institution,
            form.location,
            form.obtention_date,
            form.description,
            form.level,
            JSON_AGG(DISTINCT jsonb_build_object(
                'id', task.id,
                'content', task.content,
                'position', task.position)) AS tasks,
            JSON_AGG(DISTINCT jsonb_build_object(
                'id', hardexp.id,
                'slug', hard.slug,
                'label', hard.label,
                'level', hard.level,
                'category', hard.category,
                'sub_category', hard.sub_category)) AS hardskills,
            JSON_AGG(DISTINCT dom.slug) AS domains
            FROM formation form
            LEFT JOIN formation_task task ON task.formation_id = form.id
            LEFT JOIN formation_hardskill hardexp ON hardexp.formation_id = form.id
            LEFT JOIN hardskill hard ON hardexp.hardskill_id = hard.id
            INNER JOIN formation_domain domexp ON domexp.formation_id = form.id
            INNER JOIN domain dom ON domexp.domain_id = dom.id
            WHERE dom.slug = ANY($1)
            GROUP BY form.id
            `, [["hylien"]]);
    });

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchFormation(["gerudo"])).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchFormation(["sheikah"])).rejects.toThrow('Connexion BDD perdue');
    });
})

describe('addFormation', () => {
    let client: { query: Mock; release: Mock };

    beforeEach(() => {
        vi.clearAllMocks();
        client = { query: vi.fn(), release: vi.fn() };
        (pool.connect as Mock).mockResolvedValue(client);
    });

    it('cas fonctionnel : transaction complète, commit et libération du client', async () => {
        client.query.mockImplementation((sql: string) => {
            if (sql.includes('INSERT INTO formation (')) return Promise.resolve({ rows: [{ id: 20 }] });
            return Promise.resolve({ rows: [] });
        });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 20, slug: "academie-hyrule", title: "Maîtrise des Arts Magiques" }] });

        const result = await addFormation(
            { title: "Maîtrise des Arts Magiques" } as Formation,
            [1], ["Tâche 1"], [2]
        );

        expect(result).toEqual({ id: 20, slug: "academie-hyrule", title: "Maîtrise des Arts Magiques" });
        expect(client.query.mock.calls[0][0]).toBe('BEGIN');
        expect(client.query.mock.calls.at(-1)?.[0]).toBe('COMMIT');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO formation_domain'), expect.anything());
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO formation_task'), expect.anything());
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO formation_hardskill'), expect.anything());
        expect(client.release).toHaveBeenCalledOnce();
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE form.id = $1'), [20]);
    });

    it("cas dysfonctionnel : une insertion échoue, rollback complet et aucune donnée exposée", async () => {
        client.query.mockImplementation((sql: string) => {
            if (sql.includes('INSERT INTO formation (')) return Promise.resolve({ rows: [{ id: 20 }] });
            if (sql.includes('INSERT INTO formation_domain')) return Promise.reject(new Error('Violation de contrainte : domaine inconnu'));
            return Promise.resolve({ rows: [] });
        });

        await expect(addFormation(
            { title: "Maîtrise des Arts Magiques" } as Formation,
            [999], ["Tâche 1"], [2]
        )).rejects.toThrow('Violation de contrainte : domaine inconnu');

        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(client.query).not.toHaveBeenCalledWith('COMMIT');
        expect(client.release).toHaveBeenCalledOnce();
        expect(db.query).not.toHaveBeenCalled();
    });
});

describe('editFormation', () => {
    let client: { query: Mock; release: Mock };

    beforeEach(() => {
        vi.clearAllMocks();
        client = { query: vi.fn(), release: vi.fn() };
        (pool.connect as Mock).mockResolvedValue(client);
    });

    it('cas fonctionnel : transaction complète, commit et libération du client', async () => {
        client.query.mockResolvedValue({ rows: [] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 7, title: "Nouveau titre" }] });

        const result = await editFormation(7, { title: "Nouveau titre" }, [1, 2], null, null);

        expect(result).toEqual({ id: 7, title: "Nouveau titre" });
        expect(client.query.mock.calls[0][0]).toBe('BEGIN');
        expect(client.query.mock.calls.at(-1)?.[0]).toBe('COMMIT');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE formation SET'), [7, "Nouveau titre", "nouveau-titre"]);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM formation_domain'), [7]);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO formation_domain'), expect.anything());
        expect(client.release).toHaveBeenCalledOnce();
    });

    it("cas dysfonctionnel : l'insertion des domaines échoue, rollback complet (le titre déjà modifié n'est pas conservé)", async () => {
        client.query.mockImplementation((sql: string) => {
            if (sql.includes('INSERT INTO formation_domain')) return Promise.reject(new Error('Violation de contrainte'));
            return Promise.resolve({ rows: [] });
        });

        await expect(editFormation(7, { title: "Nouveau titre" }, [999], null, null))
            .rejects.toThrow('Violation de contrainte');

        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(client.query).not.toHaveBeenCalledWith('COMMIT');
        expect(client.release).toHaveBeenCalledOnce();
        expect(db.query).not.toHaveBeenCalled();
    });

    it('cas dysfonctionnel : champ invalide, rollback avant toute écriture', async () => {
        client.query.mockResolvedValue({ rows: [] });

        await expect(editFormation(7, { unknownField: "x" } as unknown as Partial<Formation>, null, null, null))
            .rejects.toThrow("Erreur : au moins l'un des champs à modifier n'existe pas");

        expect(client.query).toHaveBeenCalledWith('BEGIN');
        expect(client.query).toHaveBeenCalledWith('ROLLBACK');
        expect(client.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE formation SET'), expect.anything());
        expect(client.release).toHaveBeenCalledOnce();
    });
});