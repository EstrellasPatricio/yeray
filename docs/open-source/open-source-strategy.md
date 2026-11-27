# Estrategia de código abierto de Yeray

**Proyecto:** Yeray  
**Estado:** propuesta para la práctica 9; apertura pendiente  
**Responsables del documento:** Salma y Alejandro

## Propósito

Yeray es una extensión en desarrollo cuyo objetivo es ayudar a las personas a navegar con mayor seguridad. Proponemos abrir su código para que una comunidad externa pueda colaborar en su evolución, ayudar a detectar errores y mejorar la seguridad. También esperamos aprender de las aportaciones de otros desarrolladores.

La funcionalidad principal de la extensión estará disponible gratuitamente para sus usuarios. En el futuro podrían desarrollarse funcionalidades adicionales de pago cuyo código no sería abierto. Todavía no se han definido cuáles serían esas funcionalidades ni cómo se integrarían con la parte abierta; también queda por decidir cómo asumir los costes de los servicios necesarios para su funcionamiento. Nos gustaría mantener el proyecto después de la asignatura, aunque su continuidad dependerá del tiempo del equipo y de la participación de la comunidad.

## Alcance: qué se publica y qué permanece privado

| Elemento | Decisión propuesta | Motivo o condición |
| --- | --- | --- |
| Código de la extensión y del backend correspondiente a la parte abierta | Público | Permitir su revisión y la colaboración, después de comprobar su contenido y las condiciones aplicables a terceros. |
| Posibles funcionalidades adicionales de pago | Privadas en el futuro | Su código no sería abierto; las funcionalidades concretas y su integración están pendientes de definir. |
| Código propio de conexión con la API de IA | Público | Facilitar la revisión y colaboración; las claves y credenciales permanecen privadas. |
| Pruebas y páginas simuladas para distintos niveles de peligro | Públicas | Siempre que no incluyan datos sensibles y estén identificadas como pruebas. |
| Documentación de instalación, uso y colaboración | Pública | Facilitar que otras personas utilicen el proyecto y sepan cómo participar. |
| Funcionalidades incompletas de la parte abierta | Públicas, identificadas como experimentales o pendientes | Permitir contribuciones sin presentar como terminadas funciones que aún no lo están. |
| Credenciales, claves, tokens y configuración sensible | Privados | Evitar accesos no autorizados y filtraciones. |
| Datos sensibles de la base de datos y de usuarios, historiales y reportes reales | Privados | Proteger la privacidad y la información del proyecto. |
| Instrucciones, skills y configuración de MCP utilizadas internamente para desarrollar con IA | Privadas | Mantener fuera la documentación y configuración interna de desarrollo con IA, según la decisión del equipo. |
| Materiales de terceros | Pendiente de revisión | Publicarlos únicamente si sus condiciones lo permiten. |

Antes de abrir el repositorio, se deberá revisar tanto su contenido actual como su historial. Si hacen falta ejemplos de reportes o páginas para realizar pruebas, se decidirá más adelante si se crean datos ficticios para ese fin. Los materiales publicados no deberán contener información sensible. La licencia de la parte abierta y la revisión de las dependencias se coordinarán con los equipos responsables, teniendo en cuenta cómo podrían integrarse los futuros componentes privados.

## Usuarios y comunidad

**Personas usuarias:** cualquier persona que quiera navegar con mayor seguridad, con independencia de su experiencia técnica.

**Colaboradores que queremos atraer:** personas con conocimientos intermedios o avanzados de desarrollo de software, especialmente de extensiones de navegador y ciberseguridad. Al principio nos interesan las pruebas de seguridad, la detección de problemas y las propuestas de mejora.

Para facilitar su incorporación será necesario explicar la estructura del proyecto, documentar cómo instalarlo y ejecutarlo y hacer visibles las tareas disponibles y el estado de las funcionalidades.

## Estado actual y limitaciones

Yeray se encuentra en una fase inicial de desarrollo. El equipo identifica trabajo en la interfaz, la conexión entre la extensión y el backend y la documentación. **Queda pendiente verificar el estado exacto de cada una:** su existencia no implica que estén terminadas o funcionen completamente.

La integración con IA todavía no está disponible. Antes de incorporarla y probarla será necesario valorar los límites de peticiones y los posibles costes de las API. Una persona externa podría encontrar dificultades para entender el código, localizar tareas, configurar futuros servicios de IA y distinguir entre funciones terminadas y simuladas o incompletas.

Actualmente también hay dificultades de organización: participan muchas personas y es necesario mejorar la coordinación del trabajo, las ramas, la estructura del repositorio, la documentación y las revisiones de pull requests.

**Decisión:** el proyecto aún no está preparado para abrirse. Primero se abordarán las prioridades siguientes y se revisarán las condiciones de publicación con el resto del equipo.

## Prioridades antes de abrir el proyecto

1. **Proteger la información y revisar el alcance.** Identificar y excluir credenciales y datos sensibles, revisar el contenido y el historial, y comprobar los derechos sobre materiales de terceros. Así se reduce el riesgo de filtraciones y de publicar contenido sin autorización.
2. **Organizar el repositorio y la colaboración.** Acordar la estructura del código, ordenar las ramas y definir cómo se distribuyen las tareas y se revisan los cambios. Esto facilita la coordinación del equipo y la incorporación de colaboradores externos.
3. **Planificar el uso y el coste de las API.** Estimar el consumo para las pruebas y el uso de la IA, comprobar límites de peticiones y estudiar cómo financiar el servicio gratuito. Esto permite anticipar interrupciones y valorar su sostenibilidad.

## Riesgos y acciones pendientes

| Riesgo | Acción pendiente |
| --- | --- |
| Exposición de credenciales o datos de usuarios. | Revisar el repositorio y su historial; sustituir datos sensibles por ejemplos seguros cuando corresponda. |
| Confusión sobre las capacidades de Yeray o confianza excesiva en una función incompleta. | Comprobar y comunicar qué está disponible, qué es experimental y cuáles son sus limitaciones. |
| Dificultad para coordinar contribuciones de un equipo numeroso. | Definir y documentar la organización de tareas, ramas y revisiones. |
| Límites o costes de las API incompatibles con el servicio gratuito. | Estimar el uso, definir una estrategia de pruebas y estudiar financiación con el equipo de sostenibilidad. |

## Referencias de formato

- [Requivo: Open-source strategy](https://github.com/jbkkz/requivo/blob/main/docs/open-source-strategy.md): ejemplo de estrategia con el mismo nombre, organizada en torno al motivo de apertura y la separación de componentes y datos públicos y privados.
- [The Open Source Way: Building a Strategy](https://guidebook.theopensourceway.org/getting-started/building-a-strategy): guía para definir el propósito, los usuarios, los colaboradores y las barreras de participación.
- [SVT: Open Source Release checklist](https://github.com/svt/open-source-project-template/blob/main/opensource-checklist.md): referencia para la revisión previa de documentación, licencias y datos sensibles en el historial.
