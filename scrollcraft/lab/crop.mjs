// Crops the portrait to the subject alone. The source files are candid group
// shots; everyone else in frame is a third party who did not agree to appear
// on a public site, so they come out of the picture rather than being blurred.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const src = 'assets/me/profile2.jpg';
const dst = 'assets/me/portrait.jpg';

// source is 2200x2200; this window holds the subject and excludes the others
const CROP = { x: 770, y: 530, w: 700, h: 875 };
const OUT = { w: 900, h: 1125 };

const b64 = readFileSync(src).toString('base64');
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();
const data = await page.evaluate(async ({ b64, CROP, OUT }) => {
  const img = new Image();
  img.src = 'data:image/jpeg;base64,' + b64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = OUT.w; c.height = OUT.h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, OUT.w, OUT.h);
  return c.toDataURL('image/jpeg', 0.9);
}, { b64, CROP, OUT });

writeFileSync(dst, Buffer.from(data.split(',')[1], 'base64'));
await browser.close();
console.log('wrote', dst);
