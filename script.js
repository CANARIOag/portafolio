// script.js — Portafolio MSN + Windows XP boot/login (versión completa)
// Incluye: boot XP, login MSN, ventanas (draggable/resizable/min/max/close),
// chat secuencial, emoticonos, zumbido, mini-demo interactiva del ERP
// CANARYTEX (con remito), juegos (Buscaminas, Tetris), taskbar/start menu,
// sonidos, accesibilidad.

document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  try {
    console.log("%cMSN: listo (pulido v3 — boot + login)", "color:#0066cc;font-weight:700;");

    /* ====================================================
       SECUENCIA DE ARRANQUE: boot XP → login MSN → desktop
       ==================================================== */
    const bootScreen   = document.getElementById('boot-screen');
    const loginScreen  = document.getElementById('login-screen');
    const welcomeToast = document.getElementById('welcome-toast');

    // intenta reproducir un sonido de fondo opcional tras login
    const audioTheme  = document.getElementById('msn-theme');
    const audioNudge  = document.getElementById('msn-nudge');
    function safePlay(audio){
      if(!audio) return;
      try{ audio.currentTime = 0; const p = audio.play(); if(p && p.catch) p.catch(()=>{}); }
      catch(e){}
    }

    function showLogin(){
      if(bootScreen) bootScreen.style.display = 'none';
      if(loginScreen){
        loginScreen.style.display = 'flex';
      }
    }
    function showDesktop(){
      if(loginScreen){
        loginScreen.classList.add('logging-in');
        setTimeout(() => { loginScreen.style.display = 'none'; }, 500);
      }
      // reproducir el sonido del tema (si se permite autoplay)
      safePlay(audioTheme);
      // toast de bienvenida
      if(welcomeToast){
        welcomeToast.style.display = 'flex';
        setTimeout(() => { welcomeToast.style.display = 'none'; }, 5500);
      }
    }

    // El boot se anima con CSS y se oculta solo a los 3.5s. Nosotros
    // mostramos el login a los 3.6s por si la animación se interrumpe.
    let booted = false;
    function ensureLogin(){
      if(booted) return; booted = true;
      showLogin();
    }
    if(bootScreen){
      bootScreen.addEventListener('animationend', e => {
        if(e.animationName === 'bootFadeOut') ensureLogin();
      });
    }
    setTimeout(ensureLogin, 4000);

    // Login: cualquier contraseña o Enter inicia el desktop
    const loginBtn  = document.getElementById('login-btn');
    const loginPass = document.getElementById('login-pass');
    function doLogin(){
      // pequeño delay "conectando..."
      const status = loginScreen?.querySelector('.login-status');
      if(status){ status.innerHTML = '<span class="login-dot"></span> Verificando credenciales...'; }
      setTimeout(showDesktop, 700);
    }
    loginBtn?.addEventListener('click', e => { e.preventDefault(); doLogin(); });
    loginPass?.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); doLogin(); } });

    /* ====================================================
       DATOS DE LOS PROYECTOS (mensajes secuenciales)
       ==================================================== */
    const inventarioSecuencial = [
      "👋 ¡Hola! Soy el *Sistema de Gestión de Inventario y Facturación*.",
      "📦 *Problema que resuelve:* muchas empresas manejan inventario y ventas en hojas o sistemas aislados. Este ERP lo integra todo.",
      "📁 *Inventario:* control total de artículos, colores, lotes y piezas únicas.",
      "🔍 *Trazabilidad:* cada unidad física se identifica individualmente. No existe duplicación posible.",
      "👥 *Clientes / CRM:* registro de datos, historial, condiciones especiales y más.",
      "💰 *Cuentas Corrientes:* cálculo automático de saldos, compras, pagos y ganancias.",
      "📄 *Remitos digitales:* comprobantes visuales con Pillow, listos para imprimir.",
      "🗄️ *Base de datos:* SQL Server con transacciones para evitar inconsistencias de stock.",
      "⚙️ *Tecnologías:* Python, Tkinter, SQL Server, Pillow, pyodbc, JSON local.",
      "🏆 *Conclusión:* herramienta profesional que digitaliza procesos y reduce errores humanos."
    ];
    let inventarioStep = 0;

    const erpSecuencial = [
      "🧵 Soy el *ERP CANARYTEX* — un sistema de gestión empresarial completo para una textil.",
      "⚙️ *Backend:* FastAPI + PostgreSQL con Alembic, autenticación JWT, rate limiting, scheduler APScheduler.",
      "🎨 *Frontend:* HTML5 + CSS oscuro/dorado, Chart.js, Three.js, Font Awesome, Bootstrap.",
      "📦 *Módulos:* inventario físico, stock, telares, tintorería, pedidos, remitos, facturas, clientes, empleados.",
      "🔔 *Automatización:* cada hora libera pedidos vencidos y envía avisos WhatsApp (Evolution API) a clientes.",
      "💾 *Backups:* job diario a las 03:00 AR + devoluciones, tintorería, saldo a favor, verificaciones de cuenta.",
      "📊 *Dashboard de stats:* ventas, rentabilidad, auditoría, reportes, alertas, FIFO de stock.",
      "🏆 *Resultado:* una solución profesional que reemplaza procesos manuales y reduce errores."
    ];
    let erpStep = 0;

    const autoReplies = {
      "chat-ecommerce": [
        "👋 ¡Hola! Soy el proyecto E-Commerce.",
        "🛒 Plataforma de ventas con carrito, pagos, panel administrativo y sistema de productos.",
        "⚙️ Tecnologías: PHP, CSS, JavaScript, SQL y APIs."
      ],
      "chat-inventario": [ inventarioSecuencial[0] ],
      "chat-juego": [
        "🎲 Bienvenido al Juego de Mesa digital.",
        "Reglas, interacción, base de datos y sistema de turnos.",
        "🛠️ Tecnologías: JavaScript + Base de Datos."
      ],
      "chat-sistemaempresas": [ erpSecuencial[0] ],
      "chat-sobremi": [
        "👤 Soy Alejandro Gabba — desarrollador Full Stack.",
        "📄 Podés descargar mi CV y ver mi GitHub dentro de esta ventana."
      ]
    };

    /* ====================================================
       SETUP GENERAL
       ==================================================== */
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const desktop = $('#desktop') || document.body;

    const contacts = Array.from(document.querySelectorAll('.contact'));
    const chatWindows = Array.from(document.querySelectorAll('.chat-window'));
    const minimizedArea = $('#minimized-area');
    let cascade = { top: 80, left: 300 };
    let zIndexCounter = 1000;
    let activeWin = null;

    function bringToFront(win){
      zIndexCounter++;
      win.style.zIndex = zIndexCounter;
      if(activeWin) activeWin.classList.remove('active');
      win.classList.add('active');
      activeWin = win;
    }

    /* ====================================================
       CLICK EN CONTACTO → abrir chat
       ==================================================== */
    contacts.forEach(c => {
      const trigger = () => {
        const chatId = c.dataset.chat;
        const action = c.dataset.action;
        if(chatId) openChat(chatId);
        else if(action){
          if(action === 'open-minesweeper') createMinesweeperWindow();
          else if(action === 'open-tetris') createTetrisWindow();
        }
      };
      c.addEventListener('click', trigger);
      c.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); trigger(); } });
    });

    function openChat(chatId){
      const win = chatId && document.getElementById(chatId);
      if(!win) return;
      // posicionar en cascada si no inicializada
      if(!win.dataset.inited){
        win.style.top = cascade.top + 'px';
        win.style.left = cascade.left + 'px';
        cascade.top += 28; cascade.left += 28;
        if(cascade.top > window.innerHeight - 220) cascade.top = 80;
        if(cascade.left > window.innerWidth - 520) cascade.left = 300;
      }
      win.style.display = 'block';
      requestAnimationFrame(() => win.classList.add('open'));
      bringToFront(win);

      // restaurar si minimizada
      if(win.dataset.minimized === 'true'){
        win.dataset.minimized = 'false';
        const btn = minimizedArea.querySelector(`[data-win-id="${win.id}"]`);
        if(btn) btn.remove();
      }

      if(win.dataset.inited === 'true') return;
      win.dataset.inited = 'true';
      initChatWindow(win);
    }
    window.openChatWindow = winOrId => openChat(typeof winOrId === 'string' ? winOrId : winOrId?.id);

    /* ====================================================
       INIT UNA VENTANA DE CHAT
       ==================================================== */
    function initChatWindow(win){
      const chatArea = win.querySelector('.chat-area');
      const input = win.querySelector('.message-input');
      const sendBtn = win.querySelector('.send');
      const showEmotBtns = win.querySelectorAll('.show-emoticons');
      const emotPanel = win.querySelector('.emoticons-panel');
      const emoticons = win.querySelectorAll('.emoticon');
      const buzzBtns = win.querySelectorAll('.buzz');
      const closeBtns = win.querySelectorAll('.close-window');
      const maxButtons = win.querySelectorAll('.maximize');

      // controles principales (los .minimize que ya estén en el HTML)
      win.querySelectorAll('.minimize').forEach(b => {
        b.addEventListener('click', e => { e.stopPropagation(); minimizeWindow(win); });
      });
      closeBtns.forEach(b => b.addEventListener('click', e => {
        e.stopPropagation();
        if(win._msn_game && typeof win._msn_game.destroy === 'function') try{ win._msn_game.destroy(); }catch(_){}
        win.classList.remove('open');
        win.dataset.closed = 'true';
        setTimeout(() => win.style.display = 'none', 180);
      }));
      maxButtons.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); toggleMaximize(win); }));

      // cabecera mostrada al frente
      win.addEventListener('mousedown', () => bringToFront(win), { passive:true });

      // mensajes automáticos iniciales
      if(autoReplies[win.id]){
        autoReplies[win.id].forEach((m, i) => setTimeout(() => appendMessage(chatArea, 'project', m), 450 * (i+1)));
      }

      // envío de mensajes
      function sendUserMessage(){
        const txt = (input?.value || '').trim();
        if(!txt) return;
        appendMessage(chatArea, 'me', txt);
        input.value = '';

        if(win.id === 'chat-inventario'){
          inventarioStep++;
          setTimeout(() => appendMessage(chatArea, 'project',
            inventarioStep < inventarioSecuencial.length
              ? inventarioSecuencial[inventarioStep]
              : "👌 Ya te expliqué todo. ¿Querés ver imágenes del sistema?"), 600);
          return;
        }
        if(win.id === 'chat-sistemaempresas'){
          erpStep++;
          setTimeout(() => appendMessage(chatArea, 'project',
            erpStep < erpSecuencial.length
              ? erpSecuencial[erpStep]
              : "✅ Esa es la overview del ERP. Explorá la demo de abajo 👇"), 600);
          return;
        }
        setTimeout(() => appendMessage(chatArea, 'project', "👍 Recibido."), 600);
      }
      if(sendBtn && input){
        sendBtn.addEventListener('click', sendUserMessage);
        input.addEventListener('keydown', e => {
          if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendUserMessage(); }
        });
      }

      showEmotBtns.forEach(b => b.addEventListener('click', () => {
        if(emotPanel) emotPanel.style.display = emotPanel.style.display === 'grid' ? 'none' : 'grid';
      }));
      emoticons.forEach(em => em.addEventListener('click', () => {
        if(!input) return;
        input.value += (input.value ? ' ' : '') + em.textContent;
        input.focus();
        if(emotPanel) emotPanel.style.display = 'none';
      }));

      buzzBtns.forEach(b => b.addEventListener('click', () => {
        win.classList.add('buzzing');
        safePlay(audioNudge);
        setTimeout(() => win.classList.remove('buzzing'), 650);
        appendMessage(chatArea, 'me', '🔥 ¡Zumbido enviado!');
      }));

      makeDraggable(win);
      makeResizable(win);

      // Si es el ERP, inicializamos la mini-demo
      if(win.id === 'chat-sistemaempresas') initErpDemo(win);
    }

    /* ====================================================
       APPEND MESSAGE (typing + linkify seguro)
       ==================================================== */
    function escapeHtml(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

    function appendMessage(area, type, text){
      if(!area) return;
      const div = document.createElement('div');
      div.className = 'message ' + (type === 'me' ? 'me' : 'project');
      const plain = String(text);

      // marcar no leído
      const win = area.closest('.msn-window');
      if(type === 'project' && win && (win.style.display === 'none' || win.dataset.minimized === 'true')){
        const contact = document.querySelector(`.contact[data-chat="${win.id}"]`);
        if(contact){
          contact.dataset.unread = 'true';
          if(!contact.querySelector('.unread-dot')){
            const dot = document.createElement('span');
            dot.className = 'unread-dot';
            dot.setAttribute('aria-hidden','true');
            contact.appendChild(dot);
          }
        }
      }

      if(type === 'project' && plain.length >= 60){
        const span = document.createElement('span');
        div.appendChild(span);
        area.appendChild(div);
        let i = 0;
        const t = setInterval(() => {
          span.textContent += plain.charAt(i);
          i++;
          area.scrollTop = area.scrollHeight;
          if(i >= plain.length){
            clearInterval(t);
            span.replaceWith(linkify(plain));
          }
        }, 14);
      } else {
        div.appendChild(linkify(plain));
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
      }
      if(type === 'project') safePlay(null);
    }

    function linkify(text){
      // convierte *texto* en <strong> y URLs en <a> (a partir de texto escapado)
      const frag = document.createDocumentFragment();
      const escaped = escapeHtml(text);
      // bold markdown
      const withBold = escaped.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>');
      // urls
      const html = withBold.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      while(tmp.firstChild) frag.appendChild(tmp.firstChild);
      return frag;
    }

    /* ====================================================
       DRAG / RESIZE
       ==================================================== */
    function makeDraggable(win){
      const title = win.querySelector('.title-bar');
      let drag = false, ox = 0, oy = 0;
      title.addEventListener('mousedown', e => {
        if(e.target.closest('button')) return;
        if(win.dataset.maximized === 'true') return;
        drag = true; bringToFront(win);
        const r = win.getBoundingClientRect();
        ox = e.clientX - r.left; oy = e.clientY - r.top;
        document.body.style.userSelect = 'none';
      });
      document.addEventListener('mousemove', e => {
        if(!drag) return;
        win.style.left = Math.max(6, e.clientX - ox) + 'px';
        win.style.top = Math.max(6, e.clientY - oy) + 'px';
      });
      document.addEventListener('mouseup', () => { drag = false; document.body.style.userSelect = ''; });
      // touch
      title.addEventListener('touchstart', e => {
        if(e.target.closest('button')) return;
        if(win.dataset.maximized === 'true') return;
        drag = true; bringToFront(win);
        const r = win.getBoundingClientRect(); const t = e.touches[0];
        ox = t.clientX - r.left; oy = t.clientY - r.top;
      }, { passive:true });
      document.addEventListener('touchmove', e => {
        if(!drag) return; const t = e.touches[0];
        win.style.left = Math.max(6, t.clientX - ox) + 'px';
        win.style.top = Math.max(6, t.clientY - oy) + 'px';
      }, { passive:true });
      document.addEventListener('touchend', () => { drag = false; });
    }

    function makeResizable(win){
      if(win.querySelector('.resize-handle')) return;
      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      handle.title = 'Redimensionar';
      win.appendChild(handle);
      let r = false, sx=0, sy=0, sw=0, sh=0;
      handle.addEventListener('mousedown', e => {
        e.stopPropagation(); r = true; bringToFront(win);
        sx = e.clientX; sy = e.clientY;
        const rect = win.getBoundingClientRect(); sw = rect.width; sh = rect.height;
        document.body.style.userSelect = 'none';
      });
      document.addEventListener('mousemove', e => {
        if(!r) return;
        win.style.width = Math.max(280, sw + (e.clientX - sx)) + 'px';
        win.style.height = Math.max(180, sh + (e.clientY - sy)) + 'px';
      });
      document.addEventListener('mouseup', () => { r = false; document.body.style.userSelect = ''; });
    }

    function toggleMaximize(win){
      if(win.dataset.maximized === 'true'){
        win.style.left = win.dataset.restoreLeft || '';
        win.style.top = win.dataset.restoreTop || '';
        win.style.width = win.dataset.restoreWidth || '';
        win.style.height = win.dataset.restoreHeight || '';
        win.dataset.maximized = 'false';
      } else {
        win.dataset.restoreLeft = win.style.left;
        win.dataset.restoreTop = win.style.top;
        win.dataset.restoreWidth = win.style.width;
        win.dataset.restoreHeight = win.style.height;
        win.style.left = '8px'; win.style.top = '8px';
        win.style.width = (window.innerWidth - 16) + 'px';
        win.style.height = (window.innerHeight - 64) + 'px';
        win.dataset.maximized = 'true';
        bringToFront(win);
      }
    }

    /* ====================================================
       MINIMIZAR / RESTAURAR (animado)
       ==================================================== */
    function minimizeWindow(win){
      if(!win) return;
      const titleText = (win.querySelector('.title-text')?.textContent || win.id || 'Ventana').slice(0, 28);
      // si ya hay botón, no duplicar
      if(minimizedArea.querySelector(`[data-win-id="${win.id}"]`)){
        win.style.display = 'none'; win.dataset.minimized = 'true'; return;
      }
      const taskRect = minimizedArea?.getBoundingClientRect() || { left:8, top: window.innerHeight - 44, width:100 };
      win.style.transition = 'transform 400ms ease-in, opacity 400ms ease-in';
      const rect = win.getBoundingClientRect();
      const dx = (taskRect.left + taskRect.width/2) - (rect.left + rect.width/2);
      const dy = (taskRect.top + taskRect.height/2) - (rect.top + rect.height/2);
      requestAnimationFrame(() => {
        win.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
        win.style.opacity = '0';
      });
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'minimized-window-btn';
      btn.dataset.winId = win.id; btn.textContent = titleText;
      btn.addEventListener('click', () => restoreWindow(win, btn));
      setTimeout(() => {
        win.style.display = 'none';
        win.style.transform = ''; win.style.transition = ''; win.style.opacity = '';
        win.dataset.minimized = 'true';
        if(win._msn_game && win._msn_game.stop) try{ win._msn_game.stop(); }catch(_){}
        minimizedArea?.appendChild(btn);
      }, 420);
    }
    function restoreWindow(win, btn){
      win.style.display = 'block';
      win.dataset.minimized = 'false';
      bringToFront(win);
      const taskRect = minimizedArea?.getBoundingClientRect() || { left:8, top: window.innerHeight - 44, width:100 };
      const rect = win.getBoundingClientRect();
      const dx = (taskRect.left + taskRect.width/2) - (rect.left + rect.width/2);
      const dy = (taskRect.top + taskRect.height/2) - (rect.top + rect.height/2);
      win.style.transition = 'none';
      win.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
      win.style.opacity = '0';
      requestAnimationFrame(() => {
        win.style.transition = 'transform 420ms cubic-bezier(.2,.9,.3,1), opacity 420ms';
        win.style.transform = 'translate(0,0) scale(1)';
        win.style.opacity = '1';
      });
      setTimeout(() => {
        win.style.transition = ''; win.style.transform = '';
        btn?.remove();
        if(win._msn_game && win._msn_game.start) try{ win._msn_game.start(); }catch(_){}
      }, 440);
    }

    /* ====================================================
       MAIN WINDOW (minimizar/cerrar de la ventana principal)
       ==================================================== */
    const mainWin = $('#main');
    if(mainWin){
      mainWin.querySelector('.main-minimize')?.addEventListener('click', e => { e.stopPropagation(); minimizeWindow(mainWin); });
      mainWin.querySelector('.main-close')?.addEventListener('click', e => {
        e.stopPropagation();
        mainWin.classList.remove('open');
        setTimeout(() => mainWin.style.display = 'none', 180);
      });
    }

    /* ====================================================
       BUSCADOR DE CONTACTOS + Ctrl+K
       ==================================================== */
    const search = $('#contact-search');
    if(search){
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        $$('.contact-list .contact').forEach(c => {
          const t = c.textContent.trim().toLowerCase();
          c.style.display = (!q || t.includes(q)) ? '' : 'none';
        });
      });
    }
    document.addEventListener('keydown', e => {
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
        e.preventDefault(); search?.focus(); search?.select();
      }
    });
    // marcar como leído al abrir
    document.addEventListener('click', e => {
      const c = e.target.closest?.('.contact');
      if(!c) return;
      c.dataset.unread = 'false';
      c.querySelector('.unread-dot')?.remove();
    });

    /* ====================================================
       TASKBAR: reloj, start menu, acciones
       ==================================================== */
    const clock = $('#taskbar-clock');
    function updateClock(){ if(clock) clock.textContent = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
    updateClock(); setInterval(updateClock, 30_000);

    const startBtn = $('#start-button');
    const startMenu = $('#start-menu');
    startBtn?.addEventListener('click', e => {
      const open = startMenu.style.display !== 'block';
      startMenu.style.display = open ? 'block' : 'none';
      startBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) startMenu.querySelector('button')?.focus();
      e.stopPropagation();
    });
    // cerrar al hacer click fuera / Esc
    document.addEventListener('click', e => {
      if(startMenu && startMenu.style.display === 'block' && !e.target.closest('#start-menu') && !e.target.closest('#start-button')){
        startMenu.style.display = 'none'; startBtn.setAttribute('aria-expanded','false');
      }
    });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && startMenu?.style.display === 'block'){
        startMenu.style.display = 'none'; startBtn.setAttribute('aria-expanded','false'); startBtn?.focus();
      }
    });

    // start item actions
    startMenu?.addEventListener('click', e => {
      const item = e.target.closest('.start-item'); if(!item) return;
      const action = item.dataset.action;
      if(action === 'open-cv'){
        const cvPath = item.dataset.cv || 'assets/cv/Alejandro_Gabba_CV.pdf';
        window.open(cvPath, '_blank');
      }
      else if(action === 'open-github') window.open('https://github.com/CANARIOag', '_blank');
      else if(action === 'open-erp') openChat('chat-sistemaempresas');
      else if(action === 'toggle-sound') toggleThemeSound(item);
    });

    let themePlaying = false;
    function toggleThemeSound(btn){
      if(!audioTheme) return;
      if(themePlaying){ audioTheme.pause(); btn.textContent = '🔊 Activar música'; themePlaying = false; }
      else { safePlay(audioTheme); audioTheme.play().catch(()=>{}); btn.textContent = '🔇 Silenciar música'; themePlaying = true; }
    }

    /* ====================================================
       QUICK LAUNCH
       ==================================================== */
    $('#quick-launch')?.addEventListener('click', e => {
      const btn = e.target.closest('.ql-btn'); if(!btn) return;
      const action = btn.dataset.action; if(!action) return;
      if(action === 'show-desktop'){
        $$('.msn-window.open').forEach(w => minimizeWindow(w));
      } else if(action === 'open-explorer') createExplorerWindow();
      else if(action === 'open-folder') createFolderWindow();
      else if(action === 'open-minesweeper') createMinesweeperWindow();
      else if(action === 'open-tetris') createTetrisWindow();
    });

    function createWindow(id, title, contentEl){
      let win = document.getElementById(id);
      if(win){ win.style.display='block'; win.classList.add('open'); win.dataset.minimized='false'; bringToFront(win); return win; }
      win = document.createElement('div');
      win.className = 'msn-window chat-window'; win.id = id; win.dataset.inited = 'true';
      win.style.display = 'block';
      win.style.top = (cascade.top) + 'px';
      win.style.left = (cascade.left) + 'px';
      cascade.top += 28; cascade.left += 28;
      win.innerHTML = `
        <div class="title-bar">
          <img class="window-icon" src="assets/img/msn-icon.png" alt="" onerror="this.style.display='none'">
          <span class="title-text">${title}</span>
          <div class="window-controls">
            <button type="button" class="minimize" title="Minimizar">▁</button>
            <button type="button" class="maximize" title="Maximizar">▢</button>
            <button type="button" class="close-window" title="Cerrar">✖</button>
          </div>
        </div>`;
      const body = document.createElement('div');
      body.className = 'chat-area';
      body.style.height = 'calc(100% - 60px)';
      body.style.display = 'block';
      if(contentEl) body.appendChild(contentEl);
      win.appendChild(body);
      $('#desktop')?.appendChild(win);
      requestAnimationFrame(() => win.classList.add('open'));
      bringToFront(win);
      // vincular controles
      win.querySelector('.minimize').addEventListener('click', e => { e.stopPropagation(); minimizeWindow(win); });
      win.querySelector('.maximize').addEventListener('click', e => { e.stopPropagation(); toggleMaximize(win); });
      win.querySelector('.close-window').addEventListener('click', e => {
        e.stopPropagation();
        if(win._msn_game?.destroy) try{ win._msn_game.destroy(); }catch(_){}
        win.classList.remove('open');
        setTimeout(() => win.style.display = 'none', 180);
      });
      makeDraggable(win); makeResizable(win);
      return win;
    }

    function createExplorerWindow(){
      const area = document.createElement('div');
      area.style.padding = '12px';
      area.innerHTML = `
        <strong>Explorador de archivos</strong>
        <ul>
          <li><a href="assets/cv/Alejandro_Gabba_CV.pdf" target="_blank" rel="noopener noreferrer">📄 CV - Alejandro_Gabba_CV.pdf</a></li>
          <li><a href="assets/img/profile.jpg" target="_blank" rel="noopener noreferrer">🖼️ profile.jpg</a></li>
          <li><a href="assets/img/msn-icon.png" target="_blank" rel="noopener noreferrer">🖼️ msn-icon.png</a></li>
          <li><a href="https://github.com/CANARIOag" target="_blank" rel="noopener noreferrer">🐙 GitHub: CANARIOag</a></li>
        </ul>`;
      createWindow('explorer-window', 'Explorador de archivos', area);
    }
    function createFolderWindow(){
      const area = document.createElement('div');
      area.style.padding = '12px';
      area.innerHTML = `<strong>Carpeta assets/</strong><ul>
        <li><a href="assets/img/" target="_blank" rel="noopener noreferrer">/assets/img/</a></li>
        <li><a href="assets/sounds/" target="_blank" rel="noopener noreferrer">/assets/sounds/</a></li></ul>`;
      createWindow('folder-window', 'Carpeta assets', area);
    }

    /* ====================================================
       MINI-DEMO ERP CANARYTEX
       ==================================================== */
    const ERP_DATA = {
      stock: [
        { art: "Gabardina 280g", color: "Negro", lot: "L-1042", piezas: 120, m: 480, disp: "ok" },
        { art: "Microvelour", color: "Camel", lot: "L-1188", piezas: 64, m: 256, disp: "ok" },
        { art: "Drill 240g", color: "Marino", lot: "L-2051", piezas: 18, m: 72, disp: "lo" },
        { art: "Canvas 320g", color: "Crudo", lot: "L-2077", piezas: 40, m: 160, disp: "md" },
        { art: "Lino lavado", color: "Beige", lot: "L-3019", piezas: 95, m: 380, disp: "ok" },
        { art: "Polar 280g", color: "Gris", lot: "L-3055", piezas: 8, m: 32, disp: "lo" }
      ],
      clientes: [
        { id: 1, nom: "Tintorería del Sur", tel: "+54 11 555-1010", cond: "Cta. Corriente 30 días", pedAct: 2 },
        { id: 2, nom: "Confecciones Mónaco", tel: "+54 11 555-2233", cond: "Contado", pedAct: 4 },
        { id: 3, nom: "Textil Belgrano S.A.", tel: "+54 11 555-4040", cond: "Cta. Corriente 45 días", pedAct: 0 },
        { id: 4, nom: "Distribuidora Norte", tel: "+54 11 555-7711", cond: "Cta. Corriente 30 días", pedAct: 1 }
      ],
      cc: [
        { cli: "Tintorería del Sur", deuda: 1284500, fav: 0, venc: "5 días" },
        { cli: "Confecciones Mónaco", deuda: 0, fav: 154000, venc: "—" },
        { cli: "Textil Belgrano S.A.", deuda: 2135000, fav: 0, venc: "12 días" },
        { cli: "Distribuidora Norte", deuda: 678900, fav: 45000, venc: "—Sin vencer—" }
      ],
      stats: {
        ventasMes: 12450000,
        pedidosActivos: 7,
        facturado: 9800000,
        metrosStock: 32000,
        ticket: 412000,
        alertas: 3
      }
    };
    const ERP_FMT = n => "$" + n.toLocaleString("es-AR");

    function initErpDemo(win){
      const panel = win.querySelector('#erp-panel');
      const tabs = win.querySelectorAll('.erp-tab');
      let current = 'stock';
      function render(tab){
        current = tab;
        if(!panel) return;
        if(tab === 'stock'){
          panel.innerHTML = `
            <table class="erp-table"><thead><tr>
              <th>Artículo</th><th>Color</th><th>Lote</th><th>Piezas</th><th>Metros</th><th>Estado</th>
            </tr></thead><tbody>${
              ERP_DATA.stock.map(s => `
                <tr><td>${s.art}</td><td>${s.color}</td><td>${s.lot}</td>
                <td>${s.piezas}</td><td>${s.m}</td>
                <td><span class="erp-badge-sm ${s.disp}">${
                  s.disp === 'ok' ? 'Disponible' : s.disp === 'md' ? 'Bajo stock' : 'Sin stock'
                }</span></td></tr>`).join('')
            }</tbody></table>
            <div class="erp-note">Datos de muestra · trazabilidad FIFO por lote y unidad física</div>`;
        }
        else if(tab === 'clientes'){
          panel.innerHTML = `
            <table class="erp-table"><thead><tr>
              <th>ID</th><th>Cliente</th><th>Teléfono</th><th>Condición</th><th>Ped. activos</th>
            </tr></thead><tbody>${
              ERP_DATA.clientes.map(c => `
                <tr><td>${c.id}</td><td>${c.nom}</td><td>${c.tel}</td>
                <td>${c.cond}</td><td>${c.pedAct}</td></tr>`).join('')
            }</tbody></table>
            <div class="erp-note">CRM con preferencias, articulo/color frecuente y notas del agente</div>`;
        }
        else if(tab === 'cc'){
          panel.innerHTML = `
            <table class="erp-table"><thead><tr>
              <th>Cliente</th><th>Deuda</th><th>Saldo a favor</th><th>Venc.</th>
            </tr></thead><tbody>${
              ERP_DATA.cc.map(c => `
                <tr><td>${c.cli}</td><td style="color:var(--erp-red)">${ERP_FMT(c.deuda)}</td>
                <td style="color:var(--erp-green)">${ERP_FMT(c.fav)}</td>
                <td>${c.venc}</td></tr>`).join('')
            }</tbody></table>
            <div class="erp-note">Cálculo automático de saldos · verificaciones de movimientos</div>`;
        }
        else if(tab === 'stats'){
          const s = ERP_DATA.stats;
          panel.innerHTML = `
            <div class="erp-stat-grid">
              <div class="erp-stat"><div class="lab">Ventas del mes</div><div class="val gold">${ERP_FMT(s.ventasMes)}</div></div>
              <div class="erp-stat"><div class="lab">Pedidos activos</div><div class="val blue">${s.pedidosActivos}</div></div>
              <div class="erp-stat"><div class="lab">Facturado</div><div class="val green">${ERP_FMT(s.facturado)}</div></div>
              <div class="erp-stat"><div class="lab">Metros en stock</div><div class="val gold">${s.metrosStock.toLocaleString("es-AR")} m</div></div>
              <div class="erp-stat"><div class="lab">Ticket promedio</div><div class="val blue">${ERP_FMT(s.ticket)}</div></div>
              <div class="erp-stat"><div class="lab">Alertas activas</div><div class="val green">${s.alertas}</div>
                <div class="erp-bar"><i style="width:${Math.min(100, s.alertas*20)}%"></i></div></div>
            </div>
            <div class="erp-note">Dashboard del sistema · datos de muestra</div>`;
        }
        else if(tab === 'remito'){
          const re = ERP_DATA.stock.slice(0, 3);
          const total = re.reduce((a, s) => a + s.m * 450, 0);
          const fmtMoney = n => "$" + n.toLocaleString("es-AR");
          panel.innerHTML = `
            <div class="erp-remito">
              <h4>REMITO "R-0001-002389" · CANARYTEX</h4>
              <div class="row"><span><strong>Cliente:</strong> Tintorería del Sur</span><span><strong>Fecha:</strong> 10/07/2026</span></div>
              <div class="row"><span><strong>CUIT:</strong> 30-12345678-9</span><span><strong>Remito N°:</strong> 2389</span></div>
              <div class="row"><span><strong>Domicilio:</strong> Av. Caseros 2400, CABA</span><span><strong>Cond. venta:</strong> Cta. Corriente 30 días</span></div>
              <table>
                <thead><tr><th>Código</th><th>Artículo</th><th>Color</th><th>Lote</th><th>Cant.</th><th>Unitario</th><th>Subtotal</th></tr></thead>
                <tbody>
                  ${re.map((s, i) => `
                  <tr><td>${1000 + i}</td><td>${s.art}</td><td>${s.color}</td><td>${s.lot}</td>
                  <td>${s.m} m</td><td>${fmtMoney(450)}</td><td>${fmtMoney(s.m * 450)}</td></tr>`).join('')}
                </tbody>
                <tfoot><tr class="remito-total"><td colspan="6" style="text-align:right">TOTAL</td><td>${fmtMoney(total)}</td></tr></tfoot>
              </table>
              <div class="remito-terms">El solicitante declara recibir la mercadería conforme. Remito no válido como factura. Generado con Pillow en el ERP.</div>
            </div>
            <div class="erp-note">Vista previa de remito generado en el sistema con Pillow</div>`;
        }
      }
      tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
        t.classList.add('active'); t.setAttribute('aria-selected','true');
        render(t.dataset.erpTab);
      }));
      render('stock');
    }

    /* ====================================================
       BUSCAMINAS
       ==================================================== */
    function createMinesweeperWindow(){
      const id = 'game-minesweeper';
      let win = document.getElementById(id);
      if(win){ win.style.display='block'; win.classList.add('open'); win.dataset.minimized='false'; bringToFront(win);
        if(win._msn_game?.reset) try{ win._msn_game.reset(); }catch(_){} return; }
      const boardSize = 8, mines = 10;
      const area = document.createElement('div'); area.style.padding = '12px';
      const ctrl = document.createElement('div');
      ctrl.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
      const title = document.createElement('div');
      title.textContent = `Buscaminas ${boardSize}×${boardSize} · ${mines} minas`;
      const right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '8px';
      const status = document.createElement('span'); status.textContent = 'Listo';
      const restart = document.createElement('button'); restart.type='button'; restart.textContent='Reiniciar';
      right.append(status, restart); ctrl.append(title, right); area.append(ctrl);

      const table = document.createElement('div');
      table.style.cssText = `display:grid;grid-template-rows:repeat(${boardSize},28px);grid-template-columns:repeat(${boardSize},28px);gap:2px`;
      area.append(table);

      let cells = [], running = true;
      function generate(){
        cells = [];
        for(let r=0;r<boardSize;r++) for(let c=0;c<boardSize;c++)
          cells.push({ r,c, m:false, f:false, o:false, n:0, el:null });
        let placed = 0;
        while(placed < mines){ const idx = Math.floor(Math.random()*cells.length);
          if(!cells[idx].m){ cells[idx].m = true; placed++; } }
        cells.forEach(cell => {
          let n = 0;
          for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
            const o = cells.find(x => x.r === cell.r+dr && x.c === cell.c+dc);
            if(o && o.m) n++;
          }
          cell.n = n;
        });
      }
      function reveal(cell){
        if(!running || cell.o || cell.f) return;
        cell.o = true; cell.el.classList.add('open');
        if(cell.m){ cell.el.textContent = '💣'; status.textContent = 'Perdiste'; running = false; revealAll(); return; }
        if(cell.n > 0) cell.el.textContent = cell.n;
        else {
          for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
            const o = cells.find(x => x.r === cell.r+dr && x.c === cell.c+dc);
            if(o && !o.o) reveal(o);
          }
        }
        if(checkWin()){ status.textContent = 'Ganaste 🎉'; running = false; }
      }
      function revealAll(){ cells.forEach(c => { if(c.m) c.el.textContent = '💣'; c.el.classList.add('open'); c.o = true; }); }
      function checkWin(){ return cells.filter(c => c.o).length === cells.length - mines; }
      function render(){
        table.innerHTML = '';
        cells.forEach(cell => {
          const b = document.createElement('button');
          b.type='button'; b.className='ms-cell';
          b.style.cssText='width:28px;height:28px;padding:0;font-size:14px';
          const onC = () => reveal(cell);
          const onR = e => { e.preventDefault(); if(!running || cell.o) return; cell.f = !cell.f; b.textContent = cell.f ? '🚩' : ''; b.classList.toggle('flag', cell.f); };
          b.addEventListener('click', onC); b.addEventListener('contextmenu', onR);
          cell.el = b; cell._handlers = { onC, onR };
          table.appendChild(b);
        });
      }
      function reset(){ running = true; status.textContent = 'Listo'; generate(); render(); }
      generate(); render();
      const created = createWindow(id, 'Buscaminas', area);
      restart.addEventListener('click', reset);
      created._msn_game = {
        destroy: () => { running = false; cells.forEach(c => { if(c.el && c._handlers){ c.el.removeEventListener('click', c._handlers.onC); c.el.removeEventListener('contextmenu', c._handlers.onR); } }); },
        reset, stop(){}, start(){}
      };
    }

    /* ====================================================
       TETRIS
       ==================================================== */
    function createTetrisWindow(){
      const id = 'game-tetris';
      let win = document.getElementById(id);
      if(win){ win.style.display='block'; win.classList.add('open'); win.dataset.minimized='false'; bringToFront(win);
        if(win._msn_game?.start) try{ win._msn_game.start(); }catch(_){} return; }
      const area = document.createElement('div'); area.style.padding = '8px';
      const hud = document.createElement('div');
      hud.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px';
      const infoL = document.createElement('div'); infoL.textContent='← → ↓ ↑ rotar · espacio drop'; infoL.style.cssText='font-size:11px;color:#444';
      const infoR = document.createElement('div'); infoR.className='tetris-hud';
      const sc = document.createElement('div'); sc.textContent='P: 0';
      const lv = document.createElement('div'); lv.textContent='Nv: 1';
      const restart = document.createElement('button'); restart.type='button'; restart.textContent='Reiniciar'; restart.style.cssText='padding:4px 8px';
      infoR.append(sc, lv, restart); hud.append(infoL, infoR); area.append(hud);
      const canvas = document.createElement('canvas');
      canvas.width = 200; canvas.height = 400; canvas.style.cssText='background:#071428;display:block;border-radius:6px';
      area.append(canvas);
      const created = createWindow(id, 'Tetris', area);

      const ctx = canvas.getContext('2d');
      const cols=10, rows=20, size=20;
      let board = Array.from({length:rows}, () => Array(cols).fill(0));
      const pieces = {
        I:{m:[[1,1,1,1]],c:'#00f0f0'}, O:{m:[[1,1],[1,1]],c:'#f0f000'},
        T:{m:[[0,1,0],[1,1,1]],c:'#a000f0'}, S:{m:[[0,1,1],[1,1,0]],c:'#00f000'},
        Z:{m:[[1,1,0],[0,1,1]],c:'#f00000'}, J:{m:[[1,0,0],[1,1,1]],c:'#0000f0'},
        L:{m:[[0,0,1],[1,1,1]],c:'#f0a000'}
      };
      const keys = Object.keys(pieces);
      let current = null, drop = 800, tick = null, score = 0, lines = 0, level = 1, running = true;
      const clone = m => m.map(r => r.slice());
      function rotate(m){ const h=m.length, w=m[0].length; const r = Array.from({length:w},()=>Array(h).fill(0));
        for(let y=0;y<h;y++) for(let x=0;x<w;x++) r[x][h-1-y] = m[y][x]; return r; }
      function collide(b,s,p){
        for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++){
          if(!s[y][x]) continue;
          const px=p.x+x, py=p.y+y;
          if(px<0||px>=cols||py>=rows) return true;
          if(py>=0 && b[py][px]) return true;
        }
        return false;
      }
      function place(b,s,p,v=1){ for(let y=0;y<s.length;y++) for(let x=0;x<s[y].length;x++){
        if(!s[y][x]) continue; const px=p.x+x, py=p.y+y;
        if(py>=0 && py<rows && px>=0 && px<cols) b[py][px]=v; } }
      function spawn(){
        const k = keys[Math.floor(Math.random()*keys.length)];
        const info = pieces[k];
        current = { shape: clone(info.m), x: Math.floor((cols - info.m[0].length)/2), y: -1, color: info.c };
        if(collide(board, current.shape, current)){ running=false; stop();
          sc.textContent = 'Game Over · ' + score; }
      }
      function clearLines(){
        let removed = 0;
        for(let y = rows-1; y >= 0; y--){
          if(board[y].every(v => v === 1)){ board.splice(y,1); board.unshift(Array(cols).fill(0));
            score += 100*level; removed++; y++; }
        }
        if(removed > 0){
          lines += removed;
          const nl = Math.min(10, 1 + Math.floor(lines/5));
          if(nl !== level){ level = nl; drop = Math.max(150, 800 - (level-1)*70);
            if(tick){ clearInterval(tick); tick = setInterval(step, drop); } }
        }
      }
      function step(){
        if(!running || !current) return;
        const next = { x: current.x, y: current.y+1, shape: current.shape };
        if(!collide(board, next.shape, next)){ current.y++; }
        else { place(board, current.shape, current, 1); clearLines(); spawn(); }
        draw(); sc.textContent = 'P: ' + score; lv.textContent = 'Nv: ' + level;
      }
      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(board[r][c]){ ctx.fillStyle='#6cf'; ctx.fillRect(c*size, r*size, size-1, size-1); }
        if(current){ ctx.fillStyle = current.color || '#f6a';
          for(let y=0;y<current.shape.length;y++) for(let x=0;x<current.shape[y].length;x++) if(current.shape[y][x]){
            const px = (current.x+x)*size, py = (current.y+y)*size;
            if(py >= 0) ctx.fillRect(px, py, size-1, size-1); } }
      }
      function start(){ if(!running) running = true; if(!current) spawn(); if(!tick) tick = setInterval(step, drop); }
      function stop(){ if(tick){ clearInterval(tick); tick = null; } }
      function hardDrop(){ if(!current) return; while(!collide(board, current.shape, {x:current.x, y:current.y+1})) current.y++; step(); }
      function move(dx){ if(!current) return; const next = { x: current.x+dx, y: current.y, shape: current.shape };
        if(!collide(board, next.shape, next)) current.x += dx; }
      function rotateCur(){ if(!current) return; const s2 = rotate(current.shape);
        if(!collide(board, s2, {x: current.x, y: current.y})) current.shape = s2; }
      function onKey(e){
        if(!running) return;
        if(e.key === 'ArrowLeft'){ move(-1); draw(); }
        else if(e.key === 'ArrowRight'){ move(1); draw(); }
        else if(e.key === 'ArrowDown'){ step(); }
        else if(e.key === ' '){ e.preventDefault(); hardDrop(); }
        else if(e.key === 'ArrowUp'){ rotateCur(); draw(); }
      }
      function resetGame(){ stop(); board = Array.from({length:rows},()=>Array(cols).fill(0));
        current=null; score=0; lines=0; level=1; drop=800; running=true;
        sc.textContent='P: 0'; lv.textContent='Nv: 1'; spawn(); draw(); tick = setInterval(step, drop); }
      start();
      window.addEventListener('keydown', onKey);
      restart.addEventListener('click', e => { e.stopPropagation(); resetGame(); });
      created._msn_game = { destroy: () => { stop(); window.removeEventListener('keydown', onKey); },
        stop, start, reset: resetGame };
    }

    // init mark
    console.log("MSN: inicialización completa");
  } catch(e){
    console.error("MSN: error crítico:", e);
  }
}); // DOMContentLoaded