import db from "../../config/db.js";

export async function fetchIdentity() {
    let results = await db.query(`SELECT * FROM identity WHERE id = 1`, []);
    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows[0]
}