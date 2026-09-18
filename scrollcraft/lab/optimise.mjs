// The live-site captures come off the harness as 2x PNGs, which is right for
// reading them and wrong for shipping them. Downscale to a sensible display
// width and re-encode as JPEG.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const jobs = [
  { src: 'assets/shots/amg-work.png', dst: 'assets/shots/amg-work.jpg', w: 1800 },
  { src: 'assets/shots/desi-work.png', dst: 'assets/shots/desi-work.jpg', w: 1800 },
];

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();

for (const j of jobs) {
  const b64 = readFileSync(j.src).toString('base64');
  const data = await page.evaluate(async ({ b64, w }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return { url: c.toDataURL('image/jpeg', 0.84), w, h };
  }, { b64, w: j.w });
  writeFileSync(j.dst, Buffer.from(data.url.split(',')[1], 'base64'));
  console.log(
    j.dst,
    `${data.w}x${data.h}`,
    (statSync(j.src).size / 1024 / 1024).toFixed(2) + 'MB ->',
    (statSync(j.dst).size / 1024).toFixed(0) + 'KB'
  );
}

await browser.close();
