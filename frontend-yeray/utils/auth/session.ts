import type { AuthStorage } from '../storage/auth-storage';
import {
  AuthApiError,
  type AuthApi,
  type AuthErrorCode,
  type AuthResponse,
  type AuthUser,
  type Credentials,
} from './contract';

export type SessionState =
  | { status: 'anonymous'; reason?: AuthErrorCode }
  | { status: 'authenticated'; user: AuthUser };

export type AuthenticatedState = Extract<SessionState, { status: 'authenticated' }>;

interface SessionDeps {
  api: AuthApi;
  storage: AuthStorage;
  now?: () => number;
}

/** Margen para no reutilizar un access token que está a punto de caducar. */
const EXPIRY_MARGIN_MS = 30_000;

export function toAuthErrorCode(error: unknown): AuthErrorCode {
  return error instanceof AuthApiError ? error.code : 'UNKNOWN_ERROR';
}

export function createSessionManager({ api, storage, now = Date.now }: SessionDeps) {
  // El refresh token rota en cada uso: dos refrescos simultáneos invalidarían la sesión.
  let restoring: Promise<SessionState> | null = null;

  async function persist(response: AuthResponse): Promise<AuthenticatedState> {
    await storage.saveSession(response, now());
    return { status: 'authenticated', user: response.user };
  }

  async function restoreOnce(): Promise<SessionState> {
    const access = await storage.getAccess();
    if (access && access.accessTokenExpiresAt - EXPIRY_MARGIN_MS > now()) {
      return { status: 'authenticated', user: access.user };
    }

    const refreshToken = await storage.getRefreshToken();
    if (!refreshToken) {
      await storage.clearSession();
      return { status: 'anonymous' };
    }

    try {
      return await persist(await api.refresh({ refreshToken }));
    } catch (error) {
      await storage.clearSession();
      return { status: 'anonymous', reason: toAuthErrorCode(error) };
    }
  }

  return {
    /** Recupera la sesión guardada o la refresca una sola vez. Nunca lanza. */
    restore(): Promise<SessionState> {
      restoring ??= restoreOnce().finally(() => {
        restoring = null;
      });
      return restoring;
    },

    async signIn({ email, password }: Credentials): Promise<AuthenticatedState> {
      return persist(await api.login({ email: email.trim(), password }));
    },

    async register({ email, password }: Credentials): Promise<AuthenticatedState> {
      return persist(await api.register({ email: email.trim(), password }));
    },

    /** Cierra la sesión local siempre; la revocación en el servidor es best effort. */
    async signOut(): Promise<void> {
      const refreshToken = await storage.getRefreshToken();
      await storage.clearSession();
      if (!refreshToken) return;
      try {
        await api.logout({ refreshToken });
      } catch {
        // La sesión local ya está cerrada; el token caducará en el servidor.
      }
    },
  };
}

export type SessionManager = ReturnType<typeof createSessionManager>;
