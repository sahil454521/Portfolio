// Captures the personal projects that are actually deployed and actually
// present well. Same spec as the client stills: 1120 CSS at 2x, delivered
// at 1680, so every panel in the vitrine is sampled identically.
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FF = 'C:/Users/sahil/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe';

const jobs = [
  { as: 'quest',    url: 'https://gamifyport.vercel.app' },
  { as: 'neura',    url: 'https://ai-compiler-eta.vercel.app' },
  { as: 'terminal', url: 'https://ai-chat-bot-gcar.vercel.app' },
];

const browser = await chromium.launch({ executablePath: CHROME });

for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: 1120, height: 720 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(j.url, { waitUntil: 'networkidle', timeout: 50000 });
  } catch { /* pollers keep networkidle from resolving; carry on */ }
  await page.waitForTimeout(6500);

  const tmp = `scrollcraft/lab/tmp-${j.as}.png`;
  await page.screenshot({ path: tmp });
  execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-i', tmp,
    '-vf', 'scale=1680:-2', '-q:v', '2', '-y', `assets/work/${j.as}.jpg`]);
  rmSync(tmp, { force: true });
  console.log('captured', j.as);
  await ctx.close();
}

await browser.close();
