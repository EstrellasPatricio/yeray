import type { SiteRequest } from './contract';

export type SiteError = 'no_access' | 'unsupported_page';

export type ActiveSite = { ok: true; site: SiteRequest } | { ok: false; reason: SiteError };

type QueryTabs = (query: { active: true; currentWindow: true }) => Promise<{ url?: string }[]>;

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/**
 * Convierte la URL de la pestaña en lo único que se envía al backend: hostname y protocolo
 * (url-info, PR #5). Descarta páginas internas del navegador, IP y nombres sin dominio;
 * el backend vuelve a validar y rechaza además los dominios privados.
 */
export function siteFromUrl(url: string | undefined): ActiveSite {
  if (!url) return { ok: false, reason: 'no_access' };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: 'unsupported_page' };
  }

  const protocolo = parsed.protocol.slice(0, -1);
  const { hostname } = parsed;
  if (
    (protocolo !== 'http' && protocolo !== 'https') ||
    !hostname.includes('.') ||
    IPV4.test(hostname) ||
    hostname.startsWith('[')
  ) {
    return { ok: false, reason: 'unsupported_page' };
  }
  return { ok: true, site: { hostname, protocolo } };
}

/** Lee la pestaña activa. Con el permiso activeTab solo es posible tras abrir el popup en ella. */
export async function getActiveSite(
  queryTabs: QueryTabs = (query) => browser.tabs.query(query),
): Promise<ActiveSite> {
  try {
    const [tab] = await queryTabs({ active: true, currentWindow: true });
    return siteFromUrl(tab?.url);
  } catch {
    return { ok: false, reason: 'no_access' };
  }
}
