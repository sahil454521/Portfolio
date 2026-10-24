// Load cost as a recruiter on a phone feels it: 4x CPU slowdown and a 4G-like
// link (1.6 Mbps down, 150 ms round trip). Reports bytes, scripts, LCP, long
// tasks, and how far down the page the first project starts. Add --desktop.
import { chromium } from 'playwright-core';
const url = process.argv.find((a) => /^https?:/.test(a)) || 'http://localhost:4500';
const desktop = process.argv.includes('--desktop');
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext(desktop ? { viewport: { width: 1440, height: 900 } } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
if (!desktop) {
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
}
await p.addInitScript(() => {
  window.__lcp = 0; window.__long = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(e.duration); }).observe({ type: 'longtask', buffered: true });
});
const t0 = Date.now();
await p.goto(url, { waitUntil: 'load', timeout: 120000 });
const loadMs = Date.now() - t0;
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const res = performance.getEntriesByType('resource');
  const sum = (f) => Math.round(res.filter(f).reduce((s, e) => s + (e.transferSize || 0), 0) / 1024);
  const nav = performance.getEntriesByType('navigation')[0];
  const work = document.querySelector('#work');
  return {
    lcpMs: Math.round(window.__lcp), domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
    longTasks: window.__long.length, longTaskMs: Math.round(window.__long.reduce((a, b) => a + b, 0)),
    totalKB: sum(() => true) + Math.round((nav.transferSize || 0) / 1024), jsKB: sum((e) => /\.js/.test(e.name)), imgKB: sum((e) => /\.(webp|jpe?g|png|avif)/.test(e.name)),
    fontKB: sum((e) => /\.woff2?/.test(e.name)), requests: res.length,
    firstProjectScreens: work ? +(work.getBoundingClientRect().top / innerHeight + scrollY / innerHeight).toFixed(1) : null,
  };
});
console.log(JSON.stringify({ device: desktop ? 'desktop' : 'phone, 4x CPU, 4G', loadMs, ...r }, null, 1));
// Core Web Vitals' "good" line for the largest paint is 2.5 s
const ok = r.lcpMs > 0 && r.lcpMs <= 2500;
console.log(ok ? 'PERF PASS' : `PERF FAIL (largest paint ${r.lcpMs} ms)`);
process.exitCode = ok ? 0 : 1;
await b.close();
