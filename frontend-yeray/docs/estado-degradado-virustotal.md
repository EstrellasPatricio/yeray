# Estado degradado de VirusTotal en el popup (tarea #36)

Estado: implementado en el popup y probado contra el backend de la PR #11. Se podrá integrar cuando se fusionen las PR #4, #9 y #11.

## Qué pide la tarea

RNF02: si se agota la cuota de VirusTotal o la consulta tarda demasiado, el backend lo indica y el popup muestra "Análisis no disponible" en lugar de un resultado.

## Reparto con otras tareas

- Backend (#28, Jose, PR #11): `POST /reputation` ya devuelve `{ status: "unavailable", reason }` con los motivos de la tabla de abajo. Esta tarea no cambia el backend.
- Captura de la URL (#18, Alberto, PR #5): la extensión envía solo `hostname` y `protocolo`, con el permiso `activeTab`.
- Resumen de riesgo (#35, Soraya): se encarga del resultado cuando sí hay análisis. Mientras tanto el popup muestra los recuentos de VirusTotal sin convertirlos en un nivel de riesgo, porque los umbrales se deciden en la #26.

## Flujo en el popup

1. Al abrir el popup se lee la pestaña activa. Si es una página interna del navegador, una IP o un nombre sin dominio, se explica que no se puede analizar y no se consulta nada.
2. La vista de inicio muestra el dominio y avisa de que solo ese dato llega a VirusTotal.
3. La consulta empieza cuando la persona pulsa "Analizar este sitio", como pide la especificación de la PR #11.
4. Si el resultado no es utilizable, aparece el aviso "Análisis no disponible" con el motivo y una advertencia: sin análisis no se puede valorar el sitio, y eso no significa que sea seguro ni peligroso.
5. En los fallos pasajeros el aviso ofrece "Volver a intentarlo".

## Motivos y mensajes

| Motivo | Lo detecta | Mensaje | Reintentar |
| --- | --- | --- | --- |
| `rate_limited` | Backend (429 de VirusTotal) | Se ha alcanzado el límite de consultas a VirusTotal. Vuelve a intentarlo en unos minutos. | Sí |
| `timeout` | Backend (5 s) o popup (8 s) | VirusTotal ha tardado demasiado en responder. | Sí |
| `upstream_error` | Backend | VirusTotal no ha podido atender la consulta. | Sí |
| `invalid_response` | Backend o popup | La respuesta de VirusTotal no tiene el formato esperado. | No |
| `not_found` | Backend | VirusTotal no tiene ningún informe de este sitio. | No |
| `no_analysis` | Backend | VirusTotal todavía no ha analizado este sitio. | No |
| `missing_configuration` | Backend (sin clave) | El servidor de Yeray no tiene configurada la consulta a VirusTotal. | No |
| `network_error` | Popup | No se ha podido conectar con el servidor de Yeray. Comprueba tu conexión. | Sí |
| `server_error` | Popup (5xx) | El servidor de Yeray no ha podido completar la consulta. | Sí |
| `invalid_site` | Popup (400 del backend) | Este sitio no se puede consultar. Yeray solo analiza sitios web públicos. | No |

Si el backend añade un motivo nuevo, el popup lo muestra como `upstream_error` hasta que se añada a esta tabla.

## Código

- `utils/reputation/contract.ts`: tipos y validación de la respuesta de `POST /reputation`.
- `utils/reputation/active-site.ts`: lectura de la pestaña activa y extracción de hostname y protocolo.
- `utils/reputation/http-client.ts`: llamada al backend. No lanza errores; cualquier fallo es un resultado `unavailable`.
- `utils/reputation/mock-client.ts`: escenarios simulados con `WXT_REPUTATION_MOCK`.
- `utils/reputation/messages.ts`: textos de la tabla anterior.
- `hooks/useSiteAnalysis.ts`, `components/home/HomeView.tsx` y `components/home/UnavailableNotice.tsx`: vista de inicio y aviso.
- El popup abre en la vista de inicio. La cuenta está en el icono de usuario de la cabecera, como en la maqueta.

## Pendiente para integrar con el backend

- CORS: la PR #11 solo admite los orígenes de `CORS_ORIGIN`, que por defecto es `http://localhost:5173`. Con ese valor el navegador bloquea la respuesta y el popup muestra `network_error`. Hay que añadir `chrome-extension://<id>`. El id aparece en `chrome://extensions` y cambia si la extensión se carga desde otra carpeta.
- Puerto: si el 3000 está ocupado, se puede levantar el backend en otro puerto y apuntar la extensión con `WXT_API_BASE_URL`.

## Cómo probar

Sin backend, en `frontend-yeray/.env`:

```bash
WXT_REPUTATION_MOCK=rate_limited   # o timeout, not_found, network_error...
```

Después, `pnpm build`, recarga la extensión, abre una tienda y pulsa el icono de Yeray.

Con el backend de la PR #11: arráncalo con `CORS_ORIGIN=chrome-extension://<id>` y sin `VIRUSTOTAL_API_KEY`. Deja `WXT_REPUTATION_MOCK` vacío, compila y analiza un sitio. Debe aparecer el aviso con el motivo `missing_configuration`.

## Verificación realizada

- 112 pruebas con Vitest, `pnpm compile` y `pnpm build`.
- Popup en Chromium contra el backend real de la PR #11 (sus 4 pruebas pasan):
  - sin clave, `missing_configuration`;
  - dominio privado, `invalid_site`;
  - CORS por defecto, `network_error`;
  - backend caído, `network_error`, y el reintento funciona cuando vuelve.
- La petición lleva solo hostname y protocolo, sin la ruta ni la consulta de la página.
- Cuota agotada, tiempo agotado y sitio sin informe, comprobados con el mock.
- Límite: en las pruebas automáticas la pestaña activa se simula, porque `activeTab` solo se concede al pulsar el icono. Esa parte hay que comprobarla a mano.
