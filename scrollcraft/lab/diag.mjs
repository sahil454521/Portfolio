import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
const errs = [], failed = [];
page.on('pageerror', (e) => errs.push('JS: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
page.on('requestfailed', (r) => failed.push(r.url().slice(0, 90) + '  ' + (r.failure()?.errorText || '')));
page.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + '  ' + r.url().slice(0, 90)); });

await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.waitForTimeout(6000);
const state = await page.evaluate(() => {
  const v = document.querySelector('[data-vitrine]');
  const c = v && v.querySelector('canvas');
  let webgl = false;
  try { webgl = !!document.createElement('canvas').getContext('webgl2'); } catch {}
  return {
    three: typeof window.THREE,
    threeRev: window.THREE ? window.THREE.REVISION : null,
    webgl2: webgl,
    vitrineReady: v ? v.hasAttribute('data-ready') : 'no element',
    vitrineFallback: v ? v.hasAttribute('data-fallback') : 'n/a',
    canvasSize: c ? c.width + 'x' + c.height : 'none',
    canvasOpacity: c ? getComputedStyle(c).opacity : 'n/a',
    videosInScene: document.querySelectorAll('video').length,
    fontLoaded: document.fonts.check('1rem "Bricolage Grotesque"'),
    h1Font: getComputedStyle(document.querySelector('h1')).fontFamily,
  };
});
console.log(JSON.stringify(state, null, 1));
console.log('\nERRORS:', errs.length ? '\n  ' + errs.join('\n  ') : 'none');
console.log('FAILED REQUESTS:', failed.length ? '\n  ' + failed.join('\n  ') : 'none');
await b.close();
