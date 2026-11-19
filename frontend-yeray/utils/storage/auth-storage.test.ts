import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import type { AuthResponse } from '../auth/contract';
import { authStorage } from './auth-storage';

const NOW = Date.UTC(2026, 10, 18, 12, 0, 0);

const response: AuthResponse = {
  user: { id: 'u-1', email: 'ana@uma.es' },
  tokens: { accessToken: 'access-1', refreshToken: 'refresh-1', accessTokenExpiresIn: 900 },
};

describe('authStorage', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('empieza sin sesión guardada', async () => {
    expect(await authStorage.getAccess()).toBeNull();
    expect(await authStorage.getRefreshToken()).toBeNull();
  });

  it('guarda el refresh token en storage.local y el access token en storage.session', async () => {
    await authStorage.saveSession(response, NOW);

    expect(await authStorage.getRefreshToken()).toBe('refresh-1');
    expect(await authStorage.getAccess()).toEqual({
      accessToken: 'access-1',
      accessTokenExpiresAt: NOW + 900_000,
      user: { id: 'u-1', email: 'ana@uma.es' },
    });

    const local = await fakeBrowser.storage.local.get();
    const session = await fakeBrowser.storage.session.get();
    expect(Object.values(local)).toEqual(['refresh-1']);
    expect(JSON.stringify(session)).not.toContain('refresh-1');
  });

  it('nunca persiste una contraseña aunque llegue en el objeto', async () => {
    const withPassword = { ...response, password: 'segura123' } as AuthResponse;
    await authStorage.saveSession(withPassword, NOW);

    const everything = JSON.stringify([
      await fakeBrowser.storage.local.get(),
      await fakeBrowser.storage.session.get(),
      await fakeBrowser.storage.sync.get(),
    ]);
    expect(everything).not.toContain('segura123');
  });

  it('clearSession borra ambas capas', async () => {
    await authStorage.saveSession(response, NOW);
    await authStorage.clearSession();

    expect(await authStorage.getAccess()).toBeNull();
    expect(await authStorage.getRefreshToken()).toBeNull();
  });
});
