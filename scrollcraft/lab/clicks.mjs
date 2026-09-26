// Every object on the desk, clicked where its own label appeared: does the
// thing that opens match the thing that was named? Run against the live site
// or a local server. Also clicks each link in the desk's list.
import { chromium } from 'playwright-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4500';
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ executablePath: CHROME });
const size = (process.argv.find((a) => /^\d+x\d+$/.test(a)) || '1440x900').split('x').map(Number);
const ctx = await b.newContext(mobile
  ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  : { viewport: { width: size[0], height: size[1] } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]', { timeout: 20000 });
await p.waitForTimeout(6000);                 // arrival and tour

const opened = () => p.url().includes('cv.html') ? Promise.resolve('résumé page') : p.evaluate(() => {
  const w = document.querySelector('dialog[data-win]');
  const c = document.querySelector('dialog[data-compose]');
  if (w && w.open) return 'window: ' + document.querySelector('[data-win-name]').textContent;
  if (c && c.open) return 'compose';
  return 'nothing (' + location.hash + ', y=' + Math.round(scrollY) + ')';
});
const reset = async () => {
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForSelector('[data-desk][data-ready]', { timeout: 20000 });
  await p.mouse.move(5, 5);                  // ends the tour at once
  await p.waitForTimeout(2200);
};

if (!mobile) {
  const c = await p.locator('.desk__stage canvas').boundingBox();
  const spots = new Map();
  for (let y = 0.2; y <= 0.9; y += 0.035) {
    for (let x = 0.3; x <= 0.99; x += 0.02) {
      await p.mouse.move(c.x + c.width * x, c.y + c.height * y);
      const on = await p.evaluate(() => { const f = document.querySelector('.desk__frame[data-on] b'); return f && f.textContent; });
      if (on && !spots.has(on)) spots.set(on, { x: c.x + c.width * x, y: c.y + c.height * y });
    }
  }
  for (const [label, at] of spots) {
    await p.mouse.move(at.x, at.y);
    await p.waitForTimeout(250);
    const now = await p.evaluate(() => { const f = document.querySelector('.desk__frame[data-on] b'); return f && f.textContent; });
    await p.mouse.click(at.x, at.y);
    await p.waitForTimeout(1800);
    console.log(`canvas  label "${label}" (still "${now}")  ->  ${await opened()}`);
    await reset();
  }
}

for (const id of ['desi', 'amg', 'quest', 'term', 'neura', 'paper', 'phone']) {
  const a = p.locator(`.desk__menu [data-thing="${id}"]`);
  const text = (await a.textContent()).trim();
  if (mobile) await a.tap(); else { await a.focus(); await p.keyboard.press('Enter'); }
  await p.waitForTimeout(1800);
  console.log(`list    "${text}"  ->  ${await opened()}`);
  await reset();
}
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no page errors');
await b.close();
