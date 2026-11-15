/* =====================================================================
   pubTop · hero (layered fairy-tale scene, day/night) + facts ribbon +
   "השעון של סינדרלה" (scroll-driven clock 07:00 → 17:00)
   ===================================================================== */
const html = document.documentElement;
const $ = (s, r) => App.$(s, r), $$ = (s, r) => App.$$(s, r);
const clamp = App.clamp, lerp = App.lerp;
const smooth = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const pad = n => String(n).padStart(2, '0');

/* ---------- arm the intro before first paint ---------- */
const isNightAuto = () => { const h = new Date().getHours(); return h >= 18 || h < 6; };
const heroEl0 = document.getElementById('hero');
if (heroEl0 && isNightAuto()) heroEl0.classList.add('is-night');
if (!App.motion.reduced) {
  html.classList.add('pt-armed');
  setTimeout(() => { if (!S.introStarted) html.classList.remove('pt-armed'); }, 3200);
}

/* ---------- state ---------- */
const S = {
  active: false, night: false, forced: null, introStarted: false, introDone: false,
  heroVis: true, clockVis: false, loop: 0, sy: 0, heroH: 800,
  ptr: { tx: 0, ty: 0, x: 0, y: 0 }, carT: 0, lastNow: 0,
  scene: -1, fin: false, static: false, lut: null, beadX: [], stripW: 0, winW: 0
};
let root, hero, content, track, stage, dial, layers = [], carriage, hillc, trailPath;

/* ---------- timeline of the day (minutes after 07:00) ---------- */
const SCENES = [
  { art: 'arrive', from: 0, at: 0, colors: ['gold', 'pink', 'white'], bg: 'linear-gradient(180deg,#D3EEFD,#FFF5F9)' },
  { art: 'breakfast', from: 60, at: 60, colors: ['gold', 'magenta', 'white'], bg: 'linear-gradient(180deg,#FFF0D6,#FFF8FB)' },
  { art: 'club', from: 120, at: 120, colors: ['blue', 'magenta', 'gold'], bg: 'linear-gradient(180deg,#E9E4FD,#FFF5F9)' },
  { art: 'yard', from: 180, at: 180, colors: ['gold', 'blue', 'white'], bg: 'linear-gradient(180deg,#BDE5FB,#F2FAFF)' },
  { art: 'lunch', from: 300, at: 300, colors: ['gold', 'pink', 'blue'], bg: 'linear-gradient(180deg,#FFF1DC,#FDF1F6)' },
  { art: 'nap', from: 330, at: 330, colors: ['gold', 'white', 'sky'], bg: 'linear-gradient(180deg,#2C3180,#5B4AA6)' },
  { art: 'snack', from: 450, at: 480, colors: ['magenta', 'gold', 'pink'], bg: 'linear-gradient(180deg,#FFEDD2,#FDF0F6)' },
  { art: 'pickup', from: 540, at: 540, colors: ['gold', 'magenta', 'pink'], bg: 'linear-gradient(180deg,#FFCCA6,#F9B6CC 62%,#FDE4EE)' }
];
const P0 = .03, P1 = .885; // scroll progress where 07:00 starts / 17:00 is reached

/* =====================================================================
   ART HELPERS (storybook paper-cut, App.avatar-style heads)
   ===================================================================== */
const SKIN = ['#FFE3D1', '#F6C9A6', '#DFA277', '#B77A52', '#83512F'];
const HAIR = ['#2A1A12', '#553220', '#8A5A2E', '#C78D4C', '#E7C47D', '#A8401F', '#D9D7E3'];
const INK = '#1B1A4B';
function head(x, y, r, o = {}) {
  const sk = SKIN[o.skin != null ? o.skin : 1], hc = HAIR[o.hc != null ? o.hc : 0];
  let back = '', front = '';
  switch (o.hair) {
    case 'long': back = `<path d="M-11 0C-11-8-6-12.6 0-12.6S11-8 11 0v10.5c0 1.4-1 2.3-2.4 2.3H-8.6c-1.4 0-2.4-.9-2.4-2.3Z" fill="${hc}"/>`;
      front = `<path d="M-9.8-1C-9.2-7.4-5.2-11.2 0-11.2c4.8 0 8.8 3.2 9.8 8.6-4.4-.4-7.8-2-9.8-5-1.8 3-4.8 5-9.8 6.6Z" fill="${hc}"/>`; break;
    case 'bob': back = `<path d="M-11.4 1.4C-11.4-7.6-5.8-12.4 0-12.4S11.4-7.6 11.4 1.4v6.4c0 1.4-1 2.2-2.2 2.2H-9.2c-1.2 0-2.2-.8-2.2-2.2Z" fill="${hc}"/>`;
      front = `<path d="M-9.8-1.6C-8.6-7.6-4.6-11 0-11s8.6 3.4 9.8 9.4C6.2-3.8 3.2-4.6 0-4.6s-6.4.8-9.8 3Z" fill="${hc}"/>`; break;
    case 'pigtails': back = `<circle cx="-11.8" cy="-1" r="4.2" fill="${hc}"/><circle cx="11.8" cy="-1" r="4.2" fill="${hc}"/>`;
      front = `<path d="M-9.8-.6C-9.8-7-5.4-11.2 0-11.2S9.8-7 9.8-.6C7-3.4 3.6-4.6 0-4.6S-7-3.4-9.8-.6Z" fill="${hc}"/><circle cx="-9.4" cy="-4" r="1.8" fill="#E8048C"/><circle cx="9.4" cy="-4" r="1.8" fill="#E8048C"/>`; break;
    case 'curly': front = [[-7.8, -4.4, 4], [-5, -8.8, 4.4], [0, -10.8, 4.8], [5, -8.8, 4.4], [7.8, -4.4, 4], [-2.6, -6.8, 3.8], [2.8, -6.8, 3.8]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}"/>`).join(''); break;
    case 'bun': front = `<circle cx="0" cy="-12.6" r="4.4" fill="${hc}"/><path d="M-9.8-.2C-9.8-6.8-5.4-11.2 0-11.2S9.8-6.8 9.8-.2C7-3.4 3.8-4.8 0-4.8S-7-3.4-9.8-.2Z" fill="${hc}"/>`; break;
    case 'buzz': front = `<path d="M-9.4-3.4C-8-8.4-4.4-11 0-11s8 2.6 9.4 7.6C6.6-5.2 3.4-5.8 0-5.8s-6.6.6-9.4 2.4Z" fill="${hc}"/>`; break;
    default: front = `<path d="M-10.2 0C-10.6-7.4-5.8-11.4 0-11.4S10.6-7.4 10.2 0C8.6-3 6.4-4.6 3.6-5.2 1.8-3.6-1-2.8-4.2-2.8-6.8-2.8-8.6-1.8-10.2 0Z" fill="${hc}"/>`;
  }
  const bow = o.bow ? `<path d="M6.4-9.6l4.2-2.6v5.2Zm0 0-4.2-2.6v5.2Z" fill="#E8048C"/>` : '';
  const beard = o.beard ? `<path d="M-8.6 2c.6 6 4 9 8.6 9s8-3 8.6-9c-1.8 1.8-4.6 2.4-8.6 2.4S-6.8 3.8-8.6 2Z" fill="${hc}"/>` : '';
  const eyes = o.sleep ? `<path d="M-5.4.8q1.7 1.5 3.4 0M2 .8q1.7 1.5 3.4 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    : `<circle cx="-3.7" cy=".7" r="1.3" fill="${INK}"/><circle cx="3.7" cy=".7" r="1.3" fill="${INK}"/>`;
  const mouth = o.sleep ? `<circle cx="0" cy="5" r="1" fill="${INK}"/>` : o.open ? `<path d="M-2.6 3.8q2.6 4 5.2 0Z" fill="${INK}"/>`
    : `<path d="M-2.6 3.9q2.6 2.6 5.2 0" stroke="${o.beard ? '#fff' : INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  const glasses = o.glasses ? `<g fill="none" stroke="${INK}" stroke-width=".9"><circle cx="-3.8" cy=".7" r="2.6"/><circle cx="3.8" cy=".7" r="2.6"/><path d="M-1.2.7h2.4"/></g>` : '';
  return `<g transform="translate(${x} ${y}) scale(${r / 10})">${back}<circle cx="-10" cy="1.2" r="2.4" fill="${sk}"/><circle cx="10" cy="1.2" r="2.4" fill="${sk}"/><circle r="10" fill="${sk}"/>${beard}${front}${bow}${eyes}<circle cx="-6.2" cy="3.6" r="1.8" fill="#F27FA5" opacity=".5"/><circle cx="6.2" cy="3.6" r="1.8" fill="#F27FA5" opacity=".5"/>${mouth}${glasses}</g>`;
}
const armP = (sh, sk, x1, y1, x2, y2, w = 5) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${sh}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="${w * .52}" fill="${sk}"/>`;
/* child standing; ground at gy. arms: [lx,ly] / [rx,ry] endpoints relative to the feet */
function kid(x, gy, o = {}) {
  const sk = SKIN[o.skin != null ? o.skin : 1], sh = o.shirt || '#01AEF2', pa = o.pants || '#2D2B6B';
  const L = o.armL || [-10, -12], R = o.armR || [10, -12];
  return `<g transform="translate(${x} ${gy})${o.s ? ` scale(${o.s})` : ''}">
    ${o.pack ? `<rect x="5" y="-27" width="9" height="15" rx="3.5" fill="#E8048C"/><rect x="7" y="-24" width="5" height="4" rx="1.5" fill="#F9BCD0"/>` : ''}
    <rect x="-5.6" y="-12" width="4.6" height="12" rx="2.3" fill="${pa}"/><rect x="1" y="-12" width="4.6" height="12" rx="2.3" fill="${pa}"/>
    <path d="M-9.5-9C-9.5-21-6.2-26.5 0-26.5S9.5-21 9.5-9Z" fill="${sh}"/>
    ${o.bib ? `<path d="M-5-24h10v7a5 5 0 0 1-10 0Z" fill="#fff"/><path d="M0-17.5c-2-1.3-2.4-3-1.2-3.4.6-.2 1 .2 1.2.6.2-.4.6-.8 1.2-.6 1.2.4.8 2.1-1.2 3.4Z" fill="#E8048C"/>` : ''}
    ${armP(sh, sk, -7, -22, L[0], L[1])}${armP(sh, sk, 7, -22, R[0], R[1])}
    ${head(0, -36, 11, o)}</g>`;
}
function adult(x, gy, o = {}) {
  const sk = SKIN[o.skin != null ? o.skin : 1], sh = o.shirt || '#9B8CE8', pa = o.pants || '#2D2B6B';
  const L = o.armL || [-13, -20], R = o.armR || [13, -20];
  return `<g transform="translate(${x} ${gy})">
    <rect x="-7" y="-21" width="5.6" height="21" rx="2.8" fill="${pa}"/><rect x="1.4" y="-21" width="5.6" height="21" rx="2.8" fill="${pa}"/>
    <path d="M-12-18C-12-38-8.4-45 0-45s12 7 12 27Z" fill="${sh}"/>
    ${armP(sh, sk, -9, -39, L[0], L[1], 5.6)}${armP(sh, sk, 9, -39, R[0], R[1], 5.6)}
    ${head(0, -56, 12, o)}</g>`;
}
const spark = (x, y, s, c, cls = '') => `<path class="${cls}" d="M${x} ${y - s}c${s * .1} ${s * .55} ${s * .35} ${s * .8} ${s} ${s}-${s * .65} ${s * .2}-${s * .9} ${s * .45}-${s} ${s}c-${s * .1}-${s * .55}-${s * .35}-${s * .8}-${s}-${s} ${s * .65}-${s * .2} ${s * .9}-${s * .45} ${s}-${s}Z" fill="${c}"/>`;
const heart = (x, y, s, c, cls = '') => `<g class="${cls}"><path transform="translate(${x} ${y}) scale(${s / 10})" d="M0 9C-13 1-13-10-5.5-10.5-2.6-10.7-.8-8.6 0-6.8c.8-1.8 2.6-3.9 5.5-3.7C13-10 13 1 0 9Z" fill="${c}"/></g>`;
const ground = (c1, c2) => `<path d="M-260 136C-60 122 80 118 160 118s240 6 420 18v40h-680Z" fill="${c2}" transform="translate(0 5)"/><path d="M-260 136C-60 122 80 118 160 118s240 6 420 18v40h-680Z" fill="${c1}"/>`;
const table = () => `<rect x="-260" y="112" width="840" height="9" rx="4.5" fill="#E7B47A"/><rect x="-260" y="121" width="840" height="40" fill="#F7DDB9"/><path d="M-260 121h840" stroke="#D9A267" stroke-width="3"/>`;
const wallDoor = (lit) => {
  let bumps = ''; for (let i = 0; i < 6; i++) bumps += 'a9 9 0 0 1 18 0';
  return `<path d="M201 140V61${bumps}V140Z" fill="#F3DCE8"/><path d="M196 140V56${bumps}V140Z" fill="#fff"/>
    <circle cx="211" cy="84" r="8" fill="#F3DCE8"/><circle cx="211" cy="84" r="5.5" fill="${lit ? '#FFD27A' : '#3E3B7E'}"/>
    <circle cx="289" cy="84" r="8" fill="#F3DCE8"/><circle cx="289" cy="84" r="5.5" fill="${lit ? '#FFD27A' : '#3E3B7E'}"/>
    <path d="M222 140v-36a28 28 0 0 1 56 0v36Z" fill="#F9BCD0"/>
    ${lit ? `<path d="M229 140v-35a21 21 0 0 1 42 0v35Z" fill="#FFE4A3"/><path d="M229 140v-35a21 21 0 0 1 12-19v60Z" fill="#A3026A"/>`
      : `<path d="M229 140v-35a21 21 0 0 1 42 0v35Z" fill="#A3026A"/><path d="M250 86v54" stroke="rgba(27,26,75,.25)" stroke-width="1.6"/><circle cx="245" cy="118" r="1.9" fill="#FFD27A"/><circle cx="255" cy="118" r="1.9" fill="#FFD27A"/>`}
    <path d="M250 47V27" stroke="#2D2B6B" stroke-width="2" stroke-linecap="round"/><path class="pt-a pt-a-flag" d="M251 27c7-2 10 3 17 1-4 5-10 6-17 8Z" fill="#E8048C"/>
    ${heart(250, 72, 6, lit ? '#FFD27A' : '#F6B0C6')}`;
};
const note = (x, y, c, cls, d) => `<g class="pt-a ${cls}" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="5" ry="3.8" transform="rotate(-20 ${x} ${y})" fill="${c}"/><path d="M${x + 4.2} ${y - 1}V${y - 20}c3 2 7 3 8 8" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
const svgWrap = inner => `<svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">${inner}</svg>`;

const ART = {
  arrive: () => svgWrap(`
    <g class="pt-a pt-a-spin" style="transform-origin:46px 34px">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="44.5" y="10" width="3" height="8" rx="1.5" fill="#FFC24D" transform="rotate(${a} 46 34)"/>`).join('')}</g>
    <circle cx="46" cy="34" r="12" fill="#FFD27A"/><circle cx="42" cy="30" r="4" fill="#FFF1BF"/>
    <use href="#pt-cloud" x="92" y="12" width="64" height="29"/>
    ${ground('#BDE6D2', '#A4D9BF')}
    <path d="M40 146C110 136 190 140 250 140" stroke="#fff" stroke-width="4" stroke-dasharray="0 9" stroke-linecap="round" fill="none"/>
    ${wallDoor(false)}
    ${adult(124, 136, { skin: 1, hair: 'long', hc: 2, shirt: '#9B8CE8', armR: [23, -27] })}
    ${kid(164, 136, { skin: 1, hair: 'pigtails', hc: 2, shirt: '#E8048C', pack: true, armL: [-17, -26], armR: [11, -12] })}
    ${heart(146, 52, 7, '#F45BAE', 'pt-a pt-a-bob')}
    ${spark(180, 60, 5, '#FFC24D', 'pt-a pt-a-tw')}${spark(98, 66, 4, '#01AEF2', 'pt-a pt-a-tw')}`),
  breakfast: () => svgWrap(`
    <g class="pt-a pt-a-bob" style="animation-duration:3.4s">
      <path d="M254 54h30v10a3 3 0 0 1-3 3h-24a3 3 0 0 1-3-3Z" fill="#F3DCE8" transform="translate(2 2)"/>
      <circle cx="257" cy="44" r="10" fill="#fff"/><circle cx="270" cy="37" r="12.5" fill="#fff"/><circle cx="283" cy="44" r="10" fill="#fff"/>
      <path d="M254 52h32v10a3 3 0 0 1-3 3h-26a3 3 0 0 1-3-3Z" fill="#fff"/><path d="M254 56h32" stroke="#F6B0C6" stroke-width="2.4"/>
      ${heart(270, 60, 3.2, '#E8048C')}</g>
    ${spark(232, 32, 5, '#FFC24D', 'pt-a pt-a-tw')}
    ${kid(84, 126, { skin: 3, hair: 'short', hc: 0, shirt: '#01AEF2', armL: [-12, -14], armR: [16, -34] })}
    <path d="M100 92l7-14" stroke="#B9BBD6" stroke-width="3" stroke-linecap="round"/><ellipse cx="108" cy="75" rx="4" ry="5.4" transform="rotate(28 108 75)" fill="#B9BBD6"/>
    ${table()}
    <ellipse cx="176" cy="121" rx="38" ry="4" fill="rgba(27,26,75,.12)"/>
    <path d="M138 94h76c0 18-15 27-38 27s-38-9-38-27Z" fill="#fff"/><path d="M141 103h70" stroke="#01AEF2" stroke-width="4"/><path d="M146 110h60" stroke="#BFE6FC" stroke-width="2"/>
    <ellipse cx="176" cy="94" rx="38" ry="7" fill="#FFD9A0"/><circle cx="166" cy="93" r="2.6" fill="#F45BAE"/><circle cx="182" cy="95" r="2.4" fill="#9B8CE8"/><circle cx="190" cy="92" r="2.2" fill="#F45BAE"/>
    <path d="M196 92l16-20" stroke="#F45BAE" stroke-width="4" stroke-linecap="round"/><ellipse cx="214" cy="68" rx="5" ry="7" transform="rotate(40 214 68)" fill="#F45BAE"/>
    ${[160, 176, 192].map((x, i) => `<path class="pt-a pt-a-steam" style="animation-delay:${i * .5}s" d="M${x} 84c-6-6 6-10 0-17s6-10 0-16" stroke="#F6B0C6" stroke-width="3.4" fill="none" stroke-linecap="round"/>`).join('')}
    <path d="M240 92h24v20a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6Z" fill="#7FCBF2"/><path d="M264 98c7 0 7 12 0 12" stroke="#7FCBF2" stroke-width="3.4" fill="none"/><path d="M244 97h16" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`),
  club: () => svgWrap(`
    ${ground('#BDE6D2', '#A4D9BF')}
    <path d="M38 108h40v22c0 3-2 5-5 5H43c-3 0-5-2-5-5Z" fill="#E8048C"/><ellipse cx="58" cy="108" rx="20" ry="5" fill="#fff"/><path d="M40 118l6 8 6-8 6 8 6-8 6 8 6-8" stroke="#FFD27A" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
    <path d="M70 98l-8 8M76 100l-12 6" stroke="#C98E4A" stroke-width="2.6" stroke-linecap="round"/>
    ${note(46, 74, '#1B1A4B', 'pt-a-bob', 0)}${note(74, 58, '#E8048C', 'pt-a-bob', .6)}${note(30, 50, '#0270A8', 'pt-a-bob', 1.1)}
    <g class="pt-a pt-a-hop">${kid(156, 136, { skin: 2, hair: 'curly', hc: 0, shirt: '#FFB547', pants: '#0270A8', armL: [-15, -36], armR: [15, -36] })}</g>
    <g class="pt-a pt-a-bounce"><circle cx="196" cy="122" r="11" fill="#fff"/><path d="M196 111a11 11 0 0 1 9 5l-5 4-6-2Zm-10 4 6 3-1 6-6 2a11 11 0 0 1 1-11Zm13 16-3-5 5-4 5 2a11 11 0 0 1-7 7Z" fill="#01AEF2"/></g>
    <path d="M232 136c0-10 2-18 4-24" stroke="#5FAF85" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M236 114c-10-2-14-10-12-16 8 0 13 6 12 16Z" fill="#7FC8A9"/><path d="M236 120c8-4 14-2 16 4-6 4-12 3-16-4Z" fill="#9AD9B5"/>
    <ellipse cx="270" cy="126" rx="15" ry="11" fill="#fff"/><circle cx="256" cy="128" r="4" fill="#fff"/>
    <g class="pt-a pt-a-ear"><ellipse cx="279" cy="96" rx="3.4" ry="10" fill="#fff" transform="rotate(-8 279 96)"/><ellipse cx="279" cy="97" rx="1.6" ry="6.6" fill="#F6B0C6" transform="rotate(-8 279 97)"/></g>
    <ellipse cx="287" cy="97" rx="3.4" ry="10" fill="#fff" transform="rotate(12 287 97)"/><ellipse cx="287" cy="98" rx="1.6" ry="6.6" fill="#F6B0C6" transform="rotate(12 287 98)"/>
    <circle cx="283" cy="111" r="9" fill="#fff"/><circle cx="286" cy="110" r="1.4" fill="${INK}"/><circle cx="291" cy="113" r="1.4" fill="#F27FA5"/>
    ${spark(120, 56, 5, '#FFC24D', 'pt-a pt-a-tw')}${spark(222, 66, 4, '#E8048C', 'pt-a pt-a-tw')}`),
  yard: () => svgWrap(`
    <g class="pt-a pt-a-spin" style="transform-origin:276px 32px">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => `<rect x="274.5" y="6" width="3" height="7" rx="1.5" fill="#FFC24D" transform="rotate(${a} 276 32)"/>`).join('')}</g>
    <circle cx="276" cy="32" r="13" fill="#FFD27A"/><circle cx="272" cy="28" r="4" fill="#FFF1BF"/>
    <use href="#pt-cloud" x="140" y="10" width="60" height="27"/>
    ${ground('#9AD9B5', '#7FC8A9')}
    <path d="M34 134L58 40M122 134L98 40" stroke="#C98E4A" stroke-width="6" stroke-linecap="round"/><path d="M50 40h56" stroke="#B37B3C" stroke-width="7" stroke-linecap="round"/>
    <g class="pt-a pt-a-swing" style="transform-origin:78px 40px">
      <path d="M68 40v62M88 40v62" stroke="#8C6A45" stroke-width="2"/>
      <rect x="62" y="100" width="32" height="6" rx="3" fill="#E8048C"/>
      <path d="M71 101h16l7 10" stroke="#2D2B6B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M69 101c0-12 3-17 9-17s9 5 9 17Z" fill="#9B8CE8"/>
      ${armP('#9B8CE8', SKIN[0], 72, 89, 68, 74, 4.6)}${armP('#9B8CE8', SKIN[0], 84, 89, 88, 74, 4.6)}
      ${head(78, 74, 10, { skin: 0, hair: 'bob', hc: 3, bow: true, open: true })}</g>
    <rect x="186" y="116" width="108" height="20" rx="5" fill="#C98E4A"/><path d="M192 118c10-8 30-8 40-2 12-6 30-6 40 0 8-4 14-2 16 2Z" fill="#FBE3A6"/>
    <path d="M232 118v-12h6v-6h6v6h6v12Z" fill="#F2CF85"/><path d="M244 100v-8" stroke="#2D2B6B" stroke-width="1.4"/><path d="M244 92l6 2-6 2Z" fill="#E8048C"/>
    <path d="M204 104h14l-2 14h-10Z" fill="#E8048C"/><path d="M204 104c2-6 12-6 14 0" stroke="#A3026A" stroke-width="1.6" fill="none"/>
    <path d="M276 116l6-22" stroke="#0270A8" stroke-width="3" stroke-linecap="round"/><path d="M280 96l5-10 5 4-4 9Z" fill="#01AEF2"/>
    ${spark(150, 70, 4.5, '#E8048C', 'pt-a pt-a-tw')}`),
  lunch: () => svgWrap(`
    ${spark(240, 36, 5, '#FFC24D', 'pt-a pt-a-tw')}${spark(56, 30, 4, '#E8048C', 'pt-a pt-a-tw')}
    ${kid(82, 126, { skin: 0, hair: 'bun', hc: 4, shirt: '#7FC8A9', bib: true, armL: [-12, -14], armR: [17, -32] })}
    <path d="M99 92l7-14" stroke="#B9BBD6" stroke-width="3" stroke-linecap="round"/><ellipse cx="107" cy="75" rx="4" ry="5.4" transform="rotate(28 107 75)" fill="#B9BBD6"/>
    ${table()}
    <ellipse cx="178" cy="118" rx="54" ry="5" fill="rgba(27,26,75,.1)"/>
    <ellipse cx="178" cy="112" rx="54" ry="13" fill="#fff"/><ellipse cx="178" cy="112" rx="54" ry="13" fill="none" stroke="#BFE6FC" stroke-width="3"/><ellipse cx="178" cy="111" rx="38" ry="8" fill="#F5FAFF"/>
    <circle cx="156" cy="106" r="6" fill="#5FAF85"/><circle cx="163" cy="102" r="5.4" fill="#7FC8A9"/><circle cx="150" cy="102" r="5" fill="#7FC8A9"/>
    <path d="M172 110c0-10 6-15 13-15s13 5 13 15Z" fill="#FFB547"/><path d="M178 102c3-2 6-2 8 0" stroke="#FFD9A0" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="206" cy="108" rx="9" ry="5" fill="#FFE07A"/>
    ${[168, 184].map((x, i) => `<path class="pt-a pt-a-steam" style="animation-delay:${i * .6}s" d="M${x} 90c-5-5 5-9 0-15s5-9 0-14" stroke="#F6B0C6" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}
    <path d="M114 100v18M110 100v6c0 3 2 4 4 4s4-1 4-4v-6" stroke="#B9BBD6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M244 100v18" stroke="#B9BBD6" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="244" cy="97" rx="4" ry="5.4" fill="#B9BBD6"/>
    <path d="M262 94h20l-2 22h-16Z" fill="#BFE6FC"/><path d="M263 102h18" stroke="#7FCBF2" stroke-width="2"/>`),
  nap: () => svgWrap(`
    ${[[30, 30, 4], [90, 20, 3], [150, 34, 4.5], [206, 18, 3], [118, 56, 2.6], [300, 74, 3], [20, 70, 3]].map((s, i) => spark(s[0], s[1], s[2], '#FFE6A6', 'pt-a pt-a-tw').replace('<path', `<path style="animation-delay:${i * .37}s"`)).join('')}
    <circle cx="268" cy="38" r="16" fill="rgba(255,230,166,.18)"/><path d="M274 22a16 16 0 1 0 8 26 13 13 0 0 1-8-26Z" fill="#FFE6A6"/>
    ${ground('#463A8C', '#3A2F7A')}
    <path d="M40 132V76a12 12 0 0 1 24 0v56Z" fill="#F6B0C6"/><circle cx="52" cy="78" r="3" fill="#fff"/>
    <rect x="52" y="100" width="214" height="22" rx="10" fill="#F3CFDF"/><path d="M60 122v12M258 122v12" stroke="#C98E4A" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="86" cy="96" rx="24" ry="10" fill="#fff"/>
    ${head(90, 88, 12.5, { skin: 2, hair: 'curly', hc: 0, sleep: true })}
    <path d="M104 116V98c0-8 6-13 14-13h124c9 0 16 6 16 15v16Z" fill="#E8048C"/><path d="M104 98c0-8 6-13 14-13h8v31h-22Z" fill="#F9BCD0"/>
    ${[[146, 96], [172, 104], [198, 94], [222, 106], [244, 96], [160, 110], [208, 112]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="2.6" fill="#fff" opacity=".85"/>`).join('')}
    ${[[118, 70, 14], [132, 54, 18], [150, 34, 22]].map((z, i) => `<text class="pt-a pt-a-z" style="animation-delay:${i * .7}s" x="${z[0]}" y="${z[1]}" font-family="Fredoka, Rubik, sans-serif" font-weight="700" font-size="${z[2]}" fill="#FFE6A6">Z</text>`).join('')}`),
  snack: () => svgWrap(`
    ${spark(36, 34, 4.5, '#E8048C', 'pt-a pt-a-tw')}${spark(286, 30, 5, '#FFC24D', 'pt-a pt-a-tw')}
    ${kid(84, 126, { skin: 1, hair: 'pigtails', hc: 5, shirt: '#9B8CE8', armL: [-12, -14], armR: [16, -33] })}
    <g class="pt-a pt-a-bob"><circle cx="102" cy="88" r="7" fill="#F2556F"/><path d="M102 81c0-3 1-5 3-6" stroke="#5FAF85" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="99.5" cy="86" r="2" fill="#fff" opacity=".6"/></g>
    ${table()}
    <ellipse cx="178" cy="120" rx="40" ry="4" fill="rgba(27,26,75,.12)"/>
    <circle cx="160" cy="92" r="12" fill="#FFB547"/><circle cx="156" cy="88" r="3" fill="#FFD9A0"/>
    <path d="M166 98c8 8 26 8 36-4-2 10-12 16-22 16-6 0-12-4-14-12Z" fill="#FFE07A"/>
    <circle cx="183" cy="88" r="12.5" fill="#F2556F"/><path d="M183 76c0-4 2-6 4-7" stroke="#5FAF85" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M186 72c4-3 9-2 10 1-4 2-7 2-10-1Z" fill="#7FC8A9"/><circle cx="179" cy="84" r="3" fill="#fff" opacity=".55"/>
    ${[[202, 90], [209, 92], [205, 97], [212, 99], [198, 97], [206, 103]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="4.6" fill="#9B8CE8"/>`).join('')}
    <path d="M140 98h76c0 15-16 22-38 22s-38-7-38-22Z" fill="#7FCBF2"/><path d="M146 104h64" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
    <path d="M244 92h24l-3 26h-18Z" fill="#F6B0C6"/><path d="M261 92l6-22" stroke="#01AEF2" stroke-width="3" stroke-linecap="round"/><path d="M262 88l1.4-5M264.6 79l1.4-5" stroke="#fff" stroke-width="3"/>`),
  pickup: () => svgWrap(`
    <circle cx="44" cy="112" r="34" fill="rgba(255,226,150,.45)"/><circle cx="44" cy="112" r="20" fill="#FFD27A"/>
    ${ground('#F3CFDF', '#E9B8CD')}
    ${wallDoor(true)}
    ${kid(150, 136, { skin: 0, hair: 'short', hc: 4, shirt: '#01AEF2', armL: [-12, -34], armR: [12, -34], open: true })}
    ${adult(124, 136, { skin: 2, hair: 'short', hc: 0, shirt: '#2D2B6B', pants: '#4A4873', beard: true, armR: [33, -32] })}
    ${armP('#2D2B6B', SKIN[2], 116, 97, 146, 106, 5.6)}
    ${heart(138, 46, 8, '#E8048C', 'pt-a pt-a-bob')}
    ${spark(170, 56, 4.5, '#FFC24D', 'pt-a pt-a-tw')}${spark(104, 40, 4, '#fff', 'pt-a pt-a-tw')}
    <path d="M172 136v-12a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v12Z" fill="#E8048C"/><path d="M178 120v-3a4 4 0 0 1 8 0v3" stroke="#A3026A" stroke-width="2" fill="none"/>`)
};

/* ---------- the clock face (symbol #pt-face, reused by the static timeline) ---------- */
function faceSymbol() {
  const C = 200, CY = 210, n = 30, R = 178, rr = 19.5;
  const P = a => [C + R * Math.sin(a), CY - R * Math.cos(a)];
  let d = '';
  for (let i = 0; i <= n; i++) { const [x, y] = P(i * 2 * Math.PI / n); d += i ? `A${rr} ${rr} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}` : `M${x.toFixed(1)} ${y.toFixed(1)}`; }
  d += 'Z';
  let ticks = '';
  for (let m = 0; m < 60; m++) {
    const a = m * Math.PI / 30, big = m % 5 === 0, r1 = big ? 141 : 148, r2 = 154;
    ticks += `<path d="M${(C + r1 * Math.sin(a)).toFixed(1)} ${(CY - r1 * Math.cos(a)).toFixed(1)}L${(C + r2 * Math.sin(a)).toFixed(1)} ${(CY - r2 * Math.cos(a)).toFixed(1)}" stroke="${big ? INK : 'rgba(27,26,75,.38)'}" stroke-width="${big ? 4.6 : 2}" stroke-linecap="round"/>`;
  }
  let nums = '';
  for (let hh = 1; hh <= 12; hh++) {
    const a = hh * Math.PI / 6, r = 119;
    nums += `<text x="${(C + r * Math.sin(a)).toFixed(1)}" y="${(CY - r * Math.cos(a) + 1).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, Rubik, system-ui, sans-serif" font-weight="600" font-size="${hh === 12 ? 36 : 32}" fill="${hh === 12 ? '#D1037D' : INK}">${hh}</text>`;
  }
  let gems = '';
  for (let hh = 0; hh < 12; hh++) {
    const a = (hh + .5) * Math.PI / 6, r = 166, x = C + r * Math.sin(a), y = CY - r * Math.cos(a);
    gems += hh % 3 === 1 ? spark(x.toFixed(1), y.toFixed(1), 6.5, '#fff') : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#FFD9EC"/>`;
  }
  return `<symbol id="pt-face" viewBox="0 0 400 400">
    <circle cx="200" cy="20" r="9" fill="none" stroke="#FFC24D" stroke-width="5"/>
    <rect x="184" y="24" width="32" height="22" rx="8" fill="#D1037D"/><rect x="190" y="28" width="7" height="14" rx="3.5" fill="#F45BAE"/>
    <path d="${d}" fill="#F3CFDF" transform="translate(0 6)"/>
    <path d="${d}" fill="#FFFFFF"/>
    <circle cx="${C}" cy="${CY}" r="174" fill="#E8048C"/>
    <circle cx="${C}" cy="${CY}" r="174" fill="none" stroke="#B8036E" stroke-width="2" opacity=".35"/>
    ${gems}
    <circle cx="${C}" cy="${CY}" r="159" fill="url(#pt-g-face)"/>
    <circle cx="${C}" cy="${CY}" r="159" fill="none" stroke="#F6B0C6" stroke-width="3"/>
    <circle cx="${C}" cy="${CY}" r="86" fill="none" stroke="#F3CFDF" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>
    ${ticks}${nums}
  </symbol>`;
}
function miniClock(min) {
  const ha = 210 + min * .5, ma = min * 6;
  return `<svg viewBox="0 0 400 400" aria-hidden="true" focusable="false"><use href="#pt-face"/>
    <path d="M193 214l3-72c.2-4 7.8-4 8 0l3 72c0 9-14 9-14 0Z" fill="${INK}" transform="rotate(${ha} 200 210)"/>
    <path d="M195 214l3-114c.1-3 3.9-3 4 0l3 114c0 7-10 7-10 0Z" fill="${INK}" transform="rotate(${ma} 200 210)"/>
    <circle cx="200" cy="210" r="14" fill="#E8048C"/><circle cx="200" cy="210" r="5" fill="#FFD27A"/></svg>`;
}
const fmtMin = m => pad(7 + Math.floor(m / 60)) + ':' + pad(Math.floor(m % 60));

/* =====================================================================
   HERO
   ===================================================================== */
function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makeStars(box, n, seed, region) {
  const r = seeded(seed); let out = '';
  for (let i = 0; i < n; i++) {
    const big = r() < .42, x = (3 + r() * 94).toFixed(1), y = (region[0] + r() * (region[1] - region[0])).toFixed(1);
    const s = big ? (7 + r() * 9).toFixed(1) : (2 + r() * 2.4).toFixed(1);
    out += `<i class="pt-star${big ? '' : ' is-dot'}" style="left:${x}%;top:${y}%;--s:${s};--i:${Math.round(+x / 4)};--tw:${(1.8 + r() * 2).toFixed(2)}s;--td:${(r() * 3).toFixed(2)}s"></i>`;
  }
  box.innerHTML = out;
}
function splitTitle() {
  const fx = $('.pt-title__fx', root); if (!fx) return;
  let i = 0;
  const part = (txt, cls) => `<span class="${cls}">` + String(txt).split(' ').map(w => `<span class="pt-w">${Array.from(w).map(ch => `<span class="pt-ch" style="--i:${i++}">${App.esc(ch)}</span>`).join('')}</span>`).join(' ') + '</span>';
  fx.innerHTML = part(App.t('pt.slogan.a'), 'pt-title__a') + ' ' + part(App.t('pt.slogan.b'), 'pt-title__b');
}

function applyMode(animate) {
  const night = S.forced != null ? S.forced : isNightAuto();
  const changed = night !== S.night || hero.classList.contains('is-night') !== night;
  S.night = night;
  hero.classList.toggle('is-night', night);
  const sw = $('[data-pt-mode]', root); if (sw) sw.setAttribute('aria-checked', String(night));
  updateDarkTop();
  if (changed && animate && !App.motion.reduced) {
    const c = night ? $('.pt-moon', hero) : $('.pt-sun', hero);
    setTimeout(() => { const r = c.getBoundingClientRect(); if (r.bottom > 0) App.fx.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 22, colors: night ? ['gold', 'white', 'pink'] : ['gold', 'white', 'sky'], speed: [60, 220], gravity: 40, life: [700, 1300] }); }, night ? 700 : 300);
  }
}
function toggleNight() {
  S.forced = !S.night; applyMode(true); App.haptic(10);
  const sw = $('[data-pt-mode]', root);
  if (sw && !App.motion.reduced) App.fx.burstAt(sw, { count: 12, speed: [60, 170], size: [6, 14], life: [400, 800], gravity: 60, colors: S.night ? ['gold', 'white'] : ['gold', 'sky', 'white'] });
}
function updateDarkTop() {
  html.classList.toggle('pt-dark-top', !!(S.night && S.active && S.sy < S.heroH - 80));
}

/* layout: castle fills the room left between the content and the bottom chrome */
function layout() {
  if (!hero || hero.offsetParent === null) return;
  hero.style.minHeight = '';
  const W = hero.offsetWidth, desk = W >= 900;
  let H = hero.offsetHeight;
  const cb = content.offsetTop + content.offsetHeight;
  const dockH = parseFloat(getComputedStyle(html).getPropertyValue('--dock-h')) || 68;
  const base = desk ? clamp(Math.round(H * .13), 96, 140) : Math.round(dockH + 22 + 54);
  const minCh = desk ? 230 : 156, maxCh = desk ? 420 : 320;
  let room = H - cb - base - (desk ? 22 : 14);
  if (room < minCh) { H += minCh - room; hero.style.minHeight = H + 'px'; room = minCh; }
  const ch = clamp(Math.round(room), minCh, maxCh);
  hero.style.setProperty('--pt-base', base + 'px');
  hero.style.setProperty('--pt-ch', ch + 'px');
  S.heroH = hero.offsetHeight;
  measureTrail();
}
function measureTrail() {
  if (!trailPath || !trailPath.getTotalLength) return;
  try {
    const L = trailPath.getTotalLength(), N = 90, pts = [];
    for (let i = 0; i <= N; i++) { const p = trailPath.getPointAtLength(L * i / N); pts.push([p.x, p.y]); }
    S.lut = pts;
  } catch (e) { S.lut = null; }
  placeCarriage();
}
function placeCarriage() {
  if (!S.lut || !carriage) return;
  const W = hillc.offsetWidth, H = hillc.offsetHeight, sx = W / 1000, sy = H / 170;
  // travels from the bottom of the trail up to the castle door, then rests and restarts
  const cyc = 17, t = (S.carT % cyc) / cyc;
  const u = App.motion.reduced ? .55 : clamp(t / .88, 0, 1);
  const f = (1 - u) * (S.lut.length - 1), i = Math.min(S.lut.length - 2, Math.floor(f)), k = f - i;
  const a = S.lut[i], b = S.lut[i + 1];
  const x = lerp(a[0], b[0], k) * sx, y = lerp(a[1], b[1], k) * sy;
  const dx = (a[0] - b[0]) * sx, dy = (a[1] - b[1]) * sy;
  const flip = dx < 0 ? -1 : 1, ang = clamp(Math.atan2(dy * flip, Math.abs(dx) + .001) * 57.3, -16, 16);
  const sc = lerp(1, .62, smooth(1 - (1 - u), .55, 1)); // shrinks a little as it climbs toward the castle
  carriage.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${ang.toFixed(1)}deg) scale(${(flip * sc).toFixed(3)}, ${sc.toFixed(3)})`;
  carriage.style.opacity = App.motion.reduced ? 1 : String(clamp(Math.min(t / .05, (.9 - t) / .05), 0, 1));
}
function applyLayers() {
  const sy = Math.min(S.sy, S.heroH), p = S.ptr, fine = App.isFine && !App.motion.reduced;
  if (App.motion.reduced) { layers.forEach(l => { l.el.style.translate = ''; }); content.style.translate = ''; content.style.opacity = ''; return; }
  for (const l of layers) {
    const x = fine ? -p.x * l.pd * 18 : 0, y = sy * l.sp + (fine ? -p.y * l.pd * 9 : 0);
    l.el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
  }
  content.style.translate = `0 ${(sy * .3).toFixed(1)}px`;
  content.style.opacity = String(clamp(1 - sy / (S.heroH * .62), 0, 1));
}
function tick(now) {
  if (!S.loop) return;
  const dt = Math.min(.05, (now - (S.lastNow || now)) / 1000); S.lastNow = now;
  S.carT += dt;
  const p = S.ptr; p.x += (p.tx - p.x) * .06; p.y += (p.ty - p.y) * .06;
  applyLayers(); placeCarriage();
  S.loop = requestAnimationFrame(tick);
}
function startLoop() {
  if (S.loop || App.motion.reduced || !S.active || !S.heroVis) return;
  hero.classList.add('pt-live'); hero.classList.remove('pt-paused');
  carriage && carriage.classList.add('is-on');
  S.lastNow = 0; S.loop = requestAnimationFrame(tick);
}
function stopLoop() {
  if (S.loop) cancelAnimationFrame(S.loop); S.loop = 0;
  hero && hero.classList.remove('pt-live');
}

function playIntro() {
  if (S.introStarted) return; S.introStarted = true;
  if (App.motion.reduced) { html.classList.remove('pt-armed'); S.introDone = true; return; }
  hero.classList.add('pt-go'); html.classList.remove('pt-armed');
  setTimeout(() => { const b = $('.pt-title__b', hero); if (b && S.active && S.sy < 200) App.fx.burstAt(b, { count: App.isTouch ? 22 : 34, speed: [120, 360], life: [600, 1150], gravity: 120, colors: ['magenta', 'gold', 'pink', 'white', 'blue'] }); }, 900);
  setTimeout(() => { hero.classList.remove('pt-go'); S.introDone = true; }, 1900);
}

/* =====================================================================
   CLOCK
   ===================================================================== */
function buildBeads() {
  const strip = $('.pt-ruler__strip', root); if (!strip) return;
  $$('.pt-bead', strip).forEach(b => b.remove());
  let out = '';
  for (let hh = 7; hh <= 17; hh++) out += `<button type="button" class="pt-bead" data-h="${hh}" aria-label="${App.esc(App.t('pt.bead', { t: pad(hh) + ':00' }))}"><i></i><span>${pad(hh)}</span></button>`;
  strip.insertAdjacentHTML('beforeend', out);
}
function measureRuler() {
  const win = $('.pt-ruler__win', root), strip = $('.pt-ruler__strip', root); if (!win || !strip || !win.offsetWidth) return;
  strip.style.transform = 'none';
  S.winW = win.offsetWidth; S.stripW = strip.offsetWidth;
  S.beadX = $$('.pt-bead', strip).map(b => b.offsetLeft + b.offsetWidth / 2);
  $('.pt-ruler', root).classList.toggle('is-fit', S.stripW <= S.winW);
}
/* the dial takes whatever height the stage has left (tour captions / floating buttons reserve the bottom) */
function sizeDial() {
  if (S.static || !stage || !stage.offsetHeight) return;
  const cs = getComputedStyle(stage), W = stage.clientWidth, desk = W >= 900;
  const H = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const gap = parseFloat(cs.rowGap) || 8;
  let c;
  if (desk) c = Math.min(W * .4, (H - 8) / 1.09, 540);
  else {
    const used = $('.pt-stage__head', stage).offsetHeight + $('.pt-ruler', stage).offsetHeight + $('.pt-card', stage).offsetHeight + gap * 3 + 8;
    c = Math.min(W * .74, 330, (H - used) / 1.07);
  }
  c = Math.max(desk ? 260 : 140, Math.floor(c));
  stage.style.setProperty('--pt-cs', c + 'px');
}
function trackTop() { return track.getBoundingClientRect().top + App.scrollY(); }
function yForMinute(min, extra = 0) {
  const p = P0 + (P1 - P0) * clamp(min / 600, 0, 1) + extra;
  return trackTop() + clamp(p, 0, 1) * (track.offsetHeight - innerHeight);
}
function jumpTo(hh, o = {}) {
  if (S.static) { App.scrollTo('#clock', { offset: 70 }); return Promise.resolve(); }
  const min = (clamp(hh, 7, 17) - 7) * 60;
  return App.scrollTo(yForMinute(min, hh >= 17 ? .04 : .004), Object.assign({ duration: 900 }, o));
}
function updateClock() {
  if (S.static || !track || !S.active) return;
  const p = App.progress(track);
  const k = clamp((p - P0) / (P1 - P0), 0, 1), min = k * 600, t = 7 + min / 60;
  // hands
  $('.pt-hand--m', dial).style.transform = `rotate(${(min * 6).toFixed(2)}deg)`;
  $('.pt-hand--h', dial).style.transform = `rotate(${(210 + min * .5).toFixed(2)}deg)`;
  const txt = fmtMin(Math.min(600, min));
  const ro = $('.pt-readout bdi', dial); if (ro.textContent !== txt) ro.textContent = txt;
  // sky through the day
  const bg = $$('.pt-bg', stage);
  bg[1].style.opacity = smooth(t, 8, 10.2).toFixed(3);
  bg[2].style.opacity = smooth(t, 12.4, 14.8).toFixed(3);
  bg[3].style.opacity = smooth(t, 15.2, 16.9).toFixed(3);
  const dim = smooth(min, 318, 345) * (1 - smooth(min, 438, 462));
  $('.pt-stage__dim', stage).style.opacity = (dim * .24).toFixed(3);
  $('.pt-nstars', stage).style.opacity = dim.toFixed(3);
  const sun = $('.pt-stage__sun', stage), sw = stage.offsetWidth, sh = stage.offsetHeight, fr = min / 600;
  sun.style.transform = `translate3d(${((fr - .5) * sw * .84).toFixed(1)}px, ${(sh * (.6 - .48 * Math.sin(Math.PI * fr))).toFixed(1)}px, 0)`;
  sun.style.opacity = (1 - dim * .8).toFixed(3);
  // scene
  let idx = 0; for (let i = 0; i < SCENES.length; i++) if (min >= SCENES[i].from) idx = i;
  if (idx !== S.scene) setScene(idx, S.scene !== -1);
  // ruler
  const hi = clamp(Math.floor(t + 1e-6), 7, 17) - 7;
  $$('.pt-bead', stage).forEach((b, i) => { b.classList.toggle('is-on', i === hi); b.classList.toggle('is-past', i < hi); if (i === hi) b.setAttribute('aria-current', 'time'); else b.removeAttribute('aria-current'); });
  const line = $('.pt-ruler__line', stage); line && line.style.setProperty('--pt-fill', k.toFixed(4));
  if (S.beadX.length === 11) {
    const strip = $('.pt-ruler__strip', stage);
    const f = (t - 7), i0 = clamp(Math.floor(f), 0, 9), pos = lerp(S.beadX[i0], S.beadX[i0 + 1], clamp(f - i0, 0, 1));
    const tx = S.stripW <= S.winW ? (S.winW - S.stripW) / 2 : clamp(S.winW / 2 - pos, S.winW - S.stripW, 0);
    strip.style.transform = `translate3d(${tx.toFixed(1)}px,0,0)`;
    const mark = $('.pt-ruler__mark', stage), win = $('.pt-ruler__win', stage);
    if (mark) mark.style.transform = `translate3d(${(win.offsetLeft + tx + pos).toFixed(1)}px,0,0)`;
  }
  // finale
  const fin = p >= P1 + .006;
  if (fin !== S.fin) { S.fin = fin; stage.classList.toggle('is-finale', fin); if (fin) chime(); }
}
function setScene(i, fx) {
  S.scene = i;
  $$('.pt-sc', stage).forEach((el, j) => el.classList.toggle('is-on', j === i));
  if (fx && !App.motion.reduced && S.clockVis) {
    const art = $$('.pt-sc', stage)[i].querySelector('.pt-sc__art');
    const r = art.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) App.fx.burst(r.left + r.width / 2, r.top + r.height * .45, { count: App.isTouch ? 10 : 14, colors: SCENES[i].colors, speed: [70, 210], size: [6, 15], life: [450, 850], gravity: 50 });
  }
}
function chime() {
  if (App.motion.reduced || !S.clockVis) return;
  dial.classList.remove('is-chime'); void dial.offsetWidth; dial.classList.add('is-chime');
  App.haptic(18);
  const face = $('.pt-dial__face', dial), r = face.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height * .525;
  App.fx.burst(cx, cy, { count: App.isTouch ? 30 : 46, colors: ['gold', 'magenta', 'white', 'pink'], speed: [160, 460], life: [700, 1300], gravity: 140 });
  setTimeout(() => App.fx.ring(cx, cy, r.width * .5, App.isTouch ? 12 : 18, { colors: ['gold', 'white'] }), 260);
  clearTimeout(S.chimeT); S.chimeT = setTimeout(() => dial.classList.remove('is-chime'), 2800);
}

/* reduced motion: a calm vertical timeline instead of the pinned scene */
function buildTimeline() {
  const tl = $('.pt-tl', root); if (!tl) return;
  tl.innerHTML = `<div class="wrap wrap--narrow">
    <div class="pt-tl__head"><h2 class="h2" data-i18n="pt.clock.title"></h2><p class="pt-stage__sub"><span data-i18n="pt.clock.sub"></span> <span class="demo-tag" data-i18n="pt.clock.example"></span></p></div>
    <ol class="pt-tl__list">${SCENES.map((sc, i) => `<li class="pt-tl__it"><div class="pt-tl__clock">${miniClock(sc.at)}<bdi class="tnum" dir="ltr">${fmtMin(sc.at)}</bdi></div>
      <div class="pt-tl__body"><div class="pt-tl__art" style="background:${sc.bg}">${ART[sc.art]()}</div><div><h3 class="pt-tl__t" data-i18n="pt.s${i}.t"></h3><p class="pt-tl__l" data-i18n="pt.s${i}.l"></p></div></div></li>`).join('')}
      <li class="pt-tl__it"><div class="pt-tl__clock">${miniClock(600)}<bdi class="tnum" dir="ltr">17:00</bdi></div><div class="pt-tl__body"><div class="pt-tl__fin" style="grid-column: span 2"><svg class="pt-fin__ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-sparkles"/></svg><p class="pt-fin__big" data-i18n="pt.fin.big"></p><p class="pt-fin__small" data-i18n="pt.fin.small"></p></div></div></li>
    </ol></div>`;
  App.i18n.apply(tl);
}
function setStatic(on) {
  S.static = on;
  const sec = $('.pt-clock', root);
  sec.classList.toggle('is-static', on);
  const tl = $('.pt-tl', root);
  if (on) { if (!tl.firstChild) buildTimeline(); tl.hidden = false; }
  else { tl.hidden = true; }
}

/* =====================================================================
   I18N
   ===================================================================== */
const I18N = {
  he: {
    'pt.eyebrow': 'מעון יום · אשדוד',
    'pt.slogan': 'גן ילדים מהאגדות', 'pt.slogan.a': 'גן ילדים', 'pt.slogan.b': 'מהאגדות',
    'pt.lead': 'מעון יום מוכר ומפוקח, מלידה ועד גיל\u00a03',
    'pt.cta.visit': 'קביעת סיור בגן', 'pt.cta.avail': 'בדיקת מקום פנוי',
    'pt.mode': 'תצוגת לילה', 'pt.cue': 'יום בגן', 'pt.cueA': 'לגלול אל השעון של סינדרלה',
    'pt.f1': 'מלידה עד גיל 3', 'pt.f2': 'מעון מוכר ומפוקח', 'pt.f3': 'מטבח משלנו, אוכל טרי כל יום',
    'pt.f4': 'א׳–ה׳ <bdi class="tnum">07:00–17:00</bdi><br>ו׳ <bdi class="tnum">07:00–13:00</bdi>',
    'pt.clock.title': 'השעון של סינדרלה', 'pt.clock.sub': 'יום בגן, שעה אחרי שעה', 'pt.clock.example': 'יום לדוגמה',
    'pt.clock.aria': 'שעון שהמחוגים שלו זזים מ-07:00 עד 17:00 בזמן הגלילה',
    'pt.ruler': 'קפיצה לשעה ביום', 'pt.bead': 'קפיצה ל-{t}',
    'pt.s0.t': 'בוקר טוב', 'pt.s0.l': 'מגיעים בנחת, ובדלת כבר מחכים לכם עם חיוך.',
    'pt.s1.t': 'ארוחת בוקר מהמטבח שלנו', 'pt.s1.l': 'מבשלים כאן בגן. אוכל טרי, כל יום מחדש.',
    'pt.s2.t': 'שלושה חוגים בשבוע', 'pt.s2.l': 'מוזיקה, ספורט וטבע-חיות. שרים, קופצים ומלטפים.',
    'pt.s3.t': 'יוצאים לחצר', 'pt.s3.l': 'משחקים באוויר הפתוח, מתלכלכים קצת וצוחקים הרבה.',
    'pt.s4.t': 'ארוחת צהריים', 'pt.s4.l': 'בישול ביתי מהמטבח שלנו, לפי תפריט שאישרה דיאטנית.',
    'pt.s5.t': 'מנוחת צהריים', 'pt.s5.l': 'שמיכה רכה, אור עמום ושקט. אוספים כוחות.',
    'pt.s6.t': 'ארוחת מנחה', 'pt.s6.l': 'מתעוררים לאט, ומשהו טעים כבר מחכה על השולחן.',
    'pt.s7.t': 'ההורים מגיעים', 'pt.s7.l': 'ריצה אל הדלת, חיבוק גדול, ויש המון מה לספר.',
    'pt.fin.big': 'אצלנו היום נגמר ב-17:00, לא בחצות',
    'pt.fin.small': 'אפשר להאריך עד 18:00 · ביום ו׳ 07:00–13:00'
  },
  ru: {
    'pt.eyebrow': 'Мэон (ясли-сад) · Ашдод',
    'pt.slogan': 'Детский сад из сказки', 'pt.slogan.a': 'Детский сад', 'pt.slogan.b': 'из сказки',
    'pt.lead': 'Признанный мэон под надзором, для детей от рождения до 3\u00a0лет',
    'pt.cta.visit': 'Записаться на экскурсию', 'pt.cta.avail': 'Есть ли места',
    'pt.mode': 'Ночной режим', 'pt.cue': 'День в саду', 'pt.cueA': 'Прокрутить к часам Синдереллы',
    'pt.f1': 'С рождения до 3\u00a0лет', 'pt.f2': 'Признанный мэон под надзором', 'pt.f3': 'Своя кухня, свежая еда каждый день',
    'pt.f4': 'вс–чт <bdi class="tnum">07:00–17:00</bdi><br>пт <bdi class="tnum">07:00–13:00</bdi>',
    'pt.clock.title': 'Часы Синдереллы', 'pt.clock.sub': 'День в саду, час за часом', 'pt.clock.example': 'пример дня',
    'pt.clock.aria': 'Часы, стрелки которых идут с 07:00 до 17:00 при прокрутке',
    'pt.ruler': 'Перейти к часу дня', 'pt.bead': 'Перейти к {t}',
    'pt.s0.t': 'Доброе утро', 'pt.s0.l': 'Приходите без спешки, у двери вас уже встречают с улыбкой.',
    'pt.s1.t': 'Завтрак с нашей кухни', 'pt.s1.l': 'Готовим прямо в саду. Всё свежее, каждый день.',
    'pt.s2.t': 'Три кружка в неделю', 'pt.s2.l': 'Музыка, спорт, природа и животные. Поём, прыгаем, гладим кролика.',
    'pt.s3.t': 'Гуляем во дворе', 'pt.s3.l': 'Играем на свежем воздухе, немного пачкаемся и много смеёмся.',
    'pt.s4.t': 'Обед', 'pt.s4.l': 'Домашняя еда с нашей кухни, меню утверждено диетологом.',
    'pt.s5.t': 'Тихий час', 'pt.s5.l': 'Мягкое одеяло, приглушённый свет и тишина. Набираемся сил.',
    'pt.s6.t': 'Полдник', 'pt.s6.l': 'Просыпаемся не спеша, а на столе уже ждёт что-то вкусное.',
    'pt.s7.t': 'Родители пришли', 'pt.s7.l': 'Бегом к двери, крепкие объятия, и дома есть что рассказать.',
    'pt.fin.big': 'У нас день заканчивается в 17:00, а не в полночь',
    'pt.fin.small': 'Можно продлить до 18:00 · в пятницу 07:00–13:00'
  }
};

/* =====================================================================
   MODULE
   ===================================================================== */
App.module('pubTop', {
  view: 'visitors',
  i18n: I18N,
  init(r) {
    root = r; hero = $('#hero', r); content = $('.pt-hero__content', r);
    track = $('.pt-track', r); stage = $('.pt-stage', r); dial = $('.pt-dial', r);
    carriage = $('.pt-carriage', r); hillc = $('.pt-hillc', r); trailPath = $('.pt-trail', r);
    layers = $$('.pt-L', hero).map(el => ({ el, sp: +el.dataset.sp || 0, pd: +el.dataset.pd || 0 }));
    // shared symbols + generated art
    $('.pt-defs defs', r).insertAdjacentHTML('beforeend', faceSymbol());
    makeStars($('.pt-stars', hero), 34, 7, [3, 92]);
    makeStars($('.pt-nstars', stage), 12, 11, [8, 92]);
    $$('.pt-sc__art', stage).forEach((el, i) => { el.style.setProperty('--pt-art-bg', SCENES[i].bg); el.innerHTML = ART[el.dataset.art](); });
    splitTitle(); buildBeads();
    S.night = hero.classList.contains('is-night'); applyMode(false);

    // events
    $('[data-pt-visit]', r).addEventListener('click', e => {
      const pb = App.mod('pubBottom');
      if (pb && pb.openBooking) pb.openBooking({ origin: e.currentTarget }); else App.scrollTo('#visit');
    });
    $('[data-pt-avail]', r).addEventListener('click', () => App.scrollTo('#availability'));
    $('[data-pt-mode]', r).addEventListener('click', toggleNight);
    $('[data-pt-cue]', r).addEventListener('click', () => App.scrollTo(S.static ? '#clock' : track, { offset: S.static ? 70 : 0 }));
    $('.pt-ruler', r).addEventListener('click', e => { const b = e.target.closest('.pt-bead'); if (b) jumpTo(+b.dataset.h); });
    if (App.isFine) {
      hero.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const rc = hero.getBoundingClientRect(); S.ptr.tx = clamp((e.clientX - rc.left) / rc.width * 2 - 1, -1, 1); S.ptr.ty = clamp((e.clientY - rc.top) / innerHeight * 2 - 1, -1, 1); }, { passive: true });
      hero.addEventListener('pointerleave', () => { S.ptr.tx = 0; S.ptr.ty = 0; }, { passive: true });
    }
    App.onScroll(y => {
      if (!S.active) return;
      S.sy = y;
      hero.classList.toggle('is-scrolled', y > 40);
      if (!S.loop) applyLayers();
      updateDarkTop();
      updateClock();
    });
    // visibility (pause loops offscreen)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => {
        S.heroVis = en.isIntersecting;
        hero.classList.toggle('pt-paused', !en.isIntersecting);
        if (en.isIntersecting) startLoop(); else stopLoop();
      }), { rootMargin: '40px' }).observe(hero);
      new IntersectionObserver(es => es.forEach(en => {
        S.clockVis = en.isIntersecting;
        $('.pt-clock', r).classList.toggle('pt-paused', !en.isIntersecting);
      }), { rootMargin: '80px' }).observe($('.pt-clock', r));
    }
    // hide the cue while core's tour invitation pill sits in the same spot
    const inv = $('.tour-invite');
    if (inv && 'MutationObserver' in window) {
      const sync = () => hero.classList.toggle('has-invite', !inv.hidden);
      new MutationObserver(sync).observe(inv, { attributes: true, attributeFilter: ['hidden'] }); sync();
    }
    let rT = 0;
    addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (!S.active) return; layout(); sizeDial(); measureRuler(); updateClock(); }, 120); }, { passive: true });
    const reflow = () => { if (S.active) requestAnimationFrame(() => { sizeDial(); measureRuler(); updateClock(); }); };
    App.on('tour:start', reflow); App.on('tour:stop', reflow);
    App.on('lang', () => {
      splitTitle(); buildBeads();
      if (S.static) buildTimeline();
      if (S.active) { layout(); sizeDial(); measureRuler(); updateClock(); }
    });
    App.on('motion', reduced => {
      setStatic(!!reduced);
      if (reduced) { stopLoop(); html.classList.remove('pt-armed'); hero.classList.remove('pt-go'); applyLayers(); placeCarriage(); }
      else if (S.active) { sizeDial(); measureRuler(); updateClock(); startLoop(); }
    });
    setStatic(App.motion.reduced);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (S.active) { layout(); sizeDial(); measureRuler(); updateClock(); } });
  },
  onEnter() {
    S.active = true; root.classList.remove('pt-paused');
    S.sy = App.scrollY();
    layout(); sizeDial(); measureRuler();
    S.scene = -1; updateClock();
    applyMode(false);
    applyLayers(); placeCarriage();
    if (!S.introStarted) playIntro();
    startLoop();
  },
  onLeave() {
    S.active = false; stopLoop();
    root.classList.add('pt-paused');
    html.classList.remove('pt-dark-top');
  },
  reset() {
    S.forced = null; applyMode(true);
    S.ptr.tx = S.ptr.ty = 0;
  },
  /* public helpers */
  setNight(on) { S.forced = on == null ? null : !!on; applyMode(true); },
  toggleNight,
  jumpTo,
  tour: {
    async hero(ctx) {
      ctx.check();
      if (S.forced != null) { S.forced = null; applyMode(false); }
      await ctx.scrollTo(0, { duration: ctx.fast ? 0 : 600 });
      const sw = $('[data-pt-mode]', root);
      await ctx.tap(sw, { after: ctx.fast ? 500 : 1500 });
      await ctx.tap(sw, { after: ctx.fast ? 200 : 350 });
      if (S.forced != null && S.forced === isNightAuto()) S.forced = null;
      ctx.check();
      App.fx.burstAt($('.pt-logo__img', root), { count: App.isTouch ? 30 : 44, speed: [140, 420], life: [700, 1250], gravity: 120 });
      await ctx.wait(ctx.fast ? 200 : 600);
    },
    async clock(ctx) {
      ctx.check(); ctx.hideFinger();
      if (S.static) {
        await ctx.scrollTo('#clock', { offset: 70, duration: 0 });
        await ctx.wait(ctx.fast ? 700 : 1400);
        const fin = $('.pt-tl__fin', root);
        await ctx.scrollTo(fin, { center: true, duration: ctx.fast ? 0 : 2000 });
        await ctx.wait(1300);
        return;
      }
      const top = trackTop(), span = track.offsetHeight - innerHeight;
      await ctx.scrollTo(top + span * P0 * .5, { duration: 650 });
      await ctx.scrollTo(top + span * (P1 + .03), { duration: 9600, linear: true });
      await ctx.wait(1300);
    }
  }
});
