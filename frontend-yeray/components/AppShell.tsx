import type { ReactNode } from 'react';

import { Icon } from './icons';

export type PopupView = 'home' | 'account';

interface AppShellProps {
  view: PopupView;
  onNavigate: (view: PopupView) => void;
  children: ReactNode;
}

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-frame">
      <header className="app-header">
        <button
          type="button"
          className="brand-mark"
          aria-label="Yeray, ir al inicio"
          onClick={() => onNavigate('home')}
        >
          <Icon name="shield" size={23} />
        </button>
        <div className="brand-copy">
          <h1 className="brand-name">Yeray</h1>
          <p className="brand-tagline">Protección inteligente</p>
        </div>
        <nav className="header-actions" aria-label="Acciones">
          <button
            type="button"
            className={`icon-button${view === 'account' ? ' current' : ''}`}
            aria-label="Cuenta Yeray"
            title="Cuenta Yeray"
            aria-current={view === 'account' ? 'page' : undefined}
            onClick={() => onNavigate('account')}
          >
            <Icon name="user" size={18} />
          </button>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <Icon name="lock" size={13} />
        <span>Evaluación orientativa, no garantiza seguridad absoluta</span>
      </footer>
    </div>
  );
}
