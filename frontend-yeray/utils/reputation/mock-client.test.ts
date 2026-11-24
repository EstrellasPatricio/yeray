import { describe, expect, it } from 'vitest';

import { createMockReputationApi, parseMockScenario } from './mock-client';

const site = { hostname: 'tienda.example.com', protocolo: 'https' } as const;

describe('parseMockScenario', () => {
  it('desactiva el mock si la variable está vacía o vale false', () => {
    expect(parseMockScenario(undefined)).toBeNull();
    expect(parseMockScenario('')).toBeNull();
    expect(parseMockScenario('false')).toBeNull();
  });

  it('acepta analyzed y cualquier motivo de indisponibilidad', () => {
    expect(parseMockScenario('analyzed')).toBe('analyzed');
    expect(parseMockScenario('rate_limited')).toBe('rate_limited');
    expect(parseMockScenario('network_error')).toBe('network_error');
  });

  it('un valor desconocido se trata como timeout para que se vea el estado degradado', () => {
    expect(parseMockScenario('true')).toBe('timeout');
  });
});

describe('createMockReputationApi', () => {
  it('devuelve el motivo configurado', async () => {
    const api = createMockReputationApi('rate_limited', { latencyMs: 0 });
    await expect(api.check(site)).resolves.toEqual({ status: 'unavailable', reason: 'rate_limited' });
  });

  it('con analyzed devuelve recuentos de ejemplo', async () => {
    const api = createMockReputationApi('analyzed', { latencyMs: 0 });
    await expect(api.check(site)).resolves.toMatchObject({ status: 'analyzed' });
  });
});
