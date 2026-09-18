// Walks the whole page (not just the acts) and tiles the frames into one
// contact sheet, so the composition can be read rather than guessed at.
// Stands in for the ffmpeg sheet the harness would build.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4500';
const mobile = process.argv.includes('--mobile');
const reduced = process.argv.includes('--reduced');
const out = mobile ? 'lab/walk-m' : reduced ? 'lab/walk-r' : 'lab/walk';
const STEPS = mobile ? 14 : 16;

mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const vh = await page.evaluate(() => innerHeight);
const max = docH - vh;

for (let i = 0; i < STEPS; i++) {
  const y = Math.round((i / (STEPS - 1)) * max);
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` });
}

// tile them
const files = readdirSync(out).filter((f) => /^\d\d\.png$/.test(f)).sort();
const cols = mobile ? 7 : 4;
const html = `<!doctype html><meta charset="utf-8"><style>
 body{margin:0;background:#3a3d42;font:11px ui-monospace,monospace;color:#fff}
 .g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px}
 figure{margin:0;position:relative}
 img{display:block;width:100%;height:auto;outline:1px solid #000}
 figcaption{position:absolute;left:4px;top:4px;background:#000a;padding:1px 5px}
</style><div class=g>${files
  .map((f) => `<figure><img src="${f}"><figcaption>${f.replace('.png', '')}</figcaption></figure>`)
  .join('')}</div>`;
writeFileSync(`${out}/sheet.html`, html);

const sheetPage = await ctx.newPage();
await sheetPage.setViewportSize({ width: mobile ? 1900 : 2000, height: 1000 });
await sheetPage.goto('file:///' + process.cwd().replace(/\\/g, '/') + `/${out}/sheet.html`);
await sheetPage.waitForTimeout(1500);
await sheetPage.screenshot({ path: `${out}/sheet.png`, fullPage: true });

await browser.close();
console.log('sheet:', `${out}/sheet.png`);
console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : 'no page errors');
