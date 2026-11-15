// Swipes with a real (CDP) touch on the page with and without an open sheet; the page must not scroll behind a sheet.
export default async (page, h) => {
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (x, y1, y2) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y1 }] });
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y1 + (y2 - y1) * i / 8 }] }); await h.wait(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await h.wait(500);
  };
  await page.evaluate(() => window.scrollTo(0, 1500)); await h.wait(400);
  const y0 = await page.evaluate(() => scrollY);
  await swipe(200, 500, 200);
  const y1 = await page.evaluate(() => scrollY);
  console.log('no sheet: page scrolled by', y1 - y0, '(should be > 0)');
  await page.evaluate(() => App.mod('pubBottom').openEligibility()); await h.wait(900);
  const y2 = await page.evaluate(() => scrollY);
  await swipe(200, 150, 60);          // on the backdrop above the sheet
  await swipe(200, 600, 300);         // on the sheet body
  const y3 = await page.evaluate(() => scrollY);
  console.log('with sheet: page scrolled by', y3 - y2, '(should be 0)');
};
