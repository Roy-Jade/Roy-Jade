import db from "../../config/db.js";
import { Hardskill, HardskillKeyList } from "../../schema/cv/skill.js";
import { AppError } from "../../utils/AppError.js";
import { getHardskillById } from "../../utils/getHardskillById.js";
import { levels } from "../../utils/levels.js";

export async function fetchHardskill(category:string[], level:string) {

    if(!levels.includes(level)) {
        throw new AppError(400, "Le niveau demandé n'existe pas")
    }
    const levelTable = levels.slice(levels.indexOf(level))

    const results = await db.query(`
        SELECT 
            hard.id,
            hard.slug,
            hard.label,
            hard.level,
            hard.category,
            hard.sub_category
            FROM hardskill hard
            WHERE hard.category = ANY($1)
            AND hard.level = ANY($2)
            `, [category, levelTable]);
    
    if(results.rows[0]===undefined) {
        throw new AppError(404, "Aucune donnée trouvée")
    }
    return results.rows
}

export async function addHardskill(data:Hardskill) {
    const insertHardskill = await db.query(`
        INSERT INTO hardskill (slug, label, level, category, sub_category)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `, [
            data.slug, 
            data.label, 
            data.level?data.level:null, 
            data.category?data.category:null, 
            data.sub_category?data.sub_category:null, 
        ]);

        const addedHardskill = await getHardskillById(insertHardskill.rows[0].id);

        return addedHardskill
}

export async function editHardskill(id:number, data:Partial<Hardskill>) {
    const dataKeys = Object.keys(data);

    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (dataKeys.length === 0) {throw new AppError(400, "Erreur : aucun champ à modifier n'a été fourni")};
    if (!dataKeys.every((dataKey) => HardskillKeyList.includes(dataKey))) {throw new AppError(400, "Erreur : au moins l'un des champs à modifier n'existe pas")};

    const setValues = Object.entries(data).map(([key], i) => `${key} = $${i+2}`).join(', ');
    const params = [id, ...Object.values(data)];
    const update = await db.query(`
        UPDATE hardskill SET ${setValues}
        WHERE id = $1
        RETURNING id`,
        params);


    const editedHardskill = await getHardskillById(update.rows[0].id);

    return editedHardskill
}