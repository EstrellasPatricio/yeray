import { useEffect, useRef, useState } from 'react';

import { useSession } from '@/hooks/useSession';
import { isAuthMockEnabled } from '@/utils/auth/client';
import type { Credentials } from '@/utils/auth/contract';
import { authErrorMessage } from '@/utils/auth/messages';

import { Icon } from '../icons';
import { AuthPanel } from './AuthPanel';
import { SignedInView } from './SignedInView';

type Notice = { tone: 'safe' | 'warn'; text: string };

export function AccountView() {
  const { state, signIn, register, signOut } = useSession();
  const [notice, setNotice] = useState<Notice | null>(null);
  // Tras una acción del usuario se lleva el foco al título para anunciar el cambio de vista.
  const [focusHeading, setFocusHeading] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Si no se pudo recuperar la sesión guardada, se explica el motivo hasta el primer envío.
  const shownNotice: Notice | null =
    notice ??
    (!submittedOnce && state.status === 'anonymous' && state.reason
      ? { tone: 'warn', text: authErrorMessage(state.reason) }
      : null);

  useEffect(() => {
    if (focusHeading) headingRef.current?.focus();
  }, [focusHeading, state.status]);

  async function submit(action: (credentials: Credentials) => Promise<void>, credentials: Credentials) {
    // Los avisos anteriores dejan de aplicar en cuanto se envía el formulario.
    setNotice(null);
    setSubmittedOnce(true);
    await action(credentials);
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
        <AuthPanel
          onSignIn={(credentials) => submit(signIn, credentials)}
          onRegister={(credentials) => submit(register, credentials)}
          autoFocus={!focusHeading}
        />
      )}
    </>
  );
}
