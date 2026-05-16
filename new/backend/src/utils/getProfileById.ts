import db from "../config/db.js";


export const getProfileById = async (id:number) => {
    const results = await db.query(`
        SELECT id, context, tagline, description
        FROM profile
        WHERE id = $1
        `, [id]);

    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows[0]
}