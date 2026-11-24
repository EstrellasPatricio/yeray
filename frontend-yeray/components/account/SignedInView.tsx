import { useState } from 'react';

import type { AuthUser } from '@/utils/auth/contract';

import { Icon } from '../icons';

interface SignedInViewProps {
  user: AuthUser;
  onSignOut: () => Promise<void>;
}

export function SignedInView({ user, onSignOut }: SignedInViewProps) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await onSignOut();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="page-card" aria-label="Sesión iniciada">
        <p className="eyebrow">Sesión iniciada como</p>
        <p className="account-email">
          <Icon name="user" size={16} />
          <span>{user.email}</span>
        </p>
      </section>
      <button
        type="button"
        className="primary-button"
        onClick={handleSignOut}
        disabled={pending}
        aria-busy={pending}
      >
        {pending && <span className="spinner" aria-hidden="true" />}
        {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </>
  );
}
