import { storage } from 'wxt/utils/storage';

import type { AuthResponse, AuthUser } from '../auth/contract';

/**
 * Parte de sesión de la fachada YeraiStorage (ver docs de almacenamiento).
 * Los componentes no usan chrome.storage directamente.
 *
 * - storage.session: access token y usuario. Vive en memoria y se borra al cerrar el navegador.
 * - storage.local: solo el refresh token, para mantener la sesión entre reinicios del navegador.
 * La contraseña nunca se guarda.
 */
export interface StoredAccess {
  accessToken: string;
  /** Marca de tiempo en milisegundos en la que caduca el access token. */
  accessTokenExpiresAt: number;
  user: AuthUser;
}

const accessItem = storage.defineItem<StoredAccess>('session:yerai.auth.access');
const refreshTokenItem = storage.defineItem<string>('local:yerai.auth.refreshToken');

export const authStorage = {
  getAccess(): Promise<StoredAccess | null> {
    return accessItem.getValue();
  },

  getRefreshToken(): Promise<string | null> {
    return refreshTokenItem.getValue();
  },

  async saveSession({ user, tokens }: AuthResponse, now: number): Promise<void> {
    await Promise.all([
      accessItem.setValue({
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: now + tokens.accessTokenExpiresIn * 1000,
        user: { id: user.id, email: user.email },
      }),
      refreshTokenItem.setValue(tokens.refreshToken),
    ]);
  },

  async clearSession(): Promise<void> {
    await Promise.all([accessItem.removeValue(), refreshTokenItem.removeValue()]);
  },
};

export type AuthStorage = typeof authStorage;
