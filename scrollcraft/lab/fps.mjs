import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto('http://localhost:4500', { waitUntil: 'load' });
await page.waitForTimeout(1000);
await page.evaluate(() => { const a = document.querySelector('.peak'); window.scrollTo(0, a.getBoundingClientRect().top + scrollY + innerHeight * 1.8); });
await page.waitForTimeout(1500);
const fps = await page.evaluate(() => new Promise((res) => {
  let n = 0; const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res(Math.round(n / ((performance.now() - t0) / 1000))); };
  requestAnimationFrame(tick);
}));
console.log('fps during the peak:', fps);
await b.close();
