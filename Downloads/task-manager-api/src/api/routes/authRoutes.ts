import { Router } from 'express';
import { login, register } from '../../controllers/authController';
import { loginSchema, registerSchema } from '../schemas';
import { validate } from '../middlewares/validate';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
