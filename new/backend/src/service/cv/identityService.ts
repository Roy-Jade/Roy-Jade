import db from "../../config/db.js";
import { Identity, IdentityKeyList } from "../../schema/cv/identity.js";

export async function fetchIdentity() {
    let results = await db.query(`SELECT * FROM identity WHERE id = 1`, []);
    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows[0]
}

export async function editIdentity(data:Partial<Identity>) {
    const dataKeys = Object.keys(data);

    if (dataKeys.length === 0) {throw new Error("Erreur : aucun champ à modifier n'a été fourni")};
    if (!dataKeys.every((dataKey) => IdentityKeyList.includes(dataKey))) {throw new Error("Erreur : au moins l'un des champs à modifier n'existe pas")};

    const setValues = Object.entries(data).map(([key], i) => `${key} = $${i+1}`).join(', ');
    const params = Object.values(data);
    await db.query(`
        UPDATE identity SET ${setValues}
        WHERE id = 1`,
        params);

    const editedIdentity = await fetchIdentity();

    return editedIdentity
}