// Scrolls the visitors page screen by screen (skipping the clock track), screenshots every step,
// and reports elements that stick out of the viewport horizontally or text that is clipped.
//   node tools/shot.mjs --view visitors --touch --w 390 --h 664 --script tools/check-page.mjs [--lang ru]
export default async (page, h) => {
  const lang = await page.evaluate(() => App.i18n.lang);
  const W = await page.evaluate(() => innerWidth);
  const view = await page.evaluate(() => App.state.view); const dir = `shots/page/${view}-${lang}-${W}`;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const [ta, tb] = await page.evaluate(() => { const t = document.querySelector('.view:not([hidden]) .pt-track'); if (!t) return [1e9, -1]; const a = t.getBoundingClientRect().top + scrollY; return [a, a + t.offsetHeight - innerHeight]; });
  const vh = await page.evaluate(() => innerHeight);
  let y = 0, n = 0; const problems = [];
  while (y < total) {
    if (y > ta + vh && y < tb) { y = tb; continue; }
    await page.evaluate(v => window.scrollTo(0, v), y); await h.wait(650);
    const p = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth, out = [];
      document.querySelectorAll('.view:not([hidden]) *').forEach(el => {
        const r = el.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
        if (el.closest('svg,[aria-hidden="true"],.pt-hero__scene,.pixie,.sr-only')) return;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
        if ((r.left < -1 || r.right > vw + 1) && !el.closest('[data-allow-overflow]')) {
          let a = el.parentElement, clipped = false; while (a && a !== document.body) { const s = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { const ar = a.getBoundingClientRect(); if (ar.left >= -1 && ar.right <= vw + 1) { clipped = true; break; } } a = a.parentElement; }
          if (!clipped) out.push('offscreen: ' + (el.className && el.className.baseVal == null ? el.className : el.tagName));
        }
        if (el.children.length === 0 && el.textContent.trim() && (el.scrollWidth > el.clientWidth + 2) && /(hidden|clip)/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis') out.push('clipped text: "' + el.textContent.trim().slice(0, 30) + '"');
      });
      return [...new Set(out)].slice(0, 6);
    });
    const file = `${dir}/${String(++n).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    if (p.length) problems.push(`#${n} y=${y}: ${p.join(' | ')}`);
    y += Math.round(vh * .82);
  }
  console.log(`${lang} ${W}: ${n} screens → ${dir}`);
  console.log(problems.length ? problems.join('\n') : 'no offscreen/clipped elements');
};
