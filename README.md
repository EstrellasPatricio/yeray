# Yerai

**Yerai** es un proyecto de extensión de navegador para ayudar a identificar riesgos al visitar tiendas en línea. Combina señales de reputación, análisis del contenido de la página y explicaciones comprensibles para que la persona pueda decidir con más información antes de comprar.

> **Estado:** fase inicial de desarrollo. El repositorio remoto todavía no contiene una versión ejecutable; la arquitectura y las funcionalidades descritas a continuación son las previstas por el equipo y pueden evolucionar.

## Qué se quiere construir

- Evaluar el dominio y su reputación para detectar posibles indicios de fraude o suplantación.
- Mostrar advertencias graduadas según el riesgo y permitir que el usuario tome la decisión final.
- Analizar, durante la navegación, información de productos, condiciones de compra y devolución, y posibles patrones engañosos.
- Presentar los hallazgos con lenguaje claro desde el popup de la extensión y, cuando proceda, dentro de la página.
- Recoger reportes voluntarios de los usuarios para mejorar la detección.

Los resultados son **orientativos**: una valoración favorable no garantiza que una tienda sea segura.

## Arquitectura prevista

| Componente | Tecnologías elegidas | Responsabilidad prevista |
| --- | --- | --- |
| Extensión | TypeScript, WXT, React | Popup, interfaz inyectada y lógica de segundo plano |
| API principal | TypeScript, Fastify | Coordinar análisis y servicios externos |
| Datos y autenticación | PostgreSQL, Supabase | Persistencia y gestión de usuarios |
| Servicio de IA | Python, FastAPI | Análisis de contenido y señales de riesgo |
| Caché del servidor | Redis | Reutilizar resultados y reducir latencia y consultas externas |

Flujo previsto:

```text
Página visitada
    │
    ▼
Extensión (content script ↔ background ↔ popup)
    │
    ▼
API principal ──► reputación externa / servicio de IA
    │
    ├──► PostgreSQL / Supabase
    └──► Redis
```

La integración con VirusTotal se ha estudiado como una fuente de reputación. Su uso deberá respetar las cuotas y condiciones de la API aplicables. Las claves de servicios externos pertenecen al servidor y nunca deben incluirse en la extensión ni en el repositorio.

## Organización prevista de la extensión

WXT compilará los puntos de entrada de un mismo proyecto:

- `entrypoints/popup/`: interfaz de la extensión, preferencias y consulta de resultados.
- `entrypoints/content/`: interfaz insertada en la página y observación de su contenido.
- `entrypoints/background.ts`: comunicación con la API y tareas de segundo plano.
- Componentes, tipos y utilidades compartidos entre ambas interfaces.

Esta estructura es una guía de partida, no un árbol de archivos que ya exista en el repositorio.

### Almacenamiento en el navegador

La propuesta para Manifest V3 usa `chrome.storage` mediante una capa de acceso compartida:

| Área | Uso previsto |
| --- | --- |
| `storage.sync` | Preferencias ligeras, tema, nivel de seguridad y excepciones |
| `storage.local` | Caché local de análisis de URLs |
| `storage.session` | Estado temporal de la interfaz y sesión |

Los resultados en caché tendrán caducidad; la propuesta inicial es de **dos horas**. El equipo deberá revisar permisos, límites de almacenamiento y tratamiento de datos antes de publicar la extensión.

## Desarrollo y colaboración

El trabajo se organiza en sprints. Cada cambio debe describir qué hace, cómo se ha comprobado y, cuando corresponda, incluir pruebas y revisión por otra persona antes de integrarse.

Cuando se incorporen los primeros componentes ejecutables, este README se ampliará con requisitos previos, variables de entorno **sin valores secretos**, comandos de instalación, pruebas y pasos para cargar la extensión en el navegador.

## Equipo

Proyecto de **Las Estrellas Patricio**.
