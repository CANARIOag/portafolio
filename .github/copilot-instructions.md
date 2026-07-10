## Instrucciones rápidas para agentes (Repositorio: Portafolio MSN)

Este repositorio es una página estática (portfolio estilo MSN) construida con HTML, CSS y JavaScript vanila. Aquí están los puntos esenciales que un agente debe conocer para ser productivo inmediatamente.

### Arquitectura y componentes clave
- `index.html` — estructura del UI: un `div#desktop` contenedor con una `main-window` y varias `chat-window` identificadas por `id` (por ejemplo `chat-ecommerce`). Las entradas de la lista de contactos usan `data-chat` para referenciar el `id` del chat a abrir.  
- `script.js` — lógica: inicialización DOM, apertura de ventanas de chat, manejo de eventos (click en `.contact`, envío de mensajes, emoticonos, zumbido, arrastre). Busca prefijos de log `MSN:` en consola para rastrear el flujo.  
- `styles.css` — tema visual y variables CSS (`:root`) — rutas de assets en `assets/img` y `assets/cv`.

### Flujo de datos y patrones observables
- Apertura de chat: las entradas `.contact` tienen `data-chat="<chat-id>"`; el script hace `document.getElementById(chatId)` y llama a `openChatWindow(win)`. Ejemplo en `index.html`: `<div class="contact" data-chat="chat-ecommerce">`.
- Inicialización única: `script.js` usa `win.dataset.inited` para marcar ventanas inicializadas. Nota importante: en HTML las ventanas usan `data-init="false"` (sin la 'ed'), así que existe una discrepancia entre `data-init` y el dataset `inited`. Evitar asumir que `dataset.init` y `dataset.inited` están sincronizados — revisalo si modificás la inicialización.
- Mensajes automáticos: `autoReplies` en `script.js` contiene ejemplos por `chat-id`. Para simular contenido, el script agrega mensajes con `appendMessage(chatArea, 'project', m)`.
- Sanitización mínima: `appendMessage` realiza un escape básico (reemplaza `<` por `&lt;`) pero re-habilita etiquetas `<a>` y `<img>` sustituyendo texto escapado. Si añades entrada de usuario en HTML, evita inyectar HTML sin revisión.

### Convenciones de desarrollo y debugging
- No hay build system: es una app estática. Para desarrollo abre `index.html` en el navegador o usa la extensión "Live Server" (VS Code).  
- Depuración: consola del navegador. El archivo `script.js` imprime avisos y errores con el prefijo `MSN:` — búsquelos para diagnosticar problemas.  
- Acciones rápidas:  
  - Abrir en Chrome/Edge y abrir DevTools → pestaña Console/Elements.  
  - Verificar que `#desktop` exista (script advierte si falta).  

### Riesgos, quirks y puntos a verificar antes de editar
- Discrepancia `data-init` vs `dataset.inited`: revisar antes de cambiar la lógica de inicialización de ventanas.  
- Inserción de HTML desde mensajes: `appendMessage` permite `<a>` y `<img>`; evita aceptar HTML arbitrario del usuario o añade sanitización adicional.  
- Dependencia de recursos externos: fondo de pantalla en `styles.css` usa una URL externa; para trabajo offline reemplazar por un asset local (`assets/img/...`).

### Reglas de edición recomendadas (para agentes)
- Mantener mensajes y textos en español (el proyecto usa `lang="es"` y cadenas en español).  
- Respetar la estructura DOM: event listeners dependen de clases y atributos (`.contact`, `.chat-window`, `.message-input`, `.send`). Cualquier renombrado debe actualizar `index.html` y `script.js` juntos.  
- Al agregar features, preferir modificar `script.js` (único archivo JS) y documentar cambios con comentarios que empiecen por `MSN:` para seguir la convención de logs.

### Archivos a revisar cuando necesites contexto
- `index.html` — puntos de anclaje DOM y rutas de assets.  
- `script.js` — flujo de interacción, helpers (`makeDraggable`, `appendMessage`, `playBuzzSound`).  
- `styles.css` — variables CSS y clases que afectan layout/animaciones.

Si algo no está claro o querés que complete secciones de ejemplos (p. ej. small refactor para corregir `data-init`→`data-inited`), decime y actualizo el archivo con un cambio propuesto o un parche automático.
