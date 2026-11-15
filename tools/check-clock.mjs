// Geometry check of the sticky clock scene across phone sizes and both languages.
//   node tools/shot.mjs --view visitors --script tools/check-clock.mjs [--file index.html]
const SIZES = [[390, 664], [390, 750], [390, 844], [375, 600], [360, 640], [430, 740], [1280, 800]];
export default async (page, h) => {
  let bad = 0;
  for (const lang of ['ru', 'he']) {
    await page.evaluate(l => App.i18n.set(l, { animate: false }), lang);
    for (const [w, hh] of SIZES) {
      await page.setViewportSize({ width: w, height: hh }); await h.wait(450);
      for (const f of [0.03, 0.45, 0.97]) {
        await page.evaluate(f => { const t = document.querySelector('.pt-track'); const top = t.getBoundingClientRect().top + scrollY; window.scrollTo(0, Math.round(top + (t.offsetHeight - innerHeight) * f)); }, f);
        await h.wait(500);
        const r = await page.evaluate(() => {
          const R = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { t: b.top, b: b.bottom, l: b.left, r: b.right, w: b.width, h: b.height }; };
          const pill = R('.pt-readout'), txt = R('.pt-readout bdi'), dial = R('.pt-dial'), card = R('.pt-card'), ruler = R('.pt-ruler'), head = R('.pt-stage__head'), dock = R('.dock__bar');
          const issues = [];
          if (txt.r > pill.r - 6 || txt.l < pill.l + 6) issues.push(`time text outside pill (${txt.l.toFixed(0)}-${txt.r.toFixed(0)} vs ${pill.l.toFixed(0)}-${pill.r.toFixed(0)})`);
          if (pill.t < dial.b - 12) issues.push(`pill covers dial by ${(dial.b - pill.t).toFixed(0)}px`);
          const desk = innerWidth >= 900;
          if (!desk && card.t < pill.b + 2) issues.push(`card overlaps pill by ${(pill.b - card.t).toFixed(0)}px`);
          if (!desk && ruler.b > dial.t + 4) issues.push(`ruler overlaps dial`);
          if (card.b > dock.t - 4) issues.push(`card hidden behind dock by ${(card.b - dock.t + 4).toFixed(0)}px`);
          if (dial.w < (desk ? 260 : 170)) issues.push(`dial small: ${dial.w.toFixed(0)}px`);
          return { dial: Math.round(dial.w), issues, ro: document.querySelector('.pt-readout').textContent.trim() };
        });
        const tag = `${lang} ${w}x${hh} @${f}`;
        if (r.issues.length) { bad++; console.log('✗', tag, 'dial', r.dial, r.ro, r.issues.join('; ')); }
        else console.log('✓', tag, 'dial', r.dial, r.ro);
        if (f === 0.45 && (w === 390 || w === 360 || w === 1280)) await page.screenshot({ path: `shots/clock/${lang}-${w}x${hh}.png` });
      }
    }
  }
  console.log(bad ? `${bad} problem frame(s)` : 'ALL CLOCK FRAMES OK');
};
