import type { FastifyInstance } from 'fastify';
import type { PageScoreRepository } from '../repositories/page-scores.js';
import { normalizeHost } from '../services/host.js';

type PageScoreBody = { hostname: string; score: number };

/**
 * POST /page-scores: guarda la puntuación de peligrosidad (0-100) que la persona
 * asigna a una página en el formulario de reporte (tareas #29 y #30).
 */
export function pageScoreRoutes(repository: PageScoreRepository) {
    return async function routes(fastify: FastifyInstance) {
        fastify.post<{ Body: PageScoreBody }>('/page-scores', {
            onRequest: async (_request, reply) => {
                reply.header('Cache-Control', 'no-store');
            },
            schema: {
                body: {
                    type: 'object',
                    required: ['hostname', 'score'],
                    additionalProperties: false,
                    properties: {
                        hostname: { type: 'string', minLength: 1, maxLength: 254 },
                        score: { type: 'integer', minimum: 0, maximum: 100 },
                    },
                },
            },
        }, async (request, reply) => {
            const hostname = normalizeHost(request.body.hostname);
            if (!hostname) return reply.code(400).send({ error: 'hostname_invalido' });

            try {
                const record = await repository.save({ hostname, score: request.body.score });
                return reply.code(201).send(record);
            } catch (err) {
                request.log.error(err);
                return reply.code(503).send({ error: 'almacenamiento_no_disponible' });
            }
        });
    };
}
