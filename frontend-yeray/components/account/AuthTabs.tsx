import { useRef, type KeyboardEvent } from 'react';

import type { AuthMode } from '@/utils/auth/validation';

export const AUTH_PANEL_ID = 'auth-panel';
export const authTabId = (mode: AuthMode) => `auth-tab-${mode}`;

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: 'signin', label: 'Iniciar sesión' },
  { mode: 'register', label: 'Crear cuenta' },
];

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  disabled?: boolean;
}

/** Pestañas accesibles: solo la activa es tabulable y las flechas cambian de pestaña. */
export function AuthTabs({ mode, onChange, disabled }: AuthTabsProps) {
  const refs = useRef<Partial<Record<AuthMode, HTMLButtonElement | null>>>({});

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = TABS.findIndex((tab) => tab.mode === mode);
    const next =
      event.key === 'Home'
        ? TABS[0]
        : event.key === 'End'
          ? TABS[TABS.length - 1]
          : TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    if (!next) return;
    onChange(next.mode);
    refs.current[next.mode]?.focus();
  }

  return (
    <div className="secondary-row" role="tablist" aria-label="Cuenta Yeray">
      {TABS.map((tab) => {
        const selected = tab.mode === mode;
        return (
          <button
            key={tab.mode}
            ref={(element) => {
              refs.current[tab.mode] = element;
            }}
            id={authTabId(tab.mode)}
            type="button"
            role="tab"
            className={selected ? 'primary-button' : 'outline-button'}
            aria-selected={selected}
            aria-controls={AUTH_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(tab.mode)}
            onKeyDown={handleKeyDown}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
