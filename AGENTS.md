# Instrucciones del repositorio

Esta guía se aplica a todo el repositorio. Si una carpeta incorpora su propio `AGENTS.md`, sus instrucciones concretan las de este archivo para esa carpeta.

## Contexto y estado actual

Yerai es un proyecto de extensión de navegador para ayudar a detectar indicios de riesgo en tiendas en línea y explicar los hallazgos a la persona usuaria. Los resultados serán orientativos: una valoración favorable no garantizará que una tienda sea segura.

El repositorio todavía está en una fase inicial. Comprobar los archivos y la rama de trabajo antes de describir componentes como implementados o proponer comandos. La arquitectura prevista incluye una extensión con TypeScript, WXT y React; una API con TypeScript y Fastify; PostgreSQL y Supabase; un servicio de análisis con Python y FastAPI; y Redis. Son decisiones previstas, no evidencia de código o servicios existentes.

## Idioma y forma de trabajar

- Escribir respuestas, documentación, comentarios y textos dirigidos a usuarios en español. Conservar los nombres públicos, identificadores y términos exigidos por herramientas o bibliotecas.
- Evitar emojis en documentación, código, ejemplos y mensajes del producto.
- Leer los archivos afectados y comprobar el estado de Git antes de modificar. Trabajar en una rama específica para cada cambio y mantener el alcance solicitado.
- Preferir soluciones simples y reutilizar lo existente antes de añadir dependencias, capas o servicios.
- Distinguir entre funcionalidades previstas, prototipos y comportamiento realmente implementado. Mantener la documentación coherente con el código de la rama.
- No atribuir al proyecto comandos de instalación, compilación o pruebas hasta que existan sus manifiestos y configuración. Consultar las versiones declaradas antes de usar APIs concretas.

## Gestor de paquetes y licencias

- Usar siempre `pnpm` para instalar dependencias y ejecutar scripts de los componentes Node.js. No usar `npm` ni `yarn` para estas tareas. Mantener `pnpm-lock.yaml` como único archivo de bloqueo de cada componente Node.js y fijar la versión de pnpm en `packageManager` cuando se cree su `package.json`.
- Aplicar la misma elección en los ejemplos, la documentación, los contenedores y la integración continua. En CI, instalar con `pnpm install --frozen-lockfile`.
- Añadir únicamente bibliotecas cuyas licencias sean compatibles con GNU GPL versión 3, para preservar la opción de distribuir Yerai bajo esa licencia. Comprobar la licencia de cada dependencia nueva, incluidas las transitivas relevantes, y sus obligaciones de atribución o distribución antes de incorporarla. Las licencias permisivas compatibles, como MIT, ISC, BSD modificada y Apache-2.0, también pueden utilizarse; no exigir que cada biblioteca tenga licencia GPLv3.
- Si la licencia es desconocida, tiene excepciones o su compatibilidad con GPLv3 no está clara, resolverlo antes de incorporar la biblioteca. Conservar los avisos de licencia exigidos al distribuir el proyecto.

## Consultar documentación actual

Usar Context7 MCP cuando el trabajo requiera información sobre una biblioteca, framework, SDK, API, herramienta de línea de comandos o servicio en la nube, incluso si resulta familiar. Esto incluye sintaxis, configuración, migraciones, depuración específica, instalación y comandos.

1. Resolver primero la biblioteca con `resolve-library-id`, indicando qué concepto se necesita; omitir este paso solo si ya se proporciona un identificador exacto `/org/project`.
2. Elegir la coincidencia más pertinente por nombre, descripción, fragmentos disponibles, reputación de la fuente y puntuación. Preferir la versión específica cuando se conozca.
3. Consultar `query-docs` con una pregunta concreta por concepto. Separar las consultas de conceptos distintos, salvo que se necesite entender su interacción.
4. Basar la respuesta o el cambio en la documentación obtenida.

La refactorización sin cambios de API, los scripts escritos desde cero, la lógica de negocio, la revisión de código y los conceptos generales de programación no requieren Context7 por sí solos.

## Límites de la extensión y seguridad

- Mantener las claves de VirusTotal y de otros servicios externos en el servidor. No incluir secretos en la extensión, en archivos versionados ni en ejemplos con valores reales.
- Tratar el contenido de las páginas visitadas, las URL y los reportes como datos externos. Validar las entradas en el límite que las recibe y evitar registrar datos personales innecesarios.
- No presentar una señal aislada o una respuesta de un servicio externo como prueba concluyente de fraude o seguridad. Explicar límites e incertidumbre en los mensajes dirigidos a usuarios.
- Revisar permisos del navegador, datos almacenados y cuotas de servicios externos cuando se implementen las funciones que los utilicen.

## Verificación y entrega

- Para cambios documentales, comprobar rutas, afirmaciones sobre el estado del proyecto y `git diff --check`.
- Para cambios de código, ejecutar las comprobaciones pertinentes que existan en el componente afectado. Añadir pruebas que verifiquen comportamiento relevante; no inventar una suite ni afirmar que pasó una comprobación que no se ejecutó.
- Resumir qué se cambió, cómo se verificó y cualquier limitación material. No incluir cambios ajenos al encargo en el commit o la rama.
