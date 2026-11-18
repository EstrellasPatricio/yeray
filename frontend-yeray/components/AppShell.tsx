import type { ReactNode } from 'react';

import { Icon } from './icons';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <header className="app-header">
        <span className="brand-mark">
          <Icon name="shield" size={20} />
        </span>
        <div className="brand-copy">
          <h1 className="brand-name">Yeray</h1>
          <p className="brand-tagline">Protección inteligente</p>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <Icon name="lock" size={13} />
        <span>Evaluación orientativa, no garantiza seguridad absoluta</span>
      </footer>
    </div>
  );
}
