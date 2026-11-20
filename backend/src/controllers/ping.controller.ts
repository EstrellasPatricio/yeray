import type { FastifyInstance } from 'fastify';
import { verificarConexionBD } from '../repositories/supabase.js';

export async function pingRoutes(fastify: FastifyInstance) {
    fastify.get('/ping', async (request, reply) => {
        try {
            await verificarConexionBD();
            return { status: 'ok', message: 'Backend corriendo', database: 'connected' };
        } catch (err) {
            request.log.error(err);
            return reply.code(503).send({
                status: 'error',
                message: 'Error de conexión con la base de datos',
                database: 'disconnected',
            });
        }
    });
}
