import { useEffect, useRef, useState } from 'react';

import { useSession, type SessionViewState } from '@/hooks/useSession';
import { isAuthMockEnabled } from '@/utils/auth/client';
import type { Credentials } from '@/utils/auth/contract';
import { authErrorMessage, confirmationSentMessage } from '@/utils/auth/messages';
import type { AuthMode } from '@/utils/auth/validation';

import { Icon } from '../icons';
import { AuthPanel } from './AuthPanel';
import { SignedInView } from './SignedInView';

type Notice = { tone: 'safe' | 'warn'; text: string };

export function AccountView() {
  const { state, signIn, register, signOut } = useSession();
  const [notice, setNotice] = useState<Notice | null>(null);
  // Tras una acción del usuario se lleva el foco al título para anunciar el cambio de vista.
  const [focusHeading, setFocusHeading] = useState(false);
  // Estado cuyo motivo de cierre ya se ha descartado al volver a enviar el formulario.
  const [dismissedState, setDismissedState] = useState<SessionViewState | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Si la sesión se perdió (al abrir el popup o en una petición), se explica el motivo.
  const shownNotice: Notice | null =
    notice ??
    (state !== dismissedState && state.status === 'anonymous' && state.reason
      ? { tone: 'warn', text: authErrorMessage(state.reason) }
      : null);

  useEffect(() => {
    if (focusHeading) headingRef.current?.focus();
  }, [focusHeading, state.status]);

  function startSubmit() {
    // Los avisos anteriores dejan de aplicar en cuanto se envía el formulario.
    setNotice(null);
    setDismissedState(state);
  }

  async function handleSignIn(credentials: Credentials) {
    startSubmit();
    await signIn(credentials);
    setFocusHeading(true);
  }

  async function handleRegister(credentials: Credentials): Promise<AuthMode | void> {
    startSubmit();
    const result = await register(credentials);
    if (result.status === 'pending-confirmation') {
      setNotice({ tone: 'safe', text: confirmationSentMessage(result.email) });
      return 'signin';
    }
    setFocusHeading(true);
  }

  async function handleSignOut() {
    await signOut();
    setNotice({ tone: 'safe', text: 'Has cerrado sesión.' });
    setFocusHeading(true);
  }

  return (
    <>
      {isAuthMockEnabled && (
        <p className="demo-strip">
          <span className="demo-chip">Modo de prueba</span>
          <span>Sin backend: las cuentas solo existen en este navegador.</span>
        </p>
      )}
      <h2 className="page-heading" ref={headingRef} tabIndex={-1}>
        Cuenta Yeray
      </h2>

      <div role="status">
        {shownNotice && (
          <div className={`notice ${shownNotice.tone}`}>
            <span className="notice-icon">
              <Icon name={shownNotice.tone === 'safe' ? 'check' : 'info'} size={18} />
            </span>
            <p>{shownNotice.text}</p>
          </div>
        )}
        {state.status === 'checking' && (
          <p className="status-line">
            <span className="spinner" aria-hidden="true" />
            Comprobando tu sesión…
          </p>
        )}
      </div>

      {state.status === 'authenticated' && (
        <SignedInView user={state.user} onSignOut={handleSignOut} />
      )}
      {state.status === 'anonymous' && (
        <AuthPanel onSignIn={handleSignIn} onRegister={handleRegister} autoFocus={!focusHeading} />
      )}
    </>
  );
}
