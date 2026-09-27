// The badge in the contact section: it arrives, it hangs, a drag swings it,
// and a click in place opens the email form.
import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://localhost:4500';
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.getElementById('contact').scrollIntoView());
await p.waitForSelector('.end__badge canvas', { timeout: 30000 });
await p.waitForTimeout(3500);
await p.screenshot({ path: `scrollcraft/lab/shots/badge${mobile ? '-m' : ''}.png` });
const box = await p.$eval('.end__badge', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
console.log('badge box', JSON.stringify(box));
if (!mobile) {
  // find the card: the page cursor turns to grab over it
  let at = null;
  for (let y = box.y + box.h * 0.25; y < box.y + box.h * 0.85 && !at; y += 20) {
    await p.mouse.move(box.x + box.w / 2, y);
    await p.waitForTimeout(60);
    if (await p.evaluate(() => document.body.style.cursor === 'grab')) at = { x: box.x + box.w / 2, y };
  }
  console.log('card under the pointer at', JSON.stringify(at));
  if (at) {
    await p.mouse.down(); await p.mouse.move(at.x - 180, at.y + 40, { steps: 8 }); await p.mouse.up();
    await p.waitForTimeout(250);
    await p.screenshot({ path: 'scrollcraft/lab/shots/badge-swing.png' });
    await p.waitForTimeout(3000);
    at = null;
    for (let y = box.y + box.h * 0.25; y < box.y + box.h * 0.85 && !at; y += 20) {
      await p.mouse.move(box.x + box.w / 2, y);
      await p.waitForTimeout(60);
      if (await p.evaluate(() => document.body.style.cursor === 'grab')) at = { x: box.x + box.w / 2, y };
    }
    await p.mouse.click(at.x, at.y);
    await p.waitForTimeout(1500);
    console.log('after a click:', await p.evaluate(() => (document.querySelector('dialog[data-compose]').open ? 'compose open' : 'nothing')));
  }
}
console.log('errors:', errors.length ? errors : 'none');
await b.close();
