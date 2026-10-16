import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/persistence/userRepository', () => ({
  userRepository: { findByEmail: vi.fn(), create: vi.fn() },
}));
vi.mock('../src/persistence/taskRepository', () => ({
  taskRepository: {
    create: vi.fn(),
    findAllByUser: vi.fn(),
    findByIdAndUser: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import { createApp } from '../src/app';
import { taskRepository } from '../src/persistence/taskRepository';
import { signToken } from '../src/services/tokenService';

const tasks = vi.mocked(taskRepository);
const app = createApp();
const token = signToken({ sub: '11111111-1111-4111-8111-111111111111', email: 'ana@example.com' });
const auth = { Authorization: `Bearer ${token}` };
const TASK_ID = '22222222-2222-4222-8222-222222222222';

describe('API de tareas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST /auth/register rechaza un email inválido (400)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nombre: 'Ana', email: 'no-es-email', password: 'Secreta123' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /tasks sin token devuelve 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('GET /tasks con token lista solo las tareas del usuario autenticado', async () => {
    tasks.findAllByUser.mockResolvedValue([]);
    const res = await request(app).get('/tasks').set(auth);
    expect(res.status).toBe(200);
    expect(tasks.findAllByUser).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
  });

  it('POST /tasks valida el estado permitido', async () => {
    const res = await request(app)
      .post('/tasks')
      .set(auth)
      .send({ titulo: 'Algo', estado: 'inventado' });
    expect(res.status).toBe(400);
  });

  it('GET /tasks/:id de otro usuario devuelve 404', async () => {
    tasks.findByIdAndUser.mockResolvedValue(null);
    const res = await request(app).get(`/tasks/${TASK_ID}`).set(auth);
    expect(res.status).toBe(404);
  });

  it('GET /tasks/:id con id que no es UUID devuelve 400', async () => {
    const res = await request(app).get('/tasks/abc').set(auth);
    expect(res.status).toBe(400);
  });

  it('DELETE /tasks/:id devuelve 204 cuando se elimina', async () => {
    tasks.remove.mockResolvedValue(true);
    const res = await request(app).delete(`/tasks/${TASK_ID}`).set(auth);
    expect(res.status).toBe(204);
  });

  it('una ruta inexistente devuelve 404 en formato JSON', async () => {
    const res = await request(app).get('/nada');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
