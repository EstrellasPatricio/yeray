/**
 * Contrato de POST /reputation (backend, PR #11, docs/specs/virustotal-reputacion.md).
 *
 * Petición: { hostname, protocolo } con protocolo http o https. Solo el sitio, sin ruta ni consulta.
 * 200: { status: 'analyzed', stats } o { status: 'unavailable', reason }.
 * 400: hostname no válido (error de Fastify o { error: 'hostname_invalido' }).
 */

export interface SiteRequest {
  hostname: string;
  protocolo: 'http' | 'https';
}

export interface AnalysisStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
}

/** Motivos que devuelve el backend cuando la consulta a VirusTotal no da un resultado utilizable. */
export const BACKEND_UNAVAILABLE_REASONS = [
  'missing_configuration',
  'not_found',
  'rate_limited',
  'timeout',
  'upstream_error',
  'invalid_response',
  'no_analysis',
] as const;

export type BackendUnavailableReason = (typeof BACKEND_UNAVAILABLE_REASONS)[number];

/**
 * Motivos que detecta la extensión sin respuesta válida del backend:
 * - network_error: no se pudo conectar (backend caído, CORS o sin conexión).
 * - invalid_site: el backend rechazó el sitio (400), por ejemplo un dominio privado.
 * - server_error: el backend respondió con un error 5xx u otro estado inesperado.
 */
export type ClientUnavailableReason = 'network_error' | 'invalid_site' | 'server_error';

export type UnavailableReason = BackendUnavailableReason | ClientUnavailableReason;

export type ReputationResult =
  | { status: 'analyzed'; stats: AnalysisStats }
  | { status: 'unavailable'; reason: UnavailableReason };

/** Común al cliente real y al simulado. No lanza: cualquier fallo es un resultado `unavailable`. */
export interface ReputationApi {
  check(site: SiteRequest): Promise<ReputationResult>;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function isBackendUnavailableReason(value: unknown): value is BackendUnavailableReason {
  return (
    typeof value === 'string' && (BACKEND_UNAVAILABLE_REASONS as readonly string[]).includes(value)
  );
}

/** Valida una respuesta 200 del backend. Devuelve null si no sigue el contrato. */
export function parseReputationResult(value: unknown): ReputationResult | null {
  if (typeof value !== 'object' || value === null) return null;
  const payload = value as { status?: unknown; stats?: Partial<Record<keyof AnalysisStats, unknown>>; reason?: unknown };

  if (payload.status === 'analyzed') {
    const { malicious, suspicious, harmless, undetected } = payload.stats ?? {};
    if (!isCount(malicious) || !isCount(suspicious) || !isCount(harmless) || !isCount(undetected)) {
      return null;
    }
    return { status: 'analyzed', stats: { malicious, suspicious, harmless, undetected } };
  }

  if (payload.status === 'unavailable') {
    // Un motivo nuevo del backend se muestra como fallo genérico del proveedor.
    return {
      status: 'unavailable',
      reason: isBackendUnavailableReason(payload.reason) ? payload.reason : 'upstream_error',
    };
  }

  return null;
}
