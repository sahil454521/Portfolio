// Renders the hero's octopus once, at rest, and saves it as public/octopus.webp: the picture the
// tank shows when WebGL is missing or its GPU context is lost. Run it after changing the scene.
//   node scrollcraft/lab/octopus-still.mjs http://localhost:4500
// Needs playwright-core (npm i --no-save playwright-core) and Chrome at CHROME.
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const SITE = process.argv[2] || 'http://localhost:4500';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = new URL('../../public/octopus.webp', import.meta.url);

const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
// Motion off holds the resting pose, the one motion-off visitors see. Twice the 460px tank, for sharp screens.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark', reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto(SITE, { waitUntil: 'load' });
await page.evaluate(() => document.querySelector('.notice')?.remove());
await page.waitForSelector('.tank.is-live', { timeout: 20000 });
await page.waitForTimeout(1000);
const png = await page.locator('.tank canvas').screenshot();
// the tank can sit on a fractional pixel, so the shot may be a pixel wider: keep the centred square
const size = await page.evaluate(() => document.querySelector('.tank canvas').clientWidth * devicePixelRatio);
const webp = await page.evaluate(async ({ b64, size }) => {
  const img = new Image();
  img.src = `data:image/png;base64,${b64}`;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  c.getContext('2d').drawImage(img, (img.naturalWidth - size) / 2, (img.naturalHeight - size) / 2, size, size, 0, 0, size, size);
  return { data: c.toDataURL('image/webp', 0.82).split(',')[1], w: c.width, h: c.height };
}, { b64: png.toString('base64'), size });
const bytes = Buffer.from(webp.data, 'base64');
writeFileSync(OUT, bytes);
console.log(`wrote public/octopus.webp: ${webp.w}x${webp.h}, ${Math.round(bytes.length / 1024)} KB`);
await browser.close();
