import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { addDomain, editDomain } from "../../service/cv/domainService.js";
import { DomainSchema } from "../../schema/cv/domain.js";

export const postDomain = async (req: Request, res: Response) => {
    try {
        const data = DomainSchema.parse(req.body.data);

        const result = await addDomain(data);
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

export const patchDomain = async (req: Request, res: Response) => {
    try {
        const id: number = Number(req.params.id);
        const data = DomainSchema.partial().parse(req.body.data);

        const result = await editDomain(id, data);
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
