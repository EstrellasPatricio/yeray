# Contrato de la API de autenticación (extensión y backend)

Estado: implementado en el frontend (PR #9) con un cliente simulado. Pendiente de implementar en el backend.
Fuente de verdad en código: `frontend-yeray/utils/auth/contract.ts`.

## Endpoints

Base: `WXT_API_BASE_URL` (por defecto `http://localhost:3000`). Todo es `POST` con `Content-Type: application/json`.

| Ruta | Cuerpo | Respuesta correcta |
| --- | --- | --- |
| `/auth/register` | `{ email, password }` | `201` con `AuthResponse`, o `202` con `{ confirmationRequired: true, email }` si hay que confirmar el correo |
| `/auth/login` | `{ email, password }` | `200` con `AuthResponse` |
| `/auth/refresh` | `{ refreshToken }` | `200` con `AuthResponse`. Rota el refresh token: el anterior deja de valer |
| `/auth/logout` | `{ refreshToken }` y cabecera `Authorization: Bearer <accessToken>` si el cliente lo tiene | `204` sin cuerpo. Idempotente: también `204` si el token ya no existe |

```json
{
  "user": { "id": "3f1c…", "email": "ana@uma.es" },
  "tokens": {
    "accessToken": "eyJ…",
    "refreshToken": "v1.M…",
    "accessTokenExpiresIn": 3600
  }
}
```

- `user.id` puede ser texto (uuid) o número. El cliente lo guarda como texto.
- `accessTokenExpiresIn` está en segundos. El cliente calcula la caducidad con su propio reloj.

## Errores

Cualquier error responde con un estado 4xx/5xx y un cuerpo `{ "code": "...", "message": "..." }`. La interfaz elige el mensaje por `code`, y `message` es solo para depuración.

| `code` | Estado | Cuándo |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Cuerpo mal formado, correo no válido o contraseña fuera de la política |
| `INVALID_CREDENTIALS` | 401 | Login con correo o contraseña incorrectos. Mismo código si el correo no existe |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token caducado, revocado o desconocido |
| `UNAUTHORIZED` | 401 | Endpoints protegidos: access token ausente, caducado o no válido |
| `EMAIL_NOT_CONFIRMED` | 403 | Login de una cuenta sin confirmar |
| `EMAIL_ALREADY_REGISTERED` | 409 | Registro con un correo que ya tiene cuenta |
| `RATE_LIMITED` | 429 | Demasiados intentos |
| `INTERNAL_ERROR` | 500 | Error no controlado |

Si falta `code`, el cliente deduce el error por el estado: 400 es validación, 401 en login son credenciales, 401 en refresh es token inválido, 429 es límite y 5xx es error del servidor. También reconoce el error de validación por defecto de Fastify (`FST_ERR_VALIDATION`). Aun así, conviene devolver siempre `code`.

## Reglas compartidas con el frontend

- Contraseña al registrarse: de 8 a 72 caracteres, con al menos una letra y un número. El frontend ya lo valida, pero el backend debe repetir la validación.
- El correo se compara sin distinguir mayúsculas y sin espacios exteriores.
- Endpoints protegidos futuros: cabecera `Authorization: Bearer <accessToken>`, y `401` con `UNAUTHORIZED` si no vale. El cliente refresca una vez y repite la petición (`utils/api/authorized-fetch.ts`).
- CORS: el popup llama desde `chrome-extension://<id>`. Desde la PR #11 el backend solo admite los orígenes de `CORS_ORIGIN` (por defecto `http://localhost:5173`), así que hay que añadir ahí el origen de la extensión. El id aparece en `chrome://extensions` y cambia si se carga desde otra carpeta, salvo que se fije una clave en el manifest.
- Puertos: el servidor de desarrollo de WXT usa el 3100, así que el 3000 queda para la API.

## Notas para implementarlo con Fastify y Supabase

Comprobad los nombres exactos en la versión instalada de `@supabase/supabase-js`.

| Endpoint | Llamada de Supabase Auth | Adaptación |
| --- | --- | --- |
| register | `auth.signUp({ email, password })` | Si `data.session` es `null` (confirmación de correo activa), responder `202` con `{ confirmationRequired: true, email }` |
| login | `auth.signInWithPassword({ email, password })` | Credenciales incorrectas se convierten en `INVALID_CREDENTIALS` y correo sin confirmar en `EMAIL_NOT_CONFIRMED` |
| refresh | `auth.refreshSession({ refresh_token })` | Si hay error, `INVALID_REFRESH_TOKEN` |
| logout | `auth.admin.signOut(accessToken)` | Necesita el access token de la cabecera y la clave de servicio, que solo vive en el servidor. Si no llega cabecera, responder `204` igualmente |

- Traducir la sesión de Supabase al formato del contrato: `access_token` pasa a `accessToken`, `refresh_token` a `refreshToken` y `expires_in` a `accessTokenExpiresIn`.
- Usar un cliente de Supabase sin persistencia de sesión en el servidor, para no mezclar usuarios entre peticiones.
- Un `setErrorHandler` de Fastify puede traducir los errores a `{ code, message }`, incluidos los de validación de esquemas.

## Cómo probar la extensión contra el backend

En `frontend-yeray/.env` poned `WXT_AUTH_MOCK=false` y `WXT_API_BASE_URL=http://localhost:3000`. Después `pnpm build` (o `pnpm dev`) y recargad la extensión. El flujo a comprobar es crear cuenta, reabrir el popup, cerrar sesión, contraseña incorrecta e iniciar sesión.
