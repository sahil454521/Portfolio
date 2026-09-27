// The desk at rest, cropped close, for judging how it looks.
import { chromium } from 'playwright-core';
const url = process.argv[2] || 'http://localhost:4500';
const out = process.argv[3] || 'scrollcraft/lab/shots/desk-now.png';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]', { timeout: 20000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
await p.screenshot({ path: out, clip: { x: 180, y: 70, width: 1080, height: 520 } });
await b.close();
