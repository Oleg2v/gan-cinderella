// Parent cabinet: login screen, log in via the tour step, then screenshot each tab + scroll the "today" tab.
//   node tools/shot.mjs --view parents --touch --w 390 --h 664 --lang ru --script tools/check-parent.mjs
export default async (page, h) => {
  const lang = await page.evaluate(() => App.i18n.lang);
  const dir = `shots/parent-check/${lang}`;
  await page.screenshot({ path: `${dir}/00-login.png` });
  await page.evaluate(async () => { const c = App.tour.ctx(new AbortController().signal); await App.mod('parent').tour.login(c); c.hideFinger(); });
  await h.wait(900);
  const tabs = await page.evaluate(() => [...document.querySelectorAll('[data-module="parent"] [role="tab"]')].map((t, i) => i));
  const overflow = async tag => {
    const p = await page.evaluate(() => { const vw = document.documentElement.clientWidth; const bad = []; document.querySelectorAll('.view:not([hidden]) *').forEach(el => { const r = el.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight || el.closest('svg,.sr-only,[aria-hidden="true"]')) return; if (r.left < -1 || r.right > vw + 1) { let a = el.parentElement, ok = false; while (a && a !== document.body) { const s = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { const ar = a.getBoundingClientRect(); if (ar.left >= -1 && ar.right <= vw + 1) { ok = true; break; } } a = a.parentElement; } if (!ok) bad.push(el.className && el.className.baseVal == null ? el.className : el.tagName); } }); return [...new Set(bad)].slice(0, 5); });
    if (p.length) console.log('✗', tag, p.join(' | '));
  };
  // today tab: scroll through
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let y = 0, n = 0; const vh = await page.evaluate(() => innerHeight);
  while (y < total && n < 14) { await page.evaluate(v => window.scrollTo(0, v), y); await h.wait(600); await page.screenshot({ path: `${dir}/today-${String(++n).padStart(2, '0')}.png` }); await overflow('today #' + n); y += Math.round(vh * .82); }
  for (const i of tabs.slice(1)) {
    await page.evaluate(i => { window.scrollTo(0, 0); document.querySelectorAll('[data-module="parent"] [role="tab"]')[i].click(); }, i);
    await h.wait(1300);
    await page.screenshot({ path: `${dir}/tab-${i}.png` });
    await overflow('tab ' + i);
    await page.evaluate(() => window.scrollTo(0, innerHeight * .8)); await h.wait(700);
    await page.screenshot({ path: `${dir}/tab-${i}b.png` });
    await overflow('tab ' + i + 'b');
  }
  console.log(lang, 'parent screens:', n, 'today +', tabs.length - 1, 'tabs');
};
