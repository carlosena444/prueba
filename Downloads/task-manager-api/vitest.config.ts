import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Variables de entorno falsas: los tests nunca tocan la base de datos real.
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'test',
      DB_PASSWORD: 'test',
      DB_NAME: 'test',
      JWT_SECRET: 'test-secret-only-for-unit-tests',
      JWT_EXPIRES_IN: '1h',
      BCRYPT_ROUNDS: '4',
    },
  },
});
