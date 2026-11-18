# Extensión Yeray (WXT + React)

## Requisitos y comandos

El proyecto usa pnpm (ver `pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev            # extensión en modo desarrollo (Chrome)
pnpm compile        # comprobación de tipos
pnpm test           # pruebas con Vitest (fakeBrowser de WXT)
pnpm build          # compilación en .output/chrome-mv3
```

Para probarla, carga `.output/chrome-mv3` como extensión sin empaquetar desde `chrome://extensions`.

## Variables de entorno

Copia `.env.example` como `.env`. No pongas secretos: las variables `WXT_` acaban dentro del código de la extensión.

| Variable | Uso |
| --- | --- |
| `WXT_API_BASE_URL` | URL base de la API principal. Por defecto `http://localhost:3000`. |
| `WXT_AUTH_MOCK` | `true` usa un cliente de autenticación simulado que no necesita backend. |

## Autenticación

- `utils/auth/contract.ts`: contrato con el backend (endpoints, tipos y códigos de error).
- `utils/auth/http-client.ts` y `utils/auth/mock-client.ts`: cliente real y simulado con la misma interfaz.
- `utils/auth/session.ts`: inicio y cierre de sesión, y recuperación de la sesión al abrir el popup.
- `utils/storage/auth-storage.ts`: acceso a `chrome.storage`. El access token se guarda en `storage.session` y el refresh token en `storage.local`. La contraseña no se guarda nunca.
- `components/account/`: vista de cuenta del popup, basada en la maqueta del equipo.
