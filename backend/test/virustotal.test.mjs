import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getVirusTotalReputation, siteOrigin } from '../src/services/virustotal.ts';

const origin = 'https://tienda.example.com/';
const stats = { malicious: 2, suspicious: 1, harmless: 21, undetected: 19 };

test('normaliza sitios y descarta destinos privados o datos de URL', () => {
    assert.equal(siteOrigin('TIENDA.Example.com.', 'https'), origin);
    assert.equal(siteOrigin('xn--bcher-kva.example.com', 'http'), 'http://xn--bcher-kva.example.com/');
    assert.equal(siteOrigin('tienda.example.com', 'file'), null);
    for (const hostname of [
        'localhost', 'tienda.local', 'host.home.arpa', '192.168.1.1', '0x7f.0.0.1',
        '[::1]', 'tienda.example.com:443', '-tienda.example.com', 'tienda..example.com',
        'a@tienda.example.com', 'tienda.example.com/pedido', 'tienda.example.com?ref=1',
    ]) {
        assert.equal(siteOrigin(hostname, 'https'), null, hostname);
    }
});

test('consulta el informe del origen y devuelve solo los recuentos previstos', async () => {
    const result = await getVirusTotalReputation(origin, 'clave-de-prueba', async (url, init) => {
        const target = new URL(url);
        assert.equal(target.origin, 'https://www.virustotal.com');
        assert.equal(target.pathname, `/api/v3/urls/${Buffer.from(origin).toString('base64url')}`);
        assert.equal(init.headers['x-apikey'], 'clave-de-prueba');
        assert.equal(init.redirect, 'error');
        return Response.json({ data: { attributes: { last_analysis_stats: { ...stats, timeout: 2 } } } });
    });
    assert.deepEqual(result, { status: 'analyzed', stats });
});

test('distingue cuota, ausencia y fallos del proveedor', async () => {
    assert.deepEqual(await getVirusTotalReputation(origin, ' ', () => {
        assert.fail('Se intentó consultar VirusTotal sin clave');
    }), { status: 'unavailable', reason: 'missing_configuration' });

    for (const [status, reason] of [[404, 'not_found'], [429, 'rate_limited'], [503, 'upstream_error']]) {
        const result = await getVirusTotalReputation(origin, 'clave', async () => new Response(null, { status }));
        assert.deepEqual(result, { status: 'unavailable', reason });
    }

    for (const [attributes, reason] of [
        [{}, 'no_analysis'],
        [{ last_analysis_stats: { ...stats, malicious: -1 } }, 'invalid_response'],
        [{ last_analysis_stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 } }, 'no_analysis'],
    ]) {
        const result = await getVirusTotalReputation(origin, 'clave', async () => Response.json({ data: { attributes } }));
        assert.deepEqual(result, { status: 'unavailable', reason });
    }

    assert.deepEqual(await getVirusTotalReputation(origin, 'clave', async () => new Response('HTML')), {
        status: 'unavailable',
        reason: 'invalid_response',
    });
});

test('devuelve timeout si se agota el tiempo de espera', async (t) => {
    t.mock.method(AbortSignal, 'timeout', (milliseconds) => {
        assert.equal(milliseconds, 5_000);
        return AbortSignal.abort(new DOMException('Tiempo agotado', 'TimeoutError'));
    });
    const result = await getVirusTotalReputation(origin, 'clave', async (_url, { signal }) => {
        signal.throwIfAborted();
    });
    assert.deepEqual(result, { status: 'unavailable', reason: 'timeout' });
});
