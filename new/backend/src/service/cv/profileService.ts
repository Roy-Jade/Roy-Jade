import db from "../../config/db.js";
import { Profile, ProfileKeyList } from "../../schema/cv/profile.js";
import { getProfileById } from "../../utils/getProfileById.js";

export async function fetchProfile(context:string) {

    const results = await db.query(`
        SELECT 
            profile.id,
            profile.context,
            profile.tagline,
            profile.description
            FROM profile
        WHERE profile.context = $1
        `, [context]);
    
    if(results.rows[0]===undefined) {
        throw new Error("Aucune donnée trouvée")
    }
    return results.rows[0]
}

export async function addProfile(data:Profile) {
    const insertProfile = await db.query(`
        INSERT INTO profile (context, tagline, description)
        VALUES ($1, $2, $3)
        RETURNING id
        `, [
            data.context, 
            data.tagline,
            data.description
        ]);

        const addedProfile = await getProfileById(insertProfile.rows[0].id);

        return addedProfile
}

export async function editProfile(id:number, data:Partial<Profile>) {
    const dataKeys = Object.keys(data);

    if (id<1) {throw new Error(("Erreur : aucun id n'a été fourni"))};
    if (dataKeys.length === 0) {throw new Error("Erreur : aucun champ à modifier n'a été fourni")};
    if (!dataKeys.every((dataKey) => ProfileKeyList.includes(dataKey))) {throw new Error("Erreur : au moins l'un des champs à modifier n'existe pas")};

    const setValues = Object.entries(data).map(([key], i) => `${key} = $${i+2}`).join(', ');
    const params = [id, ...Object.values(data)];
    const update = await db.query(`
        UPDATE profile SET ${setValues}
        WHERE id = $1
        RETURNING id`,
        params);


    const editedProfile = await getProfileById(update.rows[0].id);

    return editedProfile
}