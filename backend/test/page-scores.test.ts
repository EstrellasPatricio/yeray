import assert from 'node:assert/strict';
import { test } from 'node:test';
import Fastify from 'fastify';

import { pageScoreRoutes } from '../src/controllers/page-scores.controller.js';
import {
    createSupabasePageScoreRepository,
    type PageScoreRepository,
} from '../src/repositories/page-scores.js';
import { normalizeHost } from '../src/services/host.js';

function fakeRepository(fail = false) {
    const saved: { hostname: string; score: number }[] = [];
    const repository: PageScoreRepository = {
        async save(input) {
            if (fail) throw new Error('conexión rechazada por Supabase');
            saved.push(input);
            return { id: saved.length, ...input, createdAt: '2026-11-25T10:00:00' };
        },
    };
    return { repository, saved };
}

async function appWith(repository: PageScoreRepository) {
    const app = Fastify();
    await app.register(pageScoreRoutes(repository));
    return app;
}

test('normalizeHost acepta dominios públicos y descarta destinos privados', () => {
    assert.equal(normalizeHost('Tienda.Example.com.'), 'tienda.example.com');
    assert.equal(normalizeHost('shop.es'), 'shop.es');
    for (const host of [
        'localhost',
        'intranet',
        '192.168.1.10',
        '[::1]',
        'router.local',
        'tienda.test',
        'tienda.es/carrito',
        'tienda.es:8080',
        'user@tienda.es',
        '-mal.es',
        `${'a'.repeat(64)}.es`,
    ]) {
        assert.equal(normalizeHost(host), null, host);
    }
});

test('POST /page-scores guarda la puntuación con el dominio normalizado', async () => {
    const { repository, saved } = fakeRepository();
    const app = await appWith(repository);

    const response = await app.inject({
        method: 'POST',
        url: '/page-scores',
        payload: { hostname: 'Tienda.Example.com', score: 72 },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.deepEqual(response.json(), {
        id: 1,
        hostname: 'tienda.example.com',
        score: 72,
        createdAt: '2026-11-25T10:00:00',
    });
    assert.deepEqual(saved, [{ hostname: 'tienda.example.com', score: 72 }]);
});

test('acepta los extremos 0 y 100', async () => {
    const { repository, saved } = fakeRepository();
    const app = await appWith(repository);

    for (const score of [0, 100]) {
        const response = await app.inject({
            method: 'POST',
            url: '/page-scores',
            payload: { hostname: 'shop.es', score },
        });
        assert.equal(response.statusCode, 201, String(score));
    }
    assert.equal(saved.length, 2);
});

test('rechaza puntuaciones fuera de 0-100, no enteras o ausentes sin guardar nada', async () => {
    const { repository, saved } = fakeRepository();
    const app = await appWith(repository);

    for (const payload of [
        { hostname: 'shop.es', score: -1 },
        { hostname: 'shop.es', score: 101 },
        { hostname: 'shop.es', score: 50.5 },
        { hostname: 'shop.es', score: 'mucho' },
        { hostname: 'shop.es' },
        { score: 50 },
    ]) {
        const response = await app.inject({ method: 'POST', url: '/page-scores', payload });
        assert.equal(response.statusCode, 400, JSON.stringify(payload));
    }
    assert.equal(saved.length, 0);
});

test('rechaza dominios privados o con datos de URL con hostname_invalido', async () => {
    const { repository, saved } = fakeRepository();
    const app = await appWith(repository);

    for (const hostname of ['localhost', '10.0.0.1', 'router.local', 'tienda.es/pedido/ana@uma.es']) {
        const response = await app.inject({
            method: 'POST',
            url: '/page-scores',
            payload: { hostname, score: 40 },
        });
        assert.equal(response.statusCode, 400, hostname);
        assert.deepEqual(response.json(), { error: 'hostname_invalido' });
    }
    assert.equal(saved.length, 0);
});

test('si la base de datos falla responde 503 sin exponer el error interno', async () => {
    const { repository } = fakeRepository(true);
    const app = await appWith(repository);

    const response = await app.inject({
        method: 'POST',
        url: '/page-scores',
        payload: { hostname: 'shop.es', score: 40 },
    });

    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json(), { error: 'almacenamiento_no_disponible' });
    assert.doesNotMatch(response.body, /Supabase/);
});

test('el repositorio de Supabase registra el dominio y luego la puntuación', async () => {
    const calls: unknown[][] = [];
    const query = (table: string, result: unknown) => ({
        upsert(...args: unknown[]) {
            calls.push([table, 'upsert', ...args]);
            return this;
        },
        insert(...args: unknown[]) {
            calls.push([table, 'insert', ...args]);
            return this;
        },
        select(columns: string) {
            calls.push([table, 'select', columns]);
            return this;
        },
        async single() {
            return result;
        },
    });
    const client = {
        from(table: string) {
            return table === 'domains'
                ? query(table, { data: { id: 7 }, error: null })
                : query(table, { data: { id: 3, created_at: '2026-11-25T10:00:00' }, error: null });
        },
    };
    const repository = createSupabasePageScoreRepository(() => client as never);

    const record = await repository.save({ hostname: 'shop.es', score: 15 });

    assert.deepEqual(record, { id: 3, hostname: 'shop.es', score: 15, createdAt: '2026-11-25T10:00:00' });
    assert.deepEqual(calls, [
        ['domains', 'upsert', { host: 'shop.es' }, { onConflict: 'host' }],
        ['domains', 'select', 'id'],
        ['page_scores', 'insert', { domain_id: 7, score: 15 }],
        ['page_scores', 'select', 'id, created_at'],
    ]);
});

test('el repositorio de Supabase propaga los errores de la base de datos', async () => {
    const failing = {
        upsert() {
            return this;
        },
        select() {
            return this;
        },
        async single() {
            return { data: null, error: { message: 'relation "domains" does not exist' } };
        },
    };
    const repository = createSupabasePageScoreRepository(() => ({ from: () => failing }) as never);

    await assert.rejects(repository.save({ hostname: 'shop.es', score: 15 }), /domains/);
});
