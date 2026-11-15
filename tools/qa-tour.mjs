// Runs the full guided tour on the built page and snapshots it every N ms.
//   node tools/qa-tour.mjs [--file index.html] [--lang he|ru] [--every 2500] [--w 390 --h 844] [--out shots/tour]
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, rmSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const a = process.argv.slice(2); const o = {};
for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
const out = o.out || 'shots/tour'; rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const W = +(o.w || 390), H = +(o.h || 844), every = +(o.every || 2500);
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: !!o.touch, isMobile: !!o.touch, reducedMotion: o.reduced ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const logs = [];
page.on('console', m => { const t = m.text(); if (m.type() === 'error' || m.type() === 'warning' || t.includes('[tour]')) logs.push(`[${m.type()}] ${t}`); });
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
await page.addInitScript(lang => { try { localStorage.setItem('gc:lang', JSON.stringify(lang)); localStorage.setItem('gc:inviteDismissed', 'true'); } catch (e) {} }, o.lang || 'he');
await page.goto(pathToFileURL(resolve(o.file || 'index.html')).href + '#visitors', { waitUntil: 'load' });
await page.waitForTimeout(1200);
const t0 = Date.now();
await page.evaluate(() => { window.__tourDone = false; App.on('tour:stop', () => { window.__tourDone = true; }); App.tour.start(); });
let n = 0;
while (true) {
  await page.waitForTimeout(every);
  const st = await page.evaluate(() => ({ done: window.__tourDone, cap: document.querySelector('.tour-cap__text')?.textContent || '', view: App.state.view, y: Math.round(scrollY), sheets: App.ui.sheets.length }));
  const file = `${out}/${String(++n).padStart(2, '0')}-${st.view}.png`;
  await page.screenshot({ path: file });
  console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s view=${st.view} y=${st.y} sheets=${st.sheets} cap="${st.cap.slice(0, 60)}"`);
  if (st.done || Date.now() - t0 > 150000) break;
}
console.log(`tour duration ≈ ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(logs.length ? logs.join('\n') : '[no console errors]');
await browser.close();
