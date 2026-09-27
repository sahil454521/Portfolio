// The case studies: the head, the site in its window with a live address
// bar, and the photographs as a pile you deal through (by Next, by a tap and
// by a flick). Shots into lab/shots/case-*.png; add --mobile for a phone.
import { chromium } from 'playwright-core';
const url = process.argv.find((a) => /^https?:/.test(a)) || 'http://localhost:4500';
const mobile = process.argv.includes('--mobile');
const sfx = mobile ? '-m' : '';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage(mobile
  ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(1500);

for (const id of ['work', 'amg']) {
  const sec = `#${id}`;
  await p.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'instant' }), sec);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `scrollcraft/lab/shots/case-${id}-head${sfx}.png` });
  await p.evaluate((s) => document.querySelector(`${s} .case__window`).scrollIntoView({ behavior: 'instant', block: 'center' }), sec);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `scrollcraft/lab/shots/case-${id}-window${sfx}.png` });
  const bar = await p.$eval(`${sec} .case__bar`, (e) => e.innerText.replace(/\s+/g, ' ').trim());
  await p.evaluate((s) => document.querySelector(`${s} .case__gallery`).scrollIntoView({ behavior: 'instant', block: 'center' }), sec);
  await p.waitForSelector(`${sec} .prints__card`, { timeout: 10000 });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `scrollcraft/lab/shots/case-${id}-photos${sfx}.png` });
  const cap = () => p.$eval(`${sec} .prints__cap`, (e) => e.textContent);
  const caps = [await cap()];
  await p.click(`${sec} .prints__next`); await p.waitForTimeout(700); caps.push(await cap());
  const top = await p.locator(`${sec} .prints__card:not([aria-hidden])`).boundingBox();
  if (mobile) await p.locator(`${sec} .prints__card:not([aria-hidden])`).tap();
  else await p.mouse.click(top.x + top.width / 2, top.y + top.height / 2);
  await p.waitForTimeout(700); caps.push(await cap());
  // a flick: short and fast
  await p.mouse.move(top.x + top.width / 2, top.y + top.height / 2);
  await p.mouse.down();
  await p.mouse.move(top.x + top.width / 2 + 60, top.y + top.height / 2, { steps: 2 });
  await p.mouse.move(top.x + top.width / 2 + 180, top.y + top.height / 2 - 20, { steps: 2 });
  await p.mouse.up();
  await p.waitForTimeout(900); caps.push(await cap());
  await p.screenshot({ path: `scrollcraft/lab/shots/case-${id}-photos-dealt${sfx}.png` });
  console.log(`${id}: bar "${bar}"\n  captions: ${caps.join(' -> ')}`);
}
console.log('page width:', await p.evaluate(() => document.documentElement.scrollWidth), '| errors:', errors.length ? errors : 'none');
await b.close();
