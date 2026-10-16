export const TASK_STATUSES = ['pendiente', 'en curso', 'completada'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: string;
  user_id: string;
  titulo: string;
  descripcion: string;
  fecha_vencimiento: Date | null;
  estado: TaskStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskInput {
  titulo: string;
  descripcion?: string;
  fecha_vencimiento?: string | null;
  estado?: TaskStatus;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;
