import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { fetchFormation, addFormation, editFormation } from "../../service/cv/formationService.js";
import { FormationSchema } from "../../schema/cv/formation.js";
 

export const getFormation = async (req:Request, res:Response) => {
    try {
        const data:string[] = Array.isArray(req.query.data) ? req.query.data as string[] : typeof req.query.data === 'string' ? [req.query.data] : [];

        const result = await fetchFormation(data);
        return res.status(200).json({result})

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Erreur lors de la récupération des données" })
    }
}

export const postFormation = async (req:Request, res:Response) => {
    try {
        const data = FormationSchema.parse(req.body.data);
        const domain:number[] = req.body.domain;
        const tasks:string[] = req.body.tasks;
        const hardskill:number[] = req.body.hardskill;

        const result = await addFormation(data, domain, tasks, hardskill);
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

export const patchFormation = async (req:Request, res:Response) => {
    try {
        const id:number = Number(req.params.id);
        const formationData = FormationSchema.partial().parse(req.body.formationData) ?? null;
        const domainData:number[] = req.body.domainData ?? null;
        const hardskillData:number[] = req.body.hardskillData ?? null;
        const taskData:string[] = req.body.taskData ?? null;

        const result = await editFormation(id, formationData, domainData, hardskillData, taskData);
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