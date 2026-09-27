// Frame times through a whole "enter the arcade" sequence: the camera flight,
// the window growing out of the screen, the app loading. Reports the flight
// and the grow separately, since they have different costs.
import { chromium } from 'playwright-core';
const url = process.argv[2] || 'http://localhost:4500';
const target = process.argv[3] || 'quest';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]');
await p.mouse.move(5, 300);
await p.waitForTimeout(3000);
const res = await p.evaluate(async (target) => {
  const f = []; let last = performance.now(), run = true;
  const tick = () => { const n = performance.now(); f.push([n, n - last]); last = n; if (run) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const t0 = performance.now();
  document.querySelector(`.desk__menu [data-thing="${target}"]`).click();
  let opened = 0;
  while (performance.now() - t0 < 2600) {
    await new Promise((r) => requestAnimationFrame(r));
    if (!opened && document.querySelector('dialog[data-win]').open) opened = performance.now();
  }
  run = false;
  const stat = (a) => { const d = a.map((x) => x[1]).sort((x, y) => x - y); return { frames: d.length, median: +d[Math.floor(d.length / 2)].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), worst: +d[d.length - 1].toFixed(1), over32: d.filter((x) => x > 32).length }; };
  const flight = f.filter(([n]) => n > t0 + 16 && n < opened);
  const after = f.filter(([n]) => n >= opened);
  return { flightMs: Math.round(opened - t0), flight: stat(flight), grow_and_load: stat(after) };
}, target);
console.log(JSON.stringify(res));
await b.close();
