// Checks for the hero's octopus tank and the claims ledger under the hero.
// Prints PASS or FAIL per check and exits 1 if any fail.
//   node scrollcraft/lab/octopus.mjs http://localhost:4500 [layout|scene|fallback]
// Needs playwright-core (npm i --no-save playwright-core) and Chrome at CHROME.
import { chromium } from 'playwright-core';

const URL = process.argv[2] || 'http://localhost:4500';
const only = process.argv[3];
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// software WebGL, so the checks behave the same on any machine
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

let failed = 0;
function check(name, ok, info = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`);
  if (!ok) failed += 1;
}

// Runs in the page before anything else: counts WebGL draw calls, and sums the layout
// shifts the visitor did not cause.
function instrument() {
  window.__draws = 0;
  for (const proto of [window.WebGL2RenderingContext?.prototype, window.WebGLRenderingContext?.prototype]) {
    if (!proto) continue;
    for (const name of ['drawArrays', 'drawElements']) {
      const draw = proto[name];
      proto[name] = function (...args) { window.__draws += 1; return draw.apply(this, args); };
    }
  }
  window.__cls = 0;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
}

async function open(browser, { width, height, reduced = false, phone = false, delayScene = 0, scheme = 'light' }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    colorScheme: scheme,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    isMobile: phone,
    hasTouch: phone,
    deviceScaleFactor: phone ? 2 : 1,
  });
  await ctx.addInitScript(instrument);
  if (delayScene) {
    await ctx.route('**/assets/scene-*.js', async (route) => {
      await new Promise((r) => setTimeout(r, delayScene));
      await route.continue();
    });
  }
  const page = await ctx.newPage();
  const requests = [];
  const errors = [];
  page.on('request', (r) => requests.push(r.url()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelector('.notice')?.remove());
  return { ctx, page, requests, errors };
}

async function layout(browser) {
  let { ctx, page } = await open(browser, { width: 1440, height: 900 });
  const d = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    const tank = hero.querySelector('.tank');
    const r = tank?.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    return {
      ledgersInHero: hero.querySelectorAll('.ledger').length,
      nextId: hero.nextElementSibling?.id,
      ledgerInChecks: !!document.querySelector('#checks .ledger'),
      // layout size: the intro animation scales the tank while it plays
      w: tank?.offsetWidth ?? 0,
      h: tank?.offsetHeight ?? 0,
      radius: tank ? getComputedStyle(tank).borderRadius : '',
      tankCx: r ? r.left + r.width / 2 : 0,
      heroCx: h.left + h.width / 2,
      text: tank ? tank.innerText.trim() : null,
      scoreHref: document.querySelector('.nav-score')?.getAttribute('href'),
    };
  });
  check('ledger is no longer in the hero', d.ledgersInHero === 0);
  check('the section after the hero is #checks with the ledger', d.nextId === 'checks' && d.ledgerInChecks);
  check('tank is a 460px circle on desktop', Math.abs(d.w - 460) <= 1 && Math.abs(d.h - d.w) <= 1 && d.radius === '50%', `${d.w}x${d.h}, radius ${d.radius}`);
  check('tank sits in the right column', d.tankCx > d.heroCx);
  check('tank holds no text', d.text === '');
  check('nav check count jumps to the ledger', d.scoreHref === '#checks');
  await ctx.close();

  ({ ctx, page } = await open(browser, { width: 390, height: 844, phone: true }));
  const p = await page.evaluate(() => {
    const tank = document.querySelector('.hero .tank');
    const r = tank?.getBoundingClientRect();
    return { w: tank?.offsetWidth ?? 0, cx: r ? r.left + r.width / 2 : 0 };
  });
  check('tank is min(320px, 82vw) and centred on a phone', Math.abs(p.w - Math.min(320, 390 * 0.82)) <= 1 && Math.abs(p.cx - 195) <= 1, `${p.w}px wide, centre at ${p.cx}`);
  await ctx.close();
}

const groups = { layout };
const browser = await chromium.launch({ executablePath: CHROME, args: GL });
for (const [name, run] of Object.entries(groups)) {
  if (only && only !== name) continue;
  console.log(`\n${name}`);
  await run(browser);
}
await browser.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
