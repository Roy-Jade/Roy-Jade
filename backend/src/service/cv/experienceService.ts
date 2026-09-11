import db, { pool } from "../../config/db.js";
import { Experience, ExperienceKeyList } from "../../schema/cv/experience.js";
import { getExperienceById } from "../../utils/getExperienceById.js";
import { deleteInJunctionTable, insertInJunctionTable, insertTasks } from "../../utils/editInJunctionTable.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { generateUniqueSlug } from "../../utils/generateUniqueSlug.js";

export async function fetchExperience(data:{domains:string[], type:'detail'|'summary'}[]) {

    const promises = data.map(group=>db.query(`
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
                'id', task.id,
                'content', task.content,
                'position', task.position)) AS tasks,
            JSON_AGG(DISTINCT jsonb_build_object(
                'id', softexp.id,
                'slug', soft.slug,
                'label', soft.label)) AS softskills,
            JSON_AGG(DISTINCT jsonb_build_object(
                'id', hardexp.id,
                'slug', hard.slug,
                'label', hard.label,
                'level', hard.level,
                'category', hard.category,
                'sub_category', hard.sub_category)) AS hardskills,
            JSON_AGG(DISTINCT dom.slug) AS domains
        FROM experience exp
        LEFT JOIN experience_task task ON task.experience_id = exp.id
        LEFT JOIN experience_hardskill hardexp ON hardexp.experience_id = exp.id
        LEFT JOIN hardskill hard ON hardexp.hardskill_id = hard.id
        LEFT JOIN experience_softskill softexp ON softexp.experience_id = exp.id
        LEFT JOIN softskill soft ON softexp.softskill_id = soft.id
        INNER JOIN experience_domain domexp ON domexp.experience_id = exp.id
        INNER JOIN domain dom ON domexp.domain_id = dom.id
        WHERE dom.slug = ANY($1) AND exp.type = $2
        GROUP BY exp.id
        `, [group.domains, group.type]));
    

    const promiseAllResults = await Promise.all(promises);

    const results = promiseAllResults.flatMap(result => result.rows)

    if(results[0]===undefined) {
        throw new AppError(404, "Aucune donnée trouvée")
    }
    return results
}

export async function addExperience(data:Experience, domain:number[], tasks:string[], hardskill:number[], softskill:number[]) {

    const client = await pool.connect();
    let newId: number;
    try {
        await client.query('BEGIN');

        const slug = await generateUniqueSlug(client, "experience", slugify({
            title: data.title,
            company: data.company,
            date: data.end_date
        }));

        const insertExperience = await client.query(`
            INSERT INTO experience (slug, type, title, company, location, start_date, end_date, description)
            VALUES ($1, 'detail', $2, $3, $4, $5, $6, $7)
            RETURNING id
            `, [
                slug,
                data.title,
                data.company?data.company:null,
                data.location?data.location:null,
                data.start_date?data.start_date:null,
                data.end_date?data.end_date:null,
                data.description?data.description:null
            ]);
        newId = insertExperience.rows[0].id;

        await Promise.all([
            insertInJunctionTable("experience", "domain", newId, domain, client),
            insertTasks("experience", newId, tasks, client),
            insertInJunctionTable("experience", "hardskill", newId, hardskill, client),
            insertInJunctionTable("experience", "softskill", newId, softskill, client)
        ])

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    const addedExperience = await getExperienceById(newId)

    return addedExperience
}

export async function editExperience(
    id:number, 
    experienceData:Partial<Experience>|null,
    domainData:number[]|null, 
    hardskillData:number[]|null, 
    softskillData:number[]|null, 
    taskData:string[]|null
) {
    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (!experienceData && !domainData && !hardskillData && !softskillData && !taskData) {
        throw new AppError(400, "Erreur : aucune donnée à modifier n'a été fourni")
    };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if(experienceData) {
            if (!Object.keys(experienceData).every((key) => ExperienceKeyList.includes(key))) {
                throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas")
            };

            const entries: [string, unknown][] = Object.entries(experienceData);
            if (experienceData.title !== undefined || experienceData.company !== undefined || experienceData.end_date !== undefined) {
                entries.push(["slug", await generateUniqueSlug(client, "experience", slugify({
                    title: experienceData.title,
                    company: experienceData.company,
                    date: experienceData.end_date
                }), id)]);
            }

            const setValues = entries.map(([key], i) => `${key} = $${i+2}`).join(', ');
            const params = [id, ...entries.map(([, value]) => value)];
            await client.query(`
                UPDATE experience SET ${setValues}
                WHERE id = $1`,
                params);
        }

        if (domainData !== null) {
            await deleteInJunctionTable("experience", "domain", id, client);
            if (domainData.length > 0) await insertInJunctionTable("experience", "domain", id, domainData, client);
        };

        if (hardskillData !== null) {
            await deleteInJunctionTable("experience", "hardskill", id, client);
            if (hardskillData.length > 0) await insertInJunctionTable("experience", "hardskill", id, hardskillData, client);
        };

        if (softskillData !== null) {
            await deleteInJunctionTable("experience", "softskill", id, client);
            if (softskillData.length > 0) await insertInJunctionTable("experience", "softskill", id, softskillData, client);
        };

        if (taskData !== null) {
            await deleteInJunctionTable("experience", "task", id, client);
            if (taskData.length > 0) await insertTasks("experience", id, taskData, client);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    const editedExperience = await getExperienceById(id);

    return editedExperience
}