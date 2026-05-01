import db from "../../config/db.js";

export async function fetchProfile(context:string) {

    const results = await db.query(`
        SELECT 
            profile.id,
            profile.context,
            profile.tagline,
            profile.description
            FROM profile
        WHERE profile.context = $1
        `, [context]);
    
    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows[0]
}