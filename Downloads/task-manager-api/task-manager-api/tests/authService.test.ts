import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/persistence/userRepository', () => ({
  userRepository: { findByEmail: vi.fn(), create: vi.fn() },
}));

import { userRepository } from '../src/persistence/userRepository';
import { authService } from '../src/services/authService';
import { verifyToken } from '../src/services/tokenService';
import { AuthenticationError, ConflictError } from '../src/utils/errors';

const repo = vi.mocked(userRepository);

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('register guarda un hash bcrypt y nunca la contraseña en texto plano', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockImplementation(async (u) => ({
      id: 'u1',
      nombre: u.nombre,
      email: u.email,
      created_at: new Date(),
    }));

    await authService.register({ nombre: 'Ana', email: 'ANA@Example.com', password: 'Secreta123' });

    const arg = repo.create.mock.calls[0][0];
    expect(arg.email).toBe('ana@example.com');
    expect(arg.passwordHash).not.toBe('Secreta123');
    expect(await bcrypt.compare('Secreta123', arg.passwordHash)).toBe(true);
  });

  it('register lanza ConflictError si el email ya existe', async () => {
    repo.findByEmail.mockResolvedValue({
      id: 'u1',
      nombre: 'Ana',
      email: 'ana@example.com',
      password_hash: 'x',
      created_at: new Date(),
    });
    await expect(
      authService.register({ nombre: 'Ana', email: 'ana@example.com', password: 'Secreta123' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('login devuelve un JWT válido con credenciales correctas', async () => {
    const password_hash = await bcrypt.hash('Secreta123', 4);
    repo.findByEmail.mockResolvedValue({
      id: 'u1',
      nombre: 'Ana',
      email: 'ana@example.com',
      password_hash,
      created_at: new Date(),
    });

    const { token, user } = await authService.login({
      email: 'ana@example.com',
      password: 'Secreta123',
    });

    expect(verifyToken(token).sub).toBe('u1');
    expect(user).not.toHaveProperty('password_hash');
  });

  it('login lanza AuthenticationError con contraseña incorrecta o usuario inexistente', async () => {
    repo.findByEmail.mockResolvedValue(null);
    await expect(
      authService.login({ email: 'x@example.com', password: 'whatever1' }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
});
