// Frame times under the two loads the hero actually carries: a pointer moving
// over the desk (a ray cast, a lean and a projected frame every frame), and a
// scroll from the desk down into the page. An idle page is smooth by definition.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.waitForSelector('[data-desk][data-ready]');
await page.waitForTimeout(5000);

const measure = () => page.evaluate(() => {
  window.__f = [];
  let last = performance.now();
  window.__run = true;
  const tick = () => { const n = performance.now(); window.__f.push(n - last); last = n; if (window.__run) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const report = (label) => page.evaluate((label) => {
  window.__run = false;
  const d = window.__f.slice(5).sort((a, b) => a - b);
  const p = (q) => d[Math.floor(d.length * q)];
  return { label, frames: d.length, medianMs: +p(0.5).toFixed(2), p95Ms: +p(0.95).toFixed(2), worstMs: +d[d.length - 1].toFixed(2), approxFps: Math.round(1000 / p(0.5)), jankFrames: d.filter((x) => x > 32).length };
}, label);

// 1. pointer sweeping across the desk
const c = await page.locator('.desk__stage canvas').boundingBox();
await measure();
for (let i = 0; i <= 120; i++) {
  const t = i / 120;
  await page.mouse.move(c.x + c.width * (0.45 + 0.5 * t), c.y + c.height * (0.35 + 0.3 * Math.sin(t * 6.28)));
}
console.log(JSON.stringify(await report('pointer over desk')));

// 2. scrolling from the desk into the page
await measure();
await page.evaluate(async () => {
  const t0 = performance.now();
  while (performance.now() - t0 < 2500) {
    scrollTo(0, ((performance.now() - t0) / 2500) * innerHeight * 1.6);
    await new Promise((r) => requestAnimationFrame(r));
  }
});
console.log(JSON.stringify(await report('scroll out of hero')));
await b.close();
