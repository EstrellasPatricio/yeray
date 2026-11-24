import { useCallback, useEffect, useState } from 'react';

import { getActiveSite, type SiteError } from '@/utils/reputation/active-site';
import { reputationApi as defaultApi } from '@/utils/reputation/client';
import type { ReputationApi, ReputationResult, SiteRequest } from '@/utils/reputation/contract';

export type SiteAnalysisState =
  | { phase: 'loading-site' }
  | { phase: 'site-error'; reason: SiteError }
  | { phase: 'ready'; site: SiteRequest }
  | { phase: 'checking'; site: SiteRequest }
  | { phase: 'done'; site: SiteRequest; result: ReputationResult };

/** Lee la pestaña activa al abrir el popup y consulta la reputación cuando la persona lo pide. */
export function useSiteAnalysis(
  api: ReputationApi = defaultApi,
  readActiveSite: typeof getActiveSite = getActiveSite,
) {
  const [state, setState] = useState<SiteAnalysisState>({ phase: 'loading-site' });

  useEffect(() => {
    let active = true;
    readActiveSite().then((activeSite) => {
      if (!active) return;
      setState(
        activeSite.ok
          ? { phase: 'ready', site: activeSite.site }
          : { phase: 'site-error', reason: activeSite.reason },
      );
    });
    return () => {
      active = false;
    };
  }, [readActiveSite]);

  const site = 'site' in state ? state.site : null;

  const analyze = useCallback(async () => {
    if (!site) return;
    setState({ phase: 'checking', site });
    const result = await api.check(site);
    setState({ phase: 'done', site, result });
  }, [api, site]);

  return { state, analyze };
}
