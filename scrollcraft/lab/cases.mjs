// The case studies: the site at rest in its frame, opened full bleed, and
// the photographs, into lab/shots/case-*.png.
import { chromium } from 'playwright-core';
const url = process.argv[2] || 'http://localhost:4500';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const mobile = process.argv.includes('--mobile');
const sfx = mobile ? '-m' : '';
const p = await b.newPage(mobile
  ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 } });
const vh = mobile ? 844 : 900;
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(1500);
const top = await p.$eval('#work .scroll-expand__track', (e) => e.getBoundingClientRect().top + scrollY);
for (const [n, k] of [['rest', 0], ['half', 0.5], ['open', 1.15]]) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + k * vh);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `scrollcraft/lab/shots/case-${n}${sfx}.png` });
  // what sits outside the screen at this stage: the title, the frame, the story panel
  console.log(n, JSON.stringify(await p.evaluate(() => {
    const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return { vw: innerWidth, sw: document.documentElement.scrollWidth, title: box('#work .scroll-expand__title'), frame: box('#work .scroll-expand__frame'), overlay: box('#work .scroll-expand__overlay') };
  })));
}
await p.evaluate(() => document.querySelector('#work .case__gallery').scrollIntoView({ behavior: 'instant', block: 'center' }));
await p.waitForTimeout(1500);
const g = await p.$('#work .ag-panel:nth-child(3)');
if (g) { await (mobile ? g.tap() : g.hover()); await p.waitForTimeout(900); }
await p.screenshot({ path: `scrollcraft/lab/shots/case-photos${sfx}.png` });
console.log('panels:', await p.$$eval('#work .ag-panel', (a) => a.length), '| errors:', errors.length ? errors : 'none');
await b.close();
