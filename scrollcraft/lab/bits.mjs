// Drives a real pointer through the three ported React Bits components and
// reports what each one actually did, plus whether the headline ever reflowed.
import { chromium } from 'playwright-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4500';
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const settle = () => page.waitForTimeout(700);

// 1. headline: sweep across it, watch weights and line count
const h1 = await page.locator('.lede h1').boundingBox();
const restH = h1.height;
let maxW = 0, maxH = 0;
for (let i = 0; i <= 24; i++) {
  await page.mouse.move(h1.x + (h1.width * i) / 24, h1.y + h1.height * (i % 2 ? 0.3 : 0.75));
  await page.waitForTimeout(40);
  const s = await page.evaluate(() => {
    const ws = [...document.querySelectorAll('.lede h1 .vp__w span')].map((e) => {
      const m = /"wght" (\d+)/.exec(e.style.fontVariationSettings);
      return m ? +m[1] : 500;
    });
    return { w: Math.max(...ws), h: document.querySelector('.lede h1').getBoundingClientRect().height };
  });
  maxW = Math.max(maxW, s.w); maxH = Math.max(maxH, s.h);
}
console.log(`headline  peak wght ${maxW}  height rest ${restH.toFixed(1)} max ${maxH.toFixed(1)}  ${maxH - restH > 1 ? 'REFLOWED' : 'stable'}`);
console.log('          aria-label:', await page.locator('.lede h1').getAttribute('aria-label'));

// 2. tilt: scroll to the first client site, hover a corner
await page.locator('.case__site a').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
const site = await page.locator('.case__site a').first().boundingBox();
await page.mouse.move(site.x + site.width * 0.9, site.y + site.height * 0.2, { steps: 8 });
await settle();
console.log('tilt      over corner:', await page.locator('.case__site a').first().evaluate((e) => e.style.rotate || '(none)'));
await page.mouse.move(site.x + site.width / 2, site.y - 200, { steps: 8 });
await page.waitForTimeout(1500);
console.log('          after leave:', await page.locator('.case__site a').first().evaluate((e) => e.style.rotate || '(none)'));

// 3. magnet: approach the CTA from outside its box
await page.locator('.end__cta').scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
const cta = await page.locator('.end__cta').boundingBox();
await page.mouse.move(cta.x + cta.width + 40, cta.y + cta.height / 2, { steps: 6 });
await settle();
console.log('magnet    40px right of it:', await page.locator('.end__cta').evaluate((e) => e.style.translate || '(none)'));
await page.mouse.move(cta.x + cta.width + 400, cta.y - 300, { steps: 6 });
await page.waitForTimeout(1500);
console.log('          far away:', await page.locator('.end__cta').evaluate((e) => e.style.translate || '(none)'));

console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no page errors');
await browser.close();
