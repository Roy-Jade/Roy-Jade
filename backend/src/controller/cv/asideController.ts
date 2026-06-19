import { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { fetchLanguage } from "../../service/cv/languageService.js";
import { fetchHobby } from "../../service/cv/hobbyService.js";

export const getAside = async (req: Request, res: Response) => {
    try {
        const [language, hobby] = await Promise.all([fetchLanguage(), fetchHobby()]);
        return res.status(200).json({ result: { language, hobby } });

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Erreur lors de la récupération des données" });
    }
};
