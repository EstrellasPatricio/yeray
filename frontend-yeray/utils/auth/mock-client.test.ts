import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import { createMockAuthApi } from './mock-client';

const credentials = { email: 'ana@uma.es', password: 'segura123' };

describe('createMockAuthApi', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  const api = () => createMockAuthApi({ latencyMs: 0 });

  it('registra una cuenta y permite iniciar sesión con ella desde otra instancia', async () => {
    const registered = await api().register(credentials);
    if (!('tokens' in registered)) throw new Error('se esperaba una sesión');
    expect(registered.user.email).toBe('ana@uma.es');
    expect(registered.tokens.accessTokenExpiresIn).toBeGreaterThan(0);

    // Una instancia nueva simula volver a abrir el popup.
    const loggedIn = await api().login({ email: 'ANA@uma.es', password: 'segura123' });
    expect(loggedIn.user.id).toBe(registered.user.id);
  });

  it('no guarda la contraseña en claro', async () => {
    await api().register(credentials);
    expect(JSON.stringify(await fakeBrowser.storage.local.get())).not.toContain('segura123');
  });

  it('rechaza un correo ya registrado', async () => {
    await api().register(credentials);
    await expect(api().register(credentials)).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_REGISTERED',
    });
  });

  it('rechaza contraseña incorrecta y correo desconocido con el mismo código', async () => {
    await api().register(credentials);
    await expect(api().login({ ...credentials, password: 'otra1234' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
    await expect(api().login({ ...credentials, email: 'nadie@uma.es' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('valida los datos como haría el servidor', async () => {
    await expect(api().register({ email: 'mal', password: 'segura123' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(api().register({ ...credentials, password: 'corta' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('con confirmación de correo responde pendiente y bloquea el login hasta confirmar', async () => {
    let now = 1_000;
    const confirming = () =>
      createMockAuthApi({
        latencyMs: 0,
        requireEmailConfirmation: true,
        confirmationDelayMs: 5_000,
        now: () => now,
      });

    await expect(confirming().register(credentials)).resolves.toEqual({
      confirmationRequired: true,
      email: 'ana@uma.es',
    });
    await expect(confirming().login(credentials)).rejects.toMatchObject({
      code: 'EMAIL_NOT_CONFIRMED',
    });

    now += 5_000;
    await expect(confirming().login(credentials)).resolves.toMatchObject({
      user: { email: 'ana@uma.es' },
    });
  });

  it('rota el refresh token e invalida el anterior', async () => {
    const response = await api().register(credentials);
    if (!('tokens' in response)) throw new Error('se esperaba una sesión');
    const { tokens } = response;

    const refreshed = await api().refresh({ refreshToken: tokens.refreshToken });
    expect(refreshed.tokens.refreshToken).not.toBe(tokens.refreshToken);
    expect(refreshed.user.email).toBe('ana@uma.es');

    await expect(api().refresh({ refreshToken: tokens.refreshToken })).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('logout revoca el refresh token y es idempotente', async () => {
    const response = await api().register(credentials);
    if (!('tokens' in response)) throw new Error('se esperaba una sesión');
    const { tokens } = response;

    await api().logout({ refreshToken: tokens.refreshToken });
    await expect(api().logout({ refreshToken: tokens.refreshToken })).resolves.toBeUndefined();
    await expect(api().refresh({ refreshToken: tokens.refreshToken })).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    });
  });
});
