// The case studies: the site at rest in its frame, opened full bleed, and
// the photographs, into lab/shots/case-*.png.
import { chromium } from 'playwright-core';
const url = process.argv[2] || 'http://localhost:4500';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(1500);
const top = await p.$eval('#work .scroll-expand__track', (e) => e.getBoundingClientRect().top + scrollY);
for (const [n, k] of [['rest', 0], ['half', 0.5], ['open', 1.15]]) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + k * 900);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `scrollcraft/lab/shots/case-${n}.png` });
}
await p.evaluate(() => document.querySelector('#work .case__gallery').scrollIntoView({ behavior: 'instant', block: 'center' }));
await p.waitForTimeout(1500);
const g = await p.$('#work .ag-panel:nth-child(3)');
if (g) { await g.hover(); await p.waitForTimeout(900); }
await p.screenshot({ path: 'scrollcraft/lab/shots/case-photos.png' });
console.log('panels:', await p.$$eval('#work .ag-panel', (a) => a.length), '| errors:', errors.length ? errors : 'none');
await b.close();
