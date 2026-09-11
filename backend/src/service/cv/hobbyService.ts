import db from "../../config/db.js";
import { Hobby, HobbyKeyList } from "../../schema/cv/hobby.js";
import { AppError } from "../../utils/AppError.js";
import { getHobbyById } from "../../utils/getHobbyById.js";
import { slugify } from "../../utils/slugify.js";
import { generateUniqueSlug } from "../../utils/generateUniqueSlug.js";

export async function fetchHobby() {
    const results = await db.query(`SELECT id, slug, label, supplement FROM hobby`, []);

    if (!results.rows.length) {
        throw new AppError(404, "Aucune donnée trouvée");
    }
    return results.rows;
}

export async function addHobby(data: Hobby) {
    const slug = await generateUniqueSlug(db, "hobby", slugify({ label: data.label }));

    const insert = await db.query(`
        INSERT INTO hobby (slug, label, supplement)
        VALUES ($1, $2, $3)
        RETURNING id
        `, [slug, data.label, data.supplement ?? null]);

    return getHobbyById(insert.rows[0].id);
}

export async function editHobby(id: number, data: Partial<Hobby>) {
    const dataKeys = Object.keys(data);

    if (id < 1 || Number.isNaN(id)) { throw new AppError(400, "Erreur : aucun id n'a été fourni") };
    if (dataKeys.length === 0) { throw new AppError(400, "Erreur : aucun champ à modifier n'a été fourni") };
    if (!dataKeys.every((dataKey) => HobbyKeyList.includes(dataKey))) { throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas") };

    const entries: [string, unknown][] = Object.entries(data);
    if (data.label !== undefined) {
        entries.push(["slug", await generateUniqueSlug(db, "hobby", slugify({ label: data.label }), id)]);
    }

    const setValues = entries.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const params = [id, ...entries.map(([, value]) => value)];
    const update = await db.query(`
        UPDATE hobby SET ${setValues}
        WHERE id = $1
        RETURNING id
        `, params);

    return getHobbyById(update.rows[0].id);
}
