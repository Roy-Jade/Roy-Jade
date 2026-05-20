import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { fetchExperience, addExperience, editExperience } from "../../service/cv/experienceService.js";
import { ExperienceSchema, ExperienceFilterSchema } from "../../schema/cv/experience.js";
 

export const getExperience = async (req:Request, res:Response) => {
    try {
        const rawData = typeof req.query.data === "string" ? JSON.parse(req.query.data) : ""
        const data = ExperienceFilterSchema.parse(rawData) 

        const result = await fetchExperience(data);
        return res.status(200).json({result})

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof ZodError) {
            return res.status(400).json({message: error.message})
        }
        return res.status(500).json({ message: "Erreur lors de la récupération des données" })
    }
}

export const postExperience = async (req:Request, res:Response) => {
    try {
        const data = ExperienceSchema.parse(req.body.data);
        const domain:number[] = req.body.domain;
        const tasks:string[] = req.body.tasks;
        const hardskill:number[] = req.body.hardskill;
        const softskill:number[] = req.body.softskill ;

        const result = await addExperience(data, domain, tasks, hardskill, softskill);
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

export const patchExperience = async (req:Request, res:Response) => {
    try {
        const id:number = Number(req.params.id);
        const experienceData = ExperienceSchema.partial().parse(req.body.experienceData) ?? null;
        const domainData:number[] = req.body.domainData ?? null;
        const hardskillData:number[] = req.body.hardskillData ?? null;
        const softskillData:number[] = req.body.softskillData ?? null;
        const taskData:string[] = req.body.taskData ?? null;

        const result = await editExperience(id, experienceData, domainData, hardskillData, softskillData, taskData);
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