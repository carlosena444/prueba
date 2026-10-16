import { taskRepository } from '../persistence/taskRepository';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { NotFoundError } from '../utils/errors';

const NOT_FOUND_MESSAGE = 'Tarea no encontrada';

/**
 * Lógica de negocio de tareas. Si una tarea no existe o pertenece a otro
 * usuario se responde 404 en ambos casos, para no revelar su existencia.
 */
export const taskService = {
  create(userId: string, input: CreateTaskInput): Promise<Task> {
    return taskRepository.create(userId, input);
  },

  list(userId: string): Promise<Task[]> {
    return taskRepository.findAllByUser(userId);
  },

  async getById(userId: string, taskId: string): Promise<Task> {
    const task = await taskRepository.findByIdAndUser(taskId, userId);
    if (!task) throw new NotFoundError(NOT_FOUND_MESSAGE);
    return task;
  },

  async update(userId: string, taskId: string, changes: UpdateTaskInput): Promise<Task> {
    const task = await taskRepository.update(taskId, userId, changes);
    if (!task) throw new NotFoundError(NOT_FOUND_MESSAGE);
    return task;
  },

  async remove(userId: string, taskId: string): Promise<void> {
    const deleted = await taskRepository.remove(taskId, userId);
    if (!deleted) throw new NotFoundError(NOT_FOUND_MESSAGE);
  },
};
