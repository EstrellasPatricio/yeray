import { describe, expect, it, vi } from 'vitest';

import { createHttpReputationApi } from './http-client';

const site = { hostname: 'tienda.example.com', protocolo: 'https' } as const;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function apiReturning(response: () => Response | Promise<Response>) {
  const fetchImpl = vi.fn<typeof fetch>(async () => response());
  return { fetchImpl, api: createHttpReputationApi({ baseUrl: 'http://api/', fetchImpl }) };
}

describe('createHttpReputationApi', () => {
  it('envía POST /reputation solo con hostname y protocolo', async () => {
    const stats = { malicious: 0, suspicious: 1, harmless: 25, undetected: 40 };
    const { api, fetchImpl } = apiReturning(() => jsonResponse(200, { status: 'analyzed', stats }));

    await expect(api.check(site)).resolves.toEqual({ status: 'analyzed', stats });

    const [url, init = {}] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('http://api/reputation');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body as string)).toEqual({ hostname: 'tienda.example.com', protocolo: 'https' });
  });

  it.each([
    'missing_configuration',
    'not_found',
    'rate_limited',
    'timeout',
    'upstream_error',
    'invalid_response',
    'no_analysis',
  ])('devuelve el motivo %s del backend', async (reason) => {
    const { api } = apiReturning(() => jsonResponse(200, { status: 'unavailable', reason }));

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason });
  });

  it('trata un motivo desconocido como fallo del proveedor', async () => {
    const { api } = apiReturning(() => jsonResponse(200, { status: 'unavailable', reason: 'nuevo' }));

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'upstream_error' });
  });

  it('una respuesta 200 sin la forma del contrato es invalid_response', async () => {
    const { api } = apiReturning(() => jsonResponse(200, { status: 'analyzed', stats: { malicious: -1 } }));

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'invalid_response' });
  });

  it('un 400 del backend es invalid_site', async () => {
    const { api } = apiReturning(() => jsonResponse(400, { error: 'hostname_invalido' }));

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'invalid_site' });
  });

  it('un 5xx del backend es server_error', async () => {
    const { api } = apiReturning(() => new Response('error', { status: 502 }));

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'server_error' });
  });

  it('si no hay conexión con el backend es network_error', async () => {
    const { api } = apiReturning(() => {
      throw new TypeError('Failed to fetch');
    });

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'network_error' });
  });

  it('si el backend no responde a tiempo es timeout', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    const api = createHttpReputationApi({ baseUrl: 'http://api', fetchImpl, timeoutMs: 20 });

    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'timeout' });
  });
});
