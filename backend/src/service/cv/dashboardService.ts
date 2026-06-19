import db from '../../config/db.js';

export async function fetchDashboard() {

    const identityPromise = db.query(`SELECT * from identity`, []);
    const languagePromise = db.query(`SELECT * from language ORDER BY id`, []);
    const hobbyPromise = db.query(`SELECT * from hobby ORDER BY id`, []);
    const profilePromise = db.query(`SELECT * from profile ORDER BY id`, []);
    const domainPromise = db.query(`SELECT * from domain ORDER BY id`, []);
    const softskillPromise = db.query(`SELECT * from softskill ORDER BY id`, []);
    const hardskillPromise = db.query(`SELECT * from hardskill ORDER BY id`, []);
    const experiencePromise = db.query(`
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
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'id', dom.id,
                'slug', dom.slug,
                'label', dom.label)) FILTER (WHERE dom.id IS NOT NULL), '[]') AS domains,
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'content', task.content,
                'position', task.position)) FILTER (WHERE task.content IS NOT NULL), '[]') AS tasks,
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'slug', soft.slug,
                'label', soft.label)) FILTER (WHERE soft.slug IS NOT NULL), '[]') AS softskills,
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'slug', hard.slug,
                'label', hard.label,
                'level', hard.level,
                'category', hard.category,
                'sub_category', hard.sub_category)) FILTER (WHERE hard.slug IS NOT NULL), '[]') AS hardskills
        FROM experience exp
        LEFT JOIN experience_task task ON task.experience_id = exp.id
        LEFT JOIN experience_hardskill hardexp ON hardexp.experience_id = exp.id
        LEFT JOIN hardskill hard ON hardexp.hardskill_id = hard.id
        LEFT JOIN experience_softskill softexp ON softexp.experience_id = exp.id
        LEFT JOIN softskill soft ON softexp.softskill_id = soft.id
        LEFT JOIN experience_domain domexp ON domexp.experience_id = exp.id
        LEFT JOIN domain dom ON domexp.domain_id = dom.id
        GROUP BY exp.id
        ORDER BY exp.id
    `, []);
    const formationPromise = db.query(`
        SELECT 
            form.id,
            form.slug,
            form.title,
            form.institution,
            form.location,
            form.obtention_date,
            form.description,
            form.level,
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'id', dom.id,
                'slug', dom.slug,
                'label', dom.label)) FILTER (WHERE dom.id IS NOT NULL), '[]') AS domains,
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'content', task.content,
                'position', task.position)) FILTER (WHERE task.content IS NOT NULL), '[]') AS tasks,
            COALESCE(JSON_AGG(DISTINCT jsonb_build_object(
                'slug', hard.slug,
                'label', hard.label,
                'level', hard.level,
                'category', hard.category,
                'sub_category', hard.sub_category)) FILTER (WHERE hard.slug IS NOT NULL), '[]') AS hardskills
        FROM formation form
        LEFT JOIN formation_task task ON task.formation_id = form.id
        LEFT JOIN formation_hardskill hardexp ON hardexp.formation_id = form.id
        LEFT JOIN hardskill hard ON hardexp.hardskill_id = hard.id
        LEFT JOIN formation_domain domexp ON domexp.formation_id = form.id
        LEFT JOIN domain dom ON domexp.domain_id = dom.id
        GROUP BY form.id
        ORDER BY form.id
    `, []);
    

    const [identityResult, languageResult, hobbyResult, profileResult, domainResult, softskillResult, hardskillResult, experienceResult, formationResult] = await Promise.all([identityPromise, languagePromise, hobbyPromise, profilePromise, domainPromise, softskillPromise, hardskillPromise, experiencePromise, formationPromise]);

    return {
        identity : identityResult.rows[0],
        language : languageResult.rows,
        hobby : hobbyResult.rows,
        profile : profileResult.rows,
        domain : domainResult.rows,
        softskill : softskillResult.rows,
        hardskill : hardskillResult.rows,
        experience : experienceResult.rows,
        formation : formationResult.rows,
    }
}

