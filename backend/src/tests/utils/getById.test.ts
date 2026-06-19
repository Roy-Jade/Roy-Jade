import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../config/db.js';
import { getHardskillById } from '../../utils/getHardskillById.js';
import { getSoftskillById } from '../../utils/getSoftskillById.js';
import { getProfileById } from '../../utils/getProfileById.js';
import { getExperienceById } from '../../utils/getExperienceById.js';
import { getFormationById } from '../../utils/getFormationById.js';

vi.mock('../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

const ERREUR_404 = "Aucune donnée trouvée";

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getHardskillById', () => {

    it('cas fonctionnel : donnée trouvée', async () => {
        const row = { id: 1, slug: 'react', label: 'React', level: 'avancé', category: 'frontend', sub_category: null };
        (db.query as Mock).mockResolvedValueOnce({ rows: [row] });

        await expect(getHardskillById(1)).resolves.toEqual(row);
    });

    it('cas dysfonctionnel : donnée non trouvée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(getHardskillById(99)).rejects.toThrow(ERREUR_404);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(getHardskillById(1)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('getSoftskillById', () => {

    it('cas fonctionnel : donnée trouvée', async () => {
        const row = { id: 1, slug: 'autonomie', label: 'Autonomie' };
        (db.query as Mock).mockResolvedValueOnce({ rows: [row] });

        await expect(getSoftskillById(1)).resolves.toEqual(row);
    });

    it('cas dysfonctionnel : donnée non trouvée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(getSoftskillById(99)).rejects.toThrow(ERREUR_404);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(getSoftskillById(1)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('getProfileById', () => {

    it('cas fonctionnel : donnée trouvée', async () => {
        const row = { id: 1, context: 'generique', tagline: 'Développeur web', description: 'desc' };
        (db.query as Mock).mockResolvedValueOnce({ rows: [row] });

        await expect(getProfileById(1)).resolves.toEqual(row);
    });

    it('cas dysfonctionnel : donnée non trouvée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(getProfileById(99)).rejects.toThrow(ERREUR_404);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(getProfileById(1)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('getExperienceById', () => {

    it('cas fonctionnel : donnée trouvée', async () => {
        const row = { id: 1, slug: 'dev-web', title: 'Développeur web', tasks: [], softskills: [], hardskills: [], domains: [] };
        (db.query as Mock).mockResolvedValueOnce({ rows: [row] });

        await expect(getExperienceById(1)).resolves.toEqual(row);
    });

    it('cas dysfonctionnel : donnée non trouvée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(getExperienceById(99)).rejects.toThrow(ERREUR_404);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(getExperienceById(1)).rejects.toThrow('Connexion BDD perdue');
    });
});

describe('getFormationById', () => {

    it('cas fonctionnel : donnée trouvée', async () => {
        const row = { id: 1, slug: 'master', title: 'Master informatique', tasks: [], hardskills: [], domains: [] };
        (db.query as Mock).mockResolvedValueOnce({ rows: [row] });

        await expect(getFormationById(1)).resolves.toEqual(row);
    });

    it('cas dysfonctionnel : donnée non trouvée', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(getFormationById(99)).rejects.toThrow(ERREUR_404);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(getFormationById(1)).rejects.toThrow('Connexion BDD perdue');
    });
});
