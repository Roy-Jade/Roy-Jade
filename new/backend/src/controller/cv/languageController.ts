import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { addLanguage, editLanguage } from "../../service/cv/languageService.js";
import { LanguageSchema } from "../../schema/cv/language.js";

export const postLanguage = async (req: Request, res: Response) => {
    try {
        const data = LanguageSchema.parse(req.body.data);

        const result = await addLanguage(data);
        return res.status(201).json({ result });

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Erreur lors de la modification des données" });
    }
};

export const patchLanguage = async (req: Request, res: Response) => {
    try {
        const id: number = Number(req.params.id);
        const data = LanguageSchema.partial().parse(req.body.data);

        const result = await editLanguage(id, data);
        return res.status(200).json({ result });

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Erreur lors de la modification des données" });
    }
};
