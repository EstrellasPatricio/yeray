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

function apiReturning(response: () => Response) {
  const fetchImpl = vi.fn<typeof fetch>(async () => response());
  return { fetchImpl, api: createHttpAuthApi({ baseUrl: 'http://api', fetchImpl }) };
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

  it('acepta un id numérico y lo convierte en texto', async () => {
    const { api } = apiReturning(() => jsonResponse(200, { ...ok, user: { id: 7, email: 'ana@uma.es' } }));

    await expect(api.login({ email: 'ana@uma.es', password: 'x' })).resolves.toMatchObject({
      user: { id: '7' },
    });
  });

  it('register devuelve la confirmación pendiente con 202', async () => {
    const { api } = apiReturning(() =>
      jsonResponse(202, { confirmationRequired: true, email: 'ana@uma.es' }),
    );

    await expect(api.register({ email: 'ana@uma.es', password: 'x' })).resolves.toEqual({
      confirmationRequired: true,
      email: 'ana@uma.es',
    });
  });

  it('logout acepta 204 sin cuerpo y envía el access token si lo hay', async () => {
    const { api, fetchImpl } = apiReturning(() => new Response(null, { status: 204 }));

    await expect(api.logout({ refreshToken: 'r' }, { accessToken: 'a' })).resolves.toBeUndefined();
    const [url, init = {}] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('http://api/auth/logout');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer a' });
  });

  it('logout sin access token no envía Authorization', async () => {
    const { api, fetchImpl } = apiReturning(() => new Response(null, { status: 204 }));

    await api.logout({ refreshToken: 'r' });
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).not.toHaveProperty('Authorization');
  });

  it('convierte el cuerpo de error en AuthApiError con su código', async () => {
    const { api } = apiReturning(() =>
      jsonResponse(409, { code: 'EMAIL_ALREADY_REGISTERED', message: 'existe' }),
    );

    await expect(api.register({ email: 'ana@uma.es', password: 'x' })).rejects.toMatchObject({
      name: 'AuthApiError',
      code: 'EMAIL_ALREADY_REGISTERED',
      status: 409,
    });
  });

  it('entiende el error de validación por defecto de Fastify', async () => {
    const { api } = apiReturning(() =>
      jsonResponse(400, {
        statusCode: 400,
        code: 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: 'body/email must match format "email"',
      }),
    );

    await expect(api.register({ email: 'x', password: 'x' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 400,
    });
  });

  it.each([
    ['login', 401, 'INVALID_CREDENTIALS'],
    ['refresh', 401, 'INVALID_REFRESH_TOKEN'],
    ['login', 429, 'RATE_LIMITED'],
    ['login', 500, 'INTERNAL_ERROR'],
    ['refresh', 502, 'INTERNAL_ERROR'],
    ['login', 418, 'UNKNOWN_ERROR'],
  ] as const)('sin code, %s con estado %i se trata como %s', async (method, status, code) => {
    const { api } = apiReturning(() => new Response('<html>error</html>', { status }));
    const call =
      method === 'login'
        ? api.login({ email: 'a@b.es', password: 'x' })
        : api.refresh({ refreshToken: 'r' });

    await expect(call).rejects.toMatchObject({ code, status });
  });

  it('usa UNKNOWN_ERROR si una respuesta 200 no tiene la forma esperada', async () => {
    const { api } = apiReturning(() => jsonResponse(200, { token: 'otra-forma' }));

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
