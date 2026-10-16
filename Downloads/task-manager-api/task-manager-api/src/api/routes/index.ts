import { Router } from 'express';
import { authRouter } from './authRoutes';
import { taskRouter } from './taskRoutes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
apiRouter.use('/auth', authRouter);
apiRouter.use('/tasks', taskRouter);
