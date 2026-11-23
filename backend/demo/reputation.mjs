import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const files = {
  '/': ['pages/bajo.html', 'text/html; charset=utf-8'],
  '/bajo': ['pages/bajo.html', 'text/html; charset=utf-8'],
  '/sospechoso': ['pages/sospechoso.html', 'text/html; charset=utf-8'],
  '/alto': ['pages/alto.html', 'text/html; charset=utf-8'],
  '/estilos.css': ['pages/estilos.css', 'text/css; charset=utf-8'],
};

export async function serveDemo(request, response) {
  if (request.method !== 'GET') {
    response.writeHead(405).end('Método no permitido');
    return;
  }
  const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  const file = Object.hasOwn(files, path) ? files[path] : undefined;
  if (!file) {
    response.writeHead(404).end('Página no encontrada');
    return;
  }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' }).end(body);
  } catch {
    response.writeHead(500).end('No se pudo cargar la página');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer(serveDemo).listen(3001, '127.0.0.1', () => {
    console.log('Tienda de prueba: http://127.0.0.1:3001/bajo');
  });
}
