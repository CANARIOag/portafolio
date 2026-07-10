# Portafolio MSN — Alejandro Gabba

Portafolio personal estilo **MSN Messenger 7.5 + Windows XP**, con ventanas
draggables, contactos, chats secuenciales por proyecto, juegos clásicos
(Buscaminas y Tetris) y una mini-demo interactiva del **ERP CANARYTEX**.

- **Escritorio Windows XP** con barra de tareas, reloj y menú Inicio.
- **Ventanas estilo MSN**: arrastrables, redimensionables, minimizar/maximizar/cerrar, z-index y cascada.
- **Chats por proyecto**: mensajes automáticos con efecto de escritura (typing) y respuestas secuenciales.
- **5 secciones**:
  - E-Commerce (PHP / SQL)
  - Sistema de Inventario (Python)
  - Juego de Mesa (JS / DB)
  - **ERP CANARYTEX** — FastAPI / PostgreSQL / WhatsApp, con mini-demo embebida (stock, clientes, cuenta corriente, stats).
  - Sobre mí / CV
- **Minijuegos**: Buscaminas y Tetris funcionales.
- **Accesibilidad**: skip link, ARIA roles, focus visible, soporte `prefers-reduced-motion`, teclado (Enter/Esc/Ctrl+K).
- **SEO + PWA mínimo**: meta Open Graph, manifest, favicon SVG, theme-color.
- **Responsive** hasta 480px.


```powershell
npx serve .
# o
python -m http.server 8000
```

## 📁 Estructura

```
.
├── index.html        # estructura del UI y chats
├── styles.css        # tema MSN/XP + demo ERP (dark/dorado)
├── script.js         # lógica: ventanas, chats, juegos, demo ERP
├── manifest.webmanifest
├── assets/
│   ├── img/          # íconos, perfil, favicon
│   ├── sounds/       # msn-messenger.mp3, msn-nudge.mp3
│   └── cv/           # CV en PDF
└── .github/
    └── copilot-instructions.md
```

## 👤 Autor

**Alejandro Gabba** — Desarrollador Full Stack
- GitHub: [@CANARIOag](https://github.com/CANARIOag)

## 📝 Licencia

Uso personal del autor. Íconos, sonidos y "Bliss" pertenecen a sus respectivos dueños.
