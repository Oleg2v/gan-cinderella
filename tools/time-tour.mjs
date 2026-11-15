// Exact timing of each guided-tour step.   node tools/shot.mjs --view visitors --touch --w 390 --h 664 --script tools/time-tour.mjs
export default async (page, h) => {
  const res = await page.evaluate(() => new Promise(resolve => {
    const marks = []; const t0 = performance.now();
    App.tour.steps.forEach(s => {
      const m = App.mod(s.module); if (!m || !m.tour || !m.tour[s.fn]) return;
      const orig = m.tour[s.fn];
      m.tour[s.fn] = async ctx => { const a = performance.now(); try { return await orig(ctx); } finally { marks.push(`${s.module}.${s.fn}: ${((performance.now() - a) / 1000).toFixed(1)}s`); } };
    });
    App.on('tour:stop', () => resolve({ total: ((performance.now() - t0) / 1000).toFixed(1), marks }));
    App.tour.start();
  }));
  console.log(res.marks.join('\n')); console.log('TOTAL', res.total + 's');
};
