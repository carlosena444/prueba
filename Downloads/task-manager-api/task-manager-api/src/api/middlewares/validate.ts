import Ajv, { type ErrorObject, type SchemaObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { RequestHandler } from 'express';
import { ValidationError } from '../../utils/errors';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);

interface Schemas {
  params?: SchemaObject;
  body?: SchemaObject;
}

/** Convierte los errores de AJV en un formato simple para el cliente. */
const formatErrors = (errors: ErrorObject[] | null | undefined) =>
  (errors ?? []).map((e) => {
    const missing = (e.params as { missingProperty?: string }).missingProperty;
    const extra = (e.params as { additionalProperty?: string }).additionalProperty;
    const path = e.instancePath.replace(/^\//, '').replace(/\//g, '.');
    return { field: path || missing || extra || '(root)', message: e.message ?? 'inválido' };
  });

/**
 * Middleware que valida `req.params` y/o `req.body` con esquemas JSON Schema.
 * Los esquemas se compilan una sola vez, al declarar la ruta.
 */
export const validate = (schemas: Schemas): RequestHandler => {
  const targets: Array<['params' | 'body', ValidateFunction]> = [];
  if (schemas.params) targets.push(['params', ajv.compile(schemas.params)]);
  if (schemas.body) targets.push(['body', ajv.compile(schemas.body)]);

  return (req, _res, next) => {
    for (const [target, validator] of targets) {
      if (!validator(req[target])) {
        return next(new ValidationError(formatErrors(validator.errors)));
      }
    }
    next();
  };
};
