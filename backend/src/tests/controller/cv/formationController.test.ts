import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getFormation, postFormation, patchFormation } from '../../../controller/cv/formationController.js';
import { fetchFormation, addFormation, editFormation } from '../../../service/cv/formationService.js';

vi.mock('../../../service/cv/formationService.js', () => ({
    fetchFormation: vi.fn(),
    addFormation: vi.fn(),
    editFormation: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getFormation', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { query: { data: ['web'] } } as unknown as Request;
        const res = mockRes();
        const data = [{ id: 1, slug: 'master', title: 'Master informatique' }];
        (fetchFormation as Mock).mockResolvedValueOnce(data);

        await getFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { query: {} } as unknown as Request;
        const res = mockRes();
        (fetchFormation as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await getFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { query: {} } as unknown as Request;
        const res = mockRes();
        (fetchFormation as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await getFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('postFormation', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { slug: 'master', title: 'Master informatique' }, domain: [1], tasks: ['Tâche 1'], hardskill: [2] } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'master', title: 'Master informatique' };
        (addFormation as Mock).mockResolvedValueOnce(data);

        await postFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await postFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { slug: 'master', title: 'Master informatique' }, domain: [1], tasks: [], hardskill: [] } } as unknown as Request;
        const res = mockRes();
        (addFormation as Mock).mockRejectedValueOnce(new AppError(409, "Erreur : conflit"));

        await postFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { slug: 'master', title: 'Master informatique' }, domain: [1], tasks: [], hardskill: [] } } as unknown as Request;
        const res = mockRes();
        (addFormation as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchFormation', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { params: { id: '1' }, body: { formationData: { title: 'Master mis à jour' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'master', title: 'Master mis à jour' };
        (editFormation as Mock).mockResolvedValueOnce(data);

        await patchFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { params: { id: '1' }, body: { formationData: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { params: { id: '1' }, body: { formationData: { title: 'Master' } } } as unknown as Request;
        const res = mockRes();
        (editFormation as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await patchFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { params: { id: '1' }, body: { formationData: { title: 'Master' } } } as unknown as Request;
        const res = mockRes();
        (editFormation as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchFormation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
