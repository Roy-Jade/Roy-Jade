import { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { validateLogin } from "../service/authService.js";

export const login = async (req:Request, res:Response) => {
    try {
    const { pseudonyme, password } = req.body;

    await validateLogin(pseudonyme, password);

    req.session.isAdmin = true

    return res.status(200).json({message: "Authentification réussie"})

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Erreur lors de la modification des données" });
    }
}

export const getSession = async (req:Request, res:Response) => {
    return res.status(200).json({ result: { isAdmin: req.session.isAdmin ?? false } })
}

export const logout = async (req:Request, res:Response) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ message: "Erreur lors de la modification des données" });
        };
        return res.status(200).json({message : "Déconnexion réussie"});
    });
}