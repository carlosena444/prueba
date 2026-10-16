import { authService, type LoginInput, type RegisterInput } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';

/** POST /auth/register */
export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body as RegisterInput);
  res.status(201).json(user);
});

/** POST /auth/login */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body as LoginInput);
  res.status(200).json(result);
});
