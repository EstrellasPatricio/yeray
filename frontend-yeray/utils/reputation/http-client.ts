import { parseReputationResult, type ReputationApi, type ReputationResult } from './contract';

interface HttpReputationApiOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  /** El backend espera hasta 5 s a VirusTotal; el cliente deja margen para la respuesta. */
  timeoutMs?: number;
}

const unavailable = (reason: Extract<ReputationResult, { status: 'unavailable' }>['reason']) =>
  ({ status: 'unavailable', reason }) as const;

export function createHttpReputationApi({
  baseUrl,
  fetchImpl = (...args) => fetch(...args),
  timeoutMs = 8_000,
}: HttpReputationApiOptions): ReputationApi {
  const url = `${baseUrl.replace(/\/+$/, '')}/reputation`;

  return {
    async check({ hostname, protocolo }) {
      const signal = AbortSignal.timeout(timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ hostname, protocolo }),
          signal,
        });
      } catch {
        return unavailable(signal.aborted ? 'timeout' : 'network_error');
      }

      if (response.status === 400) return unavailable('invalid_site');
      if (!response.ok) return unavailable('server_error');

      const payload: unknown = await response.json().catch(() => null);
      return parseReputationResult(payload) ?? unavailable('invalid_response');
    },
  };
}
