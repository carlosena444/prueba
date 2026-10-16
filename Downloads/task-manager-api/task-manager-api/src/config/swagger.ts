const jsonError = {
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
};

/** Especificación OpenAPI 3.0 de la API, servida en /api-docs. */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Task Manager API',
    version: '1.0.0',
    description:
      'API RESTful para registrar usuarios, iniciar sesión y administrar tareas personales.',
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [
    { name: 'Auth', description: 'Registro e inicio de sesión' },
    { name: 'Tasks', description: 'CRUD de tareas del usuario autenticado' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['nombre', 'email', 'password'],
        properties: {
          nombre: { type: 'string', minLength: 2, maxLength: 100, example: 'Ana Pérez' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 72, example: 'Secreta123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          password: { type: 'string', example: 'Secreta123' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string' },
          email: { type: 'string', format: 'email' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT para el header Authorization: Bearer <token>' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      TaskStatus: { type: 'string', enum: ['pendiente', 'en curso', 'completada'] },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          titulo: { type: 'string' },
          descripcion: { type: 'string' },
          fecha_vencimiento: { type: 'string', format: 'date-time', nullable: true },
          estado: { $ref: '#/components/schemas/TaskStatus' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['titulo'],
        properties: {
          titulo: { type: 'string', minLength: 1, maxLength: 150, example: 'Entregar prueba técnica' },
          descripcion: { type: 'string', example: 'Subir repo y video' },
          fecha_vencimiento: {
            type: 'string',
            nullable: true,
            description: 'Fecha (YYYY-MM-DD) o fecha-hora ISO 8601',
            example: '2026-12-31',
          },
          estado: { $ref: '#/components/schemas/TaskStatus' },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          titulo: { type: 'string', minLength: 1, maxLength: 150 },
          descripcion: { type: 'string' },
          fecha_vencimiento: { type: 'string', nullable: true },
          estado: { $ref: '#/components/schemas/TaskStatus' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'NOT_FOUND' },
              message: { type: 'string', example: 'Tarea no encontrada' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: { description: 'Token ausente, inválido o expirado', ...jsonError },
      ValidationError: { description: 'Datos de entrada inválidos', ...jsonError },
      NotFound: { description: 'Recurso no encontrado (o no pertenece al usuario)', ...jsonError },
    },
    parameters: {
      TaskId: { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un nuevo usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: 'Usuario creado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': { description: 'El email ya está registrado', ...jsonError },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión y obtener un JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: 'Login correcto',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Crear una tarea',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } } },
        },
        responses: {
          '201': {
            description: 'Tarea creada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'Listar las tareas del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de tareas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Consultar una tarea propia',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/TaskId' }],
        responses: {
          '200': {
            description: 'Tarea encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Modificar una tarea propia',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/TaskId' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskRequest' } } },
        },
        responses: {
          '200': {
            description: 'Tarea actualizada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Eliminar una tarea propia',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/TaskId' }],
        responses: {
          '204': { description: 'Tarea eliminada' },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
};
