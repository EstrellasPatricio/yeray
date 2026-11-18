import { useState } from 'react';

import type { Credentials } from '@/utils/auth/contract';
import type { AuthMode } from '@/utils/auth/validation';

import { AuthForm } from './AuthForm';
import { AUTH_PANEL_ID, AuthTabs, authTabId } from './AuthTabs';

/** Si devuelve un modo, el panel cambia a esa pestaña (p. ej. tras pedir confirmar el correo). */
type SubmitHandler = (credentials: Credentials) => Promise<AuthMode | void>;

interface AuthPanelProps {
  onSignIn: SubmitHandler;
  onRegister: SubmitHandler;
  autoFocus?: boolean;
}

export function AuthPanel({ onSignIn, onRegister, autoFocus }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(credentials: Credentials) {
    const next = await (mode === 'register' ? onRegister : onSignIn)(credentials);
    if (next) {
      setPending(false);
      setMode(next);
    }
  }

  return (
    <>
      <AuthTabs mode={mode} onChange={setMode} disabled={pending} />
      <div role="tabpanel" id={AUTH_PANEL_ID} aria-labelledby={authTabId(mode)}>
        <AuthForm
          // La clave reinicia contraseña, errores y estado al cambiar de pestaña.
          key={mode}
          mode={mode}
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleSubmit}
          onPendingChange={setPending}
          onSwitchMode={setMode}
          autoFocus={autoFocus}
        />
      </div>
    </>
  );
}
