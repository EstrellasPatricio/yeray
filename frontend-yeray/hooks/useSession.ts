import { useCallback, useEffect, useState } from 'react';

import { sessionManager as defaultManager } from '@/utils/auth/client';
import type { Credentials } from '@/utils/auth/contract';
import type { SessionManager, SessionState } from '@/utils/auth/session';

export type SessionViewState = SessionState | { status: 'checking' };

/** Estado de sesión del popup. signIn y register lanzan AuthApiError si fallan. */
export function useSession(manager: SessionManager = defaultManager) {
  const [state, setState] = useState<SessionViewState>({ status: 'checking' });

  useEffect(() => {
    let active = true;
    manager.restore().then((restored) => {
      if (active) setState(restored);
    });
    return () => {
      active = false;
    };
  }, [manager]);

  const signIn = useCallback(
    async (credentials: Credentials) => setState(await manager.signIn(credentials)),
    [manager],
  );

  const register = useCallback(
    async (credentials: Credentials) => setState(await manager.register(credentials)),
    [manager],
  );

  const signOut = useCallback(async () => {
    await manager.signOut();
    setState({ status: 'anonymous' });
  }, [manager]);

  return { state, signIn, register, signOut };
}
