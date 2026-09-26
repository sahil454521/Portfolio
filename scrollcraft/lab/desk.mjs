// Drives the desk the way a visitor would: arrive, hover each object, open a
// live app from the arcade, close it, open the compose window, and read the
// state after each step. /api/status only exists on Vercel, so the real
// endpoint is run here in-process and served to the page.
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const statusFn = require('../../api/status.js');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4500';
const out = 'scrollcraft/lab/desk/';
mkdirSync(out, { recursive: true });

const body = await new Promise((done) => statusFn({}, { setHeader() {}, status() { return this; }, json: (o) => done(JSON.stringify(o)) }));
const b = await chromium.launch({ executablePath: CHROME });
const errors = [];

async function open(w, h, mobile) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  await ctx.route('**/api/status', (r) => r.fulfill({ status: 200, contentType: 'application/json', body }));
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${w}: ${e}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`${w} console: ${m.text()}`); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForSelector('[data-desk][data-ready]', { timeout: 15000 });
  await p.waitForTimeout(1400);
  return { ctx, p };
}

// ---- desktop ----
{
  const { ctx, p } = await open(1440, 900, false);
  await p.waitForTimeout(4500);                        // let the arrival tour finish
  await p.screenshot({ path: out + 'd-hero.png' });
  console.log('top bar:', await p.locator('[data-live]').isVisible() ? await p.locator('[data-live-text]').textContent() : '(hidden)');

  // hover every object: sweep a coarse grid over the canvas and read the label
  const c = await p.locator('.desk__stage canvas').boundingBox();
  const seen = new Set();
  for (let y = 0.2; y <= 0.86; y += 0.06) {
    for (let x = 0.36; x <= 0.98; x += 0.04) {
      await p.mouse.move(c.x + c.width * x, c.y + c.height * y);
      await p.waitForTimeout(24);
      const on = await p.evaluate(() => { const f = document.querySelector('.desk__frame[data-on] b'); return f && f.textContent; });
      if (on && !seen.has(on)) { seen.add(on); if (on.startsWith('Play')) await p.screenshot({ path: out + 'd-hover.png' }); }
    }
  }
  console.log('hover labels found:', [...seen].join(' | '));

  // open the arcade from its link, as a keyboard user would
  await p.locator('.desk__menu [data-thing="quest"]').focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1600);
  console.log('window open:', await p.locator('[data-win]').evaluate((d) => d.open), '| src:', await p.locator('[data-win] iframe').getAttribute('src'), '| hash:', new URL(p.url()).hash);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out + 'd-win.png' });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1200);
  console.log('window closed:', !(await p.locator('[data-win]').evaluate((d) => d.open)), '| iframe src:', await p.locator('[data-win] iframe').getAttribute('src'), '| hash:', JSON.stringify(new URL(p.url()).hash));

  // the phone
  await p.locator('.desk__menu [data-thing="phone"]').focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1400);
  await p.locator('[data-compose] button[type=submit]').click();
  console.log('compose: empty message caught:', await p.locator('[data-compose] [data-err]').isVisible());
  await p.screenshot({ path: out + 'd-compose.png' });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(900);

  // status reached the sections
  console.log('case status:', await p.locator('[data-status-host="desitotes.com"] span').textContent());
  await ctx.close();
}

// ---- phone ----
{
  const { ctx, p } = await open(390, 844, true);
  await p.screenshot({ path: out + 'm-hero.png' });
  const c = await p.locator('.desk__stage canvas').boundingBox();
  console.log('phone canvas:', Math.round(c.width) + 'x' + Math.round(c.height));
  await p.locator('.desk__menu [data-thing="term"]').tap();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out + 'm-win.png' });
  console.log('phone window open:', await p.locator('[data-win]').evaluate((d) => d.open));
  await ctx.close();
}

console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no page errors');
await b.close();
