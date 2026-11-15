// Opens public flows in sheets and reports any horizontal overflow inside the sheet body.
export default async (page, h) => {
  const flows = ['openRegistration', 'openBooking', 'openEligibility', 'openAssistant'];
  for (const lang of ['ru', 'he']) {
    await page.evaluate(l => App.i18n.set(l, { animate: false }), lang); await h.wait(200);
    for (const f of flows) {
      const r = await page.evaluate(async fn => {
        App.ui.sheets.slice().forEach(s => s.close()); await new Promise(r => setTimeout(r, 450));
        const m = App.mod('pubBottom'); if (!m || !m[fn]) return { fn, missing: true };
        m[fn](); await new Promise(r => setTimeout(r, 900));
        const b = document.querySelector('.sheet-root:last-of-type .sheet__body'); if (!b) return { fn, noSheet: true };
        const wide = [...b.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > b.getBoundingClientRect().right + 1 || e.getBoundingClientRect().left < b.getBoundingClientRect().left - 1).map(e => e.tagName.toLowerCase() + '.' + (e.className.baseVal == null ? e.className : '')).slice(0, 5);
        return { fn, scrollW: b.scrollWidth, clientW: b.clientWidth, wide };
      }, f);
      console.log(lang, JSON.stringify(r));
      if (f === 'openRegistration') await h.shot(`shots/core/sheet-${lang}-reg.png`);
    }
  }
};
