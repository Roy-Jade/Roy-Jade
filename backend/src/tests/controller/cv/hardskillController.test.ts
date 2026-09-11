import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getHardskill, postHardskill, patchHardskill } from '../../../controller/cv/hardskillController.js';
import { fetchHardskill, addHardskill, editHardskill } from '../../../service/cv/hardskillService.js';

vi.mock('../../../service/cv/hardskillService.js', () => ({
    fetchHardskill: vi.fn(),
    addHardskill: vi.fn(),
    editHardskill: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getHardskill', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { query: { category: 'frontend', level: 'avancé' } } as unknown as Request;
        const res = mockRes();
        const data = [{ id: 1, slug: 'react', label: 'React' }];
        (fetchHardskill as Mock).mockResolvedValueOnce(data);

        await getHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : niveau manquant, AppError retourne 400', async () => {
        const req = { query: { category: 'frontend' } } as unknown as Request;
        const res = mockRes();

        await getHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Erreur : le niveau est requis" });
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { query: { level: 'avancé' } } as unknown as Request;
        const res = mockRes();
        (fetchHardskill as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await getHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('postHardskill', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { slug: 'react', label: 'React' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'react', label: 'React' };
        (addHardskill as Mock).mockResolvedValueOnce(data);

        await postHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await postHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { slug: 'react', label: 'React' } } } as unknown as Request;
        const res = mockRes();
        (addHardskill as Mock).mockRejectedValueOnce(new AppError(409, "Erreur : conflit"));

        await postHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { slug: 'react', label: 'React' } } } as unknown as Request;
        const res = mockRes();
        (addHardskill as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchHardskill', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'React mis à jour' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'react', label: 'React mis à jour' };
        (editHardskill as Mock).mockResolvedValueOnce(data);

        await patchHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'React' } } } as unknown as Request;
        const res = mockRes();
        (editHardskill as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await patchHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'React' } } } as unknown as Request;
        const res = mockRes();
        (editHardskill as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchHardskill(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
