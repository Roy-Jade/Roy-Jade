import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchFormation } from '../../../service/cv/formationService.js'

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
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
                    obtention_date: "An 1872",
                    description: "Formation approfondie aux arts magiques de la Triforce.",
                    level: "Maîtrise",
                    tasks: [
                        { content: "Maîtrise des sorts élémentaires", position: 1 },
                        { content: "Invocation des sages", position: 2 }
                    ],
                    hardskills: [
                        { slug: "magie-triforce", label: "Magie de la Triforce", level: "expert", category: "Magie", sub_category: "Triforce" }
                    ]
                },
                {
                    id: 2,
                    slug: "temple-temps",
                    title: "Gardien du Temple du Temps",
                    institution: "Temple du Temps",
                    location: "Plaine d'Hyrule",
                    obtention_date: "An 1880",
                    description: "Certification de gardien des artefacts sacrés.",
                    level: "Certification",
                    tasks: [
                        { content: "Protection de l'Épée de Légende", position: 1 }
                    ],
                    hardskills: [
                        { slug: "combat-epee", label: "Combat à l'épée", level: "expert", category: "Combat", sub_category: null }
                    ]
                }
            ]});

        await expect(fetchFormation(["hylien"])).resolves.toEqual([
            {
                id: 1,
                slug: "academie-hyrule",
                title: "Maîtrise des Arts Magiques",
                institution: "Académie Royale d'Hyrule",
                location: "Château d'Hyrule",
                obtention_date: "An 1872",
                description: "Formation approfondie aux arts magiques de la Triforce.",
                level: "Maîtrise",
                tasks: [
                    { content: "Maîtrise des sorts élémentaires", position: 1 },
                    { content: "Invocation des sages", position: 2 }
                ],
                hardskills: [
                    { slug: "magie-triforce", label: "Magie de la Triforce", level: "expert", category: "Magie", sub_category: "Triforce" }
                ]
            },
            {
                id: 2,
                slug: "temple-temps",
                title: "Gardien du Temple du Temps",
                institution: "Temple du Temps",
                location: "Plaine d'Hyrule",
                obtention_date: "An 1880",
                description: "Certification de gardien des artefacts sacrés.",
                level: "Certification",
                tasks: [
                    { content: "Protection de l'Épée de Légende", position: 1 }
                ],
                hardskills: [
                    { slug: "combat-epee", label: "Combat à l'épée", level: "expert", category: "Combat", sub_category: null }
                ]
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
                'sub_category', hard.sub_category)) AS hardskills
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