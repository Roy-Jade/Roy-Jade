import db from "../../config/db.js";

export async function fetchFormation(slugTable:string[]) {

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
                "sub_category", hard.sub_category)) AS hardskills
            FROM formation form
            LEFT JOIN formation_task task ON task.formation_id = form.id
            LEFT JOIN formation_hardskill hardexp ON hardexp.formation_id = form.id
            LEFT JOIN hardskill hard ON hardexp.hardskill_id = hard.id
            INNER JOIN formation_domain domexp ON domexp.formation_id = form.id
            INNER JOIN domain dom ON domexp.domain_id = dom.id
            WHERE dom.slug = ANY($1)
            GROUP BY for.id
            `, [slugTable]);
    

    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows
}