import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import db from '../../config/db.js';
import bcrypt from 'bcrypt';
import { validateLogin } from '../../service/authService.js'

vi.mock('../../config/db.js', () => ({
  default: { query: vi.fn() }
}));

vi.mock('bcrypt', () => ({
  default: { compare: vi.fn() }
}));

const ERREUR_LOGIN = "Erreur : l'identifiant et le mot de passe ne correspondent pas";

describe('validateLogin', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cas fonctionnel : identifiants valides', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ hashed_password: 'hash' }] });
        (bcrypt.compare as Mock).mockResolvedValueOnce(true);

        await expect(validateLogin('admin', 'motdepasse')).resolves.toBeUndefined();
    });

    it('cas dysfonctionnel : pseudonyme inconnu', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });

        await expect(validateLogin('inconnu', 'motdepasse')).rejects.toThrow(ERREUR_LOGIN);
    });

    it('cas dysfonctionnel : mot de passe incorrect', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ hashed_password: 'hash' }] });
        (bcrypt.compare as Mock).mockResolvedValueOnce(false);

        await expect(validateLogin('admin', 'mauvais')).rejects.toThrow(ERREUR_LOGIN);
    });

    it('sécurité : pseudonyme inconnu et mot de passe incorrect lèvent la même erreur', async () => {
        (db.query as Mock).mockResolvedValueOnce({ rows: [] });
        const errorUnknownUser = await validateLogin('inconnu', 'motdepasse').catch(e => e);

        vi.clearAllMocks();
        (db.query as Mock).mockResolvedValueOnce({ rows: [{ hashed_password: 'hash' }] });
        (bcrypt.compare as Mock).mockResolvedValueOnce(false);
        const errorWrongPassword = await validateLogin('admin', 'mauvais').catch(e => e);

        expect(errorUnknownUser.message).toBe(errorWrongPassword.message);
    });

    it('cas dysfonctionnel : erreur BDD', async () => {
        (db.query as Mock).mockRejectedValue(new Error('Connexion BDD perdue'));

        await expect(validateLogin('admin', 'motdepasse')).rejects.toThrow('Connexion BDD perdue');
    });
});
