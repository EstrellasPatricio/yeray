# Tres páginas de prueba

Desde la raíz del repositorio, ejecuta:

```sh
node backend/demo/reputation.mjs
```

Abre las tres versiones de la tienda ficticia:

- [Caso de riesgo bajo](http://127.0.0.1:3001/bajo): precio, envío, contacto y devoluciones claros.
- [Caso sospechoso](http://127.0.0.1:3001/sospechoso): descuento exagerado, urgencia y condiciones ambiguas.
- [Caso de riesgo alto](http://127.0.0.1:3001/alto): transferencia urgente y solicitud de credenciales bancarias.

Son páginas estáticas de ejemplo; los botones no realizan compras ni recogen datos. No hay análisis de IA, puntuación ni llamadas externas. El servidor solo escucha en la máquina local y se detiene con Ctrl+C.
