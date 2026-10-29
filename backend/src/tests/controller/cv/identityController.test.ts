import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { DatabaseError } from 'pg';
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

    it('cas fonctionnel : SIRET et domiciliation vides convertis en null', async () => {
        const req = { body: { data: { siret: '', domiciliation: '' } } } as unknown as Request;
        const res = mockRes();
        (editIdentity as Mock).mockResolvedValueOnce({ id: 1, siret: null, domiciliation: null });

        await patchIdentity(req, res);

        expect(editIdentity).toHaveBeenCalledWith({ siret: null, domiciliation: null });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('cas fonctionnel : SIRET valide et domiciliation transmis', async () => {
        const req = { body: { data: { siret: '12345678900012', domiciliation: '  1 rue de la Paix, 75002 Paris ' } } } as unknown as Request;
        const res = mockRes();
        (editIdentity as Mock).mockResolvedValueOnce({ id: 1 });

        await patchIdentity(req, res);

        expect(editIdentity).toHaveBeenCalledWith({ siret: '12345678900012', domiciliation: '1 rue de la Paix, 75002 Paris' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it.each([
        ['13 chiffres', '1234567890001'],
        ['15 chiffres', '123456789000123'],
        ['avec lettres', '1234567890001A'],
        ['avec espaces', '123 456 789 00012'],
    ])('cas dysfonctionnel : SIRET invalide (%s), retourne 400', async (_, siret) => {
        const req = { body: { data: { siret } } } as unknown as Request;
        const res = mockRes();

        await patchIdentity(req, res);

        expect(editIdentity).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : domiciliation composée uniquement d\'espaces, retourne 400', async () => {
        const req = { body: { data: { domiciliation: '   ' } } } as unknown as Request;
        const res = mockRes();

        await patchIdentity(req, res);

        expect(editIdentity).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cas dysfonctionnel : SIRET sans domiciliation (contrainte BDD), retourne 400', async () => {
        const req = { body: { data: { siret: '12345678900012' } } } as unknown as Request;
        const res = mockRes();
        const dbError = new DatabaseError('violates check constraint', 0, 'error');
        dbError.constraint = 'siret_domiciliation_together';
        (editIdentity as Mock).mockRejectedValueOnce(dbError);

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
