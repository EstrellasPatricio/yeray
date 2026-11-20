# Simulador de VirusTotal: diseño

## Intención

Permitir desarrollar el análisis de reputación antes de integrar la API real de VirusTotal. El simulador recibe una URL del sitio y devuelve una puntuación aleatoria entera entre 0 y 100, ambos extremos incluidos. Es un dato ficticio, no una evaluación de seguridad.

## Contrato y límites

- La función vive en el backend TypeScript y no llama a VirusTotal, Supabase ni a la red.
- La extensión solo envía `hostname` y `protocolo`, según `url-info/README.md`. `protocolo` llega sin los dos puntos finales (`http` o `https`). La URL que recibe esta función debe formarse en el backend a partir de esos dos campos como `${protocolo}://${hostname}/`; nunca debe incluir ruta, consulta, fragmento, credenciales o puerto.
- La función acepta una URL absoluta `http` o `https` cuyo nombre de host contenga al menos un punto, sin ninguna de las partes anteriores. La única ruta admitida es la raíz `/`, con o sin barra final (`https://ejemplo.com` y `https://ejemplo.com/` son equivalentes).
- Lanza `TypeError` cuando:
  - la cadena no es una URL válida;
  - el protocolo no es `http` ni `https`;
  - el nombre de host no contiene ningún punto;
  - el host es una IP literal, sea IPv4 o IPv6, pública o privada;
  - el host es `localhost` o termina en un sufijo de uso local o interno: `.localhost`, `.local`, `.internal`, `.lan`, `.home.arpa`, `.corp` o `.intranet`;
  - la URL incluye ruta distinta de `/`, consulta, fragmento, credenciales o puerto (aunque sea el puerto por defecto).
- La lista de sufijos es una heurística: no garantiza que un dominio aceptado sea público, solo descarta los usos internos más habituales.
- No se crea todavía un endpoint ni persistencia; la documentación de URL indica que ese contrato HTTP sigue pendiente.
- La puntuación se genera en cada llamada y no se deriva de la URL. No se presenta como resultado real de VirusTotal.

## Enfoques

1. **Servicio local mínimo (elegido):** una función en `backend/src/services` con validación y generación aleatoria. Mantiene el cambio acotado al backend existente.
2. Endpoint Fastify de simulación: permitiría una llamada desde la extensión, pero fijaría prematuramente el contrato HTTP que aún no está implementado.
3. Cliente real de VirusTotal con modo simulado: mezcla una integración futura con esta tarea y requeriría claves, cuotas y más configuración.

## Comprobación

Pruebas del contrato de entrada; de los límites del intervalo (si `Math.random()` devuelve 0, la puntuación es 0, y si devuelve el mayor valor posible por debajo de 1, la puntuación es 100); y de que cada resultado es un entero del intervalo. Compilación TypeScript del backend.
