import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getFilters } from '../../../controller/cv/filtersController.js';
import { fetchFilters } from '../../../service/cv/filtersService.js';

vi.mock('../../../service/cv/filtersService.js', () => ({
    fetchFilters: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getFilters', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = {} as Request;
        const res = mockRes();
        const data = {
            type: ['detail', 'summary'],
            context: ['generique'],
            domain: [{ slug: 'web', label: 'Développement web' }],
            category: ['frontend'],
            level: ['avancé'],
        };
        (fetchFilters as Mock).mockResolvedValueOnce(data);

        await getFilters(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchFilters as Mock).mockRejectedValueOnce(new AppError(404, 'Aucune donnée trouvée'));

        await getFilters(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Aucune donnée trouvée' });
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchFilters as Mock).mockRejectedValueOnce(new Error('Connexion BDD perdue'));

        await getFilters(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
