import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
const out = 'scrollcraft/lab/widths';
mkdirSync(out, { recursive: true });
const sizes = [[1920,1080],[1680,1050],[1440,900],[1280,800],[1024,768]];
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [w,h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4500', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(5500);
  await page.evaluate(() => window.scrollTo(0, innerHeight * 1.4));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/${w}x${h}.png` });
  await ctx.close();
  console.log('shot', w + 'x' + h);
}
const files = readdirSync(out).filter(f=>f.endsWith('.png')).sort();
writeFileSync(`${out}/sheet.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#3a3d42;font:12px ui-monospace;color:#fff}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:8px}figure{margin:0;position:relative}img{width:100%;display:block;outline:1px solid #000}figcaption{position:absolute;left:6px;top:6px;background:#000a;padding:2px 7px}</style><div class=g>${files.map(f=>`<figure><img src="${f}"><figcaption>${f.replace('.png','')}</figcaption></figure>`).join('')}</div>`);
const sp = await b.newPage();
await sp.setViewportSize({ width: 2000, height: 1000 });
await sp.goto('file:///' + process.cwd().split(String.fromCharCode(92)).join('/') + `/${out}/sheet.html`);
await sp.waitForTimeout(1500);
await sp.screenshot({ path: `${out}/sheet.png`, fullPage: true });
await b.close();
