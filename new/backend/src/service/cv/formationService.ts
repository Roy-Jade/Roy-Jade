import db from "../../config/db.js";
import { Formation, FormationKeyList } from "../../schema/cv/formation.js";
import { getFormationById } from "../../utils/getFormationById.js";
import { deleteInJunctionTable, insertInJunctionTable, insertTasks } from "../../utils/editInJunctionTable.js";
import { AppError } from "../../utils/AppError.js";

export async function fetchFormation(data:string[]) {

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
            `, [data]);
    

    if(results.rows[0]===undefined) {
        throw new AppError(404, "Aucune donnée trouvée")
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

    await Promise.all([
        insertInJunctionTable("formation", "domain", insertFormation.rows[0].id, domain), 
        insertTasks("formation", insertFormation.rows[0].id, tasks),
        insertInJunctionTable("formation", "hardskill", insertFormation.rows[0].id, hardskill)
    ])

    const addedFormation = await getFormationById(insertFormation.rows[0].id)

    return addedFormation
}

export async function editFormation(
    id:number, 
    formationData:Partial<Formation>|null,
    domainData:number[]|null, 
    hardskillData:number[]|null,
    taskData:string[]|null
) {
    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (!formationData && !domainData && !hardskillData && !taskData) {
        throw new AppError(400, "Erreur : aucune donnée à modifier n'a été fourni")
    };

    if(formationData) {
        if (!Object.keys(formationData).every((key) => FormationKeyList.includes(key))) {
            throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas")
        };

        const setValues = Object.entries(formationData).map(([key], i) => `${key} = $${i+2}`).join(', ');
        const params = [id, ...Object.values(formationData)];
        await db.query(`
            UPDATE formation SET ${setValues}
            WHERE id = $1`,
            params);
    }

    if (domainData) {
        await deleteInJunctionTable("formation", "domain", id);
        await insertInJunctionTable("formation", "domain", id, domainData);
    };

    if (hardskillData) {
        await deleteInJunctionTable("formation", "hardskill", id);
        await insertInJunctionTable("formation", "hardskill", id, hardskillData);
    };

    if (taskData) {
        await deleteInJunctionTable("formation", "task", id);
        await insertTasks("formation", id, taskData);
    }

    const editedFormation = await getFormationById(id);

    return editedFormation
}