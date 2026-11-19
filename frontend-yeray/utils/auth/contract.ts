/**
 * Contrato de la API de autenticación entre la extensión y el backend.
 * Documentación para el backend: frontend-yeray/docs/contrato-api-auth.md
 *
 * Endpoints (relativos a WXT_API_BASE_URL, cuerpo y respuesta en JSON):
 *   POST /auth/register  RegisterRequest -> 201 AuthResponse
 *                                        -> 202 PendingConfirmation (si se exige confirmar el correo)
 *   POST /auth/login     LoginRequest    -> 200 AuthResponse
 *   POST /auth/refresh   RefreshRequest  -> 200 AuthResponse (rota el refresh token)
 *   POST /auth/logout    LogoutRequest   -> 204 sin cuerpo (idempotente)
 *                        Cabecera Authorization: Bearer <accessToken> si el cliente lo tiene.
 *
 * Endpoints protegidos futuros: cabecera Authorization: Bearer <accessToken>;
 * 401 con code UNAUTHORIZED si el access token no es válido o ha caducado.
 *
 * Cualquier error responde con un estado 4xx/5xx y un cuerpo ApiErrorBody.
 */

export interface AuthUser {
  /** El cliente acepta número o texto del servidor y lo guarda siempre como texto. */
  id: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Segundos de validez del access token desde que se emite. */
  accessTokenExpiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
}

/** Respuesta 202 de /auth/register cuando la cuenta necesita confirmar el correo. */
export interface PendingConfirmation {
  confirmationRequired: true;
  email: string;
}

export type RegisterResult = AuthResponse | PendingConfirmation;

export interface Credentials {
  email: string;
  password: string;
}

export type RegisterRequest = Credentials;
export type LoginRequest = Credentials;

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

/** Códigos que puede devolver el backend en ApiErrorBody.code. */
export const SERVER_ERROR_CODES = [
  'VALIDATION_ERROR', // 400: cuerpo mal formado, correo no válido o contraseña que no cumple la política
  'INVALID_CREDENTIALS', // 401: correo o contraseña incorrectos en /auth/login
  'INVALID_REFRESH_TOKEN', // 401: refresh token caducado, revocado o desconocido
  'UNAUTHORIZED', // 401: access token ausente, caducado o no válido en endpoints protegidos
  'EMAIL_NOT_CONFIRMED', // 403: la cuenta existe pero el correo no está confirmado
  'EMAIL_ALREADY_REGISTERED', // 409: el correo ya tiene cuenta en /auth/register
  'RATE_LIMITED', // 429: demasiados intentos
  'INTERNAL_ERROR', // 500: error no controlado
] as const;

export type ServerErrorCode = (typeof SERVER_ERROR_CODES)[number];

/** Códigos que genera el propio cliente cuando no hay respuesta válida del servidor. */
export type ClientErrorCode = 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

export type AuthErrorCode = ServerErrorCode | ClientErrorCode;

export interface ApiErrorBody {
  code: ServerErrorCode;
  /** Texto para depuración; la interfaz muestra su propio mensaje según `code`. */
  message?: string;
}

export class AuthApiError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message?: string,
    readonly status?: number,
  ) {
    super(message ?? code);
    this.name = 'AuthApiError';
  }
}

/** Interfaz común del cliente real y del simulado. */
export interface AuthApi {
  register(body: RegisterRequest): Promise<RegisterResult>;
  login(body: LoginRequest): Promise<AuthResponse>;
  refresh(body: RefreshRequest): Promise<AuthResponse>;
  logout(body: LogoutRequest, options?: { accessToken?: string }): Promise<void>;
}

export function isServerErrorCode(value: unknown): value is ServerErrorCode {
  return typeof value === 'string' && (SERVER_ERROR_CODES as readonly string[]).includes(value);
}

export function isPendingConfirmation(value: unknown): value is PendingConfirmation {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<PendingConfirmation>;
  return candidate.confirmationRequired === true && typeof candidate.email === 'string';
}

/**
 * Valida la respuesta del servidor y la normaliza (id numérico -> texto).
 * Devuelve null si no tiene la forma del contrato.
 */
export function parseAuthResponse(value: unknown): AuthResponse | null {
  if (typeof value !== 'object' || value === null) return null;
  const { user, tokens } = value as {
    user?: { id?: unknown; email?: unknown };
    tokens?: Partial<Record<keyof TokenPair, unknown>>;
  };
  const id = user?.id;
  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    typeof user?.email !== 'string' ||
    typeof tokens?.accessToken !== 'string' ||
    typeof tokens.refreshToken !== 'string' ||
    typeof tokens.accessTokenExpiresIn !== 'number'
  ) {
    return null;
  }
  return {
    user: { id: String(id), email: user.email },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresIn: tokens.accessTokenExpiresIn,
    },
  };
}
