// Captures the best-looking parts of each live site as stills.
// Sharper than footage, a fraction of the weight, and nothing to decode.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FF = 'C:/Users/sahil/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe';

const W = 1280, H = 800;
mkdirSync('assets/work', { recursive: true });

const jobs = [
  { name: 'desi', url: 'https://desitotes.com/', settle: 7000, warm: 6400,
    shots: [{ at: 0, as: 'desi-1' }, { at: 2450, as: 'desi-2' }] },
  { name: 'amg', url: 'https://amgprojectsllp.com/', settle: 6500, warm: 7200,
    shots: [{ at: 0, as: 'amg-1' }, { at: 2750, as: 'amg-2' }] },
];

const browser = await chromium.launch({ executablePath: CHROME });

for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,          // captured at 2x, delivered at 1600
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(j.url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch { /* pollers keep networkidle from resolving; carry on */ }
  await page.waitForTimeout(j.settle);

  // warm the page so lazy images and reveal-on-scroll sections have fired
  for (let y = 0; y <= j.warm; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(220);
  }

  for (const shot of j.shots) {
    await page.evaluate((v) => window.scrollTo(0, v), shot.at);
    await page.waitForTimeout(2600);
    const tmp = `scrollcraft/lab/_${shot.as}.png`;
    await page.screenshot({ path: tmp });
    execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-i', tmp,
      '-vf', 'scale=1600:-2', '-q:v', '3', '-y', `assets/work/${shot.as}.jpg`]);
    execFileSync(process.platform === 'win32' ? 'cmd' : 'rm',
      process.platform === 'win32' ? ['/c', 'del', tmp.split('/').join('\\')] : ['-f', tmp]);
    console.log('captured', shot.as);
  }
  await ctx.close();
}

await browser.close();
