import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { fetchProfile, addProfile, editProfile } from "../../service/cv/profileService.js";
import { ProfileSchema } from "../../schema/cv/profile.js";
 
export const getProfile = async (req:Request, res:Response) => {
    const rawContext = req.query.context;

    try {
        const context:string = typeof rawContext === "string" ? rawContext : ""

        if (!context) {throw new AppError(400, "Erreur : le niveau est requis")}

        const result = await fetchProfile(context);
        return res.status(200).json({result})

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(500).json({ message: "Erreur lors de la récupération des données" })
    }
}

export const postProfile = async (req:Request, res:Response) => {
    try {
        const data = ProfileSchema.parse(req.body.data);

        const result = await addProfile(data);
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

export const patchProfile = async (req:Request, res:Response) => {
    try {
        const id: number = Number(req.params.id);
        const data = ProfileSchema.partial().parse(req.body.data);

        const result = await editProfile(id, data);
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