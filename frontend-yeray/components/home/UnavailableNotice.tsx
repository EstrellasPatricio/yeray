import type { UnavailableReason } from '@/utils/reputation/contract';
import {
  UNAVAILABLE_CAUTION,
  UNAVAILABLE_TITLE,
  unavailableMessage,
} from '@/utils/reputation/messages';

import { Icon } from '../icons';

interface UnavailableNoticeProps {
  reason: UnavailableReason;
  onRetry: () => void;
}

/** Estado degradado (RNF02): la consulta no dio un resultado utilizable. */
export function UnavailableNotice({ reason, onRetry }: UnavailableNoticeProps) {
  const { detail, canRetry } = unavailableMessage(reason);

  return (
    <section className="notice warn" aria-labelledby="unavailable-title" data-reason={reason}>
      <span className="notice-icon">
        <Icon name="info" size={20} />
      </span>
      <div>
        <h2 id="unavailable-title">{UNAVAILABLE_TITLE}</h2>
        <p>{detail}</p>
        <p>{UNAVAILABLE_CAUTION}</p>
        {canRetry && (
          <button type="button" className="text-button" onClick={onRetry}>
            Volver a intentarlo
          </button>
        )}
      </div>
    </section>
  );
}
