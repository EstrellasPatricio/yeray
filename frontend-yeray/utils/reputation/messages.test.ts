import { describe, expect, it } from 'vitest';

import { BACKEND_UNAVAILABLE_REASONS, type UnavailableReason } from './contract';
import { siteErrorMessage, unavailableMessage } from './messages';

const ALL_REASONS: UnavailableReason[] = [
  ...BACKEND_UNAVAILABLE_REASONS,
  'network_error',
  'invalid_site',
  'server_error',
];

describe('unavailableMessage', () => {
  it.each(ALL_REASONS)('%s tiene un mensaje propio', (reason) => {
    const message = unavailableMessage(reason);
    expect(message.detail.length).toBeGreaterThan(10);
  });

  it('los motivos de cada caso son distintos para cuota y tiempo agotado (RNF02)', () => {
    expect(unavailableMessage('rate_limited').detail).toMatch(/límite de consultas/);
    expect(unavailableMessage('timeout').detail).toMatch(/tardado demasiado/);
  });

  it('solo ofrece reintentar en fallos pasajeros', () => {
    const retriable = ALL_REASONS.filter((reason) => unavailableMessage(reason).canRetry);
    expect(retriable.sort()).toEqual(
      ['network_error', 'rate_limited', 'server_error', 'timeout', 'upstream_error'].sort(),
    );
  });
});

describe('siteErrorMessage', () => {
  it('explica por qué no se puede analizar la pestaña', () => {
    expect(siteErrorMessage('no_access')).toMatch(/pestaña/);
    expect(siteErrorMessage('unsupported_page')).toMatch(/no se puede analizar/);
  });
});
