# URL-INFO

Cómo obtener la URL de la página visitada desde la extensión de Yerai **respetando la privacidad** y enviar al backend solo los datos necesarios para analizar el sitio.

## Enfoque

Un script de contenido puede leer `window.location` de la página en la que se ejecuta. El `window.location` del popup, en cambio, corresponde al propio popup: para obtener la URL de la tienda desde allí hay que consultar la pestaña activa con la API del navegador.

La primera versión propuesta analiza la reputación del sitio cuando la persona abre el popup. Con el permiso `activeTab`, la extensión puede obtener temporalmente la URL de esa pestaña. No necesita leer las demás pestañas. Un análisis automático de las páginas visitadas requeriría definir por separado el alcance y los permisos de los scripts de contenido.

**La extensión envía al backend el nombre del host y el protocolo para que analice el sitio.** No envía la URL completa, la ruta, los parámetros de consulta ni el fragmento. Las claves de los servicios de reputación permanecen en el backend.

## Flujo

1. La persona abre el popup y solicita analizar la tienda.
2. La extensión obtiene la URL de la pestaña activa. Si no hay acceso a ella, informa de que no puede analizarla.
3. Acepta solo URL `http:` o `https:` y extrae `hostname` y `protocol`.
4. Envía esos dos campos al backend en la petición de análisis.
5. El backend valida la entrada, descarta destinos locales o privados, consulta las fuentes de reputación necesarias y devuelve un resultado orientativo.

Ejemplo de extracción a partir de la URL de la pestaña activa:

```javascript
const [pestana] = await browser.tabs.query({ active: true, currentWindow: true });
if (!pestana?.url) {
  throw new Error('No se puede obtener la URL de esta pestaña');
}

const urlActual = new URL(pestana.url);

if (urlActual.protocol !== 'http:' && urlActual.protocol !== 'https:') {
  throw new Error('Esta página no se puede analizar');
}

const datosParaElBackend = {
  hostname: urlActual.hostname,
  protocolo: urlActual.protocol.slice(0, -1),
};
```

**Contenido propuesto de la petición al backend:**

```json
{
  "hostname": "tienda.ejemplo.com",
  "protocolo": "https"
}
```

El endpoint y esta petición todavía no están implementados. El backend debe volver a validar ambos campos; la comprobación hecha en la extensión no sustituye la validación del servidor.

En un script de contenido, la misma URL se puede obtener con `new URL(window.location.href)`. La expresión `${urlActual.origin}${urlActual.pathname}` elimina la consulta y el fragmento, pero **no garantiza que la ruta sea anónima**: `/pedido/cliente@example.com` seguiría conteniendo un dato personal. Por eso la ruta no se envía en el flujo propuesto.

## Otras partes útiles de la URL

| Propiedad | Descripción | Ejemplo | ¿Se envía al backend? |
| --- | --- | --- | --- |
| `url.protocol` | Protocolo web utilizado | `https:` | Sí, como `https` |
| `url.host` | Dominio y puerto | `ejemplo.com:3000` | No |
| `url.hostname` | Nombre del host, incluido el subdominio | `tienda.ejemplo.com` | Sí |
| `url.pathname` | Ruta de la página | `/ruta/pagina` | No |
| `url.search` | Parámetros de consulta | `?id=123` | No |
| `url.hash` | Fragmento | `#seccion` | No |
| `url.origin` | Protocolo, dominio y puerto | `https://ejemplo.com:3000` | No |
| `url.port` | Puerto | `3000` | No |
| `url.username` / `url.password` | Credenciales incluidas en la URL | `https://usuario:clave@ejemplo.com` | No |

## Leer parámetros con `URLSearchParams`

Si una funcionalidad futura necesita interpretar parámetros, se utiliza `URLSearchParams` en lugar de dividir `search` manualmente:

```javascript
const params = new URLSearchParams(urlActual.search);

params.get('id');      // Primer valor de id
params.has('debug');   // true o false
params.getAll('tag');  // Todos los valores si se repite tag
```

Leer un parámetro localmente no implica enviarlo al backend. Cualquier dato adicional que se quiera transmitir deberá justificarse y documentarse.

## Privacidad

- El fragmento `#hash` no se incluye en la petición HTTP de esa URL. JavaScript sí puede leerlo y enviarlo expresamente; Yerai no lo enviará.
- `document.referrer` puede indicar de dónde llegó la persona, pero puede estar vacío o limitado por la política del sitio. No es necesario para este análisis y Yerai no lo enviará.
- La política `strict-origin-when-cross-origin` es la predeterminada cuando el sitio no define otra. Su efecto depende del destino:

  | Destino de la petición | Información de referencia enviada desde `https://tuweb.com/perfil?id=123` |
  | --- | --- |
  | Mismo origen | URL con ruta y consulta, sin fragmento |
  | Otro origen HTTPS | Solo el origen `https://tuweb.com/` |
  | Destino HTTP | Ninguna |

  Una web puede establecer otra `Referrer-Policy`. La extensión no puede imponer una etiqueta `<meta name="referrer">` a todas las tiendas que visita la persona.
- Una página web normal no puede enumerar las pestañas ni leer directamente el documento de un iframe de otro origen. La *same-origin policy* considera el protocolo, el dominio y el puerto. Esta limitación del código de la página no describe por sí sola los permisos de una extensión:

  | Desde `https://tuweb.com` se intenta leer directamente un documento en... | ¿Comparte origen? |
  | --- | --- |
  | `https://tuweb.com/otra-pagina` | Sí |
  | `http://tuweb.com` | No: cambia el protocolo |
  | `https://api.tuweb.com` | No: cambia el subdominio |
  | `https://tuweb.com:8080` | No: cambia el puerto |

  Compartir origen permite acceder a un documento del que la página tenga una referencia, por ejemplo un iframe; no permite enumerar pestañas arbitrarias.
- Una extensión puede obtener la URL de la pestaña activa con `activeTab` tras la acción de la persona. El permiso `tabs` o permisos de sitios conceden un alcance mayor. Si se implementa análisis automático con WXT, habrá que definir los patrones `matches` de los scripts de contenido y explicar qué páginas se analizarán.

## Fuentes

- [Chrome: permiso `activeTab`](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) y [API de pestañas](https://developer.chrome.com/docs/extensions/reference/api/tabs).
- [WXT: entradas de popup y scripts de contenido](https://wxt.dev/guide/essentials/entrypoints).
- [MDN: partes de una URL](https://developer.mozilla.org/en-US/docs/Web/API/Location), [fragmentos](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment) y [`Referrer-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy).
