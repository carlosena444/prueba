import type { SchemaObject } from 'ajv';
import { TASK_STATUSES } from '../../types/task';

/** Fecha (YYYY-MM-DD) o fecha-hora ISO 8601; también acepta null para borrarla. */
const dueDate: SchemaObject = {
  anyOf: [
    { type: 'string', format: 'date' },
    { type: 'string', format: 'date-time' },
    { type: 'null' },
  ],
};

export const registerSchema: SchemaObject = {
  type: 'object',
  required: ['nombre', 'email', 'password'],
  additionalProperties: false,
  properties: {
    nombre: { type: 'string', minLength: 2, maxLength: 100 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    // bcrypt solo procesa los primeros 72 bytes
    password: { type: 'string', minLength: 8, maxLength: 72 },
  },
};

export const loginSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 1, maxLength: 72 },
  },
};

export const createTaskSchema: SchemaObject = {
  type: 'object',
  required: ['titulo'],
  additionalProperties: false,
  properties: {
    titulo: { type: 'string', minLength: 1, maxLength: 150 },
    descripcion: { type: 'string', maxLength: 5000 },
    fecha_vencimiento: dueDate,
    estado: { type: 'string', enum: [...TASK_STATUSES] },
  },
};

export const updateTaskSchema: SchemaObject = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: createTaskSchema.properties,
};

export const taskIdParamsSchema: SchemaObject = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};
