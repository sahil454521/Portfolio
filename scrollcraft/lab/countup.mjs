// The research numbers: they count in once the row is on screen, land on
// exactly what the paper measured, never shift the row, and a screen reader
// hears only the final values. Run again with --reduced: no count at all.
import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://localhost:4500';
const reduced = process.argv.includes('--reduced');
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(1200);

const read = () => p.evaluate(() => {
  const dl = document.querySelector('.research__spec');
  return {
    shown: [...dl.querySelectorAll('.count-up > [aria-hidden]')].map((e) => e.textContent),
    heard: [...dl.querySelectorAll('dd')].map((d) => d.innerText.trim()).slice(0, 4),
    h: Math.round(dl.getBoundingClientRect().height),
  };
});

console.log('before it is in view:', JSON.stringify((await read()).shown));
await p.evaluate(() => document.querySelector('.research__spec').scrollIntoView({ block: 'center', behavior: 'instant' }));
const heights = new Set();
const seen = [];
for (let t = 0; t < 2600; t += 200) {
  const r = await read();
  heights.add(r.h);
  seen.push(`+${t}ms ${r.shown.join(' | ')}`);
  await p.waitForTimeout(200);
}
seen.forEach((s) => console.log('  ' + s));
const end = await read();
const want = ['91.24%', '79.23%', '0.7809', '2,250 samples, Reddit and WU3D'];
console.log('settled on the paper:', end.shown.every((s, i) => s === want[i]) ? 'yes' : 'NO ' + JSON.stringify(end.shown));
const sr = await p.evaluate(() => [...document.querySelectorAll('.research__spec .count-up__read')].map((e) => e.textContent));
console.log('screen reader text:', JSON.stringify(sr), sr.every((s, i) => s === want[i]) ? '(ok)' : '<-- WRONG');
console.log('row height while counting:', [...heights].join(', '), heights.size === 1 ? '(stable)' : '<-- SHIFTED');
console.log('errors:', errors.length ? errors : 'none');
await b.close();
