import type { AuthErrorCode } from './contract';
import type { AuthMode } from './validation';

const MESSAGES: Record<AuthErrorCode, string> = {
  VALIDATION_ERROR: 'Revisa el correo y la contraseña e inténtalo de nuevo.',
  INVALID_CREDENTIALS: 'El correo o la contraseña no son correctos.',
  INVALID_REFRESH_TOKEN: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  UNAUTHORIZED: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  EMAIL_NOT_CONFIRMED:
    'Todavía no has confirmado tu correo. Abre el enlace que te hemos enviado y vuelve a intentarlo.',
  EMAIL_ALREADY_REGISTERED: 'Ya existe una cuenta con este correo. Prueba a iniciar sesión.',
  RATE_LIMITED: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
  INTERNAL_ERROR: 'El servidor no ha podido completar la operación. Inténtalo más tarde.',
  NETWORK_ERROR: 'No se ha podido conectar con el servidor. Comprueba tu conexión.',
  UNKNOWN_ERROR: 'Se ha producido un error inesperado. Inténtalo de nuevo.',
};

export function authErrorMessage(code: AuthErrorCode, mode?: AuthMode): string {
  if (code === 'VALIDATION_ERROR' && mode === 'register') {
    return 'El servidor no ha aceptado los datos. Revisa el correo y la contraseña.';
  }
  return MESSAGES[code];
}

export function confirmationSentMessage(email: string): string {
  return `Te hemos enviado un correo a ${email}. Confirma tu cuenta con el enlace y después inicia sesión.`;
}
