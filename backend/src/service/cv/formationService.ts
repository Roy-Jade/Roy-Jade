import db, { pool } from "../../config/db.js";
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
                'id', task.id,
                'content', task.content,
                'position', task.position)) AS tasks,
            JSON_AGG(DISTINCT jsonb_build_object(
                'id', hardexp.id,
                'slug', hard.slug,
                'label', hard.label,
                'level', hard.level,
                'category', hard.category,
                'sub_category', hard.sub_category)) AS hardskills,
            JSON_AGG(DISTINCT dom.slug) AS domains
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

    const client = await pool.connect();
    let newId: number;
    try {
        await client.query('BEGIN');

        const insertFormation = await client.query(`
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
        newId = insertFormation.rows[0].id;

        await Promise.all([
            insertInJunctionTable("formation", "domain", newId, domain, client),
            insertTasks("formation", newId, tasks, client),
            insertInJunctionTable("formation", "hardskill", newId, hardskill, client)
        ])

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    const addedFormation = await getFormationById(newId)

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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if(formationData) {
            if (!Object.keys(formationData).every((key) => FormationKeyList.includes(key))) {
                throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas")
            };

            const setValues = Object.entries(formationData).map(([key], i) => `${key} = $${i+2}`).join(', ');
            const params = [id, ...Object.values(formationData)];
            await client.query(`
                UPDATE formation SET ${setValues}
                WHERE id = $1`,
                params);
        }

        if (domainData !== null) {
            await deleteInJunctionTable("formation", "domain", id, client);
            if (domainData.length > 0) await insertInJunctionTable("formation", "domain", id, domainData, client);
        };

        if (hardskillData !== null) {
            await deleteInJunctionTable("formation", "hardskill", id, client);
            if (hardskillData.length > 0) await insertInJunctionTable("formation", "hardskill", id, hardskillData, client);
        };

        if (taskData !== null) {
            await deleteInJunctionTable("formation", "task", id, client);
            if (taskData.length > 0) await insertTasks("formation", id, taskData, client);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    const editedFormation = await getFormationById(id);

    return editedFormation
}