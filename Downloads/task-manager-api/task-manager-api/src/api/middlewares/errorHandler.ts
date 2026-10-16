import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, NotFoundError } from '../../utils/errors';

/** Convierte cualquier ruta no definida en un NotFoundError. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`));
};

/**
 * Manejador de errores centralizado. Todas las respuestas de error
 * tienen la forma: { error: { code, message, details? } }.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // JSON mal formado en el body (lo lanza express.json())
  if (err && typeof err === 'object' && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido' },
    });
    return;
  }

  // Error inesperado: se registra, pero no se filtran detalles internos al cliente.
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
};
