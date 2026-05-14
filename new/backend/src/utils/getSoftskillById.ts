import db from "../config/db.js";


export const getSoftskillById = async (id:number) => {
    const results = await db.query(`
        SELECT id, slug, label
        FROM softskill
        WHERE id = $1
        `, [id]);

    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows[0]
}