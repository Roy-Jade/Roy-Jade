import db from '../config/db.js';
import { AppError } from "./AppError.js";


export const getExperienceById = async (id:number) => {
    const results = await db.query(`
        SELECT 
            exp.id,
            exp.slug,
            exp.title,
            exp.type,
            exp.company,
            exp.location,
            exp.start_date,
            exp.end_date,
            exp.description,
            JSON_AGG(DISTINCT jsonb_build_object(
                'content', task.content, 
                'position', task.position)) AS tasks, 
            JSON_AGG(DISTINCT jsonb_build_object(
                'slug', soft.slug, 'label', 
                soft.label)) AS softskills, 
            JSON_AGG(DISTINCT jsonb_build_object(
                'slug', hard.slug, 
                'label', hard.label, 
                'level', hard.level, 
                'category', hard.category, 
                'sub_category', hard.sub_category)) AS hardskills,
            JSON_AGG(DISTINCT jsonb_build_object(
                'slug', dom.slug, 
                'label', dom.label)) AS domains
        FROM experience exp
        LEFT JOIN experience_task task ON task.experience_id = exp.id
        LEFT JOIN experience_hardskill hardexp ON hardexp.experience_id = exp.id
        LEFT JOIN hardskill hard ON hardexp.hardskill_id = hard.id
        LEFT JOIN experience_softskill softexp ON softexp.experience_id = exp.id
        LEFT JOIN softskill soft ON softexp.softskill_id = soft.id
        INNER JOIN experience_domain domexp ON domexp.experience_id = exp.id
        INNER JOIN domain dom ON domexp.domain_id = dom.id
        WHERE exp.id = $1
        GROUP BY exp.id
        `, [id]);

    if(results.rows[0]===undefined) {
        throw new AppError(404, 'Aucune donnée trouvée')
    }
    return results.rows[0]
}