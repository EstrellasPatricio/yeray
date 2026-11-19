import { describe, expect, it, vi } from 'vitest';

import { getActiveSite, siteFromUrl } from './active-site';

describe('siteFromUrl', () => {
  it('extrae solo hostname y protocolo, sin ruta, consulta, fragmento, puerto ni credenciales', () => {
    expect(siteFromUrl('https://user:pw@Tienda.Example.com:8443/pedido/ana@uma.es?id=1#pago')).toEqual({
      ok: true,
      site: { hostname: 'tienda.example.com', protocolo: 'https' },
    });
    expect(siteFromUrl('http://shop.es/')).toEqual({
      ok: true,
      site: { hostname: 'shop.es', protocolo: 'http' },
    });
  });

  it('sin URL indica que no hay acceso a la pestaña', () => {
    expect(siteFromUrl(undefined)).toEqual({ ok: false, reason: 'no_access' });
    expect(siteFromUrl('')).toEqual({ ok: false, reason: 'no_access' });
  });

  it.each([
    'chrome://extensions/',
    'chrome-extension://abc/popup.html',
    'file:///C:/tienda.html',
    'about:blank',
    'https://localhost:3000/',
    'http://intranet/',
    'http://192.168.1.10/',
    'http://[::1]/',
    'not a url',
  ])('no analiza %s', (url) => {
    expect(siteFromUrl(url)).toEqual({ ok: false, reason: 'unsupported_page' });
  });
});

describe('getActiveSite', () => {
  it('consulta solo la pestaña activa de la ventana actual', async () => {
    const queryTabs = vi.fn(async () => [{ url: 'https://tienda.example.com/carrito' }]);

    await expect(getActiveSite(queryTabs)).resolves.toEqual({
      ok: true,
      site: { hostname: 'tienda.example.com', protocolo: 'https' },
    });
    expect(queryTabs).toHaveBeenCalledWith({ active: true, currentWindow: true });
  });

  it('sin permiso para leer la URL indica que no hay acceso', async () => {
    await expect(getActiveSite(async () => [{}])).resolves.toEqual({ ok: false, reason: 'no_access' });
    await expect(getActiveSite(async () => [])).resolves.toEqual({ ok: false, reason: 'no_access' });
  });

  it('si la API del navegador falla indica que no hay acceso', async () => {
    await expect(
      getActiveSite(async () => {
        throw new Error('sin permisos');
      }),
    ).resolves.toEqual({ ok: false, reason: 'no_access' });
  });
});
