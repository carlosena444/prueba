import type { RequestHandler } from 'express';
import { verifyToken } from '../../services/tokenService';
import { AuthenticationError } from '../../utils/errors';

/**
 * Verifica el token JWT y deja la información del usuario en `req.user`.
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AuthenticationError('Token no proporcionado'));
  }

  try {
    const { sub, email } = verifyToken(header.slice('Bearer '.length).trim());
    req.user = { id: sub, email };
    next();
  } catch (err) {
    next(err);
  }
};
