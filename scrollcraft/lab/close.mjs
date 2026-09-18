// Walks the last stretch of the page, where the author's plate scrubs.
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
const out = 'scrollcraft/lab/close';
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1000);
const info = await page.evaluate(() => {
  const f = document.querySelector('[data-scrub]');
  return { start: scrollY + f.getBoundingClientRect().top - innerHeight, max: document.documentElement.scrollHeight - innerHeight };
});
const N = 6;
const times = [];
for (let i = 0; i < N; i++) {
  const y = info.start + (i / (N - 1)) * (info.max - info.start);
  await page.evaluate((v) => window.scrollTo(0, v), Math.round(y));
  await page.waitForTimeout(1400);
  times.push(await page.evaluate(() => { const v = document.querySelector('[data-scrub] video'); return { t: +v.currentTime.toFixed(2), ready: document.querySelector('[data-scrub]').hasAttribute('data-ready') }; }));
  await page.screenshot({ path: `${out}/${String(i).padStart(2,'0')}.png` });
}
const files = readdirSync(out).filter(f => /^\d\d\.png$/.test(f)).sort();
writeFileSync(`${out}/sheet.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#3a3d42;font:11px ui-monospace;color:#fff}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px}figure{margin:0;position:relative}img{width:100%;display:block;outline:1px solid #000}figcaption{position:absolute;left:4px;top:4px;background:#000a;padding:1px 5px}</style><div class=g>${files.map(f=>`<figure><img src="${f}"><figcaption>${f.replace('.png','')}</figcaption></figure>`).join('')}</div>`);
const sp = await ctx.newPage();
await sp.setViewportSize({ width: 2000, height: 900 });
await sp.goto('file:///' + process.cwd().split(String.fromCharCode(92)).join('/') + `/${out}/sheet.html`);
await sp.waitForTimeout(1000);
await sp.screenshot({ path: `${out}/sheet.png`, fullPage: true });
await b.close();
console.log('playhead:', JSON.stringify(times));
console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
