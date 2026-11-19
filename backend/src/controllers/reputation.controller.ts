import type { FastifyInstance } from 'fastify';
import { getVirusTotalReputation, siteOrigin } from '../services/virustotal.js';

type ReputationBody = { hostname: string; protocolo: 'http' | 'https' };

export async function reputationRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: ReputationBody }>('/reputation', {
        onRequest: async (_request, reply) => {
            reply.header('Cache-Control', 'no-store');
        },
        schema: {
            body: {
                type: 'object',
                required: ['hostname', 'protocolo'],
                additionalProperties: false,
                properties: {
                    hostname: { type: 'string', maxLength: 254 },
                    protocolo: { type: 'string', enum: ['http', 'https'] },
                },
            },
        },
    }, async ({ body }, reply) => {
        const origin = siteOrigin(body.hostname, body.protocolo);
        if (!origin) return reply.code(400).send({ error: 'hostname_invalido' });
        return getVirusTotalReputation(origin, process.env.VIRUSTOTAL_API_KEY);
    });
}
