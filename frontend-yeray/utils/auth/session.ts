import type { AuthStorage } from '../storage/auth-storage';
import {
  AuthApiError,
  isPendingConfirmation,
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
export type PendingConfirmationState = { status: 'pending-confirmation'; email: string };

type SessionListener = (state: SessionState) => void;

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
  let refreshing: Promise<SessionState> | null = null;
  let restoring: Promise<SessionState> | null = null;
  const listeners = new Set<SessionListener>();

  function emit(state: SessionState): SessionState {
    listeners.forEach((listener) => listener(state));
    return state;
  }

  async function persist(response: AuthResponse): Promise<AuthenticatedState> {
    await storage.saveSession(response, now());
    return { status: 'authenticated', user: response.user };
  }

  async function refreshOnce(refreshToken: string): Promise<SessionState> {
    try {
      return await persist(await api.refresh({ refreshToken }));
    } catch (error) {
      await storage.clearSession();
      return { status: 'anonymous', reason: toAuthErrorCode(error) };
    }
  }

  /** Refresca compartiendo la petición en curso. Nunca lanza. */
  async function refresh(): Promise<SessionState> {
    const refreshToken = await storage.getRefreshToken();
    if (!refreshToken) {
      await storage.clearSession();
      return { status: 'anonymous' };
    }
    refreshing ??= refreshOnce(refreshToken).finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  async function restoreOnce(): Promise<SessionState> {
    const access = await storage.getAccess();
    if (access && access.accessTokenExpiresAt - EXPIRY_MARGIN_MS > now()) {
      return { status: 'authenticated', user: access.user };
    }
    return refresh();
  }

  function restore(): Promise<SessionState> {
    restoring ??= restoreOnce().finally(() => {
      restoring = null;
    });
    return restoring;
  }

  async function currentAccessToken(): Promise<string> {
    const state = await restore();
    const access = await storage.getAccess();
    if (state.status !== 'authenticated' || !access) {
      throw new AuthApiError('UNAUTHORIZED', 'No hay sesión iniciada');
    }
    return access.accessToken;
  }

  return {
    /** Recupera la sesión guardada o la refresca una sola vez. Nunca lanza. */
    restore,

    /** Escucha cambios de sesión que no inicia la interfaz (p. ej. sesión caducada). */
    subscribe(listener: SessionListener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async signIn({ email, password }: Credentials): Promise<AuthenticatedState> {
      const state = await persist(await api.login({ email: email.trim(), password }));
      emit(state);
      return state;
    },

    async register({
      email,
      password,
    }: Credentials): Promise<AuthenticatedState | PendingConfirmationState> {
      const result = await api.register({ email: email.trim(), password });
      if (isPendingConfirmation(result)) {
        return { status: 'pending-confirmation', email: result.email };
      }
      const state = await persist(result);
      emit(state);
      return state;
    },

    /** Cierra la sesión local siempre; la revocación en el servidor es best effort. */
    async signOut(): Promise<void> {
      const [refreshToken, access] = await Promise.all([
        storage.getRefreshToken(),
        storage.getAccess(),
      ]);
      await storage.clearSession();
      emit({ status: 'anonymous' });
      if (!refreshToken) return;
      try {
        await api.logout({ refreshToken }, { accessToken: access?.accessToken });
      } catch {
        // La sesión local ya está cerrada; el token caducará en el servidor.
      }
    },

    /**
     * Ejecuta una petición protegida con el access token vigente. Si el servidor
     * responde UNAUTHORIZED, refresca una vez y reintenta. Si el refresco falla,
     * cierra la sesión, avisa a los suscriptores y lanza el motivo.
     */
    async withAccessToken<T>(request: (accessToken: string) => Promise<T>): Promise<T> {
      const token = await currentAccessToken();
      try {
        return await request(token);
      } catch (error) {
        if (toAuthErrorCode(error) !== 'UNAUTHORIZED') throw error;
      }

      const refreshed = await refresh();
      if (refreshed.status !== 'authenticated') {
        emit(refreshed);
        throw new AuthApiError(refreshed.reason ?? 'UNAUTHORIZED', 'La sesión ha caducado');
      }
      return request(await currentAccessToken());
    },
  };
}

export type SessionManager = ReturnType<typeof createSessionManager>;
