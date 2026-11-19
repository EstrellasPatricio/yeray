import { apiBaseUrl } from '../api/config';
import type { ReputationApi } from './contract';
import { createHttpReputationApi } from './http-client';
import { createMockReputationApi, parseMockScenario } from './mock-client';

export const reputationMockScenario = parseMockScenario(import.meta.env.WXT_REPUTATION_MOCK);

export const reputationApi: ReputationApi = reputationMockScenario
  ? createMockReputationApi(reputationMockScenario)
  : createHttpReputationApi({ baseUrl: apiBaseUrl });
