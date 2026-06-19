import db from "../config/db.js";
import { AppError } from "./AppError.js";

export const getHobbyById = async (id: number) => {
    const results = await db.query(`
        SELECT id, slug, label, supplement
        FROM hobby
        WHERE id = $1
        `, [id]);

    if (results.rows[0] === undefined) {
        throw new AppError(404, "Aucune donnée trouvée");
    }
    return results.rows[0];
};
