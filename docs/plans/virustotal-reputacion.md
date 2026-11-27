# Plan de implementación — Reputación con VirusTotal

[Especificación](../specs/virustotal-reputacion.md) · [Tarea 28](https://app.clickup.com/t/1ammhmkdxhv)

## Orden de trabajo

1. Partir de la base Fastify de Manu y confirmar el contrato de hostname y protocolo de la extensión.
2. Implementar la consulta con `fetch`, límite de espera y traducción de respuestas. Extraer los recuentos útiles de un informe válido.
3. Registrar `POST /reputation` y añadir `VIRUSTOTAL_API_KEY` al ejemplo de entorno del backend.
4. Ejecutar pruebas contra un proveedor simulado. Cubrir datos válidos, destinos inválidos, falta de clave, cuota, ausencia de informe, tiempo agotado y respuestas incompletas.
5. Instalar las dependencias bloqueadas, compilar y arrancar Fastify. Verificar `/ping` y el nuevo endpoint. Hacer una consulta real con un sitio público de prueba y una clave configurada en local.
6. Solicitar revisión de Gonzalo. Compartir el contrato con Suito para el estado degradado y con el equipo que integra el popup.

## Verificación

Desde `backend/`, `pnpm test` ejecuta las pruebas locales sin clave y `pnpm run build` compila el backend. Para una prueba manual, configura `VIRUSTOTAL_API_KEY` en `.env`, ejecuta `pnpm run dev` y realiza una petición como esta desde PowerShell. Usa un sitio público de prueba que estés autorizado a consultar.

```powershell
$payload = @{ hostname = 'www.iana.org'; protocolo = 'https' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/reputation -ContentType 'application/json' -Body $payload
```

Si el proveedor devuelve recuentos, el resultado es `analyzed`. Si el informe no existe o la consulta no se puede completar, el resultado es `unavailable` con su motivo. Comprueba también que `/ping` sigue devolviendo HTTP 200.
