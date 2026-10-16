import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../../controllers/taskController';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createTaskSchema, taskIdParamsSchema, updateTaskSchema } from '../schemas';

export const taskRouter = Router();

// Todas las rutas de tareas requieren autenticación
taskRouter.use(authenticate);

taskRouter.post('/', validate({ body: createTaskSchema }), createTask);
taskRouter.get('/', listTasks);
taskRouter.get('/:id', validate({ params: taskIdParamsSchema }), getTask);
taskRouter.put(
  '/:id',
  validate({ params: taskIdParamsSchema, body: updateTaskSchema }),
  updateTask,
);
taskRouter.delete('/:id', validate({ params: taskIdParamsSchema }), deleteTask);
