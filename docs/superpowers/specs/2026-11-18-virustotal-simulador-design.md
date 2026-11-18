# Simulador de VirusTotal: diseño

## Intención

Permitir desarrollar el análisis de reputación antes de integrar la API real de VirusTotal. El simulador recibe una URL del sitio y devuelve una puntuación aleatoria entera entre 0 y 100, ambos extremos incluidos. Es un dato ficticio, no una evaluación de seguridad.

## Contrato y límites

- La función vive en el backend TypeScript y no llama a VirusTotal, Supabase ni a la red.
- La extensión solo envía `hostname` y `protocolo`, según `url-info/README.md`. La URL que recibe esta función debe formarse en el backend a partir de esos dos campos; nunca debe incluir ruta, consulta, fragmento, credenciales o puerto.
- La función acepta una URL absoluta `http` o `https` con nombre de dominio público y sin las partes anteriores. Rechaza entradas inválidas, destinos locales e IP literales mediante `TypeError`.
- No se crea todavía un endpoint ni persistencia; la documentación de URL indica que ese contrato HTTP sigue pendiente.
- La puntuación se genera en cada llamada y no se deriva de la URL. No se presenta como resultado real de VirusTotal.

## Enfoques

1. **Servicio local mínimo (elegido):** una función en `backend/src/services` con validación y generación aleatoria. Mantiene el cambio acotado al backend existente.
2. Endpoint Fastify de simulación: permitiría una llamada desde la extensión, pero fijaría prematuramente el contrato HTTP que aún no está implementado.
3. Cliente real de VirusTotal con modo simulado: mezcla una integración futura con esta tarea y requeriría claves, cuotas y más configuración.

## Comprobación

Pruebas del contrato de entrada, de los límites 0 y 100 y de que cada resultado es un entero del intervalo. Compilación TypeScript del backend.
