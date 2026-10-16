# Task Manager API

API RESTful para registrar usuarios, iniciar sesión y administrar **tareas personales**.
Construida con **Node.js + Express + TypeScript + PostgreSQL**.

## Arquitectura

Proyecto en capas, cada una con una única responsabilidad:

```
src/
├── api/
│   ├── routes/         # Definición de rutas (auth, tasks)
│   ├── middlewares/    # authenticate (JWT), validate (AJV), errorHandler
│   └── schemas/        # JSON Schemas de entrada
├── controllers/        # Atienden la petición HTTP y delegan en los services
├── services/           # Lógica de negocio (auth, tokens JWT, tareas)
├── persistence/        # Acceso a PostgreSQL (pool + repositorios)
├── config/             # Singleton de configuración (.env) y spec de Swagger
├── types/              # Tipos compartidos
├── utils/              # Errores personalizados, asyncHandler
├── app.ts              # Construcción de la app Express
└── server.ts           # Arranque y cierre ordenado
database/schema.sql     # Script SQL de PostgreSQL
tests/                  # Pruebas con Vitest
```

Flujo de una petición: `route → middleware (auth/validación) → controller → service → repository → PostgreSQL`.

**Decisiones clave**

- **Configuración**: clase `Config` con patrón Singleton; lee y valida el `.env` una sola vez.
- **Errores**: `AppError` + subclases (`ValidationError`, `AuthenticationError`, `NotFoundError`, `ConflictError`) y un único `errorHandler`. Todas las respuestas de error tienen la forma `{ "error": { "code", "message", "details?" } }`.
- **Seguridad**: contraseñas con bcrypt; JWT HS256 con expiración; consultas SQL parametrizadas; cada consulta de tareas filtra por `user_id`, y si una tarea es de otro usuario se responde `404` (no se revela su existencia); el login devuelve el mismo mensaje para email inexistente y contraseña errónea.
- **Validación**: AJV + ajv-formats con `additionalProperties: false`.

## Requisitos

- Node.js 18+ (recomendado 20+)
- PostgreSQL 13+

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos y las tablas
createdb task_manager
psql -d task_manager -f database/schema.sql
#   (si necesitas usuario: psql -U postgres -d task_manager -f database/schema.sql)

# 3. Configurar variables de entorno
cp .env.example .env     # en Windows: copy .env.example .env
#   edita .env con tus datos

# 4. Ejecutar en desarrollo
npm run dev
```

La API queda en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/api-docs`.

## Variables de entorno (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto HTTP | `3000` |
| `DB_HOST` / `DB_PORT` | Host y puerto de PostgreSQL | `localhost` / `5432` |
| `DB_USER` / `DB_PASSWORD` | Credenciales de PostgreSQL | `postgres` / `postgres` |
| `DB_NAME` | Nombre de la base | `task_manager` |
| `JWT_SECRET` | Secreto para firmar JWT (largo y aleatorio) | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Vigencia del token | `1h` |
| `BCRYPT_ROUNDS` | Costo del hash | `10` |

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con recarga |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run typecheck` | Verifica tipos sin compilar |
| `npm test` | Ejecuta las pruebas (Vitest, sin base de datos real) |

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Registrar usuario |
| POST | `/auth/login` | No | Login, devuelve JWT |
| POST | `/tasks` | Sí | Crear tarea |
| GET | `/tasks` | Sí | Listar mis tareas |
| GET | `/tasks/:id` | Sí | Ver una tarea mía |
| PUT | `/tasks/:id` | Sí | Modificar una tarea mía (campos parciales) |
| DELETE | `/tasks/:id` | Sí | Eliminar una tarea mía |

Estados válidos: `pendiente`, `en curso`, `completada`.

### Ejemplo rápido

```bash
curl -X POST localhost:3000/auth/register -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","email":"ana@example.com","password":"Secreta123"}'

TOKEN=$(curl -s -X POST localhost:3000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"Secreta123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -X POST localhost:3000/tasks -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"titulo":"Entregar prueba","fecha_vencimiento":"2026-12-31","estado":"pendiente"}'

curl localhost:3000/tasks -H "Authorization: Bearer $TOKEN"
```

## Mejoras futuras

Rate limiting en `/auth/*`, refresh tokens, paginación y filtros en `GET /tasks`, despliegue con Docker.
