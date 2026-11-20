# Especificación del backend — API principal de Yerai

| Campo | Valor |
| --- | --- |
| Estado | Borrador <!-- Borrador · En revisión · Aprobada · Obsoleta --> |
| Responsable(s) | <!-- TODO: nombre(s) --> |
| Revisores | <!-- TODO: al menos una persona distinta del autor --> |
| Sprint | <!-- TODO --> |
| Última actualización | <!-- AAAA-MM-DD --> |
| Issues / PR relacionados | <!-- TODO: enlaces --> |

> Cómo usar esta plantilla: rellena cada sección a medida que se tomen decisiones y borra los comentarios `<!-- -->`. Si una sección aún no está decidida, escribe «Pendiente»; no la borres. Las dudas van en [Preguntas abiertas](#7-preguntas-abiertas).

---

## 1. Contexto y objetivo

<!-- Qué problema resuelve el backend y para quién. 3–5 frases. -->

Extensión de navegador basada en IA que intercepta la navegación hacia una tienda en línea y realiza un análisis preliminar antes de cargarla. Examina la legitimidad del dominio, su reputación, posibles indicios de suplantación y otros patrones engañosos.

### 1.1 Objetivos

- 

### 1.2 Fuera de alcance

- 

---

## 2. Requisitos

### 2.1 Requisitos funcionales

| ID | Descripción | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- |
| RF-01 | | | |

### 2.2 Requisitos no funcionales

| ID | Categoría | Requisito |
| --- | --- | --- |
| RNF-01 | Seguridad | Las claves de servicios externos solo existen en el servidor; nunca en la extensión ni en el repositorio |
| RNF-02 | | |

---

## 3. Arquitectura

Tecnologías elegidas (según el README):

| Componente | Tecnología |
| --- | --- |
| API principal | TypeScript, Fastify |
| Datos y autenticación | PostgreSQL, Supabase |
| Servicio de IA | Python, FastAPI |
| Caché del servidor | Redis |

<!-- Componentes, responsabilidades y flujos, cuando estén definidos. -->

---

## 4. API

<!-- Endpoints, peticiones, respuestas y errores, cuando estén definidos. -->

---

## 5. Datos

<!-- Modelo de datos, migraciones y políticas de acceso, cuando estén definidos. -->

---

## 6. Seguridad y privacidad

<!-- Autenticación, validación de entradas, datos personales, gestión de secretos. -->

---

## 7. Preguntas abiertas

| # | Pregunta | Responsable | Estado |
| --- | --- | --- | --- |
| 1 | | | Abierta |

---

## 8. Historial de cambios

| Fecha | Autor | Cambio |
| --- | --- | --- |
| <!-- AAAA-MM-DD --> | | Versión inicial |
