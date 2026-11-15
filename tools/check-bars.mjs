// Simulates iOS browser bars hiding: the small viewport (svh) stays 662px while innerHeight grows to 761px.
// We pin the svh probe + the sticky stage to 662px, then resize the window and verify the dial does not change size.
export default async (page, h) => {
  await page.setViewportSize({ width: 390, height: 662 }); await h.wait(500);
  await page.evaluate(() => { const t = document.querySelector('.pt-track'); window.scrollTo(0, t.getBoundingClientRect().top + scrollY + 300); });
  await h.wait(700);
  const size = () => page.evaluate(() => ({ dial: Math.round(document.querySelector('.pt-dial').getBoundingClientRect().width), cls: document.querySelector('.pt-stage').className.replace('pt-stage', '').trim() }));
  const a = await size();
  // pin "small viewport" things at 662px like iOS does, then grow the window like the bars collapsing
  await page.addStyleTag({ content: '.pt-stage{height:662px!important} .pt-hero{min-height:662px!important}' });
  await page.evaluate(() => { const p = [...document.body.children].find(e => e.style && e.style.cssText.includes('svh')); if (p) p.style.height = '662px'; });
  await page.setViewportSize({ width: 390, height: 761 }); await h.wait(600);
  const b = await size();
  await page.setViewportSize({ width: 390, height: 662 }); await h.wait(600);
  const c = await size();
  console.log('bars shown', JSON.stringify(a), '| bars hidden', JSON.stringify(b), '| shown again', JSON.stringify(c));
  console.log(a.dial === b.dial && b.dial === c.dial ? 'DIAL STABLE' : 'DIAL JUMPS');
};
