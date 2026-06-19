import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function checkEnv(envKey:string, errorLabel:string) {
    const envValue = process.env[envKey]
    if (envValue===undefined) { throw new Error(`${errorLabel} non défini`)};
    return envValue;
}

const port = Number(checkEnv("PORT", "Port"));
const dbHost = checkEnv("DB_HOST", "Hôte de la BDD");
const dbPort = Number(checkEnv("DB_PORT", "Port de la BDD"));
const dbName = checkEnv("DB_NAME", "Nom de la BDD");
const dbUser = checkEnv("DB_USER", "Utilisateur de la BDD");
const dbPassword = checkEnv("DB_PASSWORD", "Mot de passe de la BDD");
const frontendUrl = checkEnv("FRONTEND_URL", "URL du frontend");
const cookieSecret = checkEnv("COOKIE_SECRET", "Secret du cookie");

export {port, dbHost, dbPort, dbName, dbUser, dbPassword, frontendUrl, cookieSecret};