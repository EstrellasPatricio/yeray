import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Yeray',
    description: 'Ayuda a detectar señales de riesgo en tiendas en línea.',
    // storage: sesión (ver docs de almacenamiento). activeTab: leer la pestaña
    // activa solo cuando la persona abre el popup en ella (url-info, PR #5).
    permissions: ['storage', 'activeTab'],
  },
  dev: {
    // El puerto 3000 queda libre para la API principal (backend).
    server: { port: 3100 },
  },
});
