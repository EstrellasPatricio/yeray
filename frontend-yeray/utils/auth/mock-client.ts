import { storage } from 'wxt/utils/storage';

import { AuthApiError, type AuthApi, type AuthResponse, type AuthUser } from './contract';
import { validateEmail, validatePassword } from './validation';

/**
 * Cliente simulado para desarrollar sin backend (WXT_AUTH_MOCK=true).
 * Imita el contrato, incluida la rotación de refresh tokens, y guarda sus datos
 * en storage.local para que las cuentas sobrevivan al cierre del popup.
 * Solo guarda un hash con sal de la contraseña. No es un sistema seguro.
 */

interface MockUser extends AuthUser {
  salt: string;
  passwordHash: string;
}

interface MockRefreshToken {
  token: string;
  userId: string;
  expiresAt: number;
}

interface MockDb {
  users: MockUser[];
  refreshTokens: MockRefreshToken[];
}

const ACCESS_TOKEN_TTL_S = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const dbItem = storage.defineItem<MockDb>('local:yerai.mock.authDb');

/** Devuelve siempre un objeto nuevo para no mutar valores compartidos. */
async function readDb(): Promise<MockDb> {
  const db = await dbItem.getValue();
  return db ? structuredClone(db) : { users: [], refreshTokens: [] };
}

async function hashPassword(salt: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

interface MockAuthApiOptions {
  /** Retardo artificial para ver los estados de carga en la interfaz. */
  latencyMs?: number;
  now?: () => number;
}

export function createMockAuthApi({ latencyMs = 400, now = Date.now }: MockAuthApiOptions = {}): AuthApi {
  const delay = () => new Promise((resolve) => setTimeout(resolve, latencyMs));

  function issueSession(db: MockDb, user: MockUser): AuthResponse {
    const refreshToken = crypto.randomUUID();
    db.refreshTokens.push({ token: refreshToken, userId: user.id, expiresAt: now() + REFRESH_TOKEN_TTL_MS });
    return {
      user: { id: user.id, email: user.email },
      tokens: {
        accessToken: `mock-access-${crypto.randomUUID()}`,
        refreshToken,
        accessTokenExpiresIn: ACCESS_TOKEN_TTL_S,
      },
    };
  }

  return {
    async register({ email, password }) {
      await delay();
      if (validateEmail(email) || validatePassword(password, 'register')) {
        throw new AuthApiError('VALIDATION_ERROR', 'Datos no válidos', 400);
      }
      const db = await readDb();
      const normalized = normalizeEmail(email);
      if (db.users.some((user) => user.email === normalized)) {
        throw new AuthApiError('EMAIL_ALREADY_REGISTERED', 'Correo ya registrado', 409);
      }
      const salt = crypto.randomUUID();
      const user: MockUser = {
        id: crypto.randomUUID(),
        email: normalized,
        salt,
        passwordHash: await hashPassword(salt, password),
      };
      db.users.push(user);
      const session = issueSession(db, user);
      await dbItem.setValue(db);
      return session;
    },

    async login({ email, password }) {
      await delay();
      const db = await readDb();
      const user = db.users.find((candidate) => candidate.email === normalizeEmail(email));
      if (!user || user.passwordHash !== (await hashPassword(user.salt, password))) {
        throw new AuthApiError('INVALID_CREDENTIALS', 'Credenciales incorrectas', 401);
      }
      const session = issueSession(db, user);
      await dbItem.setValue(db);
      return session;
    },

    async refresh({ refreshToken }) {
      await delay();
      const db = await readDb();
      const stored = db.refreshTokens.find((candidate) => candidate.token === refreshToken);
      const user = stored && db.users.find((candidate) => candidate.id === stored.userId);
      db.refreshTokens = db.refreshTokens.filter(
        (candidate) => candidate.token !== refreshToken && candidate.expiresAt > now(),
      );
      if (!stored || !user || stored.expiresAt <= now()) {
        await dbItem.setValue(db);
        throw new AuthApiError('INVALID_REFRESH_TOKEN', 'Refresh token no válido', 401);
      }
      const session = issueSession(db, user);
      await dbItem.setValue(db);
      return session;
    },

    async logout({ refreshToken }) {
      await delay();
      const db = await readDb();
      db.refreshTokens = db.refreshTokens.filter((candidate) => candidate.token !== refreshToken);
      await dbItem.setValue(db);
    },
  };
}
