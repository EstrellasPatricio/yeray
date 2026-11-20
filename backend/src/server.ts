import Fastify from 'fastify';
import cors from '@fastify/cors';
import { pingRoutes } from './controllers/ping.controller.js';
import { verificarConexionBD } from './repositories/supabase.js';

const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        await verificarConexionBD();
        console.log('Conexión con Supabase verificada correctamente');

        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
            : ['http://localhost:5173'];

        await fastify.register(cors, { origin: allowedOrigins });
        await fastify.register(pingRoutes);

        const port = Number(process.env.PORT) || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Servidor corriendo en http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
