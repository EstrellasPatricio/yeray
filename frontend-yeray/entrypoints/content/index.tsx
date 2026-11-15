import ReactDOM from 'react-dom/client';

import App from './App.tsx';

import './style.css';

export default defineContentScript({
  matches: ['*://*.google.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'frontend-yeray-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
