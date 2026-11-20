import assert from 'node:assert/strict';
import { test } from 'node:test';
import { simularVirusTotal } from './virustotal-simulator.js';

test('acepta una URL HTTP o HTTPS del sitio y devuelve un entero entre 0 y 100', () => {
  for (const url of ['https://tienda.ejemplo.com/', 'http://tienda.ejemplo.com/', 'https://tienda.ejemplo.com']) {
    for (let i = 0; i < 100; i++) {
      const resultado = simularVirusTotal(url);
      assert.ok(Number.isInteger(resultado));
      assert.ok(resultado >= 0 && resultado <= 100);
    }
  }
});

test('incluye ambos extremos del intervalo aleatorio', (t) => {
  const random = t.mock.method(Math, 'random', () => 0);
  assert.equal(simularVirusTotal('https://tienda.ejemplo.com/'), 0);
  random.mock.mockImplementation(() => 0.9999999999999999);
  assert.equal(simularVirusTotal('https://tienda.ejemplo.com/'), 100);
});

test('rechaza URLs inválidas, no web y con datos ajenos al sitio', () => {
  for (const url of [
    'no-es-una-url',
    ' https://tienda.ejemplo.com:8443/',
    ' https://tienda.ejemplo.com:443/',
    'https://tienda.ejemplo.com/ ',
    'https://tienda.ejemplo.com:\t8443/',
    'ftp://tienda.ejemplo.com/',
    'https://tienda/',
    'https://usuario:clave@tienda.ejemplo.com/',
    'https://tienda.ejemplo.com:8443/',
    'https://tienda.ejemplo.com:443/',
    'https://tienda.ejemplo.com/pedido/123',
    'https://tienda.ejemplo.com/?id=123',
    'https://tienda.ejemplo.com/?',
    'https://tienda.ejemplo.com/#perfil',
    'https://tienda.ejemplo.com/#',
  ]) {
    assert.throws(() => simularVirusTotal(url), TypeError, url);
  }
});

test('rechaza destinos locales, dominios internos e IP literales', () => {
  for (const url of [
    'http://localhost/',
    'http://equipo.localhost/',
    'http://impresora.local/',
    'http://servicio.internal/',
    'http://intranet.lan/',
    'http://router.home.arpa/',
    'http://app.corp/',
    'http://portal.intranet/',
    'http://8.8.8.8/',
    'http://127.0.0.1/',
    'http://10.0.0.1/',
    'http://172.16.0.1/',
    'http://192.168.1.1/',
    'http://169.254.1.1/',
    'http://[::1]/',
    'http://[2606:4700:4700::1111]/',
  ]) {
    assert.throws(() => simularVirusTotal(url), TypeError, url);
  }
});
