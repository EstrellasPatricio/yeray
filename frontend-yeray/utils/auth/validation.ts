import type { Credentials } from './contract';

export type AuthMode = 'signin' | 'register';

export interface FieldErrors {
  email?: string;
  password?: string;
}

export const PASSWORD_MIN_LENGTH = 8;
/** Límite habitual de los hash tipo bcrypt; el backend debe aplicar el mismo. */
export const PASSWORD_MAX_LENGTH = 72;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Introduce tu correo electrónico.';
  if (value.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(value)) {
    return 'Introduce un correo electrónico válido, por ejemplo nombre@dominio.com.';
  }
  return undefined;
}

/** Al iniciar sesión solo se exige la contraseña; la política aplica al crear la cuenta. */
export function validatePassword(password: string, mode: AuthMode): string | undefined {
  if (!password) return 'Introduce tu contraseña.';
  if (mode === 'signin') return undefined;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return 'La contraseña debe incluir al menos una letra y un número.';
  }
  return undefined;
}

export function validateCredentials(values: Credentials, mode: AuthMode): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmail(values.email);
  const password = validatePassword(values.password, mode);
  if (email) errors.email = email;
  if (password) errors.password = password;
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Boolean(errors.email || errors.password);
}
