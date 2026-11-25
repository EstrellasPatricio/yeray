import { isIP } from 'node:net';

// Mismas reglas que siteOrigin() de la PR #11 (VirusTotal). Unificar cuando se integre.
const domainLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const reservedSuffix = /\.(?:localhost|local|internal|lan|home|corp|test|invalid|example|onion|arpa)$/;

/**
 * Devuelve el dominio público normalizado (minúsculas, sin punto final) o null si
 * es una IP, un nombre sin dominio, un sufijo privado o reservado, o lleva ruta, puerto o credenciales.
 */
export function normalizeHost(hostname: string): string | null {
    const host = hostname.trim().toLowerCase().replace(/\.$/, '');
    const labels = host.split('.');
    if (
        host.length > 253 ||
        labels.length < 2 ||
        isIP(host) !== 0 ||
        !labels.every((label) => domainLabel.test(label)) ||
        reservedSuffix.test(host)
    ) {
        return null;
    }
    return host;
}
