import { vi, describe, it, expect } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { checkAuth } from '../../middleware/checkAuth.js';

describe('checkAuth', () => {

    it('cas fonctionnel : utilisateur authentifié, next() appelé', () => {
        const req = { session: { isAdmin: true } } as unknown as Request;
        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        checkAuth(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });

    it('cas dysfonctionnel : utilisateur non authentifié, erreur 401 levée et next() non appelé', () => {
        const req = { session: { isAdmin: false } } as unknown as Request;
        const res = {} as Response;
        const next = vi.fn() as NextFunction;

        expect(() => checkAuth(req, res, next)).toThrow("Erreur : accès non autorisé");
        expect(next).not.toHaveBeenCalled();
    });
});
