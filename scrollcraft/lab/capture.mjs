// Captures the two live client sites as authentic proof-of-work assets.
// Not generated imagery: these are the real shipped pages, photographed.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'assets/shots';
mkdirSync(OUT, { recursive: true });

const jobs = [
  { name: 'amg-desktop',  url: 'https://amgprojectsllp.com/', w: 1440, h: 900,  scrollTo: 0 },
  { name: 'amg-work',     url: 'https://amgprojectsllp.com/', w: 1440, h: 900,  scrollTo: 2400 },
  { name: 'amg-mobile',   url: 'https://amgprojectsllp.com/', w: 390,  h: 844,  scrollTo: 0, mobile: true },
  { name: 'desi-desktop', url: 'https://desitotes.com/',      w: 1440, h: 900,  scrollTo: 0 },
  { name: 'desi-work',    url: 'https://desitotes.com/',      w: 1440, h: 900,  scrollTo: 1600 },
  { name: 'desi-mobile',  url: 'https://desitotes.com/',      w: 390,  h: 844,  scrollTo: 0, mobile: true },
];

const browser = await chromium.launch({ executablePath: CHROME });

for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: j.w, height: j.h },
    deviceScaleFactor: 2,
    isMobile: !!j.mobile,
    hasTouch: !!j.mobile,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(j.url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch { /* networkidle can hang on sites with pollers; carry on */ }
  // let intros, preloaders and entrance animations finish
  await page.waitForTimeout(5000);
  if (j.scrollTo) {
    // step-scroll so lazy images and reveal-on-scroll sections actually fire
    for (let y = 0; y <= j.scrollTo; y += 400) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2500);
  }
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.screenshot({ path: `${OUT}/${j.name}.png` });
  console.log('shot', j.name);
  await ctx.close();
}

await browser.close();
console.log('done');
