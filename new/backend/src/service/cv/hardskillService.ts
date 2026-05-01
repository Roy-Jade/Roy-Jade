import db from "../../config/db.js";
import { levels } from "../../utils/levels.js";

export async function fetchHardskill(category:string[], level:string) {

    if(!levels.includes(level)) {
        throw new Error("Le niveau demandé n'existe pas")
    }
    const levelTable = levels.slice(levels.indexOf(level))

    const results = await db.query(`
        SELECT 
            hard.id,
            hard.slug,
            hard.label,
            hard.level,
            hard.category,
            hard.sub_category
            FROM hardskill hard
            WHERE hard.category = ANY($1)
            AND hard.level = ANY($2)
            `, [category, levelTable]);
    
    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows
}