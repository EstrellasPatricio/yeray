import {
  AuthApiError,
  isAuthResponse,
  isServerErrorCode,
  type AuthApi,
  type AuthResponse,
} from './contract';

interface HttpAuthApiOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function createHttpAuthApi({
  baseUrl,
  fetchImpl = (...args) => fetch(...args),
  timeoutMs = 10_000,
}: HttpAuthApiOptions): AuthApi {
  const root = baseUrl.replace(/\/+$/, '');

  async function post(path: string, body: unknown): Promise<Response> {
    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
        isServerErrorCode(code) ? code : 'UNKNOWN_ERROR',
        typeof message === 'string' ? message : `HTTP ${response.status}`,
        response.status,
      );
    }
    return response;
  }

  async function postForSession(path: string, body: unknown): Promise<AuthResponse> {
    const response = await post(path, body);
    const payload: unknown = await response.json().catch(() => null);
    if (!isAuthResponse(payload)) {
      throw new AuthApiError('UNKNOWN_ERROR', 'Respuesta sin el formato del contrato', response.status);
    }
    return payload;
  }

  return {
    register: (body) => postForSession('/auth/register', body),
    login: (body) => postForSession('/auth/login', body),
    refresh: (body) => postForSession('/auth/refresh', body),
    async logout(body) {
      await post('/auth/logout', body);
    },
  };
}
