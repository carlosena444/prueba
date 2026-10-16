-- ============================================================
-- Sistema de Gestión de Tareas - Esquema PostgreSQL
-- Requiere PostgreSQL 13+ (gen_random_uuid() viene incluido).
--
-- Uso:
--   createdb task_manager
--   psql -d task_manager -f database/schema.sql
-- ============================================================

BEGIN;

-- Estados permitidos de una tarea
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pendiente', 'en curso', 'completada');
  END IF;
END
$$;

-- ---------------------------
-- Usuarios
-- ---------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,   -- se guarda en minúsculas desde la API
  password_hash TEXT         NOT NULL,          -- hash bcrypt, nunca texto plano
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------
-- Tareas (cada tarea pertenece a un usuario)
-- ---------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo             VARCHAR(150) NOT NULL,
  descripcion        TEXT         NOT NULL DEFAULT '',
  fecha_vencimiento  TIMESTAMPTZ,
  estado             task_status  NOT NULL DEFAULT 'pendiente',
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Las consultas siempre filtran por dueño
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_estado ON tasks (user_id, estado);

COMMIT;
