import { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../utils/AppError.js";
import { editIdentity, fetchIdentity } from "../../service/cv/identityService.js";
import { IdentitySchema } from "../../schema/cv/identity.js";

export const getIdentity = async (req:Request, res:Response) => {

    try {

        const result = await fetchIdentity();
        return res.status(200).json({result})

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(500).json({ message: "Erreur lors de la récupération des données" })
    }
}

export const patchIdentity = async (req:Request, res:Response) => {
    try {
        const data = IdentitySchema.partial().parse(req.body.data);

        const result = await editIdentity(data);
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