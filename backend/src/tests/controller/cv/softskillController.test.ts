import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { postSoftskill, patchSoftskill } from '../../../controller/cv/softskillController.js';
import { addSoftskill, editSoftskill } from '../../../service/cv/softskillService.js';

vi.mock('../../../service/cv/softskillService.js', () => ({
    addSoftskill: vi.fn(),
    editSoftskill: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('postSoftskill', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { slug: 'autonomie', label: 'Autonomie' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'autonomie', label: 'Autonomie' };
        (addSoftskill as Mock).mockResolvedValueOnce(data);

        await postSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await postSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { slug: 'autonomie', label: 'Autonomie' } } } as unknown as Request;
        const res = mockRes();
        (addSoftskill as Mock).mockRejectedValueOnce(new AppError(409, "Erreur : conflit"));

        await postSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { slug: 'autonomie', label: 'Autonomie' } } } as unknown as Request;
        const res = mockRes();
        (addSoftskill as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchSoftskill', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'Autonome' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'autonomie', label: 'Autonome' };
        (editSoftskill as Mock).mockResolvedValueOnce(data);

        await patchSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { params: { id: '1' }, body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'Autonome' } } } as unknown as Request;
        const res = mockRes();
        (editSoftskill as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await patchSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'Autonome' } } } as unknown as Request;
        const res = mockRes();
        (editSoftskill as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchSoftskill(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
