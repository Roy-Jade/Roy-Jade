import { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { fetchDashboard } from "../../service/cv/dashboardService.js";

export const getOverview = async (req:Request, res:Response) => {
    try {
        const result = await fetchDashboard();
        return res.status(200).json({result})
        
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(500).json({ message: "Erreur lors de la récupération des données" })
    }
}