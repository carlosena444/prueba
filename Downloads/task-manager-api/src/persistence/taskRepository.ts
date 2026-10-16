import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { pool } from './db';

const COLUMNS =
  'id, user_id, titulo, descripcion, fecha_vencimiento, estado, created_at, updated_at';

// Columnas permitidas para actualización.
const UPDATABLE = ['titulo', 'descripcion', 'fecha_vencimiento', 'estado'] as const;

/**
 * Acceso a la tabla tasks con aislamiento por usuario.
 */
export const taskRepository = {
  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const { rows } = await pool.query<Task>(
      `INSERT INTO tasks (user_id, titulo, descripcion, fecha_vencimiento, estado)
       VALUES ($1, $2, COALESCE($3, ''), $4, COALESCE($5, 'pendiente')::task_status)
       RETURNING ${COLUMNS}`,
      [
        userId,
        input.titulo,
        input.descripcion ?? null,
        input.fecha_vencimiento ?? null,
        input.estado ?? null,
      ],
    );
    return rows[0];
  },

  async findAllByUser(userId: string): Promise<Task[]> {
    const { rows } = await pool.query<Task>(
      `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  },

  async findByIdAndUser(id: string, userId: string): Promise<Task | null> {
    const { rows } = await pool.query<Task>(
      `SELECT ${COLUMNS} FROM tasks WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return rows[0] ?? null;
  },

  async update(id: string, userId: string, changes: UpdateTaskInput): Promise<Task | null> {
    const sets: string[] = [];
    const values: unknown[] = [];

    for (const column of UPDATABLE) {
      if (changes[column] !== undefined) {
        values.push(changes[column]);
        sets.push(`${column} = $${values.length}`);
      }
    }

    if (sets.length === 0) {
      return taskRepository.findByIdAndUser(id, userId);
    }

    sets.push('updated_at = now()');
    values.push(id, userId);

    const { rows } = await pool.query<Task>(
      `UPDATE tasks SET ${sets.join(', ')}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING ${COLUMNS}`,
      values,
    );
    return rows[0] ?? null;
  },

  async remove(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);
    return (rowCount ?? 0) > 0;
  },
};
