import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchIdentity } from '../../../service/cv/identityService.js'

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

describe('fetchIdentity', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: [{ 
                id: 1,
                firstname:"John",
                lastname:'Shepard',
                email:"john.shepard@alliance.earth",
                telephone:"44.18.27.09.76",
                github_link:"https://github.com/Reaper-Killer",
                gitlab_link:"https://gitlab.com/Reaper-Killer",
                linkedin_link:"https://www.linkedin.com/in/john-shepard",
            }]
        });

        await expect(fetchIdentity()).resolves.toEqual({ 
            id: 1,
            firstname:"John",
            lastname:'Shepard',
            email:"john.shepard@alliance.earth",
            telephone:"44.18.27.09.76",
            github_link:"https://github.com/Reaper-Killer",
            gitlab_link:"https://gitlab.com/Reaper-Killer",
            linkedin_link:"https://www.linkedin.com/in/john-shepard",
        });
    });

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchIdentity()).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchIdentity()).rejects.toThrow('Connexion BDD perdue');
    });
})