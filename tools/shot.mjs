// Screenshot / interaction harness for the built index.html.
// Examples:
//   node tools/shot.mjs --view parents --lang ru --out shots/parents-ru.png
//   node tools/shot.mjs --view visitors --full --out shots/home-full.png
//   node tools/shot.mjs --view staff --w 1280 --h 800 --do "document.querySelector('[data-x]').click()" --wait 800 --out shots/s.png
//   node tools/shot.mjs --view visitors --sel "#clock" --clip --out shots/clock.png
//   node tools/shot.mjs --script tools/my-flow.mjs        (default export async (page, h) => {...})
//   --time 2026-11-15T20:30  (fakes the clock: night hero etc.)   --reduced  (prefers-reduced-motion)
//   --touch  (emulate a touch phone: coarse pointer, isMobile)   --dpr 2
//   --file shots/<module>/index.html  (use your own build output: node build.mjs --out shots/<module>/index.html)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright');
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const argv = process.argv.slice(2);
const opts = { do: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]; if (!a.startsWith('--')) continue;
  const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  if (k === 'do') opts.do.push(v); else opts[k] = v;
}
const W = +(opts.w || 390), H = +(opts.h || 844);
const out = opts.out || `shots/${opts.view || 'visitors'}-${opts.lang || 'he'}-${W}.png`;
mkdirSync(dirname(resolve(out)), { recursive: true });

const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined });
const context = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: +(opts.dpr || 1),
  reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
  hasTouch: !!opts.touch, isMobile: !!opts.touch, locale: 'he-IL', timezoneId: 'Asia/Jerusalem'
});
const page = await context.newPage();
const logs = [];
page.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(`[console.${m.type()}] ${m.text()}`); });
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}\n${(e.stack || '').split('\n').slice(0, 4).join('\n')}`));
page.on('requestfailed', r => logs.push(`[requestfailed] ${r.url().slice(0, 120)} ${r.failure()?.errorText}`));
await page.addInitScript(({ lang, time }) => {
  try { localStorage.setItem('gc:lang', JSON.stringify(lang)); localStorage.setItem('gc:inviteDismissed', 'true'); } catch (e) {}
  if (time) {
    const fixed = new Date(time).getTime(); const RealDate = Date; const start = RealDate.now();
    class FakeDate extends RealDate { constructor(...a) { if (a.length) super(...a); else super(fixed + (RealDate.now() - start)); } static now() { return fixed + (RealDate.now() - start); } }
    window.Date = FakeDate;
  }
}, { lang: opts.lang || 'he', time: opts.time || null });
const url = pathToFileURL(resolve(opts.file || process.env.GC_FILE || 'index.html')).href + '#' + (opts.view || 'visitors');
await page.goto(url, { waitUntil: 'load', timeout: 45000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(+(opts.wait0 || 900));
const helpers = {
  wait: ms => page.waitForTimeout(ms),
  shot: async (p, o = {}) => { mkdirSync(dirname(resolve(p)), { recursive: true }); await page.screenshot({ path: p, fullPage: !!o.full }); console.log('saved', p); },
  click: async sel => { await page.locator(sel).first().click(); },
  logs
};
if (opts.y) { await page.evaluate(y => { window.App && App.lenis ? App.lenis.scrollTo(+y, { immediate: true, force: true }) : window.scrollTo(0, +y); }, opts.y); await page.waitForTimeout(500); }
if (opts.sel) { await page.evaluate(s => { const el = document.querySelector(s); if (el) { const y = el.getBoundingClientRect().top + scrollY - 70; window.App && App.lenis ? App.lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y); } else console.error('sel not found: ' + s); }, opts.sel); await page.waitForTimeout(600); }
for (const code of opts.do) { try { await page.evaluate(`(async () => { ${code} })()`); } catch (e) { logs.push('[do error] ' + e.message); } await page.waitForTimeout(+(opts.wait || 700)); }
if (opts.script) { const mod = await import(pathToFileURL(resolve(opts.script)).href); await mod.default(page, helpers); }
else {
  await page.waitForTimeout(+(opts.wait || 400));
  if (opts.clip && opts.sel) { await page.locator(opts.sel).first().screenshot({ path: out }); }
  else await page.screenshot({ path: out, fullPage: !!opts.full });
  console.log('saved', out);
}
const overflow = await page.evaluate(() => { const w = document.documentElement.clientWidth; const bad = []; document.querySelectorAll('body *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > w + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('[data-allow-overflow],.pixie,svg')) bad.push((el.className && el.className.baseVal == null ? el.className : el.tagName) + ''); }); return { scrollW: document.documentElement.scrollWidth, w, bad: [...new Set(bad)].slice(0, 12) }; });
if (overflow.scrollW > overflow.w) logs.push(`[overflow] page scrollWidth ${overflow.scrollW} > ${overflow.w}: ${overflow.bad.join(' | ')}`);
console.log(logs.length ? logs.join('\n') : '[no console errors]');
await browser.close();
