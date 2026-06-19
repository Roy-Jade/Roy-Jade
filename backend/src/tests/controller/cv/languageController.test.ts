import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { postLanguage, patchLanguage } from '../../../controller/cv/languageController.js';
import { addLanguage, editLanguage } from '../../../service/cv/languageService.js';

vi.mock('../../../service/cv/languageService.js', () => ({
    addLanguage: vi.fn(),
    editLanguage: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('postLanguage', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { slug: 'anglais', label: 'Anglais', level: 'courant' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' };
        (addLanguage as Mock).mockResolvedValueOnce(data);

        await postLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await postLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { slug: 'anglais', label: 'Anglais' } } } as unknown as Request;
        const res = mockRes();
        (addLanguage as Mock).mockRejectedValueOnce(new AppError(409, 'Erreur : conflit'));

        await postLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { slug: 'anglais', label: 'Anglais' } } } as unknown as Request;
        const res = mockRes();
        (addLanguage as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchLanguage', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { params: { id: '1' }, body: { data: { level: 'maîtrise' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'anglais', label: 'Anglais', level: 'maîtrise' };
        (editLanguage as Mock).mockResolvedValueOnce(data);

        await patchLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { params: { id: '1' }, body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { params: { id: '1' }, body: { data: { level: 'courant' } } } as unknown as Request;
        const res = mockRes();
        (editLanguage as Mock).mockRejectedValueOnce(new AppError(404, 'Aucune donnée trouvée'));

        await patchLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { params: { id: '1' }, body: { data: { level: 'courant' } } } as unknown as Request;
        const res = mockRes();
        (editLanguage as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchLanguage(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
