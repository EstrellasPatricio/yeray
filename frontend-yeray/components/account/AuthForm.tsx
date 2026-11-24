import { useRef, useState, type FormEvent } from 'react';

import type { AuthErrorCode, Credentials } from '@/utils/auth/contract';
import { authErrorMessage } from '@/utils/auth/messages';
import { toAuthErrorCode } from '@/utils/auth/session';
import {
  PASSWORD_MIN_LENGTH,
  validateCredentials,
  type AuthMode,
} from '@/utils/auth/validation';

import { Icon } from '../icons';
import { FormField } from './FormField';

const COPY: Record<AuthMode, { submit: string; pending: string }> = {
  signin: { submit: 'Iniciar sesión', pending: 'Iniciando sesión…' },
  register: { submit: 'Crear cuenta', pending: 'Creando cuenta…' },
};

interface AuthFormProps {
  mode: AuthMode;
  /** El correo vive en el panel para conservarlo al cambiar de pestaña. */
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (credentials: Credentials) => Promise<void>;
  onPendingChange: (pending: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
  autoFocus?: boolean;
}

export function AuthForm({
  mode,
  email,
  onEmailChange,
  onSubmit,
  onPendingChange,
  onSwitchMode,
  autoFocus,
}: AuthFormProps) {
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<AuthErrorCode | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Validación en tiempo real: cada campo muestra su error tras salir de él o al enviar.
  const errors = validateCredentials({ email, password }, mode);
  const emailError = touched.email || submitted ? errors.email : undefined;
  const passwordError = touched.password || submitted ? errors.password : undefined;

  function updatePending(value: boolean) {
    setPending(value);
    onPendingChange(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setServerError(null);

    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    updatePending(true);
    try {
      await onSubmit({ email, password });
      // Si va bien, el panel se sustituye por la vista de sesión iniciada.
    } catch (error) {
      const code = toAuthErrorCode(error);
      setServerError(code);
      updatePending(false);
      if (code === 'INVALID_CREDENTIALS') passwordRef.current?.select();
    }
  }

  const copy = COPY[mode];

  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={pending}>
      <FormField
        ref={emailRef}
        id="auth-email"
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        aria-required="true"
        autoFocus={autoFocus}
        spellCheck={false}
        value={email}
        readOnly={pending}
        error={emailError}
        onChange={(event) => {
          onEmailChange(event.target.value);
          setServerError(null);
        }}
        onBlur={() => setTouched((current) => ({ ...current, email: true }))}
      />
      <FormField
        ref={passwordRef}
        id="auth-password"
        label="Contraseña"
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        aria-required="true"
        value={password}
        readOnly={pending}
        error={passwordError}
        hint={
          mode === 'register'
            ? `Mínimo ${PASSWORD_MIN_LENGTH} caracteres, con al menos una letra y un número.`
            : undefined
        }
        onChange={(event) => {
          setPassword(event.target.value);
          setServerError(null);
        }}
        onBlur={() => setTouched((current) => ({ ...current, password: true }))}
      />

      {serverError && (
        <div className="notice danger" role="alert">
          <span className="notice-icon">
            <Icon name="warning" size={18} />
          </span>
          <div>
            <p>{authErrorMessage(serverError, mode)}</p>
            {serverError === 'EMAIL_ALREADY_REGISTERED' && (
              <button type="button" className="text-button" onClick={() => onSwitchMode('signin')}>
                Ir a Iniciar sesión
              </button>
            )}
          </div>
        </div>
      )}

      <button className="primary-button" type="submit" disabled={pending}>
        {pending && <span className="spinner" aria-hidden="true" />}
        {pending ? copy.pending : copy.submit}
      </button>
    </form>
  );
}
