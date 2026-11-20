import { isIP } from 'node:net';

/** Sufijos de dominios de uso local o interno que nunca son sitios públicos. */
const SUFIJOS_LOCALES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa', '.corp', '.intranet'];

/** Puntuación ficticia para desarrollar sin consultar la API de VirusTotal. */
export function simularVirusTotal(url: string): number {
  let sitio: URL;
  try {
    sitio = new URL(url);
  } catch {
    throw new TypeError('Se requiere una URL HTTP o HTTPS del sitio');
  }

  const hostname = sitio.hostname.replace(/\.$/, '').toLowerCase();
  const autoridad = url.match(/^https?:\/\/([^/?#]+)/i)?.[1] ?? '';
  if (
    url !== url.trim() ||
    /[\t\r\n]/.test(url) ||

    !['http:', 'https:'].includes(sitio.protocol) ||
    !hostname.includes('.') ||
    isIP(hostname.replace(/^\[|\]$/g, '')) !== 0 ||
    hostname === 'localhost' ||
    SUFIJOS_LOCALES.some((sufijo) => hostname.endsWith(sufijo)) ||
    sitio.username !== '' ||
    sitio.password !== '' ||
    autoridad.includes(':') ||
    sitio.pathname !== '/' ||
    url.includes('?') ||
    url.includes('#')
  ) {
    throw new TypeError('Se requiere una URL HTTP o HTTPS del sitio sin datos de página');
  }

  return Math.floor(Math.random() * 101);
}
