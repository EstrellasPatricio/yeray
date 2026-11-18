# Plan de implementación del simulador de VirusTotal

> **Para agentes:** SUB-SKILL OBLIGATORIA: usa superpowers:executing-plans para implementar este plan tarea a tarea. Los pasos usan la sintaxis de casillas (`- [ ]`) para el seguimiento.

**Objetivo:** Añadir una función de backend que reciba la URL de un sitio y devuelva una puntuación ficticia, un entero aleatorio entre 0 y 100.

**Arquitectura:** Un servicio TypeScript independiente valida que la URL sea solo del sitio y genera una puntuación con `Math.random`. El test runner de Node, cargado mediante la dependencia `tsx` ya existente, prueba el contrato sin servicios externos.

**Stack técnico:** TypeScript, Node.js, `tsx`; backend Fastify existente (sin cambios en las rutas).

**Especificación:** `docs/superpowers/specs/2026-11-18-virustotal-simulador-design.md`

## Restricciones globales

- No transmitir ni conservar rutas visitadas, consultas, fragmentos, credenciales ni puertos.
- No llamar a VirusTotal, a Supabase ni a la red.
- No añadir un endpoint HTTP en este cambio.

## Puntos de revisión

- Cadena que no es una URL, protocolo distinto de `http`/`https` o nombre de host sin punto: se rechaza con `TypeError`.
- URL del sitio con ruta distinta de `/`, consulta, fragmento, credenciales o puerto: se rechaza con `TypeError`. `https://ejemplo.com` y `https://ejemplo.com/` se aceptan.
- `localhost`, dominios con sufijo local o interno (`.localhost`, `.local`, `.internal`, `.lan`, `.home.arpa`, `.corp`, `.intranet`) y cualquier IP literal, pública o privada: se rechazan con `TypeError`.
- Extremos del valor aleatorio: si `Math.random()` devuelve 0, la puntuación es 0; si devuelve el mayor valor posible por debajo de 1, la puntuación es 100.
- Puntuación devuelta: siempre un entero en [0, 100].

---

### Tarea 1: Implementar el servicio simulador

**Archivos:**
- Crear: `backend/src/services/virustotal-simulator.ts`
- Crear: `backend/src/services/virustotal-simulator.test.ts`
- Modificar: `backend/package.json` (añadir el script `test`)

**Interfaces:**
- Produce: `simularVirusTotal(url: string): number`.

- [x] **Paso 1: Escribir tests que fallen** para URLs de sitio HTTP y HTTPS aceptadas, URLs inválidas, partes de URL prohibidas, hosts locales o internos e IP literales, límites del valor aleatorio y rango entero.
- [x] **Paso 2: Ejecutar `npm test` en `backend`** y confirmar que los tests fallan porque la función no existe.
- [x] **Paso 3: Implementar `simularVirusTotal(url: string): number`** usando `URL` para el análisis, validando antes de generar la puntuación y con `Math.floor(Math.random() * 101)` para obtener un entero entre 0 y 100, ambos incluidos.
- [x] **Paso 4: Ejecutar `npm test` y `npm run build`** en `backend`; ambos deben terminar con código 0.
- [x] **Paso 5: Revisar el diff** frente a la especificación y hacer commit del cambio en `codex/virustotal-simulador`.
