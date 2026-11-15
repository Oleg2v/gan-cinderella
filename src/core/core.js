/* =====================================================================
   GAN CINDERELLA · CORE RUNTIME  (window.App)
   Modules register with App.module(name, def). See docs/CONTRACT.md.
   ===================================================================== */
(function () {
  'use strict';
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function h(markup) { const t = document.createElement('template'); t.innerHTML = markup.trim(); return t.content.childElementCount === 1 ? t.content.firstElementChild : t.content; }
  const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const isFine = matchMedia('(pointer: fine)').matches;

  /* ---------- storage (never trusted) ---------- */
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem('gc:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('gc:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  /* ---------- events ---------- */
  const bus = {};
  const on = (evt, fn) => { (bus[evt] = bus[evt] || []).push(fn); return () => { bus[evt] = bus[evt].filter(f => f !== fn); }; };
  const emit = (evt, data) => (bus[evt] || []).slice().forEach(fn => { try { fn(data); } catch (e) { console.error('[App] listener', evt, e); } });

  /* ---------- motion ---------- */
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = {
    get reduced() { return mqReduce.matches || html.classList.contains('a11y-motion'); }
  };
  mqReduce.addEventListener && mqReduce.addEventListener('change', () => emit('motion', motion.reduced));

  /* =====================================================================
     I18N
     ===================================================================== */
  const dict = { he: {}, ru: {} };
  const i18n = {
    lang: 'he',
    add(d) { ['he', 'ru'].forEach(l => Object.assign(dict[l], (d && d[l]) || {})); },
    has(key) { return key in dict[this.lang] || key in dict.he; },
    t(key, vars) {
      let s = dict[i18n.lang][key];
      if (s == null) s = dict.he[key];
      if (s == null) { if (App.debug) console.warn('[i18n] missing', key); return key; }
      if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
      return s;
    },
    apply(root = document) {
      const scope = root.querySelectorAll ? root : document;
      const one = el => {
        const k = el.getAttribute('data-i18n'); if (k) el.textContent = i18n.t(k);
        const kh = el.getAttribute('data-i18n-html'); if (kh) el.innerHTML = i18n.t(kh);
        const ka = el.getAttribute('data-i18n-attr');
        if (ka) ka.split(/[;,]\s*/).forEach(pair => { const [a, key] = pair.split(':').map(s => s.trim()); if (a && key) el.setAttribute(a, i18n.t(key)); });
      };
      if (scope.matches && scope.matches('[data-i18n],[data-i18n-html],[data-i18n-attr]')) one(scope);
      scope.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-attr]').forEach(one);
    },
    set(lang, { animate = true } = {}) {
      if (!dict[lang] || lang === i18n.lang && html.lang === lang) return;
      const run = () => {
        i18n.lang = lang;
        html.lang = lang; html.dir = lang === 'he' ? 'rtl' : 'ltr';
        store.set('lang', lang);
        i18n.apply(document);
        updateDockIndicator(true);
        emit('lang', lang);
      };
      const main = $('#main');
      if (!animate || motion.reduced || !main || !main.animate) { run(); return; }
      main.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-in', fill: 'forwards' }).finished.then(() => {
        run();
        main.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    }
  };
  const t = (k, v) => i18n.t(k, v);
  const L = o => (o == null ? '' : typeof o === 'string' ? o : (o[i18n.lang] != null ? o[i18n.lang] : o.he));

  /* ---------- formatting ---------- */
  const loc = () => (i18n.lang === 'he' ? 'he-IL' : 'ru-RU');
  const pad = n => String(n).padStart(2, '0');
  const HE_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  const RU_DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const fmt = {
    time(d) { if (typeof d === 'string') return d; return pad(d.getHours()) + ':' + pad(d.getMinutes()); },
    date(d, o = { day: 'numeric', month: 'long' }) { try { return new Intl.DateTimeFormat(loc(), o).format(d); } catch (e) { return d.toDateString(); } },
    weekday(d, long = false) { return long ? fmt.date(d, { weekday: 'long' }) : (i18n.lang === 'he' ? HE_DAYS : RU_DAYS)[d.getDay()]; },
    num(n, o = {}) { try { return new Intl.NumberFormat(loc(), o).format(n); } catch (e) { return String(n); } },
    money(n) { return '₪' + fmt.num(n, { maximumFractionDigits: 0 }); },
    pct(n) { return fmt.num(n, { maximumFractionDigits: 0 }) + '%'; }
  };

  /* =====================================================================
     SHARED MOCK DATA (fictional · marked as example in UI)
     ===================================================================== */
  const SHIRTS = { magenta: '#E8048C', blue: '#01AEF2', mint: '#7FC8A9', sun: '#FFB547', lilac: '#9B8CE8', navy: '#2D2B6B', pink: '#F49BB6' };
  const data = {
    groups: [
      { id: 'baby', he: 'תינוקייה', ru: 'Младенческая группа' },
      { id: 'young', he: 'צעירים', ru: 'Младшая группа' },
      { id: 'big', he: 'בוגרים', ru: 'Старшая группа' }
    ],
    allergens: {
      gluten: { he: 'גלוטן', ru: 'глютен' }, milk: { he: 'חלב', ru: 'молоко' }, egg: { he: 'ביצה', ru: 'яйцо' },
      peanuts: { he: 'בוטנים', ru: 'арахис' }, nuts: { he: 'אגוזים', ru: 'орехи' }, sesame: { he: 'שומשום', ru: 'кунжут' },
      fish: { he: 'דגים', ru: 'рыба' }, soy: { he: 'סויה', ru: 'соя' }
    },
    /* group "בוגרים", fictional children */
    kids: [
      { id: 'noa', he: 'נועה', ru: 'Ноа', lang: 'he', look: { skin: 1, hair: 'pigtails', hc: 2, bg: 1, shirt: SHIRTS.magenta, bow: true } },
      { id: 'itai', he: 'איתי', ru: 'Итай', lang: 'he', allergies: ['peanuts'], look: { skin: 2, hair: 'short', hc: 0, bg: 0, shirt: SHIRTS.blue } },
      { id: 'daniel', he: 'דניאל', ru: 'Даниэль', lang: 'ru', look: { skin: 0, hair: 'curly', hc: 4, bg: 2, shirt: SHIRTS.mint } },
      { id: 'maya', he: 'מאיה', ru: 'Майя', lang: 'ru', look: { skin: 0, hair: 'bob', hc: 3, bg: 4, shirt: SHIRTS.pink } },
      { id: 'yonatan', he: 'יונתן', ru: 'Йонатан', lang: 'he', look: { skin: 3, hair: 'buzz', hc: 0, bg: 3, shirt: SHIRTS.sun } },
      { id: 'tamar', he: 'תמר', ru: 'Тамар', lang: 'he', allergies: ['sesame'], look: { skin: 2, hair: 'curly', hc: 0, bg: 5, shirt: SHIRTS.lilac } },
      { id: 'misha', he: 'מישה', ru: 'Миша', lang: 'ru', look: { skin: 0, hair: 'short', hc: 4, bg: 0, shirt: SHIRTS.navy } },
      { id: 'lia', he: 'ליה', ru: 'Лия', lang: 'he', look: { skin: 1, hair: 'bun', hc: 1, bg: 2, shirt: SHIRTS.blue } },
      { id: 'omer', he: 'עומר', ru: 'Омер', lang: 'he', look: { skin: 4, hair: 'curly', hc: 0, bg: 1, shirt: SHIRTS.mint } },
      { id: 'sofia', he: 'סופיה', ru: 'София', lang: 'ru', allergies: ['milk'], look: { skin: 0, hair: 'long', hc: 5, bg: 3, shirt: SHIRTS.magenta } },
      { id: 'ariel', he: 'אריאל', ru: 'Ариэль', lang: 'he', look: { skin: 1, hair: 'short', hc: 2, bg: 4, shirt: SHIRTS.sun } },
      { id: 'shira', he: 'שירה', ru: 'Шира', lang: 'he', look: { skin: 2, hair: 'pigtails', hc: 0, bg: 0, shirt: SHIRTS.lilac, bow: true } },
      { id: 'eitan', he: 'איתן', ru: 'Эйтан', lang: 'he', birthdayTomorrow: true, look: { skin: 1, hair: 'buzz', hc: 3, bg: 5, shirt: SHIRTS.blue } },
      { id: 'alisa', he: 'אליסה', ru: 'Алиса', lang: 'ru', look: { skin: 0, hair: 'bob', hc: 4, bg: 1, shirt: SHIRTS.mint, bow: true } }
    ],
    /* trusted pick-up people (fictional) */
    trusted: {
      noa: [
        { id: 'mom', he: 'אמא · מיכל', ru: 'Мама · Михаль', look: { adult: true, skin: 1, hair: 'long', hc: 2, bg: 1, shirt: SHIRTS.lilac } },
        { id: 'dad', he: 'אבא · רועי', ru: 'Папа · Рои', look: { adult: true, skin: 2, hair: 'short', hc: 0, bg: 0, shirt: SHIRTS.navy, beard: true } },
        { id: 'grandma', he: 'סבתא · אורנה', ru: 'Бабушка · Орна', look: { adult: true, senior: true, skin: 1, hair: 'bun', hc: 6, bg: 2, shirt: SHIRTS.pink, glasses: true } },
        { id: 'aunt', he: 'דודה · שני', ru: 'Тётя · Шани', look: { adult: true, skin: 3, hair: 'bob', hc: 0, bg: 3, shirt: SHIRTS.sun } }
      ],
      daniel: [
        { id: 'mom', he: 'אמא · אולגה', ru: 'Мама · Ольга', look: { adult: true, skin: 0, hair: 'long', hc: 4, bg: 1, shirt: SHIRTS.blue } },
        { id: 'grandma', he: 'סבתא · לודה', ru: 'Бабушка · Люда', look: { adult: true, senior: true, skin: 0, hair: 'bun', hc: 6, bg: 3, shirt: SHIRTS.lilac, glasses: true } }
      ]
    },
    kid(id) { return data.kids.find(k => k.id === id); }
  };
  const kidName = k => (typeof k === 'string' ? L(data.kid(k)) : L(k));

  /* =====================================================================
     AVATAR GENERATOR (illustrated, no real faces)
     ===================================================================== */
  const SKIN = ['#FFE3D1', '#F6C9A6', '#DFA277', '#B77A52', '#83512F'];
  const HAIRC = ['#2A1A12', '#553220', '#8A5A2E', '#C78D4C', '#E7C47D', '#A8401F', '#D9D7E3'];
  const BGC = ['#D0EDFD', '#F3CFDF', '#FDE8C8', '#DDF5EC', '#E7E0FB', '#F6B0C6'];
  let avSeq = 0;
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = clamp(Math.round(r * (1 + amt)), 0, 255); g = clamp(Math.round(g * (1 + amt)), 0, 255); b = clamp(Math.round(b * (1 + amt)), 0, 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function avatar(who, opts = {}) {
    const o = Object.assign({ skin: 1, hair: 'short', hc: 0, bg: 0, shirt: SHIRTS.blue }, (who && who.look) || who || {});
    const id = 'av' + (++avSeq);
    const skin = SKIN[o.skin] || o.skin, hairC = HAIRC[o.hc] != null ? HAIRC[o.hc] : o.hc, bg = BGC[o.bg] || o.bg;
    const ink = '#1B1A4B';
    const back = {
      bob: `<path d="M14.5 33c0-11.5 7.6-19.5 17.5-19.5S49.5 21.5 49.5 33v10.5c0 2.2-1.6 3.6-3.6 3.6H18.1c-2 0-3.6-1.4-3.6-3.6Z" fill="${hairC}"/>`,
      long: `<path d="M13.5 34c0-12.5 8-21 18.5-21s18.5 8.5 18.5 21v20c0 2.4-2 4-4.4 4H17.9c-2.4 0-4.4-1.6-4.4-4Z" fill="${hairC}"/>`
    }[o.hair] || '';
    const front = {
      short: `<path d="M17.6 30.5C17.2 20.6 23.6 15 32 15s14.8 5.6 14.4 15.5c-2.2-4-5.3-6.3-9-7-2.4 2.2-6.2 3.4-10.6 3.3-3.6 0-6.8 1.4-9.2 3.7Z" fill="${hairC}"/>`,
      buzz: `<path d="M19 26.5c1.8-6.6 7-10.6 13-10.6s11.2 4 13 10.6c-4-2.4-8.3-3.4-13-3.4s-9 1-13 3.4Z" fill="${hairC}"/>`,
      curly: [[19.5, 25, 5.4], [23.5, 18.8, 5.8], [31.8, 15.6, 6.4], [40.2, 18.8, 5.8], [44.5, 25, 5.4], [27.5, 21.5, 5], [36.5, 21.5, 5]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hairC}"/>`).join(''),
      pigtails: `<circle cx="13.5" cy="29" r="5.6" fill="${hairC}"/><circle cx="50.5" cy="29" r="5.6" fill="${hairC}"/><path d="M18 29c0-8.5 6.2-14 14-14s14 5.5 14 14c-4-4-8.8-5.6-14-5.6S22 25 18 29Z" fill="${hairC}"/><circle cx="17.6" cy="26" r="2" fill="#E8048C"/><circle cx="46.4" cy="26" r="2" fill="#E8048C"/>`,
      bun: `<circle cx="32" cy="12.5" r="6.2" fill="${hairC}"/><path d="M18 29.5c0-8.8 6.2-14.5 14-14.5s14 5.7 14 14.5c-4-4.3-8.6-6-14-6s-10 1.7-14 6Z" fill="${hairC}"/>`,
      bob: `<path d="M18 28c1.6-8 7.4-12.8 14-12.8S44.4 20 46 28c-5-3-9.4-4-14-4s-9 1-14 4Z" fill="${hairC}"/>`,
      long: `<path d="M18 29c1-8.4 6.8-13.8 14-13.8 6.8 0 12.4 4.6 14 12.4-6.4-.6-11.4-3-14.4-7.2-2.6 4.4-7 7.4-13.6 8.6Z" fill="${hairC}"/>`
    }[o.hair] || '';
    const bow = o.bow && o.hair !== 'pigtails' ? `<path d="M40 16.5l5-3v6Zm0 0-5-3v6Z" fill="#E8048C"/><circle cx="40" cy="16.5" r="1.6" fill="#B8036E"/>` : '';
    const glasses = o.glasses ? `<g fill="none" stroke="${ink}" stroke-width="1.4"><circle cx="26.5" cy="31" r="3.6"/><circle cx="37.5" cy="31" r="3.6"/><path d="M30.1 31h3.8"/></g>` : '';
    const beard = o.beard ? `<path d="M19.8 33.5c.8 8.4 5.6 12.8 12.2 12.8s11.4-4.4 12.2-12.8c-2.6 2.6-6.6 3.4-12.2 3.4s-9.6-.8-12.2-3.4Z" fill="${hairC}"/>` : '';
    const mouth = o.beard ? `<path d="M28.8 37.8q3.2 2.4 6.4 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>` : `<path d="M28.6 36.4q3.4 3 6.8 0" stroke="${ink}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    const head = `${back}
      <rect x="28" y="40" width="8" height="9" rx="3" fill="${shade(skin, -0.08)}"/>
      <circle cx="18.6" cy="31.5" r="3.4" fill="${skin}"/><circle cx="45.4" cy="31.5" r="3.4" fill="${skin}"/>
      <circle cx="32" cy="30" r="14" fill="${skin}"/>
      ${beard}${front}${bow}
      <circle cx="26.6" cy="31" r="1.75" fill="${ink}"/><circle cx="37.4" cy="31" r="1.75" fill="${ink}"/>
      <circle cx="23.4" cy="35.4" r="2.4" fill="#F27FA5" opacity=".45"/><circle cx="40.6" cy="35.4" r="2.4" fill="#F27FA5" opacity=".45"/>
      ${mouth}${glasses}`;
    const label = opts.label != null ? opts.label : (who && (who.he || who.ru) ? L(who) : '');
    const headT = o.adult ? 'translate(32 31) scale(.86) translate(-32 -29)' : '';
    return `<svg viewBox="0 0 64 64" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}><defs><clipPath id="${id}"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#${id})"><rect width="64" height="64" fill="${bg}"/><path d="M${o.adult ? 6 : 10} 66c1-11.5 9.5-17.5 ${o.adult ? 26 : 22}-17.5s${o.adult ? 25 : 21} 6 ${o.adult ? 26 : 22} 17.5Z" fill="${o.shirt}"/><g transform="${headT}">${head}</g></g></svg>`;
  }
  const avatarEl = (who, size = 48, opts) => `<span class="av" style="--s:${size}px">${avatar(who, opts)}</span>`;

  /* =====================================================================
     FX · particle canvas (pre-rendered star sprites, pooled)
     ===================================================================== */
  const FX = (() => {
    const COLORS = { magenta: '#E8048C', pink: '#F6B0C6', blue: '#01AEF2', sky: '#BFE6FC', gold: '#FFD27A', white: '#FFFFFF', blush: '#F3CFDF' };
    let cv, ctx, W = 0, H = 0, dpr = 1, parts = [], running = false, last = 0;
    const sprites = {};
    const MAX = isTouch ? 220 : 520;
    function sprite(color, kind) {
      const key = color + kind; if (sprites[key]) return sprites[key];
      const n = 64, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, color + 'AA'); grd.addColorStop(.35, color + '33'); grd.addColorStop(1, color + '00');
      g.fillStyle = grd; g.fillRect(0, 0, n, n);
      if (kind === 'star') {
        g.fillStyle = color; g.beginPath();
        const R = 27, r = 4.2;
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r : R; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); }
        g.closePath(); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 3.2, 0, Math.PI * 2); g.fill();
      } else {
        g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 5, 0, Math.PI * 2); g.fill();
      }
      return (sprites[key] = c);
    }
    function init() {
      cv = $('.fx-canvas'); if (!cv) return; ctx = cv.getContext('2d');
      resize(); addEventListener('resize', resize, { passive: true });
    }
    function resize() {
      if (!cv) return; dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function add(p) {
      if (!ctx) return; if (parts.length >= MAX) parts.splice(0, parts.length - MAX + 1);
      parts.push(p); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    }
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.t += dt;
        if (p.t >= p.life) { parts.splice(i, 1); continue; }
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        const k = p.t / p.life;
        let a = k < .15 ? k / .15 : 1 - Math.pow((k - .15) / .85, 2);
        if (p.tw) a *= .55 + .45 * Math.sin(p.t * p.tw + p.ph);
        const s = p.size * (p.grow ? (.4 + k * .9) : (1 - k * .45));
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.setTransform(dpr * Math.cos(p.rot), dpr * Math.sin(p.rot), -dpr * Math.sin(p.rot), dpr * Math.cos(p.rot), p.x * dpr, p.y * dpr);
        ctx.drawImage(p.img, -s / 2, -s / 2, s, s);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, W, H); }
    }
    const col = c => COLORS[c] || c;
    function particle(x, y, o) {
      const ang = o.angle != null ? o.angle + rand(-o.spread / 2, o.spread / 2) : rand(0, Math.PI * 2);
      const sp = rand(o.speed[0], o.speed[1]);
      return {
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: o.gravity, drag: o.drag,
        t: 0, life: rand(o.life[0], o.life[1]) / 1000, size: rand(o.size[0], o.size[1]),
        rot: rand(0, Math.PI), vr: rand(-3, 3), tw: o.twinkle ? rand(8, 16) : 0, ph: rand(0, 6),
        img: sprite(col(pick(o.colors)), Math.random() < o.starRatio ? 'star' : 'dot'), grow: !!o.grow
      };
    }
    const base = { count: 26, colors: ['magenta', 'pink', 'gold', 'white', 'blue'], speed: [120, 380], size: [10, 26], life: [600, 1200], gravity: 260, drag: .985, spread: Math.PI * 2, angle: null, starRatio: .7, twinkle: true };
    return {
      init, resize, COLORS,
      burst(x, y, o = {}) {
        if (motion.reduced) return; o = Object.assign({}, base, o);
        for (let i = 0; i < o.count; i++) add(particle(x, y, o));
      },
      burstAt(el, o = {}) { if (!el) return; const r = el.getBoundingClientRect(); this.burst(r.left + r.width / 2, r.top + r.height / 2, o); },
      trail(x, y, o = {}) {
        if (motion.reduced) return;
        add(particle(x + rand(-3, 3), y + rand(-3, 3), Object.assign({}, base, { speed: [8, 50], size: [6, 15], life: [450, 900], gravity: 40, angle: -Math.PI / 2, spread: Math.PI * 1.4, starRatio: .55 }, o)));
      },
      ring(x, y, r, n = 8, o = {}) {
        if (motion.reduced) return;
        for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2); add(particle(x + Math.cos(a) * r, y + Math.sin(a) * r, Object.assign({}, base, { speed: [10, 70], size: [8, 22], life: [500, 1000], gravity: 60, angle: a, spread: .6 }, o))); }
      },
      rain(n = 40, o = {}) {
        if (motion.reduced) return;
        for (let i = 0; i < n; i++) add(particle(rand(0, W), rand(-20, H * .9), Object.assign({}, base, { speed: [5, 40], size: [6, 18], life: [700, 1600], gravity: 70, angle: Math.PI / 2, spread: 1, starRatio: .6 }, o)));
      },
      clear() { parts.length = 0; }
    };
  })();

  /* =====================================================================
     UI · sheets, toasts, phone mocks
     ===================================================================== */
  const sheets = [];
  let sheetSeq = 0;
  function lockScroll(lock) {
    if (lock) { html.classList.add('sheet-open'); if (lenis) lenis.stop(); }
    else { html.classList.remove('sheet-open'); if (lenis) lenis.start(); }
  }
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  function sheet(o = {}) {
    const id = 'sh' + (++sheetSeq);
    const root = h(`<div class="sheet-root ${o.size === 'full' ? 'sheet--full' : ''} ${o.className || ''}" style="--z:${100 + sheets.length * 10}">
      <div class="sheet-backdrop" data-close></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="${id}-t" tabindex="-1">
        <div class="sheet__grab" aria-hidden="true"><i></i></div>
        <header class="sheet__head"><h2 class="sheet__title" id="${id}-t"></h2>
          <button type="button" class="sheet__close" data-close data-i18n-attr="aria-label:core.close" aria-label="${esc(t('core.close'))}">${icon('close')}</button></header>
        <div class="sheet__body" data-lenis-prevent></div>
      </section></div>`);
    const titleEl = $('.sheet__title', root), body = $('.sheet__body', root), panel = $('.sheet', root);
    const api = {
      root, el: panel, body, closed: false,
      setTitle(x) { if (x && typeof x === 'object' && x.key) { titleEl.setAttribute('data-i18n', x.key); titleEl.textContent = t(x.key); } else { titleEl.removeAttribute('data-i18n'); titleEl.textContent = L(x) || ''; } },
      setContent(c) { body.innerHTML = ''; if (c == null) return; if (typeof c === 'string') body.innerHTML = c; else body.append(c); i18n.apply(body); reveal(body); },
      close(reason) {
        if (api.closed) return; api.closed = true;
        root.classList.remove('is-open');
        const i = sheets.indexOf(api); if (i > -1) sheets.splice(i, 1);
        setTimeout(() => root.remove(), 520);
        if (!sheets.length) lockScroll(false);
        if (api._prev && api._prev.focus) { try { api._prev.focus({ preventScroll: true }); } catch (e) { } }
        o.onClose && o.onClose(reason);
      }
    };
    if (o.titleKey) api.setTitle({ key: o.titleKey }); else api.setTitle(o.title);
    if (o.hideTitle) titleEl.classList.add('sr-only');
    api.setContent(o.content);
    root.addEventListener('click', e => { if (e.target.closest('[data-close]')) api.close('dismiss'); });
    // drag down to close (phone)
    let y0 = null, dy = 0;
    const startDrag = e => { if (innerWidth >= 760) return; y0 = e.clientY; dy = 0; root.classList.add('is-dragging'); e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); };
    const moveDrag = e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); panel.style.setProperty('--drag', dy + 'px'); };
    const endDrag = () => { if (y0 == null) return; root.classList.remove('is-dragging'); y0 = null; if (dy > 110) api.close('drag'); else panel.style.setProperty('--drag', '0px'); };
    [$('.sheet__grab', root), $('.sheet__head', root)].forEach(el => {
      el.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; startDrag(e); });
      el.addEventListener('pointermove', moveDrag); el.addEventListener('pointerup', endDrag); el.addEventListener('pointercancel', endDrag);
    });
    api._prev = document.activeElement;
    document.body.append(root);
    sheets.push(api); lockScroll(true);
    requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.add('is-open'); }));
    setTimeout(() => { const f = o.focus ? $(o.focus, root) : null; try { (f || panel).focus({ preventScroll: true }); } catch (e) { } }, 60);
    return api;
  }
  function trapTab(e) {
    const top = sheets[sheets.length - 1]; if (!top || e.key !== 'Tab') return;
    const f = $$(FOCUSABLE, top.el).filter(x => x.offsetParent !== null); if (!f.length) return;
    const first = f[0], lastF = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
    else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
  }

  function toast(msg, o = {}) {
    const box = $('.toasts'); if (!box) return;
    const el = h(`<div class="toast ${o.tone ? 'toast--' + o.tone : ''}" role="status">${icon(o.icon || 'check-circle')}<span></span></div>`);
    $('span', el).textContent = typeof msg === 'object' ? L(msg) : msg;
    box.append(el);
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 380); }, o.ms || 2600);
    return el;
  }

  /* phone mock: App.ui.phone({time, date, light, notifs:[{title,text,time,icon}], size}) */
  function phone(o = {}) {
    const el = h(`<div class="phone" style="--pw:${o.size || 260}px">
      <div class="phone__screen ${o.light ? 'phone__screen--light' : ''}">
        <div class="phone__island"></div>
        <div class="phone__status"><span class="tnum">${esc(o.time || '17:30')}</span><span aria-hidden="true">●●● ▮</span></div>
        <div class="phone__lock"><div class="phone__date"></div><div class="phone__clock tnum"></div></div>
        <div class="phone__notifs" aria-live="polite"></div>
      </div></div>`);
    const screen = $('.phone__screen', el), list = $('.phone__notifs', el);
    $('.phone__date', el).textContent = o.date ? L(o.date) : fmt.date(new Date(), { weekday: 'long', day: 'numeric', month: 'long' });
    $('.phone__clock', el).textContent = o.time || '17:30';
    el.setTime = tm => { $('.phone__clock', el).textContent = tm; $('.phone__status span', el).textContent = tm; };
    el.notify = (n, animate = true) => {
      const card = h(`<div class="notif ${animate ? 'is-new' : ''}"><div class="notif__app">${icon(n.icon || 'sparkle', 'ic--fill')}</div>
        <div class="notif__main"><div class="notif__top"><span class="notif__title"></span><span class="tnum"></span></div><div class="notif__text"></div></div></div>`);
      $('.notif__title', card).textContent = L(n.title || { he: 'גן סינדרלה', ru: 'Сад «Синдерелла»' });
      $('.notif__top .tnum', card).textContent = L(n.time || { he: 'עכשיו', ru: 'сейчас' });
      $('.notif__text', card).textContent = L(n.text || '');
      list.prepend(card);
      while (list.children.length > (o.max || 3)) list.lastElementChild.remove();
      return card;
    };
    el.chat = (c = {}) => {
      const old = $('.chatv', screen); if (old) old.remove();
      const v = h(`<div class="chatv"><div class="chatv__head"><span class="chatv__av"></span><span class="chatv__name"></span></div><div class="chatv__body"></div></div>`);
      $('.chatv__name', v).textContent = L(c.title || { he: 'גן סינדרלה', ru: 'Сад «Синдерелла»' });
      if (c.avatar) $('.chatv__av', v).innerHTML = c.avatar; else $('.chatv__av', v).innerHTML = logoMarkup();
      screen.append(v);
      const bodyEl = $('.chatv__body', v);
      v.add = (m, animate = true) => {
        const b = h(`<div class="bubble ${m.out ? 'bubble--out' : ''} ${animate ? 'is-new' : ''}"><span class="bubble__t"></span><span class="bubble__meta"><span class="tnum"></span>${m.out ? icon('checks') : ''}</span></div>`);
        $('.bubble__t', b).textContent = L(m.text); $('.bubble__meta .tnum', b).textContent = m.time || '';
        bodyEl.append(b); return b;
      };
      (c.messages || []).forEach(m => v.add(m, false));
      return v;
    };
    (o.notifs || []).forEach(n => el.notify(n, false));
    return el;
  }

  /* logo: real file inlined by build (window.__LOGO__) or a neutral placeholder */
  function logoMarkup() {
    return window.__LOGO__ ? `<img src="${window.__LOGO__}" alt="${esc(t('core.logoAlt'))}" data-i18n-attr="alt:core.logoAlt">` : `<span class="logo-ph" role="img" aria-label="${esc(t('core.logoAlt'))}"><span>${esc(t('core.brand'))}</span></span>`;
  }
  function fillLogos(root = document) { $$('[data-logo]', root).forEach(el => { if (!el.dataset.logoDone) { el.innerHTML = logoMarkup(); el.dataset.logoDone = '1'; } }); }

  /* =====================================================================
     SCROLL · Lenis (desktop only) + helpers
     ===================================================================== */
  let lenis = null;
  function initLenis() {
    if (!window.Lenis || !isFine || motion.reduced) return;
    try {
      lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, prevent: node => !!(node && node.closest && node.closest('.sheet-root,[data-lenis-prevent]')) });
      html.classList.add('has-lenis');
      const raf = time => { lenis && lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { console.warn('Lenis off', e); lenis = null; }
  }
  const scrollY = () => window.scrollY || window.pageYOffset || 0;
  const easeIO = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function scrollTo(target, o = {}) {
    let y;
    const vh = innerHeight;
    if (typeof target === 'number') y = target;
    else {
      const el = typeof target === 'string' ? $(target) : target; if (!el) return Promise.resolve();
      const r = el.getBoundingClientRect();
      y = o.center ? scrollY() + r.top + r.height / 2 - vh / 2 : scrollY() + r.top - (o.offset != null ? o.offset : 76);
    }
    y = clamp(y, 0, Math.max(0, document.documentElement.scrollHeight - vh));
    const dur = o.duration != null ? o.duration : clamp(Math.abs(y - scrollY()) * .5, 400, 1400);
    if (motion.reduced || dur <= 0) { lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y); return Promise.resolve(); }
    return new Promise(res => {
      const signal = o.signal;
      if (lenis) {
        let done = false; const fin = () => { if (!done) { done = true; res(); } };
        lenis.scrollTo(y, { duration: dur / 1000, force: true, easing: o.linear ? (x => x) : easeIO, onComplete: fin });
        setTimeout(fin, dur + 120);
        signal && signal.addEventListener('abort', () => { lenis.scrollTo(scrollY(), { immediate: true, force: true }); fin(); });
        return;
      }
      const y0 = scrollY(), t0 = performance.now();
      const step = now => {
        if (signal && signal.aborted) return res();
        const k = clamp((now - t0) / dur, 0, 1);
        window.scrollTo(0, lerp(y0, y, o.linear ? k : easeIO(k)));
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  const scrollSubs = new Set(); let scrollTick = false;
  function onScroll(fn) { scrollSubs.add(fn); return () => scrollSubs.delete(fn); }
  addEventListener('scroll', () => {
    if (scrollTick) return; scrollTick = true;
    requestAnimationFrame(() => { scrollTick = false; const y = scrollY(); scrollSubs.forEach(fn => { try { fn(y); } catch (e) { console.error(e); } }); });
  }, { passive: true });
  /* progress of an element through the viewport (0 when its top hits viewport top, 1 when its bottom hits viewport bottom) */
  function progress(el) { const r = el.getBoundingClientRect(); const total = r.height - innerHeight; return total <= 0 ? (r.top <= 0 ? 1 : 0) : clamp(-r.top / total, 0, 1); }

  /* =====================================================================
     REVEAL · COUNT-UP · MAGNETIC · SPARKLE TRAIL
     ===================================================================== */
  let revealIO = null;
  function reveal(root = document) {
    const els = $$('[data-reveal]:not(.is-in)', root.querySelectorAll ? root : document);
    if (!revealIO || motion.reduced) { els.forEach(el => { el.classList.add('is-in'); countFrom(el); }); return; }
    els.forEach(el => revealIO.observe(el));
  }
  function initReveal() {
    if (!('IntersectionObserver' in window) || motion.reduced) { reveal(); return; }
    revealIO = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); countFrom(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    html.classList.add('reveal-armed');
    reveal();
  }
  function countFrom(el) { $$('[data-count]', el).concat(el.hasAttribute('data-count') ? [el] : []).forEach(c => { if (!c.dataset.counted) { c.dataset.counted = '1'; countUp(c, +c.dataset.count, { suffix: c.dataset.suffix || '', prefix: c.dataset.prefix || '' }); } }); }
  function countUp(el, to, o = {}) {
    const dur = motion.reduced ? 0 : (o.duration || 1300), from = o.from || 0, t0 = performance.now();
    const out = v => (o.prefix || '') + fmt.num(o.decimals ? +v.toFixed(o.decimals) : Math.round(v)) + (o.suffix || '');
    if (!dur) { el.textContent = out(to); return; }
    const step = now => { const k = clamp((now - t0) / dur, 0, 1); el.textContent = out(lerp(from, to, 1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function initMagnetic() {
    if (!isFine) return;
    let cur = null;
    document.addEventListener('pointermove', e => {
      if (motion.reduced) return;
      const el = e.target.closest && e.target.closest('[data-magnetic]');
      if (cur && cur !== el) { cur.style.transform = ''; cur = null; }
      if (!el) return; cur = el;
      const r = el.getBoundingClientRect(); const s = +(el.dataset.magnetic || .28);
      const dx = clamp((e.clientX - (r.left + r.width / 2)) * s, -14, 14), dy = clamp((e.clientY - (r.top + r.height / 2)) * s, -10, 10);
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (cur) { cur.style.transform = ''; cur = null; } });
  }
  function initTrail() {
    let lx = 0, ly = 0;
    document.addEventListener('pointermove', e => {
      if (motion.reduced || Tour.running) return;
      const zone = e.pointerType === 'mouse' ? true : !!(e.target.closest && e.target.closest('[data-sparkle-zone]'));
      if (!zone) return;
      const d = Math.hypot(e.clientX - lx, e.clientY - ly);
      if (d < (e.pointerType === 'mouse' ? 26 : 14)) return;
      lx = e.clientX; ly = e.clientY;
      FX.trail(e.clientX, e.clientY, e.pointerType === 'mouse' ? { size: [5, 12] } : {});
    }, { passive: true });
  }

  /* =====================================================================
     MODULES + VIEWS + PIXIE-DUST TRANSITION
     ===================================================================== */
  const modules = {};
  const VIEWS = ['visitors', 'parents', 'staff', 'owner'];
  const state = { view: 'visitors', memo: {} };
  function module(name, def) { def.name = name; modules[name] = def; if (def.i18n) i18n.add(def.i18n); return def; }
  const mod = name => modules[name];
  const modsOf = view => Object.values(modules).filter(m => m.view === view);
  const viewEl = v => $(`.view[data-view="${v}"]`);
  const call = (m, fn, ...a) => { try { return m[fn] && m[fn](...a); } catch (e) { console.error(`[${m.name}.${fn}]`, e); } };

  function updateDockIndicator(instant) {
    const bar = $('.dock__bar'), ind = $('.dock__ind'); if (!bar || !ind) return;
    const btn = $(`.dock__btn[data-go="${state.view}"]`); if (!btn) return;
    if (instant) ind.style.transition = 'none';
    ind.style.width = btn.offsetWidth + 'px';
    ind.style.insetInlineStart = 'auto'; ind.style.left = '0px';
    ind.style.setProperty('--x', btn.offsetLeft + 'px');
    if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
  }
  function setDock(view) { $$('.dock__btn').forEach(b => b.setAttribute('aria-current', b.dataset.go === view ? 'page' : 'false')); }

  let busy = false;
  async function go(view, o = {}) {
    if (!VIEWS.includes(view)) view = 'visitors';
    if (view === state.view || busy) return;
    busy = true;
    const from = state.view, oldEl = viewEl(from), newEl = viewEl(view);
    state.memo[from] = scrollY();
    modsOf(from).forEach(m => call(m, 'onLeave'));
    setDock(view);
    state.view = view; updateDockIndicator(false);
    const swap = () => {
      sheets.slice().forEach(s => s.close('view'));
      oldEl.hidden = true; newEl.hidden = false;
      html.dataset.view = view;
      const y = state.memo[view] || 0;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
      newEl.classList.remove('is-entering'); void newEl.offsetWidth; newEl.classList.add('is-entering');
      try { history.replaceState(null, '', '#' + view); } catch (e) { }
      updateTopbar();
      modsOf(view).forEach(m => call(m, 'onEnter'));
      reveal(newEl);
      emit('view', view);
      if (o.focus !== false) { try { newEl.focus({ preventScroll: true }); } catch (e) { } }
    };
    try {
      if (o.instant || motion.reduced || !document.body.animate) { swap(); return; }
      await pixie(o.origin, swap);
    } finally { busy = false; }
  }
  function originOf(o) {
    if (o && o.getBoundingClientRect) { const r = o.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    if (o && o.x != null) return o;
    return { x: innerWidth / 2, y: innerHeight - 50 };
  }
  async function pixie(origin, swap) {
    const box = $('.pixie'), bloom = $('.pixie__bloom');
    const { x, y } = originOf(origin);
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
    Object.assign(bloom.style, { width: R * 2 + 'px', height: R * 2 + 'px', left: x - R + 'px', top: y - R + 'px' });
    box.hidden = false;
    // ring of dust riding the bloom edge
    const T1 = 560, t0 = performance.now();
    let alive = true;
    const ringLoop = now => {
      if (!alive) return;
      const k = clamp((now - t0) / T1, 0, 1), e = easeIO(k), r = R * e;
      const n = isTouch ? 4 : 7;
      for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2); FX.trail(x + Math.cos(a) * r, y + Math.sin(a) * r, { speed: [20, 90], size: [8, 20], life: [500, 900], angle: a, spread: .8, gravity: 30, colors: ['magenta', 'gold', 'white', 'blue', 'pink'] }); }
      if (k < 1) requestAnimationFrame(ringLoop);
    };
    FX.burst(x, y, { count: isTouch ? 34 : 60, speed: [180, 620], life: [700, 1300], gravity: 120, size: [10, 28] });
    requestAnimationFrame(ringLoop);
    await bloom.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 1 }], { duration: T1, easing: 'cubic-bezier(.62,0,.32,1)', fill: 'forwards' }).finished.catch(() => { });
    alive = false;
    swap();
    FX.rain(isTouch ? 36 : 70, { colors: ['magenta', 'gold', 'white', 'blue', 'pink'] });
    await bloom.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.08)', opacity: 0 }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }).finished.catch(() => { });
    box.hidden = true; bloom.getAnimations && bloom.getAnimations().forEach(a => a.cancel());
  }

  /* ---------- top bar ---------- */
  function updateTopbar() {
    const bar = $('.topbar'); if (!bar) return;
    bar.classList.toggle('is-solid', state.view !== 'visitors' || scrollY() > 24);
    const inv = $('.tour-invite');
    if (inv && !inv.dataset.dismissed) inv.hidden = Tour.running || state.view !== 'visitors' || scrollY() > 420;
  }

  /* ---------- a11y panel + statement ---------- */
  const A11Y = ['a11y-contrast', 'a11y-motion', 'a11y-links', 'a11y-font'];
  function a11yApply() {
    const s = store.get('a11y', {});
    html.classList.remove('a11y-text-1', 'a11y-text-2');
    if (s.text) html.classList.add('a11y-text-' + s.text);
    A11Y.forEach(c => html.classList.toggle(c, !!s[c]));
    emit('motion', motion.reduced);
  }
  function a11yPanel() {
    const s = store.get('a11y', {});
    const sw = (k, ic, key) => `<button type="button" class="a11y-item" role="switch" aria-checked="${!!s[k]}" data-a11y="${k}"><span class="icon-bubble">${icon(ic)}</span><span class="a11y-item__t" data-i18n="${key}">${esc(t(key))}</span><span class="switch" aria-hidden="true"></span></button>`;
    const content = h(`<div class="stack" style="--gap:8px">
      <div class="a11y-item" style="cursor:default"><span class="icon-bubble">${icon('search')}</span><span class="a11y-item__t" data-i18n="core.a11y.text">${esc(t('core.a11y.text'))}</span>
        <span class="a11y-size" role="group" data-i18n-attr="aria-label:core.a11y.text">${[0, 1, 2].map(n => `<button type="button" data-size="${n}" aria-pressed="${(s.text || 0) === n}" style="font-size:${14 + n * 3}px">${'א'}</button>`).join('')}</span></div>
      ${sw('a11y-contrast', 'eye', 'core.a11y.contrast')}
      ${sw('a11y-motion', 'pause', 'core.a11y.motion')}
      ${sw('a11y-links', 'link', 'core.a11y.links')}
      ${sw('a11y-font', 'doc', 'core.a11y.font')}
      <div class="row" style="margin-top:12px; justify-content:space-between">
        <button type="button" class="btn btn--ghost btn--sm" data-a11y-statement>${icon('a11y')}<span data-i18n="core.a11y.statement">${esc(t('core.a11y.statement'))}</span></button>
        <button type="button" class="btn btn--soft btn--sm" data-a11y-reset>${icon('refresh')}<span data-i18n="core.a11y.reset">${esc(t('core.a11y.reset'))}</span></button>
      </div></div>`);
    $$('.a11y-size button', content).forEach(b => {
      b.textContent = i18n.lang === 'he' ? 'א' : 'A';
      b.addEventListener('click', () => { const v = store.get('a11y', {}); v.text = +b.dataset.size; store.set('a11y', v); a11yApply(); $$('.a11y-size button', content).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    });
    $$('[data-a11y]', content).forEach(b => b.addEventListener('click', () => {
      const v = store.get('a11y', {}); const k = b.dataset.a11y; v[k] = !v[k]; store.set('a11y', v); a11yApply(); b.setAttribute('aria-checked', !!v[k]);
    }));
    $('[data-a11y-reset]', content).addEventListener('click', () => { store.set('a11y', {}); a11yApply(); $$('[data-a11y]', content).forEach(b => b.setAttribute('aria-checked', 'false')); $$('.a11y-size button', content).forEach((x, i) => x.setAttribute('aria-pressed', i === 0)); });
    $('[data-a11y-statement]', content).addEventListener('click', statement);
    sheet({ titleKey: 'core.a11y.title', content });
  }
  function statement() {
    sheet({ titleKey: 'core.a11y.statement', content: `<div class="prose" data-i18n-html="core.a11y.statementBody">${t('core.a11y.statementBody')}</div>` });
  }

  /* =====================================================================
     TOUR ENGINE · ghost finger + captions
     ===================================================================== */
  const Tour = {
    running: false, ctrl: null, finger: { x: 0, y: 0, shown: false },
    steps: [],
    define(steps) { Tour.steps = steps; },
    async start() {
      if (Tour.running) return;
      Tour.running = true; Tour.ctrl = new AbortController();
      const signal = Tour.ctrl.signal;
      html.classList.add('is-touring');
      const inv = $('.tour-invite'); if (inv) { inv.hidden = true; inv.dataset.dismissed = '1'; store.set('inviteDismissed', true); }
      sheets.slice().forEach(s => s.close('tour'));
      $('.tour-shield').hidden = false; $('.tour-cap').hidden = false;
      const bar = $('.tour-cap__bar'); bar.innerHTML = Tour.steps.map(() => '<i></i>').join('');
      emit('tour:start');
      const ctx = Tour.ctx(signal);
      try {
        for (let i = 0; i < Tour.steps.length; i++) {
          const s = Tour.steps[i]; ctx.check();
          Tour.progress(i, 0);
          if (s.caption) ctx.caption(s.caption);
          const tStart = performance.now(), est = s.dur || 7000;
          let tick = true; const loop = () => { if (!tick) return; Tour.progress(i, Math.min(.95, (performance.now() - tStart) / est)); requestAnimationFrame(loop); };
          requestAnimationFrame(loop);
          try {
            if (s.view && state.view !== s.view) await ctx.go(s.view);
            const m = s.module && mod(s.module);
            const fn = m && m.tour && m.tour[s.fn];
            if (fn) await fn(ctx); else if (s.run) await s.run(ctx); else await ctx.wait(1500);
          } catch (e) { if (e && e.name === 'AbortError') throw e; console.warn('[tour] step failed', s, e); }
          tick = false; Tour.progress(i, 1);
        }
        await Tour.finale(ctx);
      } catch (e) { if (!e || e.name !== 'AbortError') console.error(e); }
      finally { Tour.cleanup(); }
    },
    stop() { if (Tour.ctrl) Tour.ctrl.abort(); },
    cleanup() {
      Tour.running = false; html.classList.remove('is-touring');
      $('.tour-shield').hidden = true; $('.tour-cap').hidden = true;
      const f = $('.ghost-finger'); f.hidden = true; Tour.finger.shown = false;
      emit('tour:stop'); updateTopbar();
    },
    progress(i, p) { $$('.tour-cap__bar i').forEach((el, j) => el.style.setProperty('--p', j < i ? 1 : j === i ? p : 0)); },
    async finale(ctx) {
      $('.tour-cap').hidden = true; $('.ghost-finger').hidden = true;
      const box = h(`<div class="tour-end stack" style="--gap:18px; align-items:center; padding: 8px 0 12px">
        <span class="brand__logo" data-logo style="width:84px;height:84px"></span>
        <p class="display" data-i18n="core.tour.endTitle">${esc(t('core.tour.endTitle'))}</p>
        <p class="lead" style="margin-inline:auto" data-i18n="core.tour.endText">${esc(t('core.tour.endText'))}</p>
        <div class="row" style="justify-content:center">
          <button type="button" class="btn btn--primary" data-explore>${icon('sparkles', 'ic--fill')}<span data-i18n="core.tour.explore">${esc(t('core.tour.explore'))}</span></button>
          <button type="button" class="btn btn--ghost" data-again>${icon('refresh')}<span data-i18n="core.tour.again">${esc(t('core.tour.again'))}</span></button>
        </div>
        <a class="tiny muted" href="https://kikkey.com" target="_blank" rel="noopener" data-i18n="core.credit">${esc(t('core.credit'))}</a>
      </div>`);
      fillLogos(box);
      const s = sheet({ titleKey: 'core.tour.endA11y', hideTitle: true, content: box });
      FX.rain(isTouch ? 60 : 110);
      setTimeout(() => FX.burstAt($('[data-logo]', box), { count: 40 }), 450);
      $('[data-explore]', box).addEventListener('click', () => { s.close(); go('visitors', { origin: $('.dock__btn[data-go="visitors"]') }); });
      $('[data-again]', box).addEventListener('click', () => { s.close(); setTimeout(() => Tour.start(), 450); });
    },
    ctx(signal) {
      const abortErr = () => { const e = new Error('aborted'); e.name = 'AbortError'; return e; };
      const ctx = {
        signal, fast: motion.reduced,
        check() { if (signal.aborted) throw abortErr(); },
        wait(ms) { return new Promise((res, rej) => { if (signal.aborted) return rej(abortErr()); const id = setTimeout(res, ms); signal.addEventListener('abort', () => { clearTimeout(id); rej(abortErr()); }, { once: true }); }); },
        caption(c) { const el = $('.tour-cap__text'); el.textContent = typeof c === 'string' && i18n.has(c) ? t(c) : L(c); el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); },
        async waitFor(selOrFn, timeout = 2500) {
          const t0 = performance.now();
          while (performance.now() - t0 < timeout) { ctx.check(); const r = typeof selOrFn === 'function' ? selOrFn() : $(selOrFn); if (r) return r; await ctx.wait(60); }
          return null;
        },
        async ensureVisible(el) {
          const zoneTop = 70 + (parseFloat(getComputedStyle(html).getPropertyValue('--safe-t')) || 0);
          const cap = $('.tour-cap__card'); const capR = cap && !$('.tour-cap').hidden ? cap.getBoundingClientRect() : null;
          const sheetOpen = html.classList.contains('sheet-open');
          const top = sheetOpen && capR ? capR.bottom + 8 : zoneTop;
          const bottom = sheetOpen || !capR ? innerHeight - 16 - (sheetOpen ? 0 : 90) : capR.top - 8;
          let r = el.getBoundingClientRect();
          if (r.top >= top && r.bottom <= bottom) return;
          const inSheet = el.closest('.sheet__body');
          const scroller = inSheet || null;
          if (scroller) {
            const sr = scroller.getBoundingClientRect();
            const target = scroller.scrollTop + (r.top - sr.top) - (sr.height - r.height) / 2;
            await smoothScrollEl(scroller, target, signal);
          } else {
            const mid = (top + bottom) / 2;
            await scrollTo(scrollY() + r.top + r.height / 2 - mid, { duration: 700, signal });
          }
          ctx.check(); await ctx.wait(80);
        },
        async moveFinger(x, y) {
          const f = $('.ghost-finger');
          if (!Tour.finger.shown) { Tour.finger.x = innerWidth / 2; Tour.finger.y = innerHeight - 120; f.hidden = false; Tour.finger.shown = true; }
          const d = Math.hypot(x - Tour.finger.x, y - Tour.finger.y);
          const dur = motion.reduced ? 0 : clamp(d * 1.1, 260, 720);
          const from = `translate(${Tour.finger.x}px, ${Tour.finger.y}px)`, to = `translate(${x}px, ${y}px)`;
          Tour.finger.x = x; Tour.finger.y = y;
          if (dur && f.animate) await f.animate([{ transform: from }, { transform: to }], { duration: dur, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' }).finished.catch(() => { });
          else f.style.transform = to;
          ctx.check();
        },
        async point(target) {
          const el = typeof target === 'string' ? await ctx.waitFor(target) : target; if (!el) return null;
          await ctx.ensureVisible(el);
          const r = el.getBoundingClientRect(); await ctx.moveFinger(r.left + r.width / 2, r.top + r.height / 2); return el;
        },
        async tap(target, o = {}) {
          const el = await ctx.point(target); if (!el) { console.warn('[tour] tap target missing', target); return null; }
          const f = $('.ghost-finger'); f.classList.remove('is-tap'); void f.offsetWidth; f.classList.add('is-tap');
          FX.burst(Tour.finger.x, Tour.finger.y, { count: 8, speed: [60, 160], size: [6, 14], life: [350, 650], gravity: 80 });
          await ctx.wait(140);
          if (o.noClick !== true) { if (el.focus) try { el.focus({ preventScroll: true }); } catch (e) { } el.click(); }
          await ctx.wait(o.after != null ? o.after : 420);
          return el;
        },
        async type(target, text, o = {}) {
          const el = await ctx.tap(target, { after: 120 }); if (!el) return;
          el.value = '';
          for (const ch of String(text)) { ctx.check(); el.value += ch; el.dispatchEvent(new Event('input', { bubbles: true })); await ctx.wait(o.cps ? 1000 / o.cps : 55); }
          el.dispatchEvent(new Event('change', { bubbles: true }));
          await ctx.wait(o.after != null ? o.after : 250);
        },
        async scrollTo(target, o = {}) { await scrollTo(target, Object.assign({ signal }, o)); ctx.check(); },
        async go(view) {
          if (state.view === view) return;
          const btn = $(`.dock__btn[data-go="${view}"]`);
          await ctx.tap(btn, { noClick: true, after: 0 });
          await go(view, { origin: btn, focus: false });
          await ctx.wait(motion.reduced ? 200 : 500);
        },
        hideFinger() { $('.ghost-finger').hidden = true; Tour.finger.shown = false; }
      };
      return ctx;
    }
  };
  function smoothScrollEl(el, to, signal) {
    to = clamp(to, 0, el.scrollHeight - el.clientHeight);
    if (motion.reduced) { el.scrollTop = to; return Promise.resolve(); }
    const from = el.scrollTop, t0 = performance.now(), dur = clamp(Math.abs(to - from) * .6, 250, 700);
    return new Promise(res => { const step = now => { if (signal && signal.aborted) return res(); const k = clamp((now - t0) / dur, 0, 1); el.scrollTop = lerp(from, to, easeIO(k)); k < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });
  }

  /* the scripted story (≈ 75–90 s). Each step calls a module's tour[fn](ctx). */
  Tour.define([
    { view: 'visitors', module: 'pubTop', fn: 'hero', caption: 'core.tour.s1', dur: 5500 },
    { view: 'visitors', module: 'pubTop', fn: 'clock', caption: 'core.tour.s2', dur: 12000 },
    { view: 'visitors', module: 'pubBottom', fn: 'booking', caption: 'core.tour.s3', dur: 10000 },
    { view: 'parents', module: 'parent', fn: 'login', caption: 'core.tour.s4', dur: 6000 },
    { view: 'parents', module: 'parent', fn: 'feed', caption: 'core.tour.s5', dur: 6500 },
    { view: 'parents', module: 'parent', fn: 'summary', caption: 'core.tour.s6', dur: 9000 },
    { view: 'staff', module: 'staff', fn: 'checkin', caption: 'core.tour.s7', dur: 6000 },
    { view: 'staff', module: 'staff', fn: 'meal', caption: 'core.tour.s8', dur: 8000 },
    { view: 'staff', module: 'staff', fn: 'endDay', caption: 'core.tour.s9', dur: 8000 },
    { view: 'owner', module: 'owner', fn: 'kpis', caption: 'core.tour.s10', dur: 6000 },
    { view: 'owner', module: 'owner', fn: 'automations', caption: 'core.tour.s11', dur: 10000 }
  ]);

  /* =====================================================================
     CORE STRINGS
     ===================================================================== */
  i18n.add({
    he: {
      'core.brand': 'גן סינדרלה', 'core.logoAlt': 'הלוגו של גן סינדרלה', 'core.skip': 'דילוג לתוכן',
      'core.demo': 'דמו · נתונים לדוגמה', 'core.tourBtn': 'סיור בדמו', 'core.langBtn': 'RU', 'core.langA11y': 'Переключить на русский',
      'core.a11yBtn': 'תפריט נגישות', 'core.close': 'סגירה', 'core.example': 'לדוגמה',
      'core.dock.label': 'בחירת תצוגה', 'core.dock.visitors': 'מבקרים חדשים', 'core.dock.parents': 'הורים', 'core.dock.staff': 'צוות', 'core.dock.owner': 'הנהלה',
      'core.invite': 'סיור בדמו · דקה וחצי', 'core.inviteX': 'לא עכשיו',
      'core.a11y.title': 'נגישות', 'core.a11y.text': 'גודל טקסט', 'core.a11y.contrast': 'ניגודיות גבוהה', 'core.a11y.motion': 'עצירת אנימציות',
      'core.a11y.links': 'הדגשת קישורים', 'core.a11y.font': 'גופן פשוט', 'core.a11y.statement': 'הצהרת נגישות', 'core.a11y.reset': 'איפוס',
      'core.a11y.statementBody': '<p>זו גרסת דמו. באתר החי תופיע כאן הצהרת נגישות מלאה לפי תקנות שוויון זכויות לאנשים עם מוגבלות ותקן ישראלי 5568.</p><h3>מה כבר מובנה בדמו</h3><p>ניווט מלא במקלדת, פוקוס גלוי, תיאורים לקוראי מסך, ניגודיות צבעים ברמת AA, הגדלת טקסט ועצירת אנימציות.</p><h3>יצירת קשר</h3><p>פרטי רכז או רכזת הנגישות של הגן יופיעו כאן בגרסה החיה.</p>',
      'core.tour.stop': 'עצירה', 'core.tour.hint': 'נגיעה במסך עוצרת את הסיור',
      'core.tour.s1': 'ככה נראה גן סינדרלה ברשת: בעברית וברוסית, נוח מהטלפון.',
      'core.tour.s2': 'השעון של סינדרלה מספר את היום בגן, שעה אחרי שעה.',
      'core.tour.s3': 'הורים קובעים סיור בעצמם ומקבלים אישור ישר לטלפון.',
      'core.tour.s4': 'הורים שכבר אצלך נכנסים לאזור אישי עם קוד חד-פעמי.',
      'core.tour.s5': 'כל היום של נועה, מהרגע שהגיעה.',
      'core.tour.s6': 'ב-17:30 ההורים מקבלים סיכום חם, שנכתב לבד מהסימונים של הצוות.',
      'core.tour.s7': 'הצוות מסמן הגעה בנגיעה אחת.',
      'core.tour.s8': 'כמה ילדים, שתי נגיעות: אוכל, שינה, החתלה. והמערכת זוכרת אלרגיות.',
      'core.tour.s9': 'סיום יום: כל משפחה מקבלת סיכום, בשפה שלה.',
      'core.tour.s10': 'ולך: כל הגן במבט אחד.',
      'core.tour.s11': 'מאחורי הקלעים, המערכת עושה לבד את העבודה השוטפת.',
      'core.tour.endA11y': 'סוף הסיור', 'core.tour.endTitle': 'זה הגן שלך, בגרסה דיגיטלית',
      'core.tour.endText': 'עכשיו אפשר להסתובב לבד: לעבור בין התצוגות למטה וללחוץ על הכול. הכול עובד.',
      'core.tour.explore': 'להמשיך לבד', 'core.tour.again': 'לצפות שוב',
      'core.credit': 'עוצב ופותח ע״י Kikkey'
    },
    ru: {
      'core.brand': 'Синдерелла', 'core.logoAlt': 'Логотип сада «Синдерелла»', 'core.skip': 'К содержанию',
      'core.demo': 'Демо · примерные данные', 'core.tourBtn': 'Демо-тур', 'core.langBtn': 'עב', 'core.langA11y': 'לעבור לעברית',
      'core.a11yBtn': 'Меню доступности', 'core.close': 'Закрыть', 'core.example': 'пример',
      'core.dock.label': 'Выбор раздела', 'core.dock.visitors': 'Новые семьи', 'core.dock.parents': 'Родители', 'core.dock.staff': 'Команда', 'core.dock.owner': 'Управление',
      'core.invite': 'Демо-тур · полторы минуты', 'core.inviteX': 'Не сейчас',
      'core.a11y.title': 'Доступность', 'core.a11y.text': 'Размер текста', 'core.a11y.contrast': 'Высокий контраст', 'core.a11y.motion': 'Остановить анимацию',
      'core.a11y.links': 'Выделить ссылки', 'core.a11y.font': 'Простой шрифт', 'core.a11y.statement': 'Заявление о доступности', 'core.a11y.reset': 'Сбросить',
      'core.a11y.statementBody': '<p>Это демо-версия. На живом сайте здесь будет полное заявление о доступности по израильским правилам и стандарту 5568.</p><h3>Что уже есть в демо</h3><p>Управление с клавиатуры, видимый фокус, подписи для экранных чтецов, контраст уровня AA, увеличение текста и остановка анимации.</p><h3>Контакты</h3><p>Контакты ответственного за доступность появятся в живой версии.</p>',
      'core.tour.stop': 'Стоп', 'core.tour.hint': 'Коснитесь экрана, чтобы остановить тур',
      'core.tour.s1': 'Так «Синдерелла» выглядит в сети: на иврите и по-русски, удобно с телефона.',
      'core.tour.s2': 'Часы Синдереллы рассказывают день в саду, час за часом.',
      'core.tour.s3': 'Родители сами записываются на экскурсию и сразу получают подтверждение.',
      'core.tour.s4': 'Родители, чьи дети уже в саду, входят в личный кабинет по одноразовому коду.',
      'core.tour.s5': 'Весь день Ноа, с той минуты, как она пришла.',
      'core.tour.s6': 'В 17:30 родители получают тёплую сводку. Она собирается сама из отметок воспитателей.',
      'core.tour.s7': 'Воспитательница отмечает приход одним касанием.',
      'core.tour.s8': 'Несколько детей, два касания: еда, сон, подгузник. А система помнит про аллергии.',
      'core.tour.s9': 'Конец дня: каждая семья получает сводку на своём языке.',
      'core.tour.s10': 'А у вас весь сад на одном экране.',
      'core.tour.s11': 'За кулисами система сама делает рутинную работу.',
      'core.tour.endA11y': 'Конец тура', 'core.tour.endTitle': 'Это ваш сад в цифре',
      'core.tour.endText': 'Дальше можно смотреть самостоятельно: переключать разделы внизу и нажимать на всё подряд. Всё работает.',
      'core.tour.explore': 'Смотреть самой', 'core.tour.again': 'Посмотреть ещё раз',
      'core.credit': 'Дизайн и разработка: Kikkey'
    }
  });

  /* =====================================================================
     BOOT
     ===================================================================== */
  function bindChrome() {
    $$('.dock__btn').forEach(b => b.addEventListener('click', () => { if (Tour.running) return; go(b.dataset.go, { origin: b }); }));
    const lb = $('[data-lang-toggle]'); lb && lb.addEventListener('click', () => i18n.set(i18n.lang === 'he' ? 'ru' : 'he'));
    const ab = $('[data-a11y-open]'); ab && ab.addEventListener('click', a11yPanel);
    $$('[data-tour-start]').forEach(b => b.addEventListener('click', () => Tour.start()));
    const ix = $('[data-invite-x]'); ix && ix.addEventListener('click', () => { const inv = $('.tour-invite'); inv.hidden = true; inv.dataset.dismissed = '1'; store.set('inviteDismissed', true); });
    $('.tour-cap__stop').addEventListener('click', () => Tour.stop());
    const shield = $('.tour-shield');
    shield.addEventListener('click', () => Tour.stop());
    shield.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    shield.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { const top = sheets[sheets.length - 1]; if (top) { top.close('esc'); return; } if (Tour.running) Tour.stop(); }
      trapTab(e);
    });
    addEventListener('hashchange', () => { const v = location.hash.slice(1); if (v === 'tour') { Tour.start(); return; } if (VIEWS.includes(v)) go(v); });
    addEventListener('resize', () => updateDockIndicator(true), { passive: true });
    onScroll(updateTopbar);
    $('.tour-invite').hidden = true;
    if (store.get('inviteDismissed')) $('.tour-invite').dataset.dismissed = '1';
  }

  function boot() {
    if (!window.gsap) console.warn('[App] GSAP not loaded; modules must degrade');
    i18n.lang = 'he';
    const saved = store.get('lang');
    const lang = saved === 'ru' ? 'ru' : 'he';
    i18n.lang = lang; html.lang = lang; html.dir = lang === 'he' ? 'rtl' : 'ltr';
    a11yApply();
    FX.init();
    initLenis();
    fillLogos();
    // initial view
    const hv = location.hash.slice(1);
    const startView = VIEWS.includes(hv) ? hv : 'visitors';
    state.view = startView; html.dataset.view = startView;
    VIEWS.forEach(v => { const el = viewEl(v); if (el) { el.hidden = v !== startView; el.setAttribute('tabindex', '-1'); } });
    setDock(startView);
    // modules
    Object.values(modules).forEach(m => {
      const root = $(`[data-module="${m.name}"]`);
      if (!root) { console.warn('[App] no root for module', m.name); return; }
      m.root = root; call(m, 'init', root);
    });
    i18n.apply(document);
    fillLogos();
    bindChrome();
    initReveal(); initMagnetic(); initTrail();
    modsOf(startView).forEach(m => call(m, 'onEnter'));
    requestAnimationFrame(() => { updateDockIndicator(true); updateTopbar(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => updateDockIndicator(true));
    // tour invite
    setTimeout(() => { const inv = $('.tour-invite'); if (inv && !inv.dataset.dismissed) updateTopbar(); }, 1200);
    if (hv === 'tour') setTimeout(() => Tour.start(), 900);
    html.classList.add('is-booted');
    emit('ready');
  }

  window.App = {
    $, $$, h, esc, icon, clamp, lerp, rand, pick, sleep, nextFrame, store,
    on, emit, motion, isTouch, isFine,
    i18n, t, L, fmt, data, kidName, avatar, avatarEl, SHIRTS,
    fx: FX, ui: { sheet, toast, phone, logo: logoMarkup, fillLogos, sheets, a11yPanel, statement },
    scrollTo, scrollY, onScroll, progress, reveal, countUp,
    module, mod, modules, go, state, VIEWS,
    tour: Tour,
    get lenis() { return lenis; },
    haptic(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } },
    debug: false
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();
