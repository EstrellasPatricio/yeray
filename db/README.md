# Base de datos (PostgreSQL / Supabase)

Este directorio contiene el esquema SQL ejecutable de Yeray (`db/schema.sql`), generado a partir del modelo de datos en `db/model.dbml`.

## Cómo aplicar `db/schema.sql` en un proyecto nuevo de Supabase

1. **Crear el proyecto en Supabase**
   - Entra en [supabase.com](https://supabase.com) y crea un proyecto nuevo para **Yeray**.
   - En **Data access**, asegúrate de tener habilitado **Enable Data API** y **Grant API access to new tables automatically** (si activas **Enable RLS on new tables automatically**, el backend deberá usar la clave `service_role` / `secret`).

2. **Ejecutar el esquema SQL**
   - En el menú lateral izquierdo de Supabase, abre **SQL Editor** → **New query**.
   - Copia todo el contenido de `db/schema.sql`, pégalo en el editor y pulsa **Run**.
   - Debe finalizar con `Success. No rows returned`.
   - Comprueba en **Table Editor** que se han creado las 11 tablas (`users`, `sessions`, `password_reset_tokens`, `domains`, `domain_exceptions`, `reviews`, `api_quota_usage`, `analyses`, `user_history`, `analysis_results` y `cookie_findings`).

3. **Configurar las variables de entorno del backend**
   - En `backend/`, crea el archivo `.env` a partir de `backend/.env.example`.
   - En Supabase, ve a **Project Settings → API** (o **API Keys**) y copia:
     - `SUPABASE_URL`: la **Project URL** base (por ejemplo `https://<tu-proyecto>.supabase.co`, sin añadir `/rest/v1/`).
     - `SUPABASE_KEY`: la clave del proyecto (clave `secret` / `service_role` para el backend).
   - Nunca subas `backend/.env` al repositorio.

4. **Arrancar el backend con Docker Compose y comprobar**
   ```bash
   cd backend
   docker compose up -d --build
   ```
   - `docker compose ps` debe mostrar el servicio `yeray_backend` en estado `(healthy)` gracias a `GET /ping`.
   - `GET http://localhost:3000/ping` verifica únicamente que Fastify está escuchando (`{"status":"ok","message":"Backend corriendo"}`).
   - `GET http://localhost:3000/ready` comprueba la conexión real con Supabase consultando la tabla `domains`:
     - Si la base de datos y las tablas están listas, responde `200 OK` con `{"status":"ok","database":"connected"}`.
     - Si aún no se ha aplicado `db/schema.sql` o Supabase no está accesible, el backend sigue arrancando sin caerse y `/ready` responde `503` con `{"status":"error","message":"Base de datos no disponible","database":"disconnected"}`.
