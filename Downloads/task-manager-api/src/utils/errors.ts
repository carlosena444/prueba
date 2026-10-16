// Error base de la aplicación. Cada subclase define el código HTTP correcto.
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

// 400: datos de entrada inválidos.
export class ValidationError extends AppError {
  constructor(details: unknown, message = 'Datos de entrada inválidos') {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

// 401: credenciales o token inválidos.
export class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

// 404: recurso no encontrado o no pertenece al usuario.
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message, 'NOT_FOUND');
  }
}

// 409: conflicto con un recurso ya existente.
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el recurso existente') {
    super(409, message, 'CONFLICT');
  }
}
