import db from "../../config/db.js";
import { Domain, DomainKeyList } from "../../schema/cv/domain.js";
import { getDomainById } from "../../utils/getDomainById.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { generateUniqueSlug } from "../../utils/generateUniqueSlug.js";

export async function addDomain(data: Domain) {
    const slug = await generateUniqueSlug(db, "domain", slugify({ label: data.label }));

    const insertDomain = await db.query(`
        INSERT INTO domain (slug, label)
        VALUES ($1, $2)
        RETURNING id
        `, [slug, data.label]);

    const addedDomain = await getDomainById(insertDomain.rows[0].id);
    return addedDomain;
}

export async function editDomain(id: number, data: Partial<Domain>) {
    const dataKeys = Object.keys(data);

    if (id < 1 || Number.isNaN(id)) { throw new AppError(400, "Erreur : aucun id n'a été fourni") };
    if (dataKeys.length === 0) { throw new AppError(400, "Erreur : aucun champ à modifier n'a été fourni") };
    if (!dataKeys.every((key) => DomainKeyList.includes(key))) { throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas") };

    const entries: [string, unknown][] = Object.entries(data);
    if (data.label !== undefined) {
        entries.push(["slug", await generateUniqueSlug(db, "domain", slugify({ label: data.label }), id)]);
    }

    const setValues = entries.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const params = [id, ...entries.map(([, value]) => value)];
    const update = await db.query(`
        UPDATE domain SET ${setValues}
        WHERE id = $1
        RETURNING id`,
        params);

    const editedDomain = await getDomainById(update.rows[0].id);
    return editedDomain;
}
