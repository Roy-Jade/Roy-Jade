import db from "../../config/db.js";
import { Softskill, SoftskillKeyList } from "../../schema/cv/skill.js";
import { AppError } from "../../utils/AppError.js";
import { getSoftskillById } from "../../utils/getSoftskillById.js";
import { slugify } from "../../utils/slugify.js";
import { generateUniqueSlug } from "../../utils/generateUniqueSlug.js";

export async function fetchSoftskill() {
    const results = await db.query(`
        SELECT
            soft.id,
            soft.slug,
            soft.label
            FROM softskill soft
        `, []);

    if(results.rows[0]===undefined) {
        throw new AppError(404, "Aucune donnée trouvée")
    }
    return results.rows
}

export async function addSoftskill(data:Softskill) {
    const slug = await generateUniqueSlug(db, "softskill", slugify({ label: data.label }));

    const insertSoftskill = await db.query(`
        INSERT INTO softskill (slug, label)
        VALUES ($1, $2)
        RETURNING id
        `, [
            slug,
            data.label,
        ]);

        const addedSoftskill = await getSoftskillById(insertSoftskill.rows[0].id);

        return addedSoftskill
}

export async function editSoftskill(id:number, data:Partial<Softskill>) {
    const dataKeys = Object.keys(data);

    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (dataKeys.length === 0) {throw new AppError(400, "Erreur : aucun champ à modifier n'a été fourni")};
    if (!dataKeys.every((dataKey) => SoftskillKeyList.includes(dataKey))) {throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas")};

    const entries: [string, unknown][] = Object.entries(data);
    if (data.label !== undefined) {
        entries.push(["slug", await generateUniqueSlug(db, "softskill", slugify({ label: data.label }), id)]);
    }

    const setValues = entries.map(([key], i) => `${key} = $${i+2}`).join(', ');
    const params = [id, ...entries.map(([, value]) => value)];
    const update = await db.query(`
        UPDATE softskill SET ${setValues}
        WHERE id = $1
        RETURNING id`,
        params);


    const editedSoftskill = await getSoftskillById(update.rows[0].id);

    return editedSoftskill
}