/**
 * Contrato de la API de autenticación entre la extensión y el backend.
 *
 * Endpoints (relativos a WXT_API_BASE_URL, cuerpo y respuesta en JSON):
 *   POST /auth/register  RegisterRequest -> 201 AuthResponse
 *   POST /auth/login     LoginRequest    -> 200 AuthResponse
 *   POST /auth/refresh   RefreshRequest  -> 200 AuthResponse (rota el refresh token)
 *   POST /auth/logout    LogoutRequest   -> 204 sin cuerpo (idempotente)
 *
 * Cualquier error responde con un estado 4xx/5xx y un cuerpo ApiErrorBody.
 */

export interface AuthUser {
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
  register(body: RegisterRequest): Promise<AuthResponse>;
  login(body: LoginRequest): Promise<AuthResponse>;
  refresh(body: RefreshRequest): Promise<AuthResponse>;
  logout(body: LogoutRequest): Promise<void>;
}

export function isServerErrorCode(value: unknown): value is ServerErrorCode {
  return typeof value === 'string' && (SERVER_ERROR_CODES as readonly string[]).includes(value);
}

export function isAuthResponse(value: unknown): value is AuthResponse {
  if (typeof value !== 'object' || value === null) return false;
  const { user, tokens } = value as Partial<AuthResponse>;
  return (
    typeof user?.id === 'string' &&
    typeof user.email === 'string' &&
    typeof tokens?.accessToken === 'string' &&
    typeof tokens.refreshToken === 'string' &&
    typeof tokens.accessTokenExpiresIn === 'number'
  );
}
