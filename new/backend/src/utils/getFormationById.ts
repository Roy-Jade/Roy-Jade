import db from "../config/db.js";
import { AppError } from "./AppError.js";


export const getFormationById = async (id:number) => {
    const results = await db.query(`
        SELECT 
            form.id,
            form.slug,
            form.title,
            form.institution,
            form.location,
            form.obtention_date,
            form.description,
            form.level,
            JSON_AGG(DISTINCT jsonb_build_object(
                "content", task.content, 
                "position", task.position)) AS tasks, 
            JSON_AGG(DISTINCT jsonb_build_object(
                "slug", hard.slug, 
                "label", hard.label, 
                "level", hard.level, 
                "category", hard.category, 
                "sub_category", hard.sub_category)) AS hardskills,
            JSON_AGG(DISTINCT jsonb_build_object(
                "slug", dom.slug, 
                "label", dom.label)) AS domains
        FROM formation form
        LEFT JOIN formation_task task ON task.formation_id = form.id
        LEFT JOIN formation_hardskill hardform ON hardform.formation_id = form.id
        LEFT JOIN hardskill hard ON hardform.hardskill_id = hard.id
        INNER JOIN formation_domain domform ON domform.formation_id = form.id
        INNER JOIN domain dom ON domform.domain_id = dom.id
        WHERE form.id = $1
        GROUP BY form.id
        `, [id]);

    if(results.rows[0]===undefined) {
        throw new AppError(404, "Aucune donnée trouvée")
    }
    return results.rows[0]
}