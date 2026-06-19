import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getProfile, postProfile, patchProfile } from '../../../controller/cv/profileController.js';
import { fetchProfile, addProfile, editProfile } from '../../../service/cv/profileService.js';

vi.mock('../../../service/cv/profileService.js', () => ({
    fetchProfile: vi.fn(),
    addProfile: vi.fn(),
    editProfile: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getProfile', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { query: { context: 'generique' } } as unknown as Request;
        const res = mockRes();
        const data = [{ id: 1, context: 'generique', tagline: 'Dev web' }];
        (fetchProfile as Mock).mockResolvedValueOnce(data);

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : contexte manquant, AppError retourne 400', async () => {
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { query: { context: 'generique' } } as unknown as Request;
        const res = mockRes();
        (fetchProfile as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('postProfile', () => {

    it('cas fonctionnel : retourne 201 avec les données', async () => {
        const req = { body: { data: { context: 'generique', tagline: 'Dev web', description: 'desc' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, context: 'generique', tagline: 'Dev web', description: 'desc' };
        (addProfile as Mock).mockResolvedValueOnce(data);

        await postProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { data: { context: 123 } } } as unknown as Request;
        const res = mockRes();

        await postProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { data: { context: 'generique', tagline: 'Dev web', description: 'desc' } } } as unknown as Request;
        const res = mockRes();
        (addProfile as Mock).mockRejectedValueOnce(new AppError(409, "Erreur : conflit"));

        await postProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { data: { context: 'generique', tagline: 'Dev web', description: 'desc' } } } as unknown as Request;
        const res = mockRes();
        (addProfile as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await postProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('patchProfile', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = { body: { id: 1, data: { tagline: 'Dev web mis à jour' } } } as unknown as Request;
        const res = mockRes();
        const data = { id: 1, context: 'generique', tagline: 'Dev web mis à jour', description: 'desc' };
        (editProfile as Mock).mockResolvedValueOnce(data);

        await patchProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: data });
    });

    it('cas dysfonctionnel : données invalides, ZodError retourne 400', async () => {
        const req = { body: { id: 1, data: { context: 123 } } } as unknown as Request;
        const res = mockRes();

        await patchProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = { body: { id: 1, data: { tagline: 'Dev web' } } } as unknown as Request;
        const res = mockRes();
        (editProfile as Mock).mockRejectedValueOnce(new AppError(404, "Aucune donnée trouvée"));

        await patchProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { id: 1, data: { tagline: 'Dev web' } } } as unknown as Request;
        const res = mockRes();
        (editProfile as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await patchProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
