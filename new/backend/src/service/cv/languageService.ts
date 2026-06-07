import db from "../../config/db.js";
import { Language, LanguageKeyList } from "../../schema/cv/language.js";
import { AppError } from "../../utils/AppError.js";
import { getLanguageById } from "../../utils/getLanguageById.js";

export async function fetchLanguage() {
    const results = await db.query(`SELECT id, slug, label, level FROM language`, []);

    if (!results.rows.length) {
        throw new AppError(404, "Aucune donnée trouvée");
    }
    return results.rows;
}

export async function addLanguage(data: Language) {
    const insert = await db.query(`
        INSERT INTO language (slug, label, level)
        VALUES ($1, $2, $3)
        RETURNING id
        `, [data.slug, data.label, data.level ?? null]);

    return getLanguageById(insert.rows[0].id);
}

export async function editLanguage(id: number, data: Partial<Language>) {
    const dataKeys = Object.keys(data);

    if (id < 1 || Number.isNaN(id)) { throw new AppError(400, "Erreur : aucun id n'a été fourni") };
    if (dataKeys.length === 0) { throw new AppError(400, "Erreur : aucun champ à modifier n'a été fourni") };
    if (!dataKeys.every((dataKey) => LanguageKeyList.includes(dataKey))) { throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas") };

    const setValues = Object.entries(data).map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const params = [id, ...Object.values(data)];
    const update = await db.query(`
        UPDATE language SET ${setValues}
        WHERE id = $1
        RETURNING id
        `, params);

    return getLanguageById(update.rows[0].id);
}
