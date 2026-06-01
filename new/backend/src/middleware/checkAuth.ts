import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/AppError.js";

export function checkAuth(req:Request, res:Response, next:NextFunction) {
    const isAdmin = req.session.isAdmin;

    if (!isAdmin) {throw new AppError(401, "Erreur : accès non autorisé")}

    next()
}