import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '../../../utils/AppError.js';
import { getAside } from '../../../controller/cv/asideController.js';
import { fetchLanguage } from '../../../service/cv/languageService.js';
import { fetchHobby } from '../../../service/cv/hobbyService.js';

vi.mock('../../../service/cv/languageService.js', () => ({
    fetchLanguage: vi.fn(),
}));

vi.mock('../../../service/cv/hobbyService.js', () => ({
    fetchHobby: vi.fn(),
}));

const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
} as unknown as Response);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getAside', () => {

    it('cas fonctionnel : retourne 200 avec les données', async () => {
        const req = {} as Request;
        const res = mockRes();
        const language = [{ id: 1, slug: 'anglais', label: 'Anglais', level: 'courant' }];
        const hobby = [{ id: 1, slug: 'modelisme', label: 'Modélisme', supplement: null }];
        (fetchLanguage as Mock).mockResolvedValueOnce(language);
        (fetchHobby as Mock).mockResolvedValueOnce(hobby);

        await getAside(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ result: { language, hobby } });
    });

    it('cas dysfonctionnel : AppError du service', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchLanguage as Mock).mockRejectedValueOnce(new AppError(404, 'Aucune donnée trouvée'));
        (fetchHobby as Mock).mockResolvedValueOnce([]);

        await getAside(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Aucune donnée trouvée' });
    });

    it('cas dysfonctionnel : erreur générique, retourne 500', async () => {
        const req = {} as Request;
        const res = mockRes();
        (fetchLanguage as Mock).mockRejectedValueOnce(new Error('Connexion BDD perdue'));
        (fetchHobby as Mock).mockResolvedValueOnce([]);

        await getAside(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
