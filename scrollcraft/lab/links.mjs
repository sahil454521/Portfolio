// Checks that each panel's real anchor actually sits on top of the 3D panel
// it represents, at several scroll positions, and that clicking opens the site.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.waitForTimeout(5000);
const box = await page.evaluate(() => {
  const a = document.querySelector('.stage[data-sc-act]');
  const r = a.getBoundingClientRect();
  return { top: r.top + scrollY, h: r.height, vh: innerHeight };
});
for (const k of [0.05, 0.35, 0.75, 0.98]) {
  await page.evaluate((v) => window.scrollTo(0, v), Math.round(box.top + k * (box.h - box.vh)));
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => {
    const cv = document.querySelector('[data-vitrine] canvas').getBoundingClientRect();
    return [...document.querySelectorAll('[data-panel]')].map((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return {
        host: el.dataset.panelHost,
        w: Math.round(r.width),
        insideCanvas: r.left >= cv.left - 2 && r.right <= cv.right + 2 && r.top >= cv.top - 2 && r.bottom <= cv.bottom + 2,
        topAtCentre: hit ? (hit.closest('[data-panel]')?.dataset.panelHost || hit.tagName) : null,
      };
    });
  });
  console.log('p=' + k, JSON.stringify(info));
}
// does a click actually open the site?
const [popup] = await Promise.all([
  page.waitForEvent('popup', { timeout: 8000 }).catch(() => null),
  page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-panel]')]
      .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    const r = el.getBoundingClientRect();
    el.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2).click();
  }),
]);
console.log('click opened:', popup ? popup.url() : 'NOTHING');
await b.close();
