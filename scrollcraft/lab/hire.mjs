// The hiring path, driven for real: switch the research diagram's inputs,
// copy the address, cross to the résumé and back, and check the view switch
// never sits on top of the hero's two actions.
import { chromium } from 'playwright-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4500';
const b = await chromium.launch({ executablePath: CHROME });
const errors = [];
const overlap = (a, c) => a && c && !(a.x + a.width <= c.x || c.x + c.width <= a.x || a.y + a.height <= c.y || c.y + c.height <= a.y);

for (const [w, h, m] of [[1440, 900, false], [1280, 720, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${w}: ${e}`));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const hot = await p.locator('.lede .btn--hot').boundingBox();
  const cv = await p.locator('.lede .btn:not(.btn--hot)').boundingBox();
  const mode = await p.locator('.mode').boundingBox();
  const inView = hot && hot.y + hot.height <= h;
  console.log(`${w}x${h}  hero actions in first view: ${inView}  clear of switch: ${!overlap(hot, mode) && !overlap(cv, mode)}`);
  await ctx.close();
}

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const p = await ctx.newPage();
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]');
await p.waitForTimeout(600);

// research diagram
await p.locator('#research').scrollIntoViewIfNeeded();
const sig = p.locator('.net__sig');
await sig.nth(1).click(); await sig.nth(3).click();
console.log('net       two off:', await p.locator('[data-net-count]').textContent());
await sig.nth(0).click(); await sig.nth(2).click();
console.log('          all off:', await p.locator('[data-net-count]').textContent(), '| empty flag:', await p.locator('[data-net]').getAttribute('data-empty') !== null);
await sig.nth(0).click();
console.log('          one back:', await p.locator('[data-net-count]').textContent());

// copy
await p.locator('.end .copy').scrollIntoViewIfNeeded();
await p.locator('.end .copy').click();
await p.waitForTimeout(100);
console.log('copy      label:', await p.locator('.end .copy').textContent(), '| clipboard:', await p.evaluate(() => navigator.clipboard.readText()));

// view switch
await p.locator('.mode a', { hasText: 'Résumé' }).click();
await p.waitForLoadState('load');
console.log('switch    ->', new URL(p.url()).pathname, '| current:', await p.locator('.mode a[aria-current="page"]').textContent());
await p.locator('.mode a', { hasText: 'Site' }).click();
await p.waitForLoadState('load');
console.log('          ->', new URL(p.url()).pathname);

console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no page errors');
await b.close();
