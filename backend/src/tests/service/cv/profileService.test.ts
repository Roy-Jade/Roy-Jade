import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchProfile } from '../../../service/cv/profileService.js'

// Mock des dépendances externes
vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

describe('fetchProfile', () => {

    // Réinitialise les mocks entre chaque test
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: [
                {
                    id: 1,
                    context: "chasseur-debutant",
                    tagline: "Rang Basse Étoile, prêt pour la première quête",
                    description: "Apprenti chasseur formé aux techniques de base du Nouveau Monde. Maîtrise des armes légères et du pistage des petits monstres."
                }
            ]});

        await expect(fetchProfile("chasseur-debutant")).resolves.toEqual({
            id: 1,
            context: "chasseur-debutant",
            tagline: "Rang Basse Étoile, prêt pour la première quête",
            description: "Apprenti chasseur formé aux techniques de base du Nouveau Monde. Maîtrise des armes légères et du pistage des petits monstres."
        });
        expect(db.query).toHaveBeenCalledWith(`
        SELECT 
            profile.id,
            profile.context,
            profile.tagline,
            profile.description
            FROM profile
        WHERE profile.context = $1
        `, ["chasseur-debutant"]);
    });

    it('cas dysfonctionnel : pas de données dans la BDD', async () => {
        (db.query as Mock).mockResolvedValue({
            rows: []
        });

        await expect(fetchProfile("chasseur-expert")).rejects.toThrow('Aucune donnée trouvée');
    })

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchProfile("chasseur-debutant")).rejects.toThrow('Connexion BDD perdue');
    });
})