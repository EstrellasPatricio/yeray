import { useState } from 'react';

import { AccountView } from '@/components/account/AccountView';
import { AppShell, type PopupView } from '@/components/AppShell';
import { HomeView } from '@/components/home/HomeView';
import { Icon } from '@/components/icons';

function App() {
  const [view, setView] = useState<PopupView>('home');

  return (
    <AppShell view={view} onNavigate={setView}>
      {view === 'home' ? (
        <HomeView />
      ) : (
        <>
          <button type="button" className="back-button" onClick={() => setView('home')}>
            <Icon name="arrow" size={16} />
            Volver
          </button>
          <AccountView />
        </>
      )}
    </AppShell>
  );
}

export default App;
