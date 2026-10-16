import type { Request } from 'express';
import { taskService } from '../services/taskService';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticationError } from '../utils/errors';

/** Obtiene el id del usuario autenticado (lo coloca el middleware `authenticate`). */
const getUserId = (req: Request): string => {
  if (!req.user) throw new AuthenticationError();
  return req.user.id;
};

/** POST /tasks */
export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.create(getUserId(req), req.body as CreateTaskInput);
  res.status(201).json(task);
});

/** GET /tasks */
export const listTasks = asyncHandler(async (req, res) => {
  res.status(200).json(await taskService.list(getUserId(req)));
});

/** GET /tasks/:id */
export const getTask = asyncHandler(async (req, res) => {
  res.status(200).json(await taskService.getById(getUserId(req), req.params.id));
});

/** PUT /tasks/:id */
export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.update(
    getUserId(req),
    req.params.id,
    req.body as UpdateTaskInput,
  );
  res.status(200).json(task);
});

/** DELETE /tasks/:id */
export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.remove(getUserId(req), req.params.id);
  res.status(204).send();
});
