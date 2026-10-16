import { createApp } from './app';
import { config } from './config/env';
import { pool } from './persistence/db';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`);
  console.log(`Swagger UI en http://localhost:${config.port}/api-docs`);
});

// Cierra la app y libera la conexión a PostgreSQL.
function shutdown(signal: string): void {
  console.log(`${signal} recibido, cerrando...`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
