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

// One check that cannot throw: a missing element or a timeout is a FAIL, not a crash.
async function t(name, fn) {
  try {
    const [ok, info] = await fn();
    check(name, ok, info);
  } catch (e) {
    check(name, false, String(e.message || e).split('\n')[0]);
  }
}
const draws = (page) => page.evaluate(() => window.__draws);
const waitLive = (page) => page.waitForSelector('.tank.is-live', { timeout: 20000 }).then(() => true, () => false);
// waits until the scene stops drawing (with motion off it only draws while something moves)
async function settle(page) {
  for (let i = 0; i < 16; i++) {
    const a = await draws(page);
    await page.waitForTimeout(500);
    if ((await draws(page)) === a) return;
  }
}
const fit = (page) => page.evaluate(() => {
  const c = document.querySelector('.tank canvas');
  const tank = document.querySelector('.tank');
  const dpr = Math.min(devicePixelRatio, 2);
  return { ok: c.width === Math.round(c.clientWidth * dpr) && Math.abs(c.clientWidth - tank.clientWidth) <= 1, w: c.clientWidth, bw: c.width };
});

async function scene(browser) {
  // motion on, desktop
  let s = await open(browser, { width: 1440, height: 900 });
  await t('octopus goes live and draws', async () => {
    const live = await waitLive(s.page);
    const n = await draws(s.page);
    return [live && n > 0, `${n} draws`];
  });
  await t('canvas buffer matches the tank', async () => {
    const f = await fit(s.page);
    return [f.ok, `${f.w}px, buffer ${f.bw}px`];
  });
  await t('canvas follows a resize', async () => {
    await s.page.setViewportSize({ width: 390, height: 844 });
    await s.page.waitForTimeout(600);
    const small = await fit(s.page);
    await s.page.setViewportSize({ width: 1440, height: 900 });
    await s.page.waitForTimeout(600);
    const big = await fit(s.page);
    return [small.ok && Math.abs(small.w - Math.min(320, 390 * 0.82)) <= 1 && big.ok && Math.abs(big.w - 460) <= 1, `${small.w}px, then ${big.w}px`];
  });
  let offScreen = 0;
  await t('stops drawing off screen', async () => {
    const onScreen = await draws(s.page);
    await s.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await s.page.waitForTimeout(800);
    const a = await draws(s.page);
    await s.page.waitForTimeout(1200);
    offScreen = await draws(s.page);
    return [onScreen > 0 && a === offScreen, `${onScreen} draws before, ${offScreen - a} while off screen`];
  });
  await t('starts again when back in view', async () => {
    await s.page.evaluate(() => window.scrollTo(0, 0));
    await s.page.waitForTimeout(800);
    const n = await draws(s.page);
    return [n > offScreen, `${n - offScreen} draws after coming back`];
  });
  await t('three.js is not in the main bundle', async () => {
    const main = await s.page.evaluate(async () => {
      const src = document.querySelector('script[type="module"][src]')?.src;
      return src ? (await fetch(src)).text() : '';
    });
    const chunk = s.requests.some((u) => /\/assets\/scene-[^/]+\.js$/.test(u));
    return [main.length > 0 && !main.includes('WebGLRenderer') && chunk, `main bundle ${Math.round(main.length / 1024)} KB, scene chunk ${chunk ? 'loaded' : 'not loaded'}`];
  });
  await t('canvas is labelled and focusable', async () => {
    const a = await s.page.evaluate(() => {
      const c = document.querySelector('.tank canvas');
      return { role: c.getAttribute('role'), tab: c.tabIndex, label: c.getAttribute('aria-label') || '' };
    });
    return [a.role === 'img' && a.tab === 0 && a.label.length > 20 && !a.label.includes('—'), a.label];
  });
  await s.ctx.close();

  // motion off: frames are compared as element screenshots
  s = await open(browser, { width: 1440, height: 900, reduced: true });
  const canvas = s.page.locator('.tank canvas');
  let still;
  await t('holds still with motion off', async () => {
    if (!(await waitLive(s.page))) return [false, 'never went live'];
    await s.page.waitForTimeout(800);
    const d1 = await draws(s.page);
    still = await canvas.screenshot();
    await s.page.waitForTimeout(1500);
    const d2 = await draws(s.page);
    return [d1 === d2 && still.equals(await canvas.screenshot()), `${d2 - d1} draws in 1.5 s`];
  });
  await t('drag spins it with motion off', async () => {
    const b = await canvas.boundingBox();
    const x = b.x + b.width / 2;
    const y = b.y + b.height / 2;
    await s.page.mouse.move(x, y);
    await s.page.mouse.down();
    await s.page.mouse.move(x + 140, y, { steps: 8 });
    await s.page.mouse.up();
    await s.page.waitForTimeout(400);
    return [!(await canvas.screenshot()).equals(still), 'frame changed'];
  });
  await t('Tab reaches the octopus with a round focus ring', async () => {
    await settle(s.page);
    await s.page.evaluate(() => document.querySelector('.hero-ctas .btn-ghost').focus());
    await s.page.keyboard.press('Tab');
    const ring = await s.page.evaluate(() => {
      const el = document.activeElement;
      const st = getComputedStyle(el);
      return { on: el.matches('.tank canvas'), style: st.outlineStyle, radius: st.borderRadius };
    });
    return [ring.on && ring.style !== 'none' && ring.radius === '50%', `${ring.on ? 'focused' : 'not focused'}, outline ${ring.style}, radius ${ring.radius}`];
  });
  let before;
  let after;
  await t('Space does not scroll the page', async () => {
    before = await canvas.screenshot();
    const y0 = await s.page.evaluate(() => scrollY);
    await s.page.keyboard.press(' ');
    await s.page.waitForTimeout(120);
    after = await canvas.screenshot();
    const y1 = await s.page.evaluate(() => scrollY);
    return [y1 === y0, `scrollY ${y0} to ${y1}`];
  });
  await t('Space or Enter startles it', async () => [!!before && !!after && !after.equals(before), 'frame changed after Space']);
  await s.ctx.close();

  // phone: a finger swiping up over the tank
  s = await open(browser, { width: 390, height: 844, phone: true });
  await t('an upward swipe over the tank scrolls the page', async () => {
    await waitLive(s.page);
    const touchAction = await s.page.evaluate(() => getComputedStyle(document.querySelector('.tank canvas')).touchAction);
    await s.page.evaluate(() => window.scrollTo(0, document.querySelector('.tank').getBoundingClientRect().top + scrollY - 200));
    await s.page.waitForTimeout(400);
    const b = await s.page.locator('.tank canvas').boundingBox();
    const y0 = await s.page.evaluate(() => scrollY);
    const cdp = await s.ctx.newCDPSession(s.page);
    const x = b.x + b.width / 2;
    let y = b.y + b.height * 0.75;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 0; i < 10; i++) {
      y -= 30;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await s.page.waitForTimeout(700);
    const y1 = await s.page.evaluate(() => scrollY);
    return [touchAction === 'pan-y' && y1 - y0 > 100, `touch-action ${touchAction}, scrolled ${Math.round(y1 - y0)}px`];
  });
  await s.ctx.close();

  // slow network: the scene chunk takes 3 s
  s = await open(browser, { width: 1440, height: 900, reduced: true, delayScene: 3000 });
  await t('no layout shift while three.js loads', async () => {
    await s.page.waitForTimeout(1500);
    const rect = () => s.page.evaluate(() => {
      const r = document.querySelector('.tank').getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map(Math.round).join(',');
    });
    const notLive = await s.page.evaluate(() => { window.__cls = 0; return !document.querySelector('.tank.is-live'); });
    const rectBefore = await rect();
    const live = await waitLive(s.page);
    const rectAfter = await rect();
    const cls = await s.page.evaluate(() => window.__cls);
    return [notLive && live && rectBefore === rectAfter && cls < 0.001, `${notLive ? 'placeholder first' : 'live too early'}, rect ${rectBefore} to ${rectAfter}, shift ${cls.toFixed(4)}`];
  });
  await s.ctx.close();
}

const groups = { layout, scene };
const browser = await chromium.launch({ executablePath: CHROME, args: GL });
for (const [name, run] of Object.entries(groups)) {
  if (only && only !== name) continue;
  console.log(`\n${name}`);
  await run(browser);
}
await browser.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
