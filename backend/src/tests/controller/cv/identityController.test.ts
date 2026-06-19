import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getIdentity, patchIdentity } from '../../../controller/cv/identityController.js';
import { fetchIdentity, editIdentity } from '../../../service/cv/identityService.js';

vi.mock('../../../service/cv/identityService.js', () => ({
    fetchIdentity: vi.fn(),
    editIdentity: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getIdentity', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = {} as Request;
        const res = mockRes();
        const data = { id: 1, firstname: 'Roy-Jade', lastname: 'Portier' };
        (fetchIdentity as Mock).mockResolvedValueOnce(data);

        await getIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchIdentity as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await getIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchIdentity as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await getIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchIdentity', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { body: { data: { firstname: 'Roy-Jade' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, firstname: 'Roy-Jade', lastname: 'Portier' };
        (editIdentity as Mock).mockResolvedValueOnce(data);

        await patchIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { firstname: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { firstname: 'Roy-Jade' } } } as unknown as Request;
        const res = mockRes();
        (editIdentity as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await patchIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { firstname: 'Roy-Jade' } } } as unknown as Request;
        const res = mockRes();
        (editIdentity as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchIdentity(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
