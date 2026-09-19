// Captures a CROP of each site rather than the whole viewport.
//
// A full-page still has to show a 1120px page inside a panel about 670 CSS px
// wide, so everything on it lands at roughly 60% size. Cropping to the part
// that matters means the panel shows less of the page, at full size, which is
// the only way the type on it is genuinely 1:1.
//
// The crop is taken from a 2x capture, so the delivered image is real pixels.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FF = 'C:/Users/sahil/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe';

const W = 1280, H = 860, SCALE = 2;
const OUT_W = 1680;                 // delivered width
const CROP_CSS_W = 840;             // how much page each panel shows

mkdirSync('assets/work', { recursive: true });

const jobs = [
  { url: 'https://desitotes.com/', settle: 7000, warm: 6400, shots: [
      { at: 0,    x: 0,   y: 120, as: 'desi-1' },
      { at: 2450, x: 0,   y: 60,  as: 'desi-2' },
    ] },
  { url: 'https://amgprojectsllp.com/', settle: 6500, warm: 7200, shots: [
      { at: 0,    x: 0,   y: 120, as: 'amg-1' },
      { at: 2750, x: 0,   y: 60,  as: 'amg-2' },
    ] },
];

const browser = await chromium.launch({ executablePath: CHROME });

for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: SCALE,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(j.url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch { /* pollers keep networkidle from resolving; carry on */ }
  await page.waitForTimeout(j.settle);

  for (let y = 0; y <= j.warm; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(220);
  }

  for (const shot of j.shots) {
    await page.evaluate((v) => window.scrollTo(0, v), shot.at);
    await page.waitForTimeout(2600);
    const tmp = `scrollcraft/lab/_${shot.as}.png`;
    // clip in CSS pixels; playwright scales it by deviceScaleFactor for us
    await page.screenshot({
      path: tmp,
      clip: { x: shot.x, y: shot.y, width: CROP_CSS_W, height: Math.round(CROP_CSS_W * 1080 / 1680) },
    });
    execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-i', tmp,
      '-vf', `scale=${OUT_W}:-2`, '-q:v', '2', '-y', `assets/work/${shot.as}.jpg`]);
    execFileSync('cmd', ['/c', 'del', tmp.split('/').join('\\')]);
    console.log('cropped', shot.as);
  }
  await ctx.close();
}

await browser.close();
