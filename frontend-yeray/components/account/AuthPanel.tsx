import { useState } from 'react';

import type { Credentials } from '@/utils/auth/contract';
import type { AuthMode } from '@/utils/auth/validation';

import { AuthForm } from './AuthForm';
import { AUTH_PANEL_ID, AuthTabs, authTabId } from './AuthTabs';

interface AuthPanelProps {
  onSignIn: (credentials: Credentials) => Promise<void>;
  onRegister: (credentials: Credentials) => Promise<void>;
  autoFocus?: boolean;
}

export function AuthPanel({ onSignIn, onRegister, autoFocus }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);

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
          onSubmit={mode === 'register' ? onRegister : onSignIn}
          onPendingChange={setPending}
          onSwitchMode={setMode}
          autoFocus={autoFocus}
        />
      </div>
    </>
  );
}
