## Estructura y organización del repositorio

* **Estado actual:**

  * El proyecto tiene carpetas como `frontend-yeray`, `backend/`, `docs/` y `url-info/`, con documentación dispersa y partes de `docs/` usadas actualmente como apoyo para el desarrollo con IA.
* **Problemas detectados:**

  * La carpeta `frontend-yeray` no usa un nombre genérico coherente con el resto del proyecto.
  * El nombre «Yeray» aparece escrito también como «Yerai» en varios sitios.
  * La carpeta `docs/` contiene material de apoyo para el desarrollo con IA en lugar de documentación propia del proyecto, y `url-info` está fuera de `docs/`.
  * Faltan archivos `README` específicos en `backend/` y en `frontend/`.
* **Decisiones y acciones pendientes:**

  * Renombrar la carpeta `frontend-yeray` a `frontend` para que sea más coherente y fácil de mantener.
  * Revisar y unificar la grafía de «Yeray» para dejarlo siempre con «y».
  * Retirar de `docs/` el contenido de apoyo para el desarrollo con IA y dedicarla a documentación propia del proyecto (como `CONTRIBUTING.md` y `LICENSE.md`), moviendo `url-info` dentro de `docs/` para reunir toda la documentación en un único lugar.
  * Añadir un `README` específico en `backend/` y en `frontend/` con lo necesario para trabajar con cada parte (requisitos, instalación, ejecución y pruebas).

## Secretos, credenciales y datos sensibles

* **Estado actual:** En las ramas y el historial de GIT no hay claves API, tokens ni archivos `.env` subidos al repositorio. Solo existen plantillas vacías (`backend/.env.example` y `frontend-yeray/.env.example`).
* **Problemas detectados:**

  * `frontend-yeray/.gitignore` no ignora los archivos `.env` (a diferencia de `backend/.gitignore`), y tampoco hay un `.gitignore` en la raíz, por lo que alguien podría subir credenciales por error.
  * En el historial de commits aparecen correos reales de varios integrantes (`@uma.es`, `@gmail.com`) y en algunos tests del frontend se usan correos ficticios con dominio `@uma.es` en lugar de `@example.com`.
* **Decisiones y acciones pendientes:**

  * Añadir `.env` y `.env.\\\\\\\*` (dejando fuera `.env.example`) al `.gitignore` de `frontend-yeray/` y crear un `.gitignore` en la raíz antes de abrir el proyecto.
  * Activar *Secret Scanning* y *Push Protection* en GitHub para bloquear cualquier subida accidental de claves.
  * Cambiar los correos de prueba de los tests por `@example.com` y recomendar el uso del correo privado (`noreply`) de GitHub.

## Dependencias y licencias de terceros

* **Estado actual:**

  * **Librerías del código:** Las herramientas principales que usamos en backend y frontend (Fastify, React, WXT, Supabase JS) son de código abierto y gratuitas, compatibles con publicar Yeray como Open Source.
  * **Servicios externos:** La aplicación depende de APIs de terceros como **VirusTotal** y **Supabase**, que no son código libre, sino servicios externos con sus propios términos de uso y cuotas limitadas.
* **Problemas detectados:**

  * El repositorio no tiene un archivo `LICENSE` general y hay incoherencia entre carpetas (el backend indica licencia `ISC` y el frontend no indica ninguna).
  * En el frontend falta confirmar que ninguna de las librerías instaladas tenga condiciones incompatibles con la licencia que elija el equipo.
  * **Condiciones de VirusTotal y servicios externos:** La API gratuita de VirusTotal tiene límites estrictos de uso y restricciones. Al abrir el proyecto al público, cada persona que lo despliegue tendrá que usar su propia cuenta y respetar esas condiciones.
* **Decisiones y acciones pendientes:**

  * Documentar claramente en el `README` que servicios como **VirusTotal** o **Supabase** son dependencias externas sujetas a sus propias condiciones y cuotas, y que cada usuario debe aportar sus propias claves.

## Configuración de la aplicación y gestión de parámetros

* **Estado actual:**

  * Los datos que cambian según el entorno no están puestos directamente en el código.
  * En el backend existe un archivo `.env.example` con las variables necesarias (puerto, origen permitido para CORS y claves de VirusTotal y Supabase), y el `.env` real está ignorado por Git.
  * Hay valores por defecto configurados: puerto `3000` para el backend y `http://localhost:5173` para CORS.
* **Problemas detectados:**

  * Falta explicar mejor en el `README` cómo crear el archivo `.env`, qué variables son obligatorias y cuáles son opcionales.
  * Al arrancar el backend no se comprueba que las variables importantes existen y tienen un valor correcto, lo que puede provocar errores difíciles de entender.
* **Decisiones y acciones pendientes:**

  * Documentar en el `README` cómo crear el archivo `.env`, diferenciando qué variables son obligatorias y cuáles opcionales.
  * Añadir una validación al arrancar el backend para comprobar que las variables importantes existen y tienen un valor correcto.

## Tests, CI/CD y automatización de comprobaciones

* **Estado actual:**

  * El backend cuenta con pruebas iniciales, pero todavía con cobertura insuficiente, y el frontend carece de comprobaciones básicas automatizadas.
* **Problemas detectados:**

  * En backend la cobertura de tests actual es insuficiente.
  * En frontend faltan tests sencillos que aseguren al menos que el proyecto compila correctamente.
  * No existe un formateo automático que garantice un estilo uniforme al integrar cambios en `backend` y `frontend`.
* **Decisiones y acciones pendientes:**

  * **Backend:** Completar los tests y, una vez completados, crear un workflow de CI que los ejecute en cada PR.
  * **Frontend:** Añadir un par de tests sencillos que, como mínimo, verifiquen que el proyecto compila correctamente.
  * **Backend y frontend:** Añadir un workflow de CI que formatee el código automáticamente al mergear PRs, manteniendo un estilo uniforme sin depender de revisiones manuales.

## Riesgos técnicos a resolver antes de publicar

1. **Que se suban claves privadas por error**

   * **Riesgo:** Al usar servicios externos como VirusTotal y Supabase, se podría subir por accidente una clave real al repositorio.
   * **Impacto:** Otra persona podría usar esa clave o acceder a servicios del proyecto.
   * **Acción pendiente:** Mantener siempre el `.env` fuera de Git, usar solo `.env.example` sin datos reales y revisar el historial del repositorio por si alguna clave se hubiera subido anteriormente.
2. **Que la configuración esté mal o incompleta**

   * **Riesgo:** Que falten variables como `VIRUSTOTAL\_API\_KEY`, `SUPABASE\_URL` o `SUPABASE\_KEY`, o que `CORS\_ORIGIN` esté mal configurado.
   * **Impacto:** Algunas partes del proyecto pueden dejar de funcionar y el frontend podría no comunicarse correctamente con el backend.
   * **Acción pendiente:** Documentar mejor la configuración y validar las variables cuando se inicia la aplicación.
3. **Que un cambio rompa alguna funcionalidad y no se detecte**

   * **Riesgo:** Aunque el backend tiene algunas comprobaciones automáticas y tests, el frontend todavía tiene pocos tests automáticos.
   * **Impacto:** Se podría hacer un cambio que rompa alguna parte del popup, los reportes o la interacción con la página sin detectarlo antes de subirlo.
   * **Acción pendiente:** Añadir más tests al frontend y hacer que se ejecuten automáticamente antes de aceptar cambios.

