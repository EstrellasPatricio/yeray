import {
  BACKEND_UNAVAILABLE_REASONS,
  type ReputationApi,
  type UnavailableReason,
} from './contract';

/**
 * Cliente simulado para probar el popup sin backend ni clave de VirusTotal.
 * Se activa con WXT_REPUTATION_MOCK=<escenario>: `analyzed` o un motivo de indisponibilidad.
 */
export type MockScenario = 'analyzed' | UnavailableReason;

const SCENARIOS: readonly string[] = [
  'analyzed',
  ...BACKEND_UNAVAILABLE_REASONS,
  'network_error',
  'invalid_site',
  'server_error',
];

export function parseMockScenario(value: string | undefined): MockScenario | null {
  if (!value || value === 'false') return null;
  return SCENARIOS.includes(value) ? (value as MockScenario) : 'timeout';
}

export function createMockReputationApi(
  scenario: MockScenario,
  { latencyMs = 600 }: { latencyMs?: number } = {},
): ReputationApi {
  return {
    async check() {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
      if (scenario === 'analyzed') {
        return {
          status: 'analyzed',
          stats: { malicious: 0, suspicious: 1, harmless: 62, undetected: 30 },
        };
      }
      return { status: 'unavailable', reason: scenario };
    },
  };
}
