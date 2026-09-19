// Measures frame rate while actively scrolling through the hero, which is the
// only measurement that matters: an idle page is smooth by definition.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.waitForTimeout(6000);
const box = await page.evaluate(() => {
  const a = document.querySelector('.stage[data-sc-act]');
  const r = a.getBoundingClientRect();
  return { top: r.top + scrollY, h: r.height, vh: innerHeight };
});
const res = await page.evaluate(async (box) => {
  const frames = [];
  let last = performance.now(), running = true;
  const tick = () => { const n = performance.now(); frames.push(n - last); last = n; if (running) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const total = box.h - box.vh;
  const t0 = performance.now();
  // scroll the whole act over ~3 seconds, the way a person would
  while (performance.now() - t0 < 3000) {
    const k = (performance.now() - t0) / 3000;
    window.scrollTo(0, box.top + k * total);
    await new Promise((r) => requestAnimationFrame(r));
  }
  running = false;
  const d = frames.slice(5).sort((a, b) => a - b);
  const p = (q) => d[Math.floor(d.length * q)];
  return {
    frames: d.length,
    medianMs: +p(0.5).toFixed(2),
    p95Ms: +p(0.95).toFixed(2),
    worstMs: +d[d.length - 1].toFixed(2),
    approxFps: Math.round(1000 / p(0.5)),
    jankFrames: d.filter((x) => x > 32).length,
  };
}, box);
console.log(JSON.stringify(res));
await b.close();
