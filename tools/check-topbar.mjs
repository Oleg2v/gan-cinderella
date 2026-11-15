export default async (page, h) => {
  for (const lang of ['he', 'ru']) {
    await page.evaluate(l => App.i18n.set(l, { animate: false }), lang); await h.wait(300);
    for (const w of [340, 360, 390, 430, 768, 1280]) {
      await page.setViewportSize({ width: w, height: 800 }); await h.wait(250);
      const r = await page.evaluate(() => {
        const box = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width), h: Math.round(b.height) }; };
        const els = { logo: box('.brand__logo'), plaque: box('.demo-plaque'), tour: box('.tb-btn--tour'), lang: box('.tb-btn--lang'), a11y: box('.tb-btn--icon') };
        const vw = document.documentElement.clientWidth;
        const list = Object.entries(els).filter(([, b]) => b && b.w > 0).sort((a, b) => a[1].l - b[1].l);
        const overlaps = []; for (let i = 1; i < list.length; i++) if (list[i][1].l < list[i - 1][1].r - 0.5) overlaps.push(list[i - 1][0] + '/' + list[i][0]);
        const out = list.filter(([, b]) => b.l < 8 || b.r > vw - 8).map(([k]) => k);
        return { vw, overlaps, out, plaqueH: els.plaque && els.plaque.h, tourW: els.tour && els.tour.w };
      });
      console.log(lang, w, JSON.stringify(r));
      if (w === 390 || w === 340) await page.screenshot({ path: `shots/core/topbar-${lang}-${w}.png`, clip: { x: 0, y: 0, width: w, height: 70 } });
    }
  }
};
