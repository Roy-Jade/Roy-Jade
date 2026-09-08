import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import { login, logout, getSession } from '../../controller/authController.js';
import { validateLogin } from '../../service/authService.js';

vi.mock('../../service/authService.js', () => ({
    validateLogin: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('login', () => {

    it('cas fonctionnel : retourne 200 et isAdmin est positionné', async () => {
        const session = { isAdmin: false };
        const req = { body: { pseudonyme: 'admin', password: 'motdepasse' }, session } as unknown as Request;
        const res = mockRes();
        (validateLogin as Mock).mockResolvedValueOnce(undefined);

        await login(req, res);

        expect(session.isAdmin).toBe(true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Authentification réussie" });
    });

    it('cas dysfonctionnel : identifiants invalides, AppError retourne 401', async () => {
        const req = { body: { pseudonyme: 'inconnu', password: 'mauvais' }, session: {} } as unknown as Request;
        const res = mockRes();
        (validateLogin as Mock).mockRejectedValueOnce(new AppError(401, "Erreur : l'identifiant et le mot de passe ne correspondent pas"));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = { body: { pseudonyme: 'admin', password: 'motdepasse' }, session: {} } as unknown as Request;
        const res = mockRes();
        (validateLogin as Mock).mockRejectedValueOnce(new Error('Erreur inattendue'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('getSession', () => {

    it('cas fonctionnel : session admin, isAdmin vaut true', async () => {
        const req = { session: { isAdmin: true } } as unknown as Request;
        const res = mockRes();

        await getSession(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: { isAdmin: true } });
    });

    it('cas fonctionnel : visiteur anonyme, isAdmin vaut false', async () => {
        const req = { session: {} } as unknown as Request;
        const res = mockRes();

        await getSession(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: { isAdmin: false } });
    });
});

describe('logout', () => {

    it('cas fonctionnel : retourne 200', async () => {
        const req = { session: { destroy: vi.fn().mockImplementation((cb: Function) => cb(null)) } } as unknown as Request;
        const res = mockRes();

        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Déconnexion réussie" });
    });

    it('cas dysfonctionnel : erreur de session, retourne 500', async () => {
        const req = { session: { destroy: vi.fn().mockImplementation((cb: Function) => cb(new Error('Session error'))) } } as unknown as Request;
        const res = mockRes();

        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
