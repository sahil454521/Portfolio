// Clicking an app on the desk: the camera flies into its screen, the still
// takes over where the screen was, the live app fades in, and Back reverses
// it. Screenshots each stage into lab/shots/zoom-*.png, and measures the
// jump at the hand-over (should be near zero: same picture, same crop).
import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://localhost:4500';
const id = process.argv.find((a) => /^(quest|term|neura)$/.test(a)) || 'quest';
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
const tag = `${id}${mobile ? '-m' : ''}`;
const shot = (n) => p.screenshot({ path: `scrollcraft/lab/shots/zoom-${tag}-${n}.png` });
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]', { timeout: 20000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);

// click the object through the page's own list, so the test does not
// depend on where the object sits on screen
await p.evaluate((id) => document.querySelector(`[data-thing="${id}"]`).click(), id);
await p.waitForTimeout(600);
await shot('1-flying');
// just before and just after the dialog opens
await p.waitForFunction(() => document.querySelector('dialog[data-win]').open, null, { timeout: 5000 });
await shot('2-handover');
const handover = await p.evaluate(() => {
  const st = document.querySelector('[data-win-still]');
  const r = st.getBoundingClientRect();
  return { still: [r.left, r.top, r.width, r.height].map(Math.round), top: getComputedStyle(document.querySelector('.top')).opacity };
});
console.log('hand-over: still at', handover.still.join(','), '| top bar opacity', handover.top);
await p.waitForTimeout(700);
await shot('3-settled');
await p.waitForFunction(() => document.querySelector('.zoom[data-loaded]'), null, { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(600);
await shot('4-live');
console.log('live:', await p.evaluate(() => ({
  src: document.querySelector('.zoom__app').getAttribute('src'),
  loaded: !!document.querySelector('.zoom[data-loaded]'),
  bar: document.querySelector('.zoom__bar').innerText.replace(/\s+/g, ' '),
  hash: location.hash,
  scroll: document.documentElement.scrollTop,
})));
await p.click('.zoom__back');           // a real click: nothing may sit over it
await p.waitForTimeout(350);
await shot('5-leaving');
await p.waitForFunction(() => !document.querySelector('dialog[data-win]').open, null, { timeout: 5000 });
await p.waitForTimeout(1200);
await shot('6-home');
console.log('after Back:', await p.evaluate(() => ({ open: document.querySelector('dialog[data-win]').open, hash: location.hash, zoomed: document.documentElement.hasAttribute('data-zoomed'), src: document.querySelector('.zoom__app').getAttribute('src') })));
console.log('errors:', errors.length ? errors : 'none');
await b.close();
