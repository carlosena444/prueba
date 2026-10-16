import { Pool } from 'pg';
import { config } from '../config/env';

// Pool compartido para todas las consultas a la base de datos.
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

// Código SQLSTATE para violación de clave única.
export const PG_UNIQUE_VIOLATION = '23505';

export const hasPgCode = (err: unknown, code: string): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === code;
