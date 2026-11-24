import { createAuthorizedFetch } from '../api/authorized-fetch';
import { apiBaseUrl } from '../api/config';
import { authStorage } from '../storage/auth-storage';
import type { AuthApi } from './contract';
import { createHttpAuthApi } from './http-client';
import { createMockAuthApi } from './mock-client';
import { createSessionManager } from './session';

export const isAuthMockEnabled = import.meta.env.WXT_AUTH_MOCK === 'true';

function createAuthApi(): AuthApi {
  if (isAuthMockEnabled) {
    return createMockAuthApi({
      requireEmailConfirmation: import.meta.env.WXT_AUTH_MOCK_EMAIL_CONFIRMATION === 'true',
    });
  }
  return createHttpAuthApi({ baseUrl: apiBaseUrl });
}

/** Instancia única para todo el popup: comparte el refresco en curso. */
export const sessionManager = createSessionManager({ api: createAuthApi(), storage: authStorage });

/** fetch con sesión para los endpoints protegidos que vayan llegando del backend. */
export const authorizedFetch = createAuthorizedFetch({
  baseUrl: apiBaseUrl,
  session: sessionManager,
});
