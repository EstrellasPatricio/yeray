import type { UnavailableReason } from './contract';
import type { SiteError } from './active-site';

/** Texto del estado degradado exigido por RNF02. */
export const UNAVAILABLE_TITLE = 'Análisis no disponible';

/** Recuerda que la falta de resultado no es una valoración del sitio. */
export const UNAVAILABLE_CAUTION =
  'Sin este análisis Yeray no puede valorar el sitio: no significa que sea seguro ni peligroso.';

const MESSAGES: Record<UnavailableReason, { detail: string; canRetry: boolean }> = {
  rate_limited: {
    detail: 'Se ha alcanzado el límite de consultas a VirusTotal. Vuelve a intentarlo en unos minutos.',
    canRetry: true,
  },
  timeout: {
    detail: 'VirusTotal ha tardado demasiado en responder.',
    canRetry: true,
  },
  upstream_error: {
    detail: 'VirusTotal no ha podido atender la consulta.',
    canRetry: true,
  },
  invalid_response: {
    detail: 'La respuesta de VirusTotal no tiene el formato esperado.',
    canRetry: false,
  },
  not_found: {
    detail: 'VirusTotal no tiene ningún informe de este sitio.',
    canRetry: false,
  },
  no_analysis: {
    detail: 'VirusTotal todavía no ha analizado este sitio.',
    canRetry: false,
  },
  missing_configuration: {
    detail: 'El servidor de Yeray no tiene configurada la consulta a VirusTotal.',
    canRetry: false,
  },
  network_error: {
    detail: 'No se ha podido conectar con el servidor de Yeray. Comprueba tu conexión.',
    canRetry: true,
  },
  server_error: {
    detail: 'El servidor de Yeray no ha podido completar la consulta.',
    canRetry: true,
  },
  invalid_site: {
    detail: 'Este sitio no se puede consultar. Yeray solo analiza sitios web públicos.',
    canRetry: false,
  },
};

export function unavailableMessage(reason: UnavailableReason) {
  return MESSAGES[reason];
}

export function siteErrorMessage(reason: SiteError): string {
  return reason === 'no_access'
    ? 'No se ha podido leer la pestaña activa. Abre Yeray desde la página que quieres analizar.'
    : 'Esta página no se puede analizar. Yeray analiza sitios web públicos que empiezan por http o https.';
}
