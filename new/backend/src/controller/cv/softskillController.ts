import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { addSoftskill, editSoftskill } from "../../service/cv/softskillService.js";
import { SoftskillSchema } from "../../schema/cv/skill.js";

export const postSoftskill = async (req:Request, res:Response) => {
    try {
        const data = SoftskillSchema.parse(req.body.data);

        const result = await addSoftskill(data);
        return res.status(201).json({result});

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof ZodError) {
            return res.status(400).json({message: error.message})
        }
        return res.status(500).json({ message: "Erreur lors de la modification des données" });
    }
    
}

export const patchSoftskill = async (req:Request, res:Response) => {
    try {
        const id:number = Number(req.params.id);
        const data = SoftskillSchema.partial().parse(req.body.data);

        const result = await editSoftskill(id, data);
        return res.status(200).json({result});

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof ZodError) {
            return res.status(400).json({message: error.message})
        }
        return res.status(500).json({ message: "Erreur lors de la modification des données" });
    }
}