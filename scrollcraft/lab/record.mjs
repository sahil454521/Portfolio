// Records the two live client sites scrolling, as real footage.
// The sites both send X-Frame-Options, so they cannot be embedded live (which
// is correct of them). This is the honest next best thing: the actual pages,
// actually moving, captured from production.
import { chromium } from 'playwright-core';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FF = 'C:/Users/sahil/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe';

const W = 1024, H = 640, FRAMES = 96;

const jobs = [
  { name: 'amg', url: 'https://amgprojectsllp.com/', settle: 6500, to: 7200 },
  { name: 'desi', url: 'https://desitotes.com/', settle: 7000, to: 6400 },
];

const browser = await chromium.launch({ executablePath: CHROME });

for (const j of jobs) {
  const dir = `scrollcraft/lab/rec-${j.name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(j.url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch { /* pollers keep networkidle from resolving; carry on */ }
  await page.waitForTimeout(j.settle);

  // warm the whole page first so lazy images and reveal-on-scroll sections
  // have fired before the take, otherwise the footage records them popping in
  for (let y = 0; y <= j.to; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(220);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2200);

  for (let i = 0; i < FRAMES; i++) {
    const t = i / (FRAMES - 1);
    // ease in and out, so the take starts and ends at rest rather than
    // cutting mid-travel
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.evaluate((v) => window.scrollTo(0, v), Math.round(e * j.to));
    await page.waitForTimeout(90);
    await page.screenshot({ path: `${dir}/${String(i).padStart(3, '0')}.png` });
  }
  await ctx.close();

  const enc = (out, w, gop, crf) => execFileSync(FF, [
    '-hide_banner', '-loglevel', 'error',
    '-framerate', '24', '-i', `${dir}/%03d.png`,
    '-vf', `scale=${w}:-2`,
    '-an', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-g', String(gop), '-keyint_min', String(gop), '-sc_threshold', '0',
    '-crf', String(crf), '-preset', 'slow', '-movflags', '+faststart',
    '-y', out,
  ]);
  enc(`assets/work/${j.name}.mp4`, 1024, 6, 27);
  enc(`assets/work/${j.name}-m.mp4`, 640, 4, 30);
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-i', `${dir}/000.png`,
    '-vf', 'scale=1024:-2', '-q:v', '4', '-y', `assets/work/${j.name}-poster.jpg`]);
  rmSync(dir, { recursive: true, force: true });
  console.log('recorded', j.name);
}

await browser.close();
