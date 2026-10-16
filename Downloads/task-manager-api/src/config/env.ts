import dotenv from 'dotenv';

dotenv.config();

// Lee una variable obligatoria o lanza un error claro al iniciar.
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Variable de entorno obligatoria no definida: ${name}`);
  }
  return value;
}

// Lee un entero desde el entorno con un valor por defecto.
function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`La variable ${name} debe ser un número entero`);
  }
  return parsed;
}

// Guarda la configuración de la app y la carga una sola vez.
export class Config {
  private static instance: Config | undefined;

  public readonly nodeEnv: string;
  public readonly port: number;
  public readonly db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  public readonly jwt: { secret: string; expiresIn: string };
  public readonly bcryptRounds: number;

  private constructor() {
    this.nodeEnv = process.env.NODE_ENV ?? 'development';
    this.port = int('PORT', 3000);
    this.db = {
      host: required('DB_HOST'),
      port: int('DB_PORT', 5432),
      user: required('DB_USER'),
      password: required('DB_PASSWORD'),
      database: required('DB_NAME'),
    };
    this.jwt = {
      secret: required('JWT_SECRET'),
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    };
    this.bcryptRounds = int('BCRYPT_ROUNDS', 10);
  }

  // Devuelve la instancia única de la configuración.
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

export const config = Config.getInstance();
