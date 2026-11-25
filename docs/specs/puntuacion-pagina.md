# Puntuación de peligrosidad de una página (tareas #29 y #30)

| Campo | Valor |
| --- | --- |
| Estado | En revisión |
| Responsable | Suito (#30). La extensión la envía desde la tarea #29 de Salma |
| Pareja y revisión | Adri y Manu |
| Depende de | PR #14 (esquema y cliente de Supabase) |

## Contrato HTTP

`POST /page-scores` con `Content-Type: application/json`:

```json
{ "hostname": "tienda.example.com", "score": 72 }
```

- `hostname`: el dominio de la pestaña (`URL.hostname`), como en `POST /reputation`. No se envía la ruta, la consulta ni el fragmento.
- `score`: entero de 0 (segura) a 100 (muy peligrosa), el valor de la barra "Peligrosidad de la página".

| HTTP | Cuerpo | Cuándo |
| --- | --- | --- |
| 201 | `{ "id": 3, "hostname": "tienda.example.com", "score": 72, "createdAt": "2026-11-25T10:00:00" }` | Puntuación guardada |
| 400 | Error de validación de Fastify | Falta un campo o `score` no es un entero de 0 a 100 |
| 400 | `{ "error": "hostname_invalido" }` | IP, nombre sin dominio, dominio privado o reservado, o datos de URL en `hostname` |
| 503 | `{ "error": "almacenamiento_no_disponible" }` | Supabase no responde o no está configurado. El detalle queda en el log del servidor |

Las respuestas llevan `Cache-Control: no-store`.

## Datos

Tabla `page_scores` (`db/schema.sql`): `domain_id`, `score` (0-100, comprobado también en la base de datos) y `created_at`. El dominio se reutiliza de `domains`. Para bases de datos que ya tenían el esquema anterior está `db/migrations/2026-11-25-page-scores.sql`.

Solo se guardan el dominio y la puntuación. El formulario también tiene etiquetas, texto seleccionado y detalles, pero son texto libre que puede contener datos personales, así que se guardarán cuando se decida su tratamiento en la tarea #31 (RGPD).

## Preguntas abiertas

1. Sin login, cualquiera puede enviar puntuaciones. Cuando exista la autenticación conviene asociarlas al usuario o limitar los envíos.
2. Para integrarlo desde el popup, `CORS_ORIGIN` debe incluir `chrome-extension://<id>`.
3. Falta un endpoint de lectura (por ejemplo, la media por dominio) si se quiere mostrar la valoración de la comunidad.
