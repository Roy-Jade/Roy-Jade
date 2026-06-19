import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../../config/db.js';
import { fetchDashboard } from '../../../service/cv/dashboardService.js'

vi.mock('../../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

describe('fetchDashboard', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cas fonctionnel : données récupérées', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, first_name: "Roy-Jade" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "anglais" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "modelisme" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "generique" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "web" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "autonomie" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "react" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "dev-web" }] });
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ id: 1, slug: "master" }] });

        await expect(fetchDashboard()).resolves.toEqual({
            identity: { id: 1, first_name: "Roy-Jade" },
            language: [{ id: 1, slug: "anglais" }],
            hobby: [{ id: 1, slug: "modelisme" }],
            profile: [{ id: 1, slug: "generique" }],
            domain: [{ id: 1, slug: "web" }],
            softskill: [{ id: 1, slug: "autonomie" }],
            hardskill: [{ id: 1, slug: "react" }],
            experience: [{ id: 1, slug: "dev-web" }],
            formation: [{ id: 1, slug: "master" }],
        });
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(fetchDashboard()).rejects.toThrow('Connexion BDD perdue');
    });
});
