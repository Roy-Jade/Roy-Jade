import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { postHobby, patchHobby } from '../../../controller/cv/hobbyController.js';
import { addHobby, editHobby } from '../../../service/cv/hobbyService.js';

vi.mock('../../../service/cv/hobbyService.js', () => ({
    addHobby: vi.fn(),
    editHobby: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('postHobby', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { slug: 'modelisme', label: 'Modélisme' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'modelisme', label: 'Modélisme', supplement: null };
        (addHobby as Mock).mockResolvedValueOnce(data);

        await postHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await postHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { slug: 'modelisme', label: 'Modélisme' } } } as unknown as Request;
        const res = mockRes();
        (addHobby as Mock).mockRejectedValueOnce(new AppError(409, 'Erreur : conflit'));

        await postHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { slug: 'modelisme', label: 'Modélisme' } } } as unknown as Request;
        const res = mockRes();
        (addHobby as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchHobby', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { params: { id: '1' }, body: { data: { supplement: 'Wargame' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, slug: 'modelisme', label: 'Modélisme', supplement: 'Wargame' };
        (editHobby as Mock).mockResolvedValueOnce(data);

        await patchHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { params: { id: '1' }, body: { data: { slug: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'Modélisme' } } } as unknown as Request;
        const res = mockRes();
        (editHobby as Mock).mockRejectedValueOnce(new AppError(404, 'Aucune donnée trouvée'));

        await patchHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { params: { id: '1' }, body: { data: { label: 'Modélisme' } } } as unknown as Request;
        const res = mockRes();
        (editHobby as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchHobby(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
