import db from "../../config/db.js";
import { Softskill, SoftskillKeyList } from "../../schema/cv/skill.js";
import { getSoftskillById } from "../../utils/getSoftskillById.js";

export async function addSoftskill(data:Softskill) {
    const insertSoftskill = await db.query(`
        INSERT INTO softskill (slug, label)
        VALUES ($1, $2)
        RETURNING id
        `, [
            data.slug, 
            data.label,
        ]);

        const addedSoftskill = await getSoftskillById(insertSoftskill.rows[0].id);

        return addedSoftskill
}

export async function editSoftskill(id:number, data:Partial<Softskill>) {
    const dataKeys = Object.keys(data);

    if (id<1) {throw new Error(("Erreur : aucun id n'a été fourni"))};
    if (dataKeys.length === 0) {throw new Error("Erreur : aucun champ à modifier n'a été fourni")};
    if (!dataKeys.every((dataKey) => SoftskillKeyList.includes(dataKey))) {throw new Error("Erreur : au moins l'un des champs à modifier n'existe pas")};

    const setValues = Object.entries(data).map(([key], i) => `${key} = $${i+2}`).join(', ');
    const params = [id, ...Object.values(data)];
    const update = await db.query(`
        UPDATE softskill SET ${setValues}
        WHERE id = $1
        RETURNING id`,
        params);


    const editedSoftskill = await getSoftskillById(update.rows[0].id);

    return editedSoftskill
}