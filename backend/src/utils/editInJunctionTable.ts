import db from "../config/db.js";
import { AppError } from "./AppError.js";
import { junctionTable } from "./junctionTables.js";

export const deleteInJunctionTable = async (refTable:string, secondTable:string, id:number) => {

    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (!junctionTable.some(([ref, second]) => ref ===refTable && second === secondTable)) {
        throw new AppError(400, "Erreur : la table de liaison cible n'existe pas")
    }

    const response = await db.query(`
        DELETE FROM ${refTable}_${secondTable} WHERE ${refTable}_id = $1
        `, [id]
    );
}

export const insertInJunctionTable = async (refTable:string, secondTable:string, id:number, addedElement:number[]) => {

    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (!junctionTable.some(([ref, second]) => ref ===refTable && second === secondTable)) {
        throw new AppError(400, "Erreur : la table de liaison cible n'existe pas")
    }
    if (addedElement.length <1) {
        throw new AppError(400, "Erreur : aucun élément à ajouter n'a été fourni")
    }

    const placeholder = addedElement.map((_, i) => `($1, $${i+2})`).join(', ');
    const params = [id, ...addedElement]
    const response = await db.query(`
        INSERT INTO ${refTable}_${secondTable} (${refTable}_id, ${secondTable}_id)
        VALUES ${placeholder}
        `, params
    );

    return
}

export const insertTasks = async (refTable:string, id:number, tasks:string[]) => {

    if (id<1 || Number.isNaN(id)) {throw new AppError(400, "Erreur : aucun id n'a été fourni")};
    if (!junctionTable.some(([ref, second]) => ref ===refTable && second === "task")) {
        throw new AppError(400, "Erreur : la table de liaison cible n'existe pas")
    }
    if (tasks.length <1) {
        throw new AppError(400, "Erreur : aucun élément à ajouter n'a été fourni")
    }


    const placeholder = tasks.map((_, i) => `($1, $${i*2+2}, $${i*2+3})`).join(', ');
    const params = tasks.flatMap((_, i) => [tasks[i], i+1]);
    const completeParams = [id, ...params];
    await db.query(`
        INSERT INTO ${refTable}_task (${refTable}_id, content, position)
        VALUES ${placeholder}
        `, completeParams
    );

    return
}