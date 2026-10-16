import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { userRepository, type PublicUser } from '../persistence/userRepository';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { signToken } from './tokenService';

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const authService = {
  /**
   * Registra un usuario nuevo. La contraseña se guarda únicamente como hash bcrypt.
   * @throws {ConflictError} si el email ya existe.
   */
  async register({ nombre, email, password }: RegisterInput): Promise<PublicUser> {
    const normalized = normalizeEmail(email);

    if (await userRepository.findByEmail(normalized)) {
      throw new ConflictError('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    return userRepository.create({ nombre: nombre.trim(), email: normalized, passwordHash });
  },

  /**
   * Verifica credenciales y devuelve un JWT.
   * El mensaje de error es el mismo para "usuario inexistente" y
   * "contraseña incorrecta" para no revelar qué emails están registrados.
   * @throws {AuthenticationError} si las credenciales no son válidas.
   */
  async login({ email, password }: LoginInput): Promise<LoginResult> {
    const user = await userRepository.findByEmail(normalizeEmail(email));
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !valid) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    const token = signToken({ sub: user.id, email: user.email });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...publicUser } = user;
    return { token, user: publicUser };
  },
};
