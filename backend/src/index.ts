import app from './app.js';
import { port } from './config/env.js';

app.listen(port, () => {
  console.log(`Serveur en ligne sur http://localhost:${port}`);
});