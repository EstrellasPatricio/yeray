import { useSiteAnalysis } from '@/hooks/useSiteAnalysis';
import type { AnalysisStats } from '@/utils/reputation/contract';
import { reputationMockScenario } from '@/utils/reputation/client';
import { siteErrorMessage } from '@/utils/reputation/messages';

import { Icon } from '../icons';
import { UnavailableNotice } from './UnavailableNotice';

/**
 * Resumen neutro de los recuentos de VirusTotal. La valoración del riesgo (niveles y
 * umbrales) corresponde a las tareas #26 y #35.
 */
function ReputationCounts({ stats }: { stats: AnalysisStats }) {
  const total = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;
  return (
    <section className="page-card" aria-labelledby="counts-title">
      <p className="eyebrow" id="counts-title">
        Resultado de VirusTotal
      </p>
      <p>
        De {total} motores, {stats.malicious} lo marcan como malicioso y {stats.suspicious} como
        sospechoso.
      </p>
    </section>
  );
}

export function HomeView() {
  const { state, analyze } = useSiteAnalysis();

  return (
    <>
      {reputationMockScenario && (
        <p className="demo-strip">
          <span className="demo-chip">Modo de prueba</span>
          <span>Reputación simulada: {reputationMockScenario}.</span>
        </p>
      )}

      <section className="page-card">
        <p className="eyebrow">Página actual</p>
        <div className="domain">
          <Icon name="globe" size={16} />
          <span>
            {'site' in state
              ? state.site.hostname
              : state.phase === 'loading-site'
                ? 'Leyendo la pestaña…'
                : 'Página no compatible'}
          </span>
        </div>
      </section>

      <div role="status" aria-live="polite">
        {state.phase === 'site-error' && (
          <section className="notice warn">
            <span className="notice-icon">
              <Icon name="info" size={20} />
            </span>
            <p>{siteErrorMessage(state.reason)}</p>
          </section>
        )}
        {state.phase === 'checking' && (
          <p className="status-line">
            <span className="spinner" aria-hidden="true" />
            Consultando la reputación del sitio…
          </p>
        )}
        {state.phase === 'done' &&
          (state.result.status === 'analyzed' ? (
            <ReputationCounts stats={state.result.stats} />
          ) : (
            <UnavailableNotice reason={state.result.reason} onRetry={analyze} />
          ))}
      </div>

      {(state.phase === 'ready' || state.phase === 'checking') && (
        <>
          <button
            type="button"
            className="primary-button"
            onClick={analyze}
            disabled={state.phase === 'checking'}
            aria-busy={state.phase === 'checking'}
          >
            <Icon name="document" size={17} />
            {state.phase === 'checking' ? 'Analizando…' : 'Analizar este sitio'}
          </button>
          <p className="subtle-note">
            Solo se envía el dominio ({state.site.hostname}) a VirusTotal, nunca la ruta ni los datos
            de la página.
          </p>
        </>
      )}
    </>
  );
}
