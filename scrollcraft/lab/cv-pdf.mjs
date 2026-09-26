// The résumé PDF is printed from cv.html, so the page and the file can never
// disagree. Re-run after editing cv.html.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage();
await p.goto((process.argv[2] || 'http://localhost:4500') + '/cv.html', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.emulateMedia({ media: 'print' });
await p.pdf({ path: 'assets/Sahil_Pathak_Resume.pdf', preferCSSPageSize: true, printBackground: false });
await b.close();
console.log('assets/Sahil_Pathak_Resume.pdf');
