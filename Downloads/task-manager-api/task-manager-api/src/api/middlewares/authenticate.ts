import type { RequestHandler } from 'express';
import { verifyToken } from '../../services/tokenService';
import { AuthenticationError } from '../../utils/errors';

/**
 * Protege rutas: lee `Authorization: Bearer <token>`, verifica el JWT y
 * deja el usuario en `req.user`.
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
