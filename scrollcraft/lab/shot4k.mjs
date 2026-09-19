// Renders the homepage at 4K: 1920 CSS at 2x device pixels, so the layout is
// a normal desktop one and the image is 3840x2160.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Users/sahil/../../Program Files/Google/Chrome/Application/chrome.exe'.replace('C:/Users/sahil/../../','C:/') });
const ctx = await b.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
  reducedMotion: 'no-preference',
});
const page = await ctx.newPage();
await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// let the textures land and the scene settle
await page.waitForTimeout(9000);
await page.screenshot({ path: 'scrollcraft/lab/home-4k.png' });
await b.close();
console.log('wrote scrollcraft/lab/home-4k.png');
