/**
 * Error base de la aplicación. Cada subclase representa una situación
 * concreta y lleva su código HTTP, para que el manejador central
 * construya una respuesta JSON consistente.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 - Los datos de entrada no cumplen el esquema. */
export class ValidationError extends AppError {
  constructor(details: unknown, message = 'Datos de entrada inválidos') {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

/** 401 - Credenciales o token inválidos. */
export class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

/** 404 - Recurso inexistente (o que no pertenece al usuario). */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message, 'NOT_FOUND');
  }
}

/** 409 - Conflicto con el estado actual (ej. email duplicado). */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el recurso existente') {
    super(409, message, 'CONFLICT');
  }
}
