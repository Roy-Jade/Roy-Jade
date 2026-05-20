import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { fetchHardskill, addHardskill, editHardskill } from "../../service/cv/hardskillService.js";
import { HardskillSchema } from "../../schema/cv/skill.js";
 
export const getHardskill = async (req:Request, res:Response) => {
    const rawCategory = req.query.category;
    const rawLevel = req.query.level;

    try {
        const category:string[] = Array.isArray(rawCategory) ? rawCategory as string[] : typeof rawCategory === 'string' ? [rawCategory] : [];
        const level:string = typeof rawLevel === "string" ? rawLevel : ""

        if (!level) {throw new AppError(400, "Erreur : le niveau est requis")}

        const result = await fetchHardskill(category, level);
        return res.status(200).json({result})

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(500).json({ message: "Erreur lors de la récupération des données" })
    }
}

export const postHardskill = async (req:Request, res:Response) => {
    try {
        const data = HardskillSchema.parse(req.body.data);

        const result = await addHardskill(data);
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

export const patchHardskill = async (req:Request, res:Response) => {
    try {
        const id:number = Number(req.params.id);
        const data = HardskillSchema.partial().parse(req.body.data);

        const result = await editHardskill(id, data);
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