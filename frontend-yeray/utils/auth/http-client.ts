import {
  AuthApiError,
  isPendingConfirmation,
  isServerErrorCode,
  parseAuthResponse,
  type AuthApi,
  type AuthResponse,
  type ServerErrorCode,
} from './contract';

interface HttpAuthApiOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/**
 * Código que se usa si el servidor no envía un `code` del contrato
 * (por ejemplo, errores por defecto de Fastify o de un proxy).
 */
function fallbackCode(path: string, status: number, payload: unknown): ServerErrorCode | 'UNKNOWN_ERROR' {
  const fastifyCode = (payload as { code?: unknown } | null)?.code;
  if (status === 400 || fastifyCode === 'FST_ERR_VALIDATION') return 'VALIDATION_ERROR';
  if (status === 401 && path === '/auth/login') return 'INVALID_CREDENTIALS';
  if (status === 401 && path === '/auth/refresh') return 'INVALID_REFRESH_TOKEN';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'INTERNAL_ERROR';
  return 'UNKNOWN_ERROR';
}

export function createHttpAuthApi({
  baseUrl,
  fetchImpl = (...args) => fetch(...args),
  timeoutMs = 10_000,
}: HttpAuthApiOptions): AuthApi {
  const root = baseUrl.replace(/\/+$/, '');

  async function post(path: string, body: unknown, accessToken?: string): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new AuthApiError('NETWORK_ERROR', error instanceof Error ? error.message : undefined);
    }

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const code = (payload as { code?: unknown } | null)?.code;
      const message = (payload as { message?: unknown } | null)?.message;
      throw new AuthApiError(
        isServerErrorCode(code) ? code : fallbackCode(path, response.status, payload),
        typeof message === 'string' ? message : `HTTP ${response.status}`,
        response.status,
      );
    }
    return response;
  }

  async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => null);
  }

  function toSession(payload: unknown, status: number): AuthResponse {
    const session = parseAuthResponse(payload);
    if (!session) {
      throw new AuthApiError('UNKNOWN_ERROR', 'Respuesta sin el formato del contrato', status);
    }
    return session;
  }

  async function postForSession(path: string, body: unknown): Promise<AuthResponse> {
    const response = await post(path, body);
    return toSession(await readJson(response), response.status);
  }

  return {
    async register(body) {
      const response = await post('/auth/register', body);
      const payload = await readJson(response);
      if (response.status === 202 && isPendingConfirmation(payload)) return payload;
      return toSession(payload, response.status);
    },
    login: (body) => postForSession('/auth/login', body),
    refresh: (body) => postForSession('/auth/refresh', body),
    async logout(body, options) {
      await post('/auth/logout', body, options?.accessToken);
    },
  };
}
