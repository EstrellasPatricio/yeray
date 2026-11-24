import { AuthApiError } from '../auth/contract';
import type { SessionManager } from '../auth/session';

interface AuthorizedFetchOptions {
  baseUrl: string;
  session: SessionManager;
  fetchImpl?: typeof fetch;
}

/**
 * fetch para endpoints protegidos de la API principal. Añade el access token,
 * y ante un 401 refresca la sesión una vez y repite la petición. Devuelve la
 * Response tal cual para cualquier otro estado.
 */
export function createAuthorizedFetch({
  baseUrl,
  session,
  fetchImpl = (...args) => fetch(...args),
}: AuthorizedFetchOptions) {
  const root = baseUrl.replace(/\/+$/, '');

  return function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
    return session.withAccessToken(async (accessToken) => {
      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);

      let response: Response;
      try {
        response = await fetchImpl(`${root}${path}`, { ...init, headers });
      } catch (error) {
        throw new AuthApiError('NETWORK_ERROR', error instanceof Error ? error.message : undefined);
      }
      if (response.status === 401) {
        throw new AuthApiError('UNAUTHORIZED', 'Access token rechazado', 401);
      }
      return response;
    });
  };
}
