import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticationError } from '../utils/errors';

export interface TokenPayload {
  sub: string;
  email: string;
}

/** Genera un JWT firmado (HS256) para el usuario indicado. */
export function signToken(payload: TokenPayload): string {
  return jwt.sign({ email: payload.email }, config.jwt.secret, {
    subject: payload.sub,
    algorithm: 'HS256',
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });
}

/**
 * Verifica firma y expiración de un JWT.
 * @throws {AuthenticationError} si el token es inválido o expiró.
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      throw new Error('Payload inesperado');
    }
    return { sub: decoded.sub, email: String(decoded.email ?? '') };
  } catch {
    throw new AuthenticationError('Token inválido o expirado');
  }
}
