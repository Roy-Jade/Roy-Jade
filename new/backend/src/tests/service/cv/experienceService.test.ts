import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchExperience } from '../../../service/cv/experienceService.js'

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

describe('fetchExperience', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValueOnce({
            rows: [{ 
                    id:1,
                    slug:"ranger",
                    type:"detail",
                    title:"Chevalier ranger mercenaire",
                    company:"Poing enflammé",
                    location:"Porte de Baldur",
                    start_date:"1396 DR",
                    end_date:"1401 DR",
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
                }]});
                
        (db.query as Mock).mockResolvedValueOnce({
            rows: [{ 
                id:2,
                slug:"occultiste",
                type:"detail",
                title:"Occultiste de la Grande Fée Verte",
                company:"Cour de la Fée Verte",
                location:"Domaine Féérique vert",
                start_date:"1402 DR",
                end_date:"1406 DR",
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
            }]
        });

        await expect(fetchExperience([{"domain":"combattant", "type":"detail"}, {"domain":"magicien", "type":"detail"}])).resolves.toEqual([
                { 
                    id:1,
                    slug:"ranger",
                    type:"detail",
                    title:"Chevalier ranger mercenaire",
                    company:"Poing enflammé",
                    location:"Porte de Baldur",
                    start_date:"1396 DR",
                    end_date:"1401 DR",
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
                    start_date:"1402 DR",
                    end_date:"1406 DR",
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
    });

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchExperience([{"domain":"voleur", "type":"summary"}])).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchExperience([{"domain":"voleur", "type":"summary"}])).rejects.toThrow('Connexion BDD perdue');
    });
})