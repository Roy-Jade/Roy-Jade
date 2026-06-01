import db from "../config/db.js";
import bcrypt from 'bcrypt';
import { AppError } from "../utils/AppError.js";

export async function validateLogin(pseudonyme:string, password:string) {
    const loginFailed = new AppError(401, "Erreur : l'identifiant et le mot de passe ne correspondent pas");

    const userPassword = await db.query(`
        SELECT hashed_password FROM admin WHERE pseudonyme = $1`, [pseudonyme]
    );
    if (!userPassword.rows[0]) {throw loginFailed}

    const isPasswordValid = await bcrypt.compare(password, userPassword.rows[0].hashed_password);
    if (!isPasswordValid) {throw loginFailed}

    return
}