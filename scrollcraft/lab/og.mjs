// The share card: the hero as it first paints, rendered at desktop size, saved at 1200x630.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 756 }, deviceScaleFactor: 1200 / 1440 });
await p.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForSelector('[data-desk][data-ready]', { timeout: 15000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(2600);
await p.screenshot({ path: 'public/assets/og.jpg', type: 'jpeg', quality: 86 });
await b.close();
console.log('public/assets/og.jpg');
