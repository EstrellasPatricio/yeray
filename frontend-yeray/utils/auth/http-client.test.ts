import { describe, expect, it, vi } from 'vitest';

import type { AuthResponse } from './contract';
import { createHttpAuthApi } from './http-client';

const ok: AuthResponse = {
  user: { id: 'u-1', email: 'ana@uma.es' },
  tokens: { accessToken: 'a', refreshToken: 'r', accessTokenExpiresIn: 900 },
};

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createHttpAuthApi', () => {
  it('envía POST JSON a la ruta del contrato y devuelve la respuesta', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse(200, ok));
    const api = createHttpAuthApi({ baseUrl: 'http://localhost:3000/', fetchImpl });

    await expect(api.login({ email: 'ana@uma.es', password: 'x' })).resolves.toEqual(ok);

    const [url, init = {}] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('http://localhost:3000/auth/login');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body as string)).toEqual({ email: 'ana@uma.es', password: 'x' });
  });

  it('logout acepta 204 sin cuerpo', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
    const api = createHttpAuthApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.logout({ refreshToken: 'r' })).resolves.toBeUndefined();
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('http://api/auth/logout');
  });

  it('convierte el cuerpo de error en AuthApiError con su código', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse(409, { code: 'EMAIL_ALREADY_REGISTERED', message: 'existe' }),
    );
    const api = createHttpAuthApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.register({ email: 'ana@uma.es', password: 'x' })).rejects.toMatchObject({
      name: 'AuthApiError',
      code: 'EMAIL_ALREADY_REGISTERED',
      status: 409,
    });
  });

  it('usa UNKNOWN_ERROR si el error no sigue el contrato', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('<html>502</html>', { status: 502 }));
    const api = createHttpAuthApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.refresh({ refreshToken: 'r' })).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      status: 502,
    });
  });

  it('usa UNKNOWN_ERROR si una respuesta 200 no tiene la forma esperada', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse(200, { token: 'otra-forma' }));
    const api = createHttpAuthApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.login({ email: 'a@b.es', password: 'x' })).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
    });
  });

  it('usa NETWORK_ERROR si fetch falla', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    const api = createHttpAuthApi({ baseUrl: 'http://api', fetchImpl });

    await expect(api.login({ email: 'a@b.es', password: 'x' })).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });
});
