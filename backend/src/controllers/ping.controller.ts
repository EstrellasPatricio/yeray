import type { FastifyInstance } from 'fastify';

export async function pingRoutes(fastify: FastifyInstance) {
    fastify.get('/ping', async () => {
        return { status: 'ok', message: 'Backend corriendo' };
    });
}
