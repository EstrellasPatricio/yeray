import { useCallback, useEffect, useState } from 'react';

import { sessionManager as defaultManager } from '@/utils/auth/client';
import type { Credentials } from '@/utils/auth/contract';
import type { SessionManager, SessionState } from '@/utils/auth/session';

export type SessionViewState = SessionState | { status: 'checking' };

/**
 * Estado de sesión del popup. Se actualiza con los avisos del gestor, incluidos
 * los que no inicia la interfaz (sesión caducada en una petición protegida).
 * signIn y register lanzan AuthApiError si fallan.
 */
export function useSession(manager: SessionManager = defaultManager) {
  const [state, setState] = useState<SessionViewState>({ status: 'checking' });

  useEffect(() => {
    let active = true;
    const unsubscribe = manager.subscribe((next) => {
      if (active) setState(next);
    });
    manager.restore().then((restored) => {
      if (active) setState(restored);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [manager]);

  const signIn = useCallback(
    async (credentials: Credentials) => {
      await manager.signIn(credentials);
    },
    [manager],
  );

  /** Devuelve el resultado para que la vista gestione la confirmación pendiente. */
  const register = useCallback(
    (credentials: Credentials) => manager.register(credentials),
    [manager],
  );

  const signOut = useCallback(() => manager.signOut(), [manager]);

  return { state, signIn, register, signOut };
}
