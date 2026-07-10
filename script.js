// ════════════════════════════════════════════════════════════════
//  Portafolio MSN 7.5 + Windows XP — script.js (edición senior)
//  Alejandro Gabba · Full Stack Developer
//  Bot system con personalidad · typing indicator · timestamps
//  ERP CANARYTEX demo interactiva · Web Audio · minijuegos
// ════════════════════════════════════════════════════════════════

(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  // ── utilidades globales ─────────────────────────────────────
  const $  = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const rand = arr => arr[Math.floor(Math.random()*arr.length)];
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const nowTime = () => new Date().toLocaleTimeString('es-AR', {hour:'2-digit',minute:'2-digit'});

  // ── audio (Web Audio API sintético + mp3 fallback) ──────────
  let audioCtx = null;
  function getAudioCtx(){
    if(!audioCtx){
      try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ audioCtx=null; }
    }
    return audioCtx;
  }
  function tone(freq, dur, type='sine', vol=0.15){
    const ctx = getAudioCtx(); if(!ctx) return;
    if(ctx.state==='suspended') ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  }
  function playNudgeSound(){
    // secuencia de 3 tonos descendentes (estilo MSN nudge)
    tone(880, 0.08, 'square', 0.12);
    setTimeout(()=> tone(660, 0.08, 'square', 0.12), 90);
    setTimeout(()=> tone(440, 0.12, 'square', 0.10), 180);
    // fallback mp3
    try{ const a = document.getElementById('msn-nudge'); if(a){ a.currentTime=0; a.play().catch(()=>{}); } }catch(e){}
  }
  function playMessageSound(){
    tone(1318, 0.06, 'sine', 0.08); // E6 corto
    try{ const a = document.getElementById('msn-message-snd'); if(a){ a.currentTime=0; a.play().catch(()=>{}); } }catch(e){}
  }
  function playLoginSound(){
    // arpegio ascendente
    [523, 659, 784, 1047].forEach((f,i) => setTimeout(()=> tone(f, 0.15, 'sine', 0.10), i*80));
  }

  function init(){
    try{
      console.log('%c═══ Portafolio MSN · senior edition ═══', 'color:#0066cc;font-size:14px;font-weight:700;');
      setupBootLogin();
      setupChat();
      setupErpDemo();
      setupGames();
      setupTaskbar();
      console.log('%c✓ Init completo', 'color:#2fd17a;font-weight:700;');
    }catch(e){
      console.error('Init error:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  SECCIÓN 1 — BOOT XP + LOGIN MSN
  // ═══════════════════════════════════════════════════════════
  function setupBootLogin(){
    const boot = $('#boot-screen'), login = $('#login-screen'), welcome = $('#welcome-toast');
    let phase = 'boot';

    function goLogin(){
      if(phase!=='boot') return; phase='login';
      if(boot) boot.style.display='none';
      if(login) login.style.display='flex';
    }
    function goDesktop(){
      if(phase!=='login') return; phase='desktop';
      if(login){ login.classList.add('logging-in'); setTimeout(()=> login.style.display='none', 500); }
      playLoginSound();
      if(welcome){ welcome.style.display='flex'; setTimeout(()=> welcome.style.display='none', 5500); }
      // unlock audio context on user gesture
      getAudioCtx();
    }

    // boot → login a los 3.5s
    if(boot){
      boot.addEventListener('animationend', e => { if(e.animationName==='bootFadeOut') goLogin(); });
    }
    setTimeout(goLogin, 4000);

    // login → desktop
    const btn = $('#login-btn'), pass = $('#login-pass');
    function doLogin(){
      const st = $('.login-status');
      if(st) st.innerHTML = '<span class="login-dot"></span> Verificando credenciales...';
      setTimeout(goDesktop, 700);
    }
    btn?.addEventListener('click', e=>{ e.preventDefault(); doLogin(); });
    pass?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); doLogin(); } });
  }

  // ═══════════════════════════════════════════════════════════
  //  SECCIÓN 2 — SISTEMA DE CHAT (bots con personalidad)
  // ═══════════════════════════════════════════════════════════

  // Cada bot tiene: nombre, avatar (emoji), estado, mensajes de bienvenida,
  // y respuestas por keyword. Si nada matchea, usa una fallback genérica.

  const BOTS = {
    'chat-ecommerce': {
      name: 'Tienda Online', emoji: '🛒',
      welcome: [
        '👋 ¡Hey! Soy el bot del proyecto E-Commerce. Dale, preguntame lo que quieras.',
        '🛒 Es una plataforma de ventas completa: carrito, checkout, panel admin, gestión de productos y pedidos.',
        'Stack: **PHP puro** (sin framework), **MySQL**, **JavaScript** vanilla para el frontend y **CSS** a mano.'
      ],
      keywords: {
        'carrito|checkout|pago': [
          '🛒 El carrito usa sesiones de PHP. El checkout valida stock en tiempo real antes de confirmar.',
          '💰 Integré una pasarela de pagos con webhooks para actualizar el estado del pedido automáticamente.'
        ],
        'admin|panel|dashboard': [
          '📊 El panel admin tiene CRUD de productos, gestión de pedidos, y métricas básicas (ventas del día, top productos).',
          '🔐 Login con sesiones + hash bcrypt. Roles: admin y vendedor, con permisos distintos.'
        ],
        'stock|inventario': [
          '📦 Cada producto tiene stock. Al venderse, descuenta con una transacción SQL — no se pisa nada.',
          '⚠️ Si alguien intenta comprar más de lo que hay, el checkout lo bloquea antes de cobrar.'
        ],
        'seguridad|security|sql injection|xss': [
          '🔒 Prepared statements en todas las queries (PDO). Nunca concatené SQL a mano.',
          '🛡️ Output escapado en el frontend, CSRF tokens en formularios, y rate limiting en el login.'
        ],
        'tecnolog|stack|php|mysql|framework': [
          'Stack: **PHP 8** procedural con PDO, **MySQL 8**, **JavaScript** vanilla, **CSS3** sin framework.',
          'Decidí no usar framework porque el proyecto era chico y quería control total. En algo más grande usaría Laravel.'
        ],
        'url|link|demo|repositorio|github|repo': [
          '🔗 Es un proyecto privado por ahora, pero si querés ver código pedímelo y te paso un extracto.'
        ]
      },
      fallback: [
        '👍 Buena pregunta. Si querés saber más del e-commerce, probá preguntando por: carrito, panel admin, stock, seguridad o stack.',
        '🤔 Decime más específico. Te puedo contar sobre el checkout, el panel admin, la base de datos o la seguridad.'
      ]
    },

    'chat-inventario': {
      name: 'Sistema de Inventario', emoji: '📦',
      welcome: [
        '📦 ¡Hola! Soy el bot del Sistema de Inventario y Facturación. Es un ERP de escritorio en Python.',
        ' Fue hecho para una empresa que manejaba todo en Excel y perdía mercadería. Ahora tiene trazabilidad unidad por unidad.'
      ],
      keywords: {
        'trazabilidad|unidad|pieza|lote': [
          '🔍 Cada unidad física tiene un ID único. No existen duplicados — el sistema no deja dar de alta dos piezas con el mismo identificador.',
          '📋 Cuando vendés, el sistema sabe exactamente qué lote y qué unidad salió. Podés rastrear cualquier metro de tela hasta su origen.'
        ],
        'remito|comprobante|pdf|imprimir': [
          '📄 Los remitos se generan con **Pillow** (PIL). Armo el PDF dibujando texto y tablas píxel por píxel.',
          '🖨️ El remito tiene encabezado configurable, tabla de artículos, totales y términos. Se imprime directo desde la app.'
        ],
        'base de dato|sql server|bd|transaccion': [
          '🗄️ **SQL Server** con transacciones explícitas. El stock se descuenta dentro de una transacción — si algo falla, rollback y no se pierde nada.',
          '🔗 Uso **pyodbc** para conectar. Las queries están parametrizadas para evitar SQL injection.'
        ],
        'cliente|crm|cuenta corriente|saldo|deuda': [
          '👥 Cada cliente tiene su historia: compras, pagos, saldo, condiciones especiales (descuentos, plazo de pago).',
          '💰 La cuenta corriente calcula saldos automáticamente. Sabe si un cliente debe, desde cuándo, y si tiene saldo a favor.'
        ],
        'python|tkinter|desktop|escritorio': [
          '🐍 La app es de escritorio con **Tkinter**. Es feo, sí, pero corre en cualquier PC con Windows sin instalar nada raro.',
          '⚙️ **Python 3** + Tkinter + pyodbc + Pillow. Todo en un .exe empaquetado con PyInstaller.'
        ],
        'problema|challenge|dificil|error|bug': [
          '🧠 El desafío más grande fue la trazabilidad: que el sistema nunca duplique una unidad física. Lo resolví con un ID compuesto (artículo + lote + número correlativo) y un UNIQUE constraint en la BD.',
          '🐛 Otro problema: la concurrencia. Dos vendedores vendiendo la misma tela al mismo tiempo. Lo resolví con SELECT ... WITH (UPDLOCK) dentro de la transacción.'
        ]
      },
      fallback: [
        '👍 Probá preguntar por: trazabilidad, remitos, base de datos, clientes, o los challenges del proyecto.',
        '🤔 Te puedo contar sobre la trazabilidad, los remitos con Pillow, SQL Server, o los problemas que resolví.'
      ]
    },

    'chat-juego': {
      name: 'Juego de Mesa', emoji: '🎲',
      welcome: [
        '🎲 ¡Bienvenido al Juego de Mesa digital! Es un juego de mesa clásico adaptado a web.',
        '🎮 Tiene reglas, sistema de turnos, interacción visual y persistencia en base de datos.',
        '🛠️ Stack: **JavaScript** vanilla + **MySQL** para guardar partidas y rankings.'
      ],
      keywords: {
        'turno|turnos|regla|reglas': [
          '⏱️ El sistema de turnos usa un state machine. Cada turno tiene fases: tirar dados → mover → resolver casilla → pasar turno.',
          '📜 Las reglas están codificadas como funciones puras. Cada acción valida el estado antes de ejecutarse.'
        ],
        'base de dato|bd|mysql|partida|guardar': [
          '💾 Las partidas se guardan en MySQL. Podés pausar y retomar después — el estado se serializa a JSON.',
          '🏆 Hay una tabla de rankings con ELO-style: ganás puntos por ganar, perdés por perder, ponderado por el nivel del rival.'
        ],
        'multiplayer|multijugador|online|red': [
          '🌐 No es multiplayer en tiempo real — es hot-seat (dos jugadores en la misma PC). Para online habría que meter WebSocket.',
        ],
        'diseño|ui|interfaz|grafico': [
          '🎨 El tablero se renderiza con CSS Grid. Las fichas son divs absolutos que se animan con transitions.',
          '🎲 Los dados son animación CSS 3D con transform rotateX/Y. Suena tonto pero queda lindo.'
        ]
      },
      fallback: [
        '🎲 Probá preguntar por: turnos, reglas, base de datos, multiplayer, o el diseño del tablero.',
        '🤔 Te puedo contar sobre el sistema de turnos, cómo se guardan las partidas, o cómo hice el tablero visual.'
      ]
    },

    'chat-sistemaempresas': {
      name: 'ERP CANARYTEX', emoji: '🧵',
      welcome: [
        '🧵 Soy el bot del **ERP CANARYTEX** — el sistema más grande que construí y mantengo.',
        ' Es un ERP para una textil: inventario, pedidos, remitos, facturación, clientes, telares, tintorería y WhatsApp.',
        '📈 Empezó reemplazando Excel y ahora maneja toda la operación. Abajo tenés una **demo interactiva** con datos reales del sistema.'
      ],
      keywords: {
        'backend|fastapi|python|api|endpoint': [
          '⚙️ Backend en **FastAPI** (Python). ~30 routers, JWT con refresh, rate limiting con slowapi, CORS configurable.',
          '🗄️ **PostgreSQL** con **Alembic** para migraciones. Modelos en SQLAlchemy 2.0 con typed columns.',
          '🔐 Autenticación JWT + bcrypt. Roles: owner, admin, vendedor, operario. Cada rol ve distintos endpoints.'
        ],
        'inventario|stock|fifo|trazabilidad': [
          '📦 Inventario físico: cada **metro de tela** es identificable. Artículo + color + lote + número de pieza = ID único.',
          '📊 El stock sale con **FIFO** — primero que entró, primero que sale. El sistema sabe qué lote entregarle a cada cliente.',
          '🔍 Trazabilidad total: podés saber de qué telar salió una tela, cuándo pasó por tintorería, y a quién se le vendió.'
        ],
        'whatsapp|automation|automatico|cron|scheduler': [
          '🔔 **APScheduler** corre dos jobs: cada hora libera pedidos vencidos y manda WhatsApp a los que están por vencer.',
          '📱 WhatsApp usa **Evolution API** (self-hosted). El cron arma el mensaje según cuántos días falten y lo envía vía HTTP.',
          '💬 Si un pedido vence en 3 días, manda un 🔴. Si vence en 7, un 🟡. Si ya venció, libera el stock y avisa.'
        ],
        'remito|factura|pdf|pillow': [
          '📄 Remitos generados con **Pillow** (PIL) — dibujo el PDF píxel por píxel: encabezado, tabla, totales, términos.',
          '🧾 Facturación con alícuotas de IVA configurables. El sistema calcula subtotales, IVA y total automáticamente.',
          '🎨 El remito es **personalizable**: fuente, tamaño, colores, alineación del encabezado y columnas visibles — todo configurable desde el admin.'
        ],
        'telar|telares|produccion|tela': [
          '🧵 Módulo de **Telares**: registra producción por telar, operario y turno. Cada metros producidos se suma al stock.',
          '📊 Métricas: metros por telar/día, eficiencia, paros. El dueño ve qué telar produce más y cuál hay que revisar.'
        ],
        'tintoreria|tinte|color': [
          '🎨 Módulo de **Tintorería**: envíos de tela a tintorería externa con seguimiento de estado (enviado → en proceso → recibido).',
          '🔄 Cuando vuelve la tela, puede volver con otro color. El sistema actualiza el stock y registra el nuevo color.'
        ],
        'front end|frontend|css|chart|three': [
          '🎨 Frontend: HTML5 + CSS a mano (tema dark/dorado), **Chart.js** para gráficos, **Three.js** para una viz 3D del stock.',
          '📱 Es responsive. Uso **Bootstrap** solo para el grid y algunos componentes. El resto es CSS custom.'
        ],
        'backup|seguridad|cron|scheduler|job': [
          '💾 **Backup automático** todos los días a las 03:00 (AR). pg_dump comprimido, rota los últimos 30 días.',
          '🛡️ Rate limiting en login (5 intentos/min), bcrypt en passwords, JWT con expiración de 1h + refresh de 7 días.',
          '📜 **Auditoría**: cada acción sensible (crear/modificar/borrar stock, pedidos, remitos) se loguea con usuario, timestamp e IP.'
        ],
        'challenge|problema|dificil|error|migracion': [
          '🧠 El desafío más grande: migrar de SQLite a PostgreSQL en producción sin downtime. Lo resolví con Alembic + un script de migración dual-write.',
          '🐛 Otro: la concurrencia en el stock. Dos vendedores reservando la misma tela. Lo resolví con `SELECT ... FOR UPDATE` + un campo `reservado` en el stock.',
          '📉 Un bug histórico: el scheduler no arrancaba porque `scheduler.start()` estaba antes de registrar los jobs. Lo moví al final del startup.'
        ],
        'modulo|modulos|que hace|feature|funcional': [
          '📦 Módulos: **Inventario**, **Stock**, **Telares**, **Tintorería**, **Pedidos**, **Remitos**, **Facturas**, **Clientes**, **Empleados**, **RR.HH.**, **Auditoría**, **Reportes**, **Alertas**, **Stats**, **WhatsApp**.',
          '🔧 Cada módulo tiene su router, sus modelos y su schema. Es modular — podés desactivar uno sin romper el resto.'
        ],
        'arquitectura|estructura|diseno|design': [
          '🏗️ Arquitectura: **FastAPI** + **SQLAlchemy** + **Alembic** + **APScheduler** + **pydantic** para schemas.',
          '📁 Estructura: `backend/` (routers, models, schemas, services, utils) + `frontend/public/` (HTML estático servido por FastAPI).',
          '🔄 Los routers son finos — la lógica vive en `services/`. Así los routers son testables y la lógica es reutilizable.'
        ]
      },
      fallback: [
        '🧵 Probá preguntar por: backend, inventario, WhatsApp, remitos, telares, tintorería, backup, arquitectura, o los challenges.',
        '🤔 Te puedo contar sobre el backend (FastAPI), el inventario con FIFO, la automatización con WhatsApp, los remitos con Pillow, o los problemas que resolví.'
      ]
    },

    'chat-sobremi': {
      name: 'Sobre mí', emoji: '👤',
      welcome: [
        '👤 Soy **Alejandro Gabba**, desarrollador Full Stack desde Argentina 🇦🇷.',
        '🧠 Trabajo en sistemas empresariales: ERPs que reemplazan procesos manuales y tienen que andar en serio.',
        '⚙️ Stack principal: **Python**, **FastAPI**, **PHP**, **JavaScript**, **PostgreSQL**, **SQL Server**.',
        '📄 Abajo tenés mi CV en PDF y mi GitHub. Dale, preguntame lo que quieras.'
      ],
      keywords: {
        'experiencia|años|trabajo|trabajé|laboral': [
          '💼 Vengo trabajando en sistemas empresariales hace años. Mi proyecto más grande es el ERP CANARYTEX, que mantengo y evoluciono.',
          '🏭 He hecho desde e-commerce hasta ERPs de escritorio. Me adapto al stack que necesite el negocio.'
        ],
        'stack|tecnolog|python|php|javascript|sql': [
          '🐍 Python es mi lenguaje principal — FastAPI, SQLAlchemy, Pillow, pyodbc, APScheduler.',
          '🐘 Bases de datos: PostgreSQL y SQL Server. Manejo transacciones, migraciones con Alembic, optimización de queries.',
          '🌐 Frontend: HTML/CSS/JS vanilla, Bootstrap, Chart.js. No le tengo miedo al CSS a mano.'
        ],
        'cv|curriculum|pdf|descargar': [
          '📄 Mi CV está en el botón de abajo: **Descargar CV (PDF)**. También está en el menú Inicio → Descargar CV.'
        ],
        'github|repositorio|repo|codigo': [
          '🐙 Mi GitHub es **github.com/CANARIOag**. Ahí está este portafolio y otros proyectos.',
          '🔗 El portafolio que estás viendo está en github.com/CANARIOag/portafolio — 100% HTML/CSS/JS vanilla.'
        ],
        'contacto|email|mail|linkedin|red': [
          '📧 Podés contactarme a **ale_gabba@hotmail.com** o por GitHub.',
          '🇦🇷 Estoy en Argentina. Disponible para trabajo remoto o presencial (CABA).'
        ]
      },
      fallback: [
        '👍 Probá preguntar por: experiencia, stack, CV, GitHub, o contacto.',
        '🤔 Te puedo contar sobre mi experiencia, mi stack técnico, dónde descargás el CV, o cómo contactarme.'
      ]
    }
  };

  // ── estado de ventanas ──────────────────────────────────────
  let zIndexCounter = 1000;
  let activeWin = null;
  let cascade = { top: 80, left: 300 };
  const minimizedArea = $('#minimized-area');

  function bringToFront(win){
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
    if(activeWin && activeWin!==win) activeWin.classList.remove('active');
    win.classList.add('active');
    activeWin = win;
  }

  function setupChat(){
    // contactos
    $$('.contact').forEach(c => {
      const trigger = () => {
        const chatId = c.dataset.chat;
        const action = c.dataset.action;
        if(chatId) openChat(chatId);
        else if(action){
          if(action==='open-minesweeper') createMinesweeperWindow();
          else if(action==='open-tetris') createTetrisWindow();
        }
        // marcar leído
        c.dataset.unread = 'false';
        c.querySelector('.unread-dot')?.remove();
      };
      c.addEventListener('click', trigger);
      c.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); trigger(); } });
    });

    // pre-attach controles de la ventana principal
    const main = $('#main');
    main?.querySelector('.main-minimize')?.addEventListener('click', e=>{ e.stopPropagation(); minimizeWindow(main); });
    main?.querySelector('.main-close')?.addEventListener('click', e=>{ e.stopPropagation(); main.classList.remove('open'); setTimeout(()=> main.style.display='none', 200); });

    // buscador
    const search = $('#contact-search');
    search?.addEventListener('input', ()=>{
      const q = search.value.trim().toLowerCase();
      $$('.contact-list .contact').forEach(c=>{
        const t = c.textContent.trim().toLowerCase();
        c.style.display = (!q || t.includes(q)) ? '' : 'none';
      });
    });
    document.addEventListener('keydown', e=>{
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); search?.focus(); search?.select(); }
    });
  }

  function openChat(chatId){
    const win = chatId && document.getElementById(chatId);
    if(!win) return;
    if(!win.dataset.inited){
      win.style.top = cascade.top + 'px';
      win.style.left = cascade.left + 'px';
      cascade.top += 28; cascade.left += 28;
      if(cascade.top > window.innerHeight - 240) cascade.top = 80;
      if(cascade.left > window.innerWidth - 540) cascade.left = 300;
    }
    win.style.display = 'block';
    requestAnimationFrame(()=> win.classList.add('open'));
    bringToFront(win);

    if(win.dataset.minimized === 'true'){
      win.dataset.minimized = 'false';
      minimizedArea?.querySelector(`[data-win-id="${win.id}"]`)?.remove();
    }
    if(win.dataset.inited === 'true') return;
    win.dataset.inited = 'true';
    initChatWindow(win);
  }
  window.openChatWindow = id => openChat(id);

  function initChatWindow(win){
    const chatArea = win.querySelector('.chat-area');
    const input = win.querySelector('.message-input');
    const sendBtn = win.querySelector('.send');
    const bot = BOTS[win.id];

    // controles de ventana
    win.querySelectorAll('.minimize').forEach(b=> b.addEventListener('click', e=>{ e.stopPropagation(); minimizeWindow(win); }));
    win.querySelectorAll('.close-window').forEach(b=> b.addEventListener('click', e=>{
      e.stopPropagation();
      if(win._msn_game?.destroy) try{ win._msn_game.destroy(); }catch(_){}
      win.classList.remove('open');
      setTimeout(()=> win.style.display='none', 200);
    }));
    win.querySelectorAll('.maximize').forEach(b=> b.addEventListener('click', e=>{ e.stopPropagation(); toggleMaximize(win); }));
    win.addEventListener('mousedown', ()=> bringToFront(win), {passive:true});

    // mensajes de bienvenida
    if(bot && bot.welcome){
      bot.welcome.forEach((m,i) => setTimeout(()=> botReply(chatArea, win, m), 500*(i+1)));
    }

    // emoticonos
    win.querySelectorAll('.show-emoticons').forEach(b=> b.addEventListener('click', ()=>{
      const p = win.querySelector('.emoticons-panel');
      if(p) p.style.display = p.style.display==='grid' ? 'none' : 'grid';
    }));
    win.querySelectorAll('.emoticon').forEach(em=> em.addEventListener('click', ()=>{
      if(!input) return;
      input.value += (input.value ? ' ' : '') + em.textContent;
      input.focus();
      win.querySelector('.emoticons-panel')?.classList.remove('grid');
      const p = win.querySelector('.emoticons-panel'); if(p) p.style.display='none';
    }));

    // zumbido
    win.querySelectorAll('.buzz').forEach(b=> b.addEventListener('click', ()=>{
      win.classList.add('buzzing');
      playNudgeSound();
      setTimeout(()=> win.classList.remove('buzzing'), 650);
      appendMessage(chatArea, 'me', '🔥 ¡Zumbido enviado!', true);
      // el bot "reacciona" al zumbido
      setTimeout(()=> botReply(chatArea, win, rand(['¡Epa! ¿Qué pasa? 😅','¡Zumbido recibido! Decime qué necesitás.','¡Hola! Acá estoy, preguntame.'])), 800);
    }));

    // quick replies
    win.querySelectorAll('.quick-reply').forEach(qr=> qr.addEventListener('click', ()=>{
      if(!input) return;
      input.value = (input.value ? input.value + ' ' : '') + qr.dataset.reply;
      input.focus();
    }));

    // envío de mensajes
    function send(){
      const txt = (input?.value||'').trim();
      if(!txt) return;
      appendMessage(chatArea, 'me', txt, true);
      input.value = '';
      // responder según keywords
      if(bot){
        const reply = matchBot(bot, txt);
        const delay = 600 + Math.random()*800;
        setTimeout(()=> botReply(chatArea, win, reply), delay);
      }
    }
    sendBtn?.addEventListener('click', send);
    input?.addEventListener('keydown', e=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
    });

    makeDraggable(win);
    makeResizable(win);

    // ERP demo
    if(win.id === 'chat-sistemaempresas') initErpDemo(win);
  }

  // ── matching de keywords del bot ───────────────────────────
  function matchBot(bot, text){
    const t = text.toLowerCase();
    for(const [keys, replies] of Object.entries(bot.keywords || {})){
      const re = new RegExp(keys, 'i');
      if(re.test(t)) return rand(replies);
    }
    return rand(bot.fallback || ['👍']);
  }

  // ── bot reply con typing indicator ──────────────────────────
  function botReply(chatArea, win, text){
    if(!chatArea) return;
    // indicador "escribiendo..."
    const typing = document.createElement('div');
    typing.className = 'message project typing-indicator';
    typing.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    chatArea.appendChild(typing);
    chatArea.scrollTop = chatArea.scrollHeight;

    // marcar no leído si la ventana está oculta
    const win2 = chatArea.closest('.msn-window');
    if(win2 && (win2.style.display==='none' || win2.dataset.minimized==='true')){
      const contact = document.querySelector(`.contact[data-chat="${win2.id}"]`);
      if(contact){
        contact.dataset.unread = 'true';
        if(!contact.querySelector('.unread-dot')){
          const dot = document.createElement('span');
          dot.className = 'unread-dot'; dot.setAttribute('aria-hidden','true');
          contact.appendChild(dot);
        }
      }
    }

    // tiempo de "escritura" proporcional al largo del mensaje
    const thinkTime = clamp(text.length * 12, 500, 1800);
    setTimeout(()=>{
      typing.remove();
      appendMessage(chatArea, 'project', text, false);
      playMessageSound();
    }, thinkTime);
  }

  // ── appendMessage (con formato rico + timestamp) ────────────
  function appendMessage(area, type, text, isMe){
    if(!area) return;
    const div = document.createElement('div');
    div.className = 'message ' + (type==='me' ? 'me' : 'project');

    // contenido con formato
    div.innerHTML = formatMessage(text);

    // timestamp
    const ts = document.createElement('small');
    ts.className = 'msg-time';
    ts.textContent = nowTime();
    div.appendChild(ts);

    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  // ── formato de mensaje: **bold**, `code`, listas, separadores ─
  function formatMessage(text){
    let h = esc(text);
    // bloques de código ``` ... ```
    h = h.replace(/```([\s\S]*?)```/g, (_,c) => `<pre class="msg-code">${c}</pre>`);
    // `inline code`
    h = h.replace(/`([^`]+)`/g, '<code class="msg-inline">$1</code>');
    // **bold**
    h = h.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    // *italic* (simple, no anidado con bold)
    h = h.replace(/(?<!\*)\*([^\*]+)\*(?!\*)/g, '<em>$1</em>');
    // URLs
    h = h.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return h;
  }

  // ── drag / resize ───────────────────────────────────────────
  function makeDraggable(win){
    const title = win.querySelector('.title-bar');
    let drag=false, ox=0, oy=0;
    title.addEventListener('mousedown', e=>{
      if(e.target.closest('button')) return;
      if(win.dataset.maximized==='true') return;
      drag=true; bringToFront(win);
      const r = win.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      document.body.style.userSelect='none';
    });
    document.addEventListener('mousemove', e=>{
      if(!drag) return;
      win.style.left = Math.max(6, e.clientX-ox)+'px';
      win.style.top = Math.max(6, e.clientY-oy)+'px';
    });
    document.addEventListener('mouseup', ()=>{ drag=false; document.body.style.userSelect=''; });
    // touch
    title.addEventListener('touchstart', e=>{
      if(e.target.closest('button')) return;
      if(win.dataset.maximized==='true') return;
      drag=true; bringToFront(win);
      const r=win.getBoundingClientRect(), t=e.touches[0];
      ox=t.clientX-r.left; oy=t.clientY-r.top;
    },{passive:true});
    document.addEventListener('touchmove', e=>{
      if(!drag) return; const t=e.touches[0];
      win.style.left=Math.max(6,t.clientX-ox)+'px';
      win.style.top=Math.max(6,t.clientY-oy)+'px';
    },{passive:true});
    document.addEventListener('touchend', ()=>{ drag=false; });
  }

  function makeResizable(win){
    if(win.querySelector('.resize-handle')) return;
    const h = document.createElement('div');
    h.className='resize-handle'; h.title='Redimensionar';
    win.appendChild(h);
    let r=false, sx=0, sy=0, sw=0, sh=0;
    h.addEventListener('mousedown', e=>{
      e.stopPropagation(); r=true; bringToFront(win);
      sx=e.clientX; sy=e.clientY;
      const rc=win.getBoundingClientRect(); sw=rc.width; sh=rc.height;
      document.body.style.userSelect='none';
    });
    document.addEventListener('mousemove', e=>{
      if(!r) return;
      win.style.width=Math.max(300, sw+(e.clientX-sx))+'px';
      win.style.height=Math.max(200, sh+(e.clientY-sy))+'px';
    });
    document.addEventListener('mouseup', ()=>{ r=false; document.body.style.userSelect=''; });
  }

  function toggleMaximize(win){
    if(win.dataset.maximized==='true'){
      win.style.left=win.dataset.restoreLeft||'';
      win.style.top=win.dataset.restoreTop||'';
      win.style.width=win.dataset.restoreWidth||'';
      win.style.height=win.dataset.restoreHeight||'';
      win.dataset.maximized='false';
    } else {
      win.dataset.restoreLeft=win.style.left;
      win.dataset.restoreTop=win.style.top;
      win.dataset.restoreWidth=win.style.width;
      win.dataset.restoreHeight=win.style.height;
      win.style.left='8px'; win.style.top='8px';
      win.style.width=(window.innerWidth-16)+'px';
      win.style.height=(window.innerHeight-64)+'px';
      win.dataset.maximized='true';
      bringToFront(win);
    }
  }

  // ── minimizar / restaurar ───────────────────────────────────
  function minimizeWindow(win){
    if(!win) return;
    const title = (win.querySelector('.title-text')?.textContent || win.id || 'Ventana').slice(0,28);
    if(minimizedArea?.querySelector(`[data-win-id="${win.id}"]`)){
      win.style.display='none'; win.dataset.minimized='true'; return;
    }
    const tr = minimizedArea?.getBoundingClientRect() || {left:8, top:window.innerHeight-44, width:100};
    win.style.transition='transform 400ms ease-in, opacity 400ms ease-in';
    const rc = win.getBoundingClientRect();
    const dx = (tr.left+tr.width/2)-(rc.left+rc.width/2);
    const dy = (tr.top+tr.height/2)-(rc.top+rc.height/2);
    requestAnimationFrame(()=>{ win.style.transform=`translate(${dx}px,${dy}px) scale(0.1)`; win.style.opacity='0'; });
    const btn = document.createElement('button');
    btn.type='button'; btn.className='minimized-window-btn';
    btn.dataset.winId=win.id; btn.textContent=title;
    btn.addEventListener('click', ()=> restoreWindow(win, btn));
    setTimeout(()=>{
      win.style.display='none'; win.style.transform=''; win.style.transition=''; win.style.opacity='';
      win.dataset.minimized='true';
      if(win._msn_game?.stop) try{ win._msn_game.stop(); }catch(_){}
      minimizedArea?.appendChild(btn);
    }, 420);
  }
  function restoreWindow(win, btn){
    win.style.display='block'; win.dataset.minimized='false'; bringToFront(win);
    const tr = minimizedArea?.getBoundingClientRect() || {left:8, top:window.innerHeight-44, width:100};
    const rc = win.getBoundingClientRect();
    const dx=(tr.left+tr.width/2)-(rc.left+rc.width/2);
    const dy=(tr.top+tr.height/2)-(rc.top+rc.height/2);
    win.style.transition='none';
    win.style.transform=`translate(${dx}px,${dy}px) scale(0.1)`; win.style.opacity='0';
    requestAnimationFrame(()=>{
      win.style.transition='transform 420ms cubic-bezier(.2,.9,.3,1), opacity 420ms';
      win.style.transform='translate(0,0) scale(1)'; win.style.opacity='1';
    });
    setTimeout(()=>{
      win.style.transition=''; win.style.transform='';
      btn?.remove();
      if(win._msn_game?.start) try{ win._msn_game.start(); }catch(_){}
    }, 440);
  }

  // ═══════════════════════════════════════════════════════════
  //  SECCIÓN 3 — DEMO ERP CANARYTEX
  // ═══════════════════════════════════════════════════════════
  function setupErpDemo(){
    // se inicializa al abrir el chat del ERP (en initChatWindow)
    // pero dejamos la función accesible
  }

  function initErpDemo(win){
    const panel = win.querySelector('#erp-panel');
    const tabs = win.querySelectorAll('.erp-tab');
    let current = 'overview';

    // datos realistas
    const D = {
      overview: null, // se renderiza directo
      stock: [
        { art:'Gabardina 280g', color:'Negro', lot:'L-1042', pz:120, m:480, st:'ok', price:450 },
        { art:'Microvelour', color:'Camel', lot:'L-1188', pz:64, m:256, st:'ok', price:680 },
        { art:'Drill 240g', color:'Marino', lot:'L-2051', pz:18, m:72, st:'lo', price:520 },
        { art:'Canvas 320g', color:'Crudo', lot:'L-2077', pz:40, m:160, st:'md', price:590 },
        { art:'Lino lavado', color:'Beige', lot:'L-3019', pz:95, m:380, st:'ok', price:720 },
        { art:'Polar 280g', color:'Gris', lot:'L-3055', pz:8, m:32, st:'lo', price:380 },
        { art:'Gabardina 280g', color:'Marino', lot:'L-3102', pz:72, m:288, st:'ok', price:450 },
        { art:'Tweed Premium', color:'Camel', lot:'L-3200', pz:24, m:96, st:'md', price:950 }
      ],
      clientes: [
        { id:1, nom:'Tintorería del Sur', tel:'+54 11 555-1010', cond:'CC 30 días', ped:2, total:1284500 },
        { id:2, nom:'Confecciones Mónaco', tel:'+54 11 555-2233', cond:'Contado', ped:4, total:0 },
        { id:3, nom:'Textil Belgrano S.A.', tel:'+54 11 555-4040', cond:'CC 45 días', ped:0, total:2135000 },
        { id:4, nom:'Distribuidora Norte', tel:'+54 11 555-7711', cond:'CC 30 días', ped:1, total:678900 },
        { id:5, nom:'Fábrica La Unión', tel:'+54 11 555-8855', cond:'Contado', ped:3, total:0 }
      ],
      pedidos: [
        { id:1042, cli:'Confecciones Mónaco', fecha:'08/07', vence:'15/07', items:4, st:'activo', m:288 },
        { id:1043, cli:'Tintorería del Sur', fecha:'07/07', vence:'14/07', items:2, st:'activo', m:120 },
        { id:1041, cli:'Distribuidora Norte', fecha:'05/07', vence:'12/07', items:1, st:'activo', m:96 },
        { id:1039, cli:'Fábrica La Unión', fecha:'03/07', vence:'10/07', items:3, st:'activo', m:180 },
        { id:1038, cli:'Confecciones Mónaco', fecha:'01/07', vence:'08/07', items:6, st:'vencido', m:320 }
      ],
      telares: [
        { id:'T-01', op:'J. Pérez', turno:'Mañana', m:480, st:'ok', ef:92 },
        { id:'T-02', op:'M. Gómez', turno:'Mañana', m:420, st:'ok', ef:88 },
        { id:'T-03', op:'L. Díaz', turno:'Tarde', m:380, st:'ok', ef:85 },
        { id:'T-04', op:'R. Sosa', turno:'Tarde', m:0, st:'stop', ef:0 },
        { id:'T-05', op:'J. Pérez', turno:'Noche', m:350, st:'ok', ef:90 }
      ],
      stats: {
        ventasMes: 12450000, pedidosAct: 7, facturado: 9800000,
        metros: 32000, ticket: 412000, alertas: 3,
        clientes: 47, telares: 5, activos: 4
      },
      ventasSem: [3200000, 2800000, 4100000, 3500000, 2900000, 4800000, 5200000]
    };

    const fmt = n => '$'+n.toLocaleString('es-AR');
    const stLabel = s => s==='ok'?'Disponible':s==='md'?'Stock bajo':s==='lo'?'Sin stock':'Parado';
    const stClass = s => s==='ok'?'ok':s==='md'?'md':s==='lo'?'lo':'md';

    function render(tab){
      current = tab;
      if(!panel) return;

      if(tab==='overview'){
        const s = D.stats;
        panel.innerHTML = `
          <div class="erp-stat-grid">
            <div class="erp-stat"><div class="lab">Ventas del mes</div><div class="val gold">${fmt(s.ventasMes)}</div></div>
            <div class="erp-stat"><div class="lab">Pedidos activos</div><div class="val blue">${s.pedidosAct}</div></div>
            <div class="erp-stat"><div class="lab">Facturado</div><div class="val green">${fmt(s.facturado)}</div></div>
            <div class="erp-stat"><div class="lab">Metros en stock</div><div class="val gold">${s.metros.toLocaleString('es-AR')} m</div></div>
            <div class="erp-stat"><div class="lab">Clientes activos</div><div class="val blue">${s.clientes}</div></div>
            <div class="erp-stat"><div class="lab">Telares activos</div><div class="val green">${s.activos}/${s.telares}</div></div>
          </div>
          <div class="erp-chart">
            <div class="erp-chart-title">📈 Ventas últimos 7 días</div>
            <div class="erp-bars">${D.ventasSem.map((v,i)=>{
              const max = Math.max(...D.ventasSem);
              const pct = Math.round(v/max*100);
              const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
              return `<div class="erp-bar-col"><div class="erp-bar-fill" style="height:${pct}%"><span>${(v/1e6).toFixed(1)}M</span></div><small>${days[i]}</small></div>`;
            }).join('')}</div>
          </div>
          <div class="erp-note">Dashboard en tiempo real · datos del sistema</div>`;
      }
      else if(tab==='stock'){
        panel.innerHTML = `
          <div class="erp-search"><input type="text" id="erp-stock-search" placeholder="🔍 Filtrar por artículo, color o lote..." /></div>
          <table class="erp-table" id="erp-stock-table"><thead><tr>
            <th>Artículo</th><th>Color</th><th>Lote</th><th>Piezas</th><th>Metros</th><th>Precio/m</th><th>Estado</th>
          </tr></thead><tbody>${
            D.stock.map(s=>`<tr data-search="${(s.art+' '+s.color+' '+s.lot).toLowerCase()}">
              <td>${s.art}</td><td>${s.color}</td><td>${s.lot}</td>
              <td>${s.pz}</td><td>${s.m}</td><td>${fmt(s.price)}</td>
              <td><span class="erp-badge-sm ${stClass(s.st)}">${stLabel(s.st)}</span></td></tr>`).join('')
          }</tbody></table>
          <div class="erp-note">${D.stock.length} artículos · trazabilidad FIFO por lote y unidad</div>`;
        // filtro en vivo
        const sf = panel.querySelector('#erp-stock-search');
        sf?.addEventListener('input', ()=>{
          const q = sf.value.trim().toLowerCase();
          panel.querySelectorAll('#erp-stock-table tbody tr').forEach(tr=>{
            tr.style.display = (!q || tr.dataset.search.includes(q)) ? '' : 'none';
          });
        });
      }
      else if(tab==='clientes'){
        panel.innerHTML = `
          <table class="erp-table"><thead><tr>
            <th>ID</th><th>Cliente</th><th>Teléfono</th><th>Condición</th><th>Ped. activos</th><th>Saldo</th>
          </tr></thead><tbody>${
            D.clientes.map(c=>`<tr>
              <td>${c.id}</td><td>${c.nom}</td><td>${c.tel}</td>
              <td>${c.cond}</td><td>${c.ped}</td>
              <td style="color:${c.total>0?'var(--erp-red)':'var(--erp-green)'}">${c.total>0?fmt(c.total):'—'}</td></tr>`).join('')
          }</tbody></table>
          <div class="erp-note">${D.clientes.length} clientes · CRM con preferencias e historial</div>`;
      }
      else if(tab==='cc'){
        panel.innerHTML = `
          <table class="erp-table"><thead><tr>
            <th>Cliente</th><th>Debe</th><th>Saldo a favor</th><th>Estado</th>
          </tr></thead><tbody>${
            D.clientes.filter(c=>c.total>0 || c.cond.includes('Contado')===false).map(c=>{
              const fav = c.id===2 ? 154000 : c.id===4 ? 45000 : 0;
              const venc = c.id===1?'5 días':c.id===3?'12 días':c.id===4?'Sin vencer':'—';
              return `<tr><td>${c.nom}</td>
                <td style="color:var(--erp-red)">${c.total>0?fmt(c.total):'—'}</td>
                <td style="color:var(--erp-green)">${fav>0?fmt(fav):'—'}</td>
                <td>${venc}</td></tr>`;
            }).join('')
          }</tbody></table>
          <div class="erp-note">Cuentas corrientes · cálculo automático de saldos y vencimientos</div>`;
      }
      else if(tab==='pedidos'){
        panel.innerHTML = `
          <table class="erp-table"><thead><tr>
            <th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Vence</th><th>Items</th><th>Metros</th><th>Estado</th>
          </tr></thead><tbody>${
            D.pedidos.map(p=>`<tr>
              <td>#${p.id}</td><td>${p.cli}</td><td>${p.fecha}</td><td>${p.vence}</td>
              <td>${p.items}</td><td>${p.m} m</td>
              <td><span class="erp-badge-sm ${p.st==='activo'?'ok':'lo'}">${p.st==='activo'?'Activo':'Vencido'}</span></td></tr>`).join('')
          }</tbody></table>
          <div class="erp-note">${D.pedidos.length} pedidos · el scheduler libera los vencidos cada hora</div>`;
      }
      else if(tab==='telares'){
        panel.innerHTML = `
          <table class="erp-table"><thead><tr>
            <th>Telar</th><th>Operario</th><th>Turno</th><th>Metros hoy</th><th>Eficiencia</th><th>Estado</th>
          </tr></thead><tbody>${
            D.telares.map(t=>`<tr>
              <td><strong>${t.id}</strong></td><td>${t.op}</td><td>${t.turno}</td>
              <td>${t.m} m</td>
              <td>${t.st==='stop'?'—':t.ef+'%'}</td>
              <td><span class="erp-badge-sm ${t.st==='ok'?'ok':'md'}">${t.st==='ok'?'Produciendo':'Parado'}</span></td></tr>`).join('')
          }</tbody></table>
          <div class="erp-note">${D.telares.length} telares · producción registrada por operario y turno</div>`;
      }
      else if(tab==='stats'){
        const s = D.stats;
        panel.innerHTML = `
          <div class="erp-stat-grid">
            <div class="erp-stat"><div class="lab">Ventas del mes</div><div class="val gold">${fmt(s.ventasMes)}</div></div>
            <div class="erp-stat"><div class="lab">Pedidos activos</div><div class="val blue">${s.pedidosAct}</div></div>
            <div class="erp-stat"><div class="lab">Facturado</div><div class="val green">${fmt(s.facturado)}</div></div>
            <div class="erp-stat"><div class="lab">Metros en stock</div><div class="val gold">${s.metros.toLocaleString('es-AR')} m</div></div>
            <div class="erp-stat"><div class="lab">Ticket promedio</div><div class="val blue">${fmt(s.ticket)}</div></div>
            <div class="erp-stat"><div class="lab">Alertas activas</div><div class="val green">${s.alertas}</div>
              <div class="erp-bar"><i style="width:${Math.min(100,s.alertas*20)}%"></i></div></div>
          </div>
          <div class="erp-chart">
            <div class="erp-chart-title">📈 Ventas últimos 7 días</div>
            <div class="erp-bars">${D.ventasSem.map((v,i)=>{
              const max = Math.max(...D.ventasSem);
              const pct = Math.round(v/max*100);
              const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
              return `<div class="erp-bar-col"><div class="erp-bar-fill" style="height:${pct}%"><span>${(v/1e6).toFixed(1)}M</span></div><small>${days[i]}</small></div>`;
            }).join('')}</div>
          </div>
          <div class="erp-note">Dashboard del sistema · datos del sistema</div>`;
      }
      else if(tab==='remito'){
        const re = D.stock.slice(0,3);
        const total = re.reduce((a,s)=> a+s.m*s.price, 0);
        const fmtR = n => '$'+n.toLocaleString('es-AR');
        panel.innerHTML = `
          <div class="erp-remito">
            <h4>REMITO "R-0001-002389" · CANARYTEX</h4>
            <div class="row"><span><strong>Cliente:</strong> Tintorería del Sur</span><span><strong>Fecha:</strong> 10/07/2026</span></div>
            <div class="row"><span><strong>CUIT:</strong> 30-12345678-9</span><span><strong>Remito N°:</strong> 2389</span></div>
            <div class="row"><span><strong>Domicilio:</strong> Av. Caseros 2400, CABA</span><span><strong>Cond. venta:</strong> CC 30 días</span></div>
            <table><thead><tr><th>Cód</th><th>Artículo</th><th>Color</th><th>Lote</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
            <tbody>${re.map((s,i)=>`<tr><td>${1000+i}</td><td>${s.art}</td><td>${s.color}</td><td>${s.lot}</td><td>${s.m} m</td><td>${fmtR(s.price)}</td><td>${fmtR(s.m*s.price)}</td></tr>`).join('')}</tbody>
            <tfoot><tr class="remito-total"><td colspan="6" style="text-align:right">TOTAL</td><td>${fmtR(total)}</td></tr></tfoot></table>
            <div class="remito-terms">El solicitante declara recibir la mercadería conforme. Remito no válido como factura. Generado con Pillow en el ERP.</div>
          </div>
          <div class="erp-note">Vista previa de remito generado con Pillow</div>`;
      }
    }

    tabs.forEach(t=> t.addEventListener('click', ()=>{
      tabs.forEach(x=>{ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
      t.classList.add('active'); t.setAttribute('aria-selected','true');
      render(t.dataset.erpTab);
    }));
    render('overview');
  }

  // ═══════════════════════════════════════════════════════════
  //  SECCIÓN 4 — JUEGOS (Buscaminas + Tetris)
  // ═══════════════════════════════════════════════════════════
  function setupGames(){
    // quick-launch
    $('#quick-launch')?.addEventListener('click', e=>{
      const btn = e.target.closest('.ql-btn'); if(!btn) return;
      const a = btn.dataset.action; if(!a) return;
      if(a==='show-desktop') $$('.msn-window.open').forEach(w=> minimizeWindow(w));
      else if(a==='open-explorer') createExplorerWindow();
      else if(a==='open-folder') createFolderWindow();
      else if(a==='open-minesweeper') createMinesweeperWindow();
      else if(a==='open-tetris') createTetrisWindow();
    });
  }

  function createWindow(id, title, contentEl){
    let win = document.getElementById(id);
    if(win){ win.style.display='block'; win.classList.add('open'); win.dataset.minimized='false'; bringToFront(win); return win; }
    win = document.createElement('div');
    win.className='msn-window chat-window'; win.id=id; win.dataset.inited='true';
    win.style.display='block';
    win.style.top=cascade.top+'px'; win.style.left=cascade.left+'px';
    cascade.top+=28; cascade.left+=28;
    win.innerHTML=`<div class="title-bar">
      <img class="window-icon" src="assets/img/msn-icon.png" alt="" onerror="this.style.display='none'">
      <span class="title-text">${title}</span>
      <div class="window-controls">
        <button type="button" class="minimize" title="Minimizar">▁</button>
        <button type="button" class="maximize" title="Maximizar">▢</button>
        <button type="button" class="close-window" title="Cerrar">✖</button>
      </div></div>`;
    const body = document.createElement('div');
    body.className='chat-area'; body.style.height='calc(100% - 60px)'; body.style.display='block';
    if(contentEl) body.appendChild(contentEl);
    win.appendChild(body);
    $('#desktop')?.appendChild(win);
    requestAnimationFrame(()=> win.classList.add('open'));
    bringToFront(win);
    win.querySelector('.minimize').addEventListener('click', e=>{ e.stopPropagation(); minimizeWindow(win); });
    win.querySelector('.maximize').addEventListener('click', e=>{ e.stopPropagation(); toggleMaximize(win); });
    win.querySelector('.close-window').addEventListener('click', e=>{
      e.stopPropagation();
      if(win._msn_game?.destroy) try{ win._msn_game.destroy(); }catch(_){}
      win.classList.remove('open'); setTimeout(()=> win.style.display='none', 200);
    });
    makeDraggable(win); makeResizable(win);
    return win;
  }

  function createExplorerWindow(){
    const a = document.createElement('div'); a.style.padding='12px';
    a.innerHTML=`<strong>Explorador de archivos</strong><ul>
      <li><a href="assets/cv/Alejandro_Gabba_CV.pdf" target="_blank" rel="noopener noreferrer">📄 CV - Alejandro_Gabba_CV.pdf</a></li>
      <li><a href="assets/img/profile.jpg" target="_blank" rel="noopener noreferrer">🖼️ profile.jpg</a></li>
      <li><a href="assets/img/msn-icon.png" target="_blank" rel="noopener noreferrer">🖼️ msn-icon.png</a></li>
      <li><a href="https://github.com/CANARIOag" target="_blank" rel="noopener noreferrer">🐙 GitHub: CANARIOag</a></li>
      <li><a href="https://canarioag.github.io/portafolio/" target="_blank" rel="noopener noreferrer">🌐 Portafolio online</a></li></ul>`;
    createWindow('explorer-window','Explorador', a);
  }
  function createFolderWindow(){
    const a = document.createElement('div'); a.style.padding='12px';
    a.innerHTML=`<strong>Carpeta assets/</strong><ul>
      <li><a href="assets/img/" target="_blank">/assets/img/</a></li>
      <li><a href="assets/sounds/" target="_blank">/assets/sounds/</a></li></ul>`;
    createWindow('folder-window','Carpeta assets', a);
  }

  // ── Buscaminas ──────────────────────────────────────────────
  function createMinesweeperWindow(){
    const id='game-minesweeper';
    let win = document.getElementById(id);
    if(win){ win.style.display='block'; win.classList.add('open'); win.dataset.minimized='false'; bringToFront(win);
      if(win._msn_game?.reset) try{ win._msn_game.reset(); }catch(_){} return; }
    const sz=8, mines=10;
    const area=document.createElement('div'); area.style.padding='12px';
    const ctrl=document.createElement('div');
    ctrl.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
    const title=document.createElement('div'); title.textContent=`Buscaminas ${sz}×${sz} · ${mines} minas`;
    const right=document.createElement('div'); right.style.cssText='display:flex;gap:8px;align-items:center';
    const status=document.createElement('span'); status.textContent='Listo'; status.style.fontSize='12px';
    const restart=document.createElement('button'); restart.type='button'; restart.textContent='Reiniciar';
    right.append(status, restart); ctrl.append(title, right); area.append(ctrl);
    const grid=document.createElement('div');
    grid.style.cssText=`display:grid;grid-template-rows:repeat(${sz},28px);grid-template-columns:repeat(${sz},28px);gap:2px`;
    area.append(grid);
    let cells=[], running=true;
    function gen(){
      cells=[];
      for(let r=0;r<sz;r++) for(let c=0;c<sz;c++) cells.push({r,c,m:false,f:false,o:false,n:0,el:null});
      let p=0; while(p<mines){ const i=Math.floor(Math.random()*cells.length); if(!cells[i].m){cells[i].m=true;p++;} }
      cells.forEach(cell=>{ let n=0; for(const[dr,dc] of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){ const o=cells.find(x=>x.r===cell.r+dr&&x.c===cell.c+dc); if(o&&o.m)n++; } cell.n=n; });
    }
    function reveal(cell){
      if(!running||cell.o||cell.f) return;
      cell.o=true; cell.el.classList.add('open');
      if(cell.m){ cell.el.textContent='💣'; status.textContent='💥 Perdiste'; running=false; revealAll(); return; }
      if(cell.n>0) cell.el.textContent=cell.n;
      else for(const[dr,dc] of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){ const o=cells.find(x=>x.r===cell.r+dr&&x.c===cell.c+dc); if(o&&!o.o) reveal(o); }
      if(checkWin()){ status.textContent='🎉 ¡Ganaste!'; running=false; }
    }
    function revealAll(){ cells.forEach(c=>{ if(c.m)c.el.textContent='💣'; c.el.classList.add('open'); c.o=true; }); }
    function checkWin(){ return cells.filter(c=>c.o).length===cells.length-mines; }
    function render(){
      grid.innerHTML='';
      cells.forEach(cell=>{
        const b=document.createElement('button'); b.type='button'; b.className='ms-cell';
        b.style.cssText='width:28px;height:28px;padding:0;font-size:14px';
        const oc=()=>reveal(cell);
        const oR=e=>{ e.preventDefault(); if(!running||cell.o)return; cell.f=!cell.f; b.textContent=cell.f?'🚩':''; b.classList.toggle('flag',cell.f); };
        b.addEventListener('click',oc); b.addEventListener('contextmenu',oR);
        cell.el=b; cell._h={oc,oR}; grid.appendChild(b);
      });
    }
    function reset(){ running=true; status.textContent='Listo'; gen(); render(); }
    gen(); render();
    const created=createWindow(id,'Buscaminas',area);
    restart.addEventListener('click',reset);
    created._msn_game={ destroy(){running=false; cells.forEach(c=>{ if(c.el&&c._h){ c.el.removeEventListener('click',c._h.oc); c.el.removeEventListener('contextmenu',c._h.oR); }});}, reset, stop(){}, start(){} };
  }

  // ── Tetris ──────────────────────────────────────────────────
  function createTetrisWindow(){
    const id='game-tetris';
    let win=document.getElementById(id);
    if(win){ win.style.display='block'; win.classList.add('open'); win.dataset.minimized='false'; bringToFront(win);
      if(win._msn_game?.start) try{ win._msn_game.start(); }catch(_){} return; }
    const area=document.createElement('div'); area.style.padding='8px';
    const hud=document.createElement('div');
    hud.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px';
    const infoL=document.createElement('div'); infoL.textContent='← → ↓ ↑ rotar · espacio drop'; infoL.style.cssText='font-size:11px;color:#444';
    const infoR=document.createElement('div'); infoR.className='tetris-hud';
    const sc=document.createElement('div'); sc.textContent='P: 0';
    const lv=document.createElement('div'); lv.textContent='Nv: 1';
    const restart=document.createElement('button'); restart.type='button'; restart.textContent='Reiniciar'; restart.style.cssText='padding:4px 8px';
    infoR.append(sc,lv,restart); hud.append(infoL,infoR); area.append(hud);
    const canvas=document.createElement('canvas');
    canvas.width=200; canvas.height=400; canvas.style.cssText='background:#071428;display:block;border-radius:6px';
    area.append(canvas);
    const created=createWindow(id,'Tetris',area);
    const ctx=canvas.getContext('2d');
    const cols=10,rows=20,size=20;
    let board=Array.from({length:rows},()=>Array(cols).fill(0));
    const P={I:{m:[[1,1,1,1]],c:'#00f0f0'},O:{m:[[1,1],[1,1]],c:'#f0f000'},T:{m:[[0,1,0],[1,1,1]],c:'#a000f0'},S:{m:[[0,1,1],[1,1,0]],c:'#00f000'},Z:{m:[[1,1,0],[0,1,1]],c:'#f00000'},J:{m:[[1,0,0],[1,1,1]],c:'#0000f0'},L:{m:[[0,0,1],[1,1,1]],c:'#f0a000'}};
    const K=Object.keys(P);
    let cur=null,drop=800,tick=null,score=0,lines=0,level=1,running=true;
    const cl=m=>m.map(r=>r.slice());
    function rot(m){const h=m.length,w=m[0].length,r=Array.from({length:w},()=>Array(h).fill(0));for(let y=0;y<h;y++)for(let x=0;x<w;x++)r[x][h-1-y]=m[y][x];return r;}
    function col(b,s,p){for(let y=0;y<s.length;y++)for(let x=0;x<s[y].length;x++){if(!s[y][x])continue;const px=p.x+x,py=p.y+y;if(px<0||px>=cols||py>=rows)return true;if(py>=0&&b[py][px])return true;}return false;}
    function plc(b,s,p,v=1){for(let y=0;y<s.length;y++)for(let x=0;x<s[y].length;x++){if(!s[y][x])continue;const px=p.x+x,py=p.y+y;if(py>=0&&py<rows&&px>=0&&px<cols)b[py][px]=v;}}
    function spawn(){const k=K[Math.floor(Math.random()*K.length)];const info=P[k];cur={shape:cl(info.m),x:Math.floor((cols-info.m[0].length)/2),y:-1,color:info.c};if(col(board,cur.shape,cur)){running=false;stop();sc.textContent='Game Over · '+score;}}
    function clearLines(){let rm=0;for(let y=rows-1;y>=0;y--){if(board[y].every(v=>v===1)){board.splice(y,1);board.unshift(Array(cols).fill(0));score+=100*level;rm++;y++;}}if(rm>0){lines+=rm;const nl=Math.min(10,1+Math.floor(lines/5));if(nl!==level){level=nl;drop=Math.max(150,800-(level-1)*70);if(tick){clearInterval(tick);tick=setInterval(step,drop);}}}}
    function step(){if(!running||!cur)return;const n={x:cur.x,y:cur.y+1,shape:cur.shape};if(!col(board,n.shape,n)){cur.y++;}else{plc(board,cur.shape,cur,1);clearLines();spawn();}draw();sc.textContent='P: '+score;lv.textContent='Nv: '+level;}
    function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(board[r][c]){ctx.fillStyle='#6cf';ctx.fillRect(c*size,r*size,size-1,size-1);}if(cur){ctx.fillStyle=cur.color||'#f6a';for(let y=0;y<cur.shape.length;y++)for(let x=0;x<cur.shape[y].length;x++)if(cur.shape[y][x]){const px=(cur.x+x)*size,py=(cur.y+y)*size;if(py>=0)ctx.fillRect(px,py,size-1,size-1);}}}
    function start(){if(!running)running=true;if(!cur)spawn();if(!tick)tick=setInterval(step,drop);}
    function stop(){if(tick){clearInterval(tick);tick=null;}}
    function hardDrop(){if(!cur)return;while(!col(board,cur.shape,{x:cur.x,y:cur.y+1}))cur.y++;step();}
    function move(dx){if(!cur)return;const n={x:cur.x+dx,y:cur.y,shape:cur.shape};if(!col(board,n.shape,n))cur.x+=dx;}
    function rotCur(){if(!cur)return;const s2=rot(cur.shape);if(!col(board,s2,{x:cur.x,y:cur.y}))cur.shape=s2;}
    function onKey(e){if(!running)return;if(e.key==='ArrowLeft'){move(-1);draw();}else if(e.key==='ArrowRight'){move(1);draw();}else if(e.key==='ArrowDown'){step();}else if(e.key===' '){e.preventDefault();hardDrop();}else if(e.key==='ArrowUp'){rotCur();draw();}}
    function resetG(){stop();board=Array.from({length:rows},()=>Array(cols).fill(0));cur=null;score=0;lines=0;level=1;drop=800;running=true;sc.textContent='P: 0';lv.textContent='Nv: 1';spawn();draw();tick=setInterval(step,drop);}
    start(); window.addEventListener('keydown',onKey);
    restart.addEventListener('click',e=>{e.stopPropagation();resetG();});
    created._msn_game={destroy(){stop();window.removeEventListener('keydown',onKey);},stop,start,reset:resetG};
  }

  // ═══════════════════════════════════════════════════════════
  //  SECCIÓN 5 — TASKBAR + START MENU
  // ═══════════════════════════════════════════════════════════
  function setupTaskbar(){
    const clock=$('#taskbar-clock');
    function upd(){ if(clock) clock.textContent=new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}); }
    upd(); setInterval(upd, 30000);

    const sb=$('#start-button'), sm=$('#start-menu');
    sb?.addEventListener('click', e=>{
      const open=sm.style.display!=='block';
      sm.style.display=open?'block':'none';
      sb.setAttribute('aria-expanded',open?'true':'false');
      if(open) sm.querySelector('button')?.focus();
      e.stopPropagation();
    });
    document.addEventListener('click', e=>{
      if(sm&&sm.style.display==='block'&&!e.target.closest('#start-menu')&&!e.target.closest('#start-button')){
        sm.style.display='none'; sb.setAttribute('aria-expanded','false');
      }
    });
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape'&&sm?.style.display==='block'){ sm.style.display='none'; sb.setAttribute('aria-expanded','false'); sb?.focus(); }
    });
    sm?.addEventListener('click', e=>{
      const item=e.target.closest('.start-item'); if(!item) return;
      const a=item.dataset.action;
      if(a==='open-cv'){ const cv=item.dataset.cv||'assets/cv/Alejandro_Gabba_CV.pdf'; window.open(cv,'_blank'); }
      else if(a==='open-github') window.open('https://github.com/CANARIOag','_blank');
      else if(a==='open-erp') openChat('chat-sistemaempresas');
      else if(a==='open-minesweeper') createMinesweeperWindow();
      else if(a==='open-tetris') createTetrisWindow();
      else if(a==='toggle-sound') toggleTheme(item);
      sm.style.display='none'; sb.setAttribute('aria-expanded','false');
    });
  }

  let themePlaying=false;
  function toggleTheme(btn){
    const a=document.getElementById('msn-theme');
    if(!a) return;
    if(themePlaying){ a.pause(); btn.textContent='🔊 Activar música'; themePlaying=false; }
    else { getAudioCtx(); a.play().catch(()=>{}); btn.textContent='🔇 Silenciar música'; themePlaying=true; }
  }

  // exponer para debugging
  window._msn = { openChat, BOTS, initErpDemo };
})();
