import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getOverview } from '../../../controller/cv/dashboardController.js';
import { fetchDashboard } from '../../../service/cv/dashboardService.js';

vi.mock('../../../service/cv/dashboardService.js', () => ({
    fetchDashboard: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getOverview', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = {} as Request;
        const res = mockRes();
        const data = { identity: { id: 1 }, profile: [], domain: [], softskill: [], hardskill: [], experience: [], formation: [] };
        (fetchDashboard as Mock).mockResolvedValueOnce(data);

        await getOverview(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchDashboard as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await getOverview(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchDashboard as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await getOverview(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
