import db from "../../config/db.js";
import { Formation } from "../../schema/cv/formation.js";
import { getFormationById } from "../../utils/getFormationById.js";

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
            GROUP BY form.id
            `, [slugTable]);
    

    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows
}


export async function addFormation(data:Formation, domain:number[], tasks:string[], hardskill:number[]) {
    
    const insertFormation = await db.query(`
        INSERT INTO formation (slug, title, institution, location, obtention_date, description, level)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `, [
            data.slug, 
            data.title, 
            data.institution?data.institution:null, 
            data.location?data.location:null, 
            data.obtention_date?data.obtention_date:null, 
            data.description?data.description:null,
            data.level?data.level:null
        ]);

    const domainPlaceholder = domain.map((_, i) => `($1, $${i+2})`).join(', ');;
    const completeDomainParams = [insertFormation.rows[0].id, ...domain];
    const insertDomain = db.query(`
        INSERT INTO formation_domain (formation_id, domain_id)
        VALUES ${domainPlaceholder}
        `, completeDomainParams)

    const tasksPlaceholder = tasks.map((_, i) => `($1, $${i*2+2}, $${i*2+3})`).join(', ');;
    const tasksParams = tasks.flatMap((task, i) => [tasks[i], i+1]);
    const completeTasksParams = [insertFormation.rows[0].id, ...tasksParams];
    const insertTasks = db.query(`
        INSERT INTO formation_task (formation_id, content, position)
        VALUES ${tasksPlaceholder}
        `, completeTasksParams);

    const hardskillPlaceholder = hardskill.map((_, i) => `($1, $${i+2})`).join(', ');;
    const completeHardskillParams = [insertFormation.rows[0].id, ...hardskill];
    const insertHardskill = db.query(`
        INSERT INTO formation_hardskill (formation_id, hardskill_id)
        VALUES ${hardskillPlaceholder}
        `, completeHardskillParams);

    const promiseAll = await Promise.all([insertDomain, insertTasks, insertHardskill])

    const addedFormation = await getFormationById(insertFormation.rows[0].id)

    return addedFormation
}