import { Pool, QueryArrayConfig } from 'pg';
import { dbHost, dbPort, dbName, dbUser, dbPassword } from './env.js';

// Sert à gérer les connexions PSQL (optimisation et requêtes)
const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
});

// Export de la méthode query()
export default {
  query: (text: string, params: unknown[]) => pool.query(text, params),
};