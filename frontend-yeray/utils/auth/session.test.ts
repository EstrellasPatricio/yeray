import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import { authStorage } from '../storage/auth-storage';
import { AuthApiError, type AuthApi, type AuthResponse } from './contract';
import { createSessionManager } from './session';

const NOW = Date.UTC(2026, 10, 18, 12, 0, 0);
const user = { id: 'u-1', email: 'ana@uma.es' };

function authResponse(suffix: string): AuthResponse {
  return {
    user,
    tokens: {
      accessToken: `access-${suffix}`,
      refreshToken: `refresh-${suffix}`,
      accessTokenExpiresIn: 900,
    },
  };
}

function createFakeApi(): { [K in keyof AuthApi]: ReturnType<typeof vi.fn> } & AuthApi {
  return {
    register: vi.fn(async () => authResponse('register')),
    login: vi.fn(async () => authResponse('login')),
    refresh: vi.fn(async () => authResponse('refreshed')),
    logout: vi.fn(async () => undefined),
  };
}

describe('createSessionManager', () => {
  let api: ReturnType<typeof createFakeApi>;
  let now: number;

  const manager = () => createSessionManager({ api, storage: authStorage, now: () => now });

  beforeEach(() => {
    fakeBrowser.reset();
    api = createFakeApi();
    now = NOW;
  });

  describe('restore', () => {
    it('sin tokens guardados queda anónimo y no llama a la API', async () => {
      expect(await manager().restore()).toEqual({ status: 'anonymous' });
      expect(api.refresh).not.toHaveBeenCalled();
    });

    it('reutiliza un access token vigente sin refrescar', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      now = NOW + 60_000;

      expect(await manager().restore()).toEqual({ status: 'authenticated', user });
      expect(api.refresh).not.toHaveBeenCalled();
    });

    it('refresca una vez si el access token ha caducado y guarda los tokens rotados', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      now = NOW + 901_000;

      expect(await manager().restore()).toEqual({ status: 'authenticated', user });
      expect(api.refresh).toHaveBeenCalledTimes(1);
      expect(api.refresh).toHaveBeenCalledWith({ refreshToken: 'refresh-login' });
      expect(await authStorage.getRefreshToken()).toBe('refresh-refreshed');
      expect((await authStorage.getAccess())?.accessToken).toBe('access-refreshed');
    });

    it('refresca si solo queda el refresh token (navegador reiniciado)', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      await fakeBrowser.storage.session.clear();

      expect(await manager().restore()).toEqual({ status: 'authenticated', user });
      expect(api.refresh).toHaveBeenCalledTimes(1);
    });

    it('si el refresco falla borra la sesión y devuelve el motivo', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      await fakeBrowser.storage.session.clear();
      api.refresh.mockRejectedValueOnce(new AuthApiError('INVALID_REFRESH_TOKEN', 'caducado', 401));

      expect(await manager().restore()).toEqual({
        status: 'anonymous',
        reason: 'INVALID_REFRESH_TOKEN',
      });
      expect(await authStorage.getRefreshToken()).toBeNull();
      expect(await authStorage.getAccess()).toBeNull();
    });

    it('trata un error inesperado como UNKNOWN_ERROR y también borra la sesión', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      await fakeBrowser.storage.session.clear();
      api.refresh.mockRejectedValueOnce(new Error('boom'));

      expect(await manager().restore()).toEqual({ status: 'anonymous', reason: 'UNKNOWN_ERROR' });
      expect(await authStorage.getRefreshToken()).toBeNull();
    });

    it('comparte un único refresco entre llamadas simultáneas', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      await fakeBrowser.storage.session.clear();
      const session = manager();

      const [first, second] = await Promise.all([session.restore(), session.restore()]);

      expect(first).toEqual(second);
      expect(api.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('signIn y register', () => {
    it('signIn guarda la sesión, envía el correo sin espacios y no guarda la contraseña', async () => {
      const state = await manager().signIn({ email: '  ana@uma.es ', password: 'segura123' });

      expect(state).toEqual({ status: 'authenticated', user });
      expect(api.login).toHaveBeenCalledWith({ email: 'ana@uma.es', password: 'segura123' });
      expect(await authStorage.getRefreshToken()).toBe('refresh-login');
      const stored = JSON.stringify([
        await fakeBrowser.storage.local.get(),
        await fakeBrowser.storage.session.get(),
      ]);
      expect(stored).not.toContain('segura123');
    });

    it('register guarda la sesión', async () => {
      const state = await manager().register({ email: 'ana@uma.es', password: 'segura123' });

      expect(state).toEqual({ status: 'authenticated', user });
      expect(await authStorage.getRefreshToken()).toBe('refresh-register');
    });

    it('register con confirmación pendiente no guarda sesión', async () => {
      api.register.mockResolvedValueOnce({ confirmationRequired: true, email: 'ana@uma.es' });

      const state = await manager().register({ email: 'ana@uma.es', password: 'segura123' });

      expect(state).toEqual({ status: 'pending-confirmation', email: 'ana@uma.es' });
      expect(await authStorage.getRefreshToken()).toBeNull();
    });

    it('avisa a los suscriptores al iniciar y cerrar sesión', async () => {
      const session = manager();
      const listener = vi.fn();
      const unsubscribe = session.subscribe(listener);

      await session.signIn({ email: 'ana@uma.es', password: 'segura123' });
      await session.signOut();
      unsubscribe();
      await session.signIn({ email: 'ana@uma.es', password: 'segura123' });

      expect(listener.mock.calls).toEqual([
        [{ status: 'authenticated', user }],
        [{ status: 'anonymous' }],
      ]);
    });

    it('propaga el AuthApiError y no guarda nada si falla', async () => {
      api.login.mockRejectedValueOnce(new AuthApiError('INVALID_CREDENTIALS', 'no', 401));

      await expect(
        manager().signIn({ email: 'ana@uma.es', password: 'mala' }),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
      expect(await authStorage.getRefreshToken()).toBeNull();
    });
  });

  describe('signOut', () => {
    it('revoca el refresh token en la API y borra la sesión local', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);

      await manager().signOut();

      expect(api.logout).toHaveBeenCalledWith(
        { refreshToken: 'refresh-login' },
        { accessToken: 'access-login' },
      );
      expect(await authStorage.getRefreshToken()).toBeNull();
      expect(await authStorage.getAccess()).toBeNull();
    });

    it('borra la sesión local aunque la API falle', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      api.logout.mockRejectedValueOnce(new AuthApiError('NETWORK_ERROR'));

      await expect(manager().signOut()).resolves.toBeUndefined();
      expect(await authStorage.getRefreshToken()).toBeNull();
      expect(await authStorage.getAccess()).toBeNull();
    });

    it('sin sesión no llama a la API', async () => {
      await manager().signOut();
      expect(api.logout).not.toHaveBeenCalled();
    });
  });

  describe('withAccessToken', () => {
    const unauthorized = () => new AuthApiError('UNAUTHORIZED', 'caducado', 401);

    it('sin sesión lanza UNAUTHORIZED y no ejecuta la petición', async () => {
      const request = vi.fn();

      await expect(manager().withAccessToken(request)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      expect(request).not.toHaveBeenCalled();
    });

    it('usa el access token vigente', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);

      const result = await manager().withAccessToken(async (token) => `ok con ${token}`);

      expect(result).toBe('ok con access-login');
      expect(api.refresh).not.toHaveBeenCalled();
    });

    it('ante un 401 refresca una vez y reintenta con el token nuevo', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      const request = vi
        .fn<(token: string) => Promise<string>>()
        .mockRejectedValueOnce(unauthorized())
        .mockResolvedValueOnce('ok');

      await expect(manager().withAccessToken(request)).resolves.toBe('ok');
      expect(request.mock.calls).toEqual([['access-login'], ['access-refreshed']]);
      expect(api.refresh).toHaveBeenCalledTimes(1);
    });

    it('si el reintento también da 401 no vuelve a refrescar', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      const request = vi.fn(async () => {
        throw unauthorized();
      });

      await expect(manager().withAccessToken(request)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      expect(request).toHaveBeenCalledTimes(2);
      expect(api.refresh).toHaveBeenCalledTimes(1);
    });

    it('si el refresco falla cierra la sesión y avisa a la interfaz', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);
      api.refresh.mockRejectedValueOnce(new AuthApiError('INVALID_REFRESH_TOKEN', 'no', 401));
      const session = manager();
      const listener = vi.fn();
      session.subscribe(listener);

      await expect(
        session.withAccessToken(async () => {
          throw unauthorized();
        }),
      ).rejects.toMatchObject({ code: 'INVALID_REFRESH_TOKEN' });
      expect(await authStorage.getRefreshToken()).toBeNull();
      expect(listener).toHaveBeenCalledWith({
        status: 'anonymous',
        reason: 'INVALID_REFRESH_TOKEN',
      });
    });

    it('no toca la sesión ante otros errores', async () => {
      await authStorage.saveSession(authResponse('login'), NOW);

      await expect(
        manager().withAccessToken(async () => {
          throw new AuthApiError('INTERNAL_ERROR', 'boom', 500);
        }),
      ).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
      expect(api.refresh).not.toHaveBeenCalled();
      expect(await authStorage.getRefreshToken()).toBe('refresh-login');
    });
  });
});
