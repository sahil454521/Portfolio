// The résumé PDF is printed from cv.html, so the page and the file can never
// disagree. Re-run after editing cv.html.
// The print styles ask for Calibri, then Carlito, its metric twin. On a machine
// with neither (Linux CI, a cloud box), pass --carlito <dir of carlito-latin-*.woff2>
// so the page breaks fall where they do on Windows: without it the fallback
// face is wider and the single page spills onto a second.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
const at = process.argv.indexOf('--carlito');
const carlito = at > 0 ? process.argv[at + 1] : null;
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage();
const base = process.argv.find((a) => /^https?:/.test(a)) || 'http://localhost:4500';
await p.goto(base + '/cv.html', { waitUntil: 'load' });
if (carlito) {
  const face = (w, style) => `@font-face{font-family:Carlito;font-weight:${w};font-style:${style};src:url(data:font/woff2;base64,${readFileSync(join(carlito, `carlito-latin-${w}-${style}.woff2`)).toString('base64')}) format("woff2")}`;
  await p.addStyleTag({ content: [face(400, 'normal'), face(700, 'normal'), face(400, 'italic'), face(700, 'italic')].join('') });
}
await p.emulateMedia({ media: 'print' });
// The print face is used only in print, so the browser has not fetched it yet;
// load it before printing or the PDF is set in the wider fallback.
await p.evaluate(async () => {
  await Promise.all(['400 10pt Carlito', '700 10pt Carlito'].map((f) => document.fonts.load(f).catch(() => [])));
  await document.fonts.ready;
});
await p.pdf({ path: 'public/assets/Sahil_Pathak_Resume.pdf', preferCSSPageSize: true, printBackground: false });
await b.close();
// a one-page résumé is the point: say how many pages came out
const pages = (readFileSync('public/assets/Sahil_Pathak_Resume.pdf', 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`public/assets/Sahil_Pathak_Resume.pdf: ${pages} page${pages === 1 ? '' : 's'}`);
