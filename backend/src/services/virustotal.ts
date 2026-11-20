import { isIP } from 'node:net';

const domainLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const reservedSuffix = /\.(?:localhost|local|internal|lan|home|corp|test|invalid|example|onion|arpa)$/;
const statNames = ['malicious', 'suspicious', 'harmless', 'undetected'] as const;
type AnalysisStats = Record<(typeof statNames)[number], number>;

type UnavailableReason =
    | 'missing_configuration'
    | 'not_found'
    | 'rate_limited'
    | 'timeout'
    | 'upstream_error'
    | 'invalid_response'
    | 'no_analysis';

type Reputation =
    | { status: 'analyzed'; stats: AnalysisStats }
    | { status: 'unavailable'; reason: UnavailableReason };

export function siteOrigin(hostname: string, protocolo: string): string | null {
    const domain = hostname.toLowerCase().replace(/\.$/, '');
    const labels = domain.split('.');
    if (
        (protocolo !== 'http' && protocolo !== 'https') ||
        domain.length > 253 ||
        labels.length < 2 ||
        !labels.every((label) => domainLabel.test(label)) ||
        reservedSuffix.test(domain)
    ) {
        return null;
    }

    const site = URL.parse(`${protocolo}://${domain}/`);
    return site && isIP(site.hostname) === 0 ? site.href : null;
}

export async function getVirusTotalReputation(
    origin: string,
    apiKey: string | undefined,
    fetchReport = fetch,
): Promise<Reputation> {
    const key = apiKey?.trim();
    if (!key) {
        return { status: 'unavailable', reason: 'missing_configuration' };
    }

    const id = Buffer.from(origin).toString('base64url');
    const signal = AbortSignal.timeout(5_000);
    try {
        const response = await fetchReport(`https://www.virustotal.com/api/v3/urls/${id}`, {
            headers: { accept: 'application/json', 'x-apikey': key },
            redirect: 'error',
            signal,
        });
        if (!response.ok) {
            await response.body?.cancel();
            const reason = response.status === 404 ? 'not_found'
                : response.status === 429 ? 'rate_limited'
                    : 'upstream_error';
            return { status: 'unavailable', reason };
        }

        const payload = await response.json().catch(() => null) as {
            data?: { attributes?: { last_analysis_stats?: Partial<AnalysisStats> } };
        } | null;
        if (signal.aborted) return { status: 'unavailable', reason: 'timeout' };

        const attributes = payload?.data?.attributes;
        if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
            return { status: 'unavailable', reason: 'invalid_response' };
        }
        const counts = attributes.last_analysis_stats;
        if (counts === undefined) return { status: 'unavailable', reason: 'no_analysis' };
        if (!counts || typeof counts !== 'object' || Array.isArray(counts)) {
            return { status: 'unavailable', reason: 'invalid_response' };
        }

        const { malicious, suspicious, harmless, undetected } = counts;
        if (
            !isCount(malicious) || !isCount(suspicious) ||
            !isCount(harmless) || !isCount(undetected)
        ) {
            return { status: 'unavailable', reason: 'invalid_response' };
        }
        if (malicious + suspicious + harmless + undetected === 0) {
            return { status: 'unavailable', reason: 'no_analysis' };
        }
        return { status: 'analyzed', stats: { malicious, suspicious, harmless, undetected } };
    } catch {
        return { status: 'unavailable', reason: signal.aborted ? 'timeout' : 'upstream_error' };
    }
}

function isCount(value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
