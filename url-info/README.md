# URL-INFO

Cómo obtener la URL de la página en el navegador del cliente **respetando la privacidad**.

## Enfoque

Usamos `window.location` de JavaScript y **limpiamos los datos sensibles antes de enviarlos al servidor**.

> Acceder a la URL de la propia página es una función estándar del navegador y **no requiere permisos invasivos**.

## Flujo

```javascript
// Obtener la URL actual mediante la API estándar URL
const urlActual = new URL(window.location.href);

// Construir una versión limpia sin parámetros de consulta (?id=123) ni fragmentos (#token)
const urlLimpia = `${urlActual.origin}${urlActual.pathname}`;

console.log(urlLimpia);
```

## Otras partes útiles de la URL

| Propiedad                  | Descripción                          | Ejemplo           |
| -------------------------- | ------------------------------------ | ----------------- |
| `window.location.protocol` | Protocolo web utilizado              | `https:`          |
| `window.location.host`     | Dominio y puerto                     | `ejemplo.com:3000`|
| `window.location.hostname` | Solo el dominio                      | `ejemplo.com`     |
| `window.location.pathname` | Ruta de la página                    | `/ruta/pagina`    |
| `window.location.search`   | Parámetros GET                       | `?id=123`         |
| `window.location.hash`     | Ancla o fragmento                    | `#seccion`        |
| `window.location.origin`   | Protocolo + dominio + puerto         | `https://ejemplo.com:3000` |
| `window.location.port`     | Solo el puerto                       | `3000`            |
| `url.username` / `url.password` | Credenciales incluidas en la URL (solo en el objeto `URL`) | `https://usuario:clave@ejemplo.com` |

> Si la URL lleva credenciales (`username` / `password`), es un motivo más para **limpiarla antes de enviarla** al servidor.

## Leer parámetros con `URLSearchParams`

En lugar de trocear `location.search` a mano:

```javascript
const params = new URLSearchParams(window.location.search);

params.get('id');      // "123"
params.has('debug');   // true / false
params.getAll('tag');  // todos los valores si el parámetro se repite
```

## Privacidad

- **El `#hash` nunca llega al servidor** en la petición HTTP: solo existe en el navegador (por eso a veces se usa para tokens, p. ej. en OAuth, así no quedan guardados en los logs del servidor). Solo lo guardaría si utilizamos window.location.hash y lo acaba enviando.
- **`document.referrer`** indica desde qué página viene el usuario, aunque puede llegar vacío o recortado según la `Referrer-Policy`.

  | Política | Si el usuario está en tu web y pincha un enlace a otra, esta recibe... |
  | --- | --- |
  | Sin restricción | `https://tuweb.com/perfil?id=123&email=pepe@...` (todo) |
  | `strict-origin-when-cross-origin` | `https://tuweb.com/` (solo el dominio) |
  | `no-referrer` | Nada |
- **`Referrer-Policy`**: evita que los sitios a los que enlazas reciban tu URL completa:

  ```html
  <meta name="referrer" content="strict-origin-when-cross-origin">
  ```

  Es el valor por defecto en los navegadores modernos.
- **Lo que no se puede leer**: la URL de **otras pestañas** ni la de un **iframe de otro dominio**. La *same-origin policy* lo bloquea; para eso haría falta una extensión del navegador con permisos.

  Una página solo puede acceder a datos de otra si comparten **origen** (mismo protocolo, dominio y puerto):

  | Desde `https://tuweb.com` intentas leer... | ¿Se puede? |
  | --- | --- |
  | `https://tuweb.com/otra-pagina` | ✅ Mismo origen |
  | `http://tuweb.com` | ❌ Cambia el protocolo |
  | `https://api.tuweb.com` | ❌ Cambia el dominio (el subdominio cuenta) |
  | `https://tuweb.com:8080` | ❌ Cambia el puerto |


> Una extensión del navegador **sí puede ver las URLs de todas las pestañas**, pero solo si el usuario la instala y **acepta ese permiso explícitamente**. Una página web normal nunca puede hacerlo.
