import type { FastifyInstance } from 'fastify';
import { verificarConexionBD } from '../repositories/supabase.js';

export async function readyRoutes(fastify: FastifyInstance) {
    fastify.get('/ready', async (request, reply) => {
        try {
            await verificarConexionBD();
            return { status: 'ok', database: 'connected' };
        } catch (err) {
            request.log.error(err);
            return reply.code(503).send({
                status: 'error',
                message: 'Base de datos no disponible',
                database: 'disconnected',
            });
        }
    });
}
