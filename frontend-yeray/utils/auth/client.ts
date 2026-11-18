import { authStorage } from '../storage/auth-storage';
import type { AuthApi } from './contract';
import { createHttpAuthApi } from './http-client';
import { createMockAuthApi } from './mock-client';
import { createSessionManager } from './session';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const isAuthMockEnabled = import.meta.env.WXT_AUTH_MOCK === 'true';

function createAuthApi(): AuthApi {
  if (isAuthMockEnabled) return createMockAuthApi();
  return createHttpAuthApi({ baseUrl: import.meta.env.WXT_API_BASE_URL || DEFAULT_API_BASE_URL });
}

/** Instancia única para todo el popup: comparte el refresco en curso. */
export const sessionManager = createSessionManager({ api: createAuthApi(), storage: authStorage });
