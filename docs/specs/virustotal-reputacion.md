# Especificación del backend — Reputación con VirusTotal

| Campo | Valor |
| --- | --- |
| Estado | En revisión |
| Responsable de la PR | Sofía Si Villalba Jiménez |
| Pareja y revisión | Manu y Gonzalo, respectivamente |
| Sprint | Sprint único, semana 2 |
| Trabajo relacionado | [Tarea 28](https://app.clickup.com/t/1ammhmkdxhv) · [Base del backend](https://github.com/EstrellasPatricio/yeray/pull/1) · [Contrato de captura de URL](https://github.com/EstrellasPatricio/yeray/pull/5) |

## 1. Objetivo y alcance

Consultar la reputación del sitio que la persona selecciona en la extensión. El backend obtiene el informe existente de la raíz del sitio y devuelve los recuentos de detección. El diseño de umbrales, el escaneo activo, la persistencia y la UI pertenecen a otras tareas.

## 2. Requisitos

| ID | Requisito | Criterio de aceptación |
| --- | --- | --- |
| RF01 | Consultar el informe de VirusTotal | Solo se envía el origen web normalizado, usando la API v3 y la clave del servidor. |
| RNF02 | Representar la degradación de la consulta | Cuota, espera agotada y ausencia de informe se distinguen. Todo fallo produce un estado no disponible. |
| RNF04 | Minimizar los datos de navegación | La ruta de la página, los parámetros, el fragmento, el puerto y las credenciales quedan fuera de la consulta. |

## 3. Arquitectura y datos

El controlador Fastify valida la petición y llama a un servicio pequeño que usa `fetch` de Node. La consulta solicita el [informe de URL](https://docs.virustotal.com/reference/url-info) mediante el [identificador Base64 URL-safe sin relleno](https://docs.virustotal.com/reference/url). El backend interpreta únicamente `last_analysis_stats`. No se conserva una copia del informe.

## 4. Contrato HTTP

`POST /reputation` con `Content-Type: application/json` admite `{ "hostname": "tienda.example.com", "protocolo": "https" }`. El protocolo debe ser `http` o `https`. El navegador envía los nombres internacionales en ASCII mediante `URL.hostname`. Se rechazan IP, nombres de una sola etiqueta, sufijos privados o reservados conocidos y un hostname con datos de URL.

| HTTP | Cuerpo | Significado |
| --- | --- | --- |
| 200 | `{ "status": "analyzed", "stats": { "malicious": 0, "suspicious": 1, "harmless": 25, "undetected": 40 } }` | Informe con datos. Los recuentos orientan la evaluación. |
| 200 | `{ "status": "unavailable", "reason": "rate_limited" }` | Consulta sin resultado utilizable. |
| 400 | Error de validación de Fastify o `{ "error": "hostname_invalido" }` | Petición inválida. |

Motivos de indisponibilidad: `not_found`, `rate_limited`, `timeout`, `missing_configuration`, `invalid_response`, `no_analysis` y `upstream_error`. Las respuestas del endpoint incluyen `Cache-Control: no-store`. La consulta espera hasta cinco segundos y se hace una vez.

## 5. Privacidad y operación

`VIRUSTOTAL_API_KEY` se configura en el entorno del backend. El destino HTTP es fijo y las redirecciones se rechazan. El endpoint está pensado para el desarrollo local y una consulta solicitada por la persona. Los dominios privados conocidos se filtran por nombre. El cliente debe consultar únicamente sitios públicos aptos para compartirse con VirusTotal, pues el proveedor puede incorporar indicadores consultados a su conjunto de datos. Antes de publicar el endpoint, el equipo debe definir los controles de acceso y los límites de uso con la cuota contratada.

## 6. Preguntas abiertas

Los umbrales para transformar recuentos en niveles y la política de conservación se acuerdan en las tareas 26 y 25. El informe corresponde a la raíz del sitio, por lo que la extensión debe explicar ese alcance al mostrarlo.

## 7. Historial

2026-11-18. Contrato inicial de consulta y estado degradado.
