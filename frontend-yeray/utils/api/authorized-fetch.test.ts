import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import type { AuthApi, AuthResponse } from '../auth/contract';
import { createSessionManager } from '../auth/session';
import { authStorage } from '../storage/auth-storage';
import { createAuthorizedFetch } from './authorized-fetch';

const session = (suffix: string): AuthResponse => ({
  user: { id: 'u-1', email: 'ana@uma.es' },
  tokens: {
    accessToken: `access-${suffix}`,
    refreshToken: `refresh-${suffix}`,
    accessTokenExpiresIn: 900,
  },
});

describe('createAuthorizedFetch', () => {
  let api: AuthApi;

  beforeEach(async () => {
    fakeBrowser.reset();
    api = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(async () => session('refreshed')),
      logout: vi.fn(),
    };
    await authStorage.saveSession(session('login'), Date.now());
  });

  it('añade Authorization y respeta las cabeceras propias', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('{}', { status: 200 }));
    const authorizedFetch = createAuthorizedFetch({
      baseUrl: 'http://api/',
      session: createSessionManager({ api, storage: authStorage }),
      fetchImpl,
    });

    const response = await authorizedFetch('/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('http://api/analyses');
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer access-login');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('ante un 401 refresca y repite la petición', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const authorizedFetch = createAuthorizedFetch({
      baseUrl: 'http://api',
      session: createSessionManager({ api, storage: authStorage }),
      fetchImpl,
    });

    const response = await authorizedFetch('/me');

    expect(response.status).toBe(200);
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchImpl.mock.calls[1]?.[1]?.headers).get('Authorization')).toBe(
      'Bearer access-refreshed',
    );
  });

  it('devuelve otras respuestas de error sin tocar la sesión', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 404 }));
    const authorizedFetch = createAuthorizedFetch({
      baseUrl: 'http://api',
      session: createSessionManager({ api, storage: authStorage }),
      fetchImpl,
    });

    expect((await authorizedFetch('/no-existe')).status).toBe(404);
    expect(api.refresh).not.toHaveBeenCalled();
  });
});
