import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getExperience, postExperience, patchExperience } from '../../../controller/cv/experienceController.js';
import { fetchExperience, addExperience, editExperience } from '../../../service/cv/experienceService.js';

vi.mock('../../../service/cv/experienceService.js', () => ({
    fetchExperience: vi.fn(),
    addExperience: vi.fn(),
    editExperience: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getExperience', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const filter = JSON.stringify(['web']);
        const req = { query: { data: filter } } as unknown as Request;
        const res = mockRes();
        const data = [{ id: 1, slug: 'dev-web', title: 'Dev web' }];
        (fetchExperience as Mock).mockResolvedValueOnce(data);

        await getExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : filtre invalide, ZodError retourne 400', async () => {
        const filter = JSON.stringify([123]);
        const req = { query: { data: filter } } as unknown as Request;
        const res = mockRes();

        await getExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const filter = JSON.stringify(['web']);
        const req = { query: { data: filter } } as unknown as Request;
        const res = mockRes();
        (fetchExperience as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await getExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const filter = JSON.stringify(['web']);
        const req = { query: { data: filter } } as unknown as Request;
        const res = mockRes();
        (fetchExperience as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await getExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('postExperience', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { slug: 'dev-web', type: 'detail', title: 'Dev web' }, domain: [1], tasks: ['Tâche 1'], hardskill: [2], softskill: [3] } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'dev-web', title: 'Dev web' };
        (addExperience as Mock).mockResolvedValueOnce(data);

        await postExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await postExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { slug: 'dev-web', type: 'detail', title: 'Dev web' }, domain: [1], tasks: [], hardskill: [], softskill: [] } } as unknown as Request;
        const res = mockRes();
        (addExperience as Mock).mockRejectedValueOnce(new AppError(409, "Erreur : conflit"));

        await postExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { slug: 'dev-web', type: 'detail', title: 'Dev web' }, domain: [1], tasks: [], hardskill: [], softskill: [] } } as unknown as Request;
        const res = mockRes();
        (addExperience as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchExperience', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { params: { id: '1' }, body: { experienceData: { title: 'Dev web mis à jour' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'dev-web', title: 'Dev web mis à jour' };
        (editExperience as Mock).mockResolvedValueOnce(data);

        await patchExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { params: { id: '1' }, body: { experienceData: { title: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { params: { id: '1' }, body: { experienceData: { title: 'Dev web' } } } as unknown as Request;
        const res = mockRes();
        (editExperience as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await patchExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { params: { id: '1' }, body: { experienceData: { title: 'Dev web' } } } as unknown as Request;
        const res = mockRes();
        (editExperience as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchExperience(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
