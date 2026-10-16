# Bitácora de Desarrollo

> ⚠️ Esta bitácora debe reflejar **tu** proceso real. Las secciones de abajo son una plantilla:
> reemplaza cada `COMPLETAR` con lo que realmente hiciste, probaste y decidiste.
> No dejes texto que no puedas defender en el video.

## 1. Resumen del proceso

COMPLETAR: orden en que construiste el proyecto (config → persistencia → auth → tareas → validación → docs → tests) y tiempo aproximado.

## 2. Uso de asistentes de IA

### Uso 1 — COMPLETAR (ej. "Scaffold inicial del proyecto")

- **Herramienta y prompt exacto:** COMPLETAR (pega el prompt tal cual lo escribiste).
- **Qué se aceptó y por qué:** COMPLETAR (ej. estructura en capas, Singleton de config, clases de error: explica por qué son adecuadas).
- **Qué se rechazó o modificó y por qué:** COMPLETAR. Puntos que conviene revisar con ojo crítico:
  - El `JWT_SECRET` debe venir del `.env` y no tener valor por defecto.
  - `expiresIn` en `jsonwebtoken` requiere un cast de tipo al venir de una variable de entorno.
  - El `PUT` aquí acepta campos parciales; decide si prefieres semántica de reemplazo completo.
  - Las consultas de tareas siempre filtran por `user_id` (comprueba que realmente lo hacen todas).
- **Verificación realizada:** COMPLETAR (ej. `npm run typecheck`, `npm test`, pruebas manuales con Swagger/curl: probar que el usuario B recibe 404 al pedir tareas del usuario A, token expirado, email duplicado, UUID inválido).
- **Decisiones tomadas sin asistencia de IA (mínimo 2):**
  1. COMPLETAR (ej. responder 404 y no 403 cuando la tarea es de otro usuario, y por qué).
  2. COMPLETAR (ej. elegir UUID en vez de SERIAL, usar un ENUM de PostgreSQL, bcryptjs vs bcrypt, etc.).

### Uso 2 — COMPLETAR (repite la estructura anterior por cada uso significativo)

## 3. Retos y soluciones

| Reto / error | Cómo se superó |
|---|---|
| COMPLETAR | COMPLETAR |

## 4. Pruebas realizadas

COMPLETAR: qué cubren los tests de `tests/` y qué probaste manualmente.
