import { ConflictError } from '../utils/errors';
import { hasPgCode, PG_UNIQUE_VIOLATION, pool } from './db';

export interface User {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export type PublicUser = Omit<User, 'password_hash'>;

export interface NewUser {
  nombre: string;
  email: string;
  passwordHash: string;
}

// Acceso a la tabla users con consultas parametrizadas.
export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT id, nombre, email, password_hash, created_at FROM users WHERE email = $1',
      [email],
    );
    return rows[0] ?? null;
  },

  async create({ nombre, email, passwordHash }: NewUser): Promise<PublicUser> {
    try {
      const { rows } = await pool.query<PublicUser>(
        `INSERT INTO users (nombre, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, nombre, email, created_at`,
        [nombre, email, passwordHash],
      );
      return rows[0];
    } catch (err) {
      // Evita la carrera entre consultar y crear un usuario duplicado.
      if (hasPgCode(err, PG_UNIQUE_VIOLATION)) {
        throw new ConflictError('El email ya está registrado');
      }
      throw err;
    }
  },
};
