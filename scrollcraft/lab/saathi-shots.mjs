// Screenshots of Sarkari Saathi for the portfolio, in its real UI with its real
// output: Sunita's six turns as the app's own pipeline answered them, recorded
// in the app's repo (video/public/data.json), are replayed in place of
// /api/turn, so nothing on screen is invented. Fonts come from local files
// because the capture machine may not reach Google Fonts.
// node saathi-shots.mjs <app url> <data.json> <fonts dir> <out dir>
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const [url = 'http://localhost:4600', dataPath, fontsDir, outDir = 'public/work'] = process.argv.slice(2);
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

// every woff2 under the fontsource packages, by file name
const fontFiles = new Map();
for (const pkg of readdirSync(fontsDir)) {
  const dir = join(fontsDir, pkg, 'package', 'files');
  if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith('.woff2')) fontFiles.set(f, join(dir, f));
}
const face = (family, file, weight, range) => `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;src:url(https://fonts.local/${file}) format("woff2");unicode-range:${range}}`;
const DEV = 'U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+25CC,U+A830-A839,U+A8E0-A8FF';
const LAT = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const css = [
  ...[400, 600, 700].flatMap((w) => [face('Mukta', `mukta-devanagari-${w}-normal.woff2`, w, DEV), face('Mukta', `mukta-latin-${w}-normal.woff2`, w, LAT)]),
  face('Tiro Devanagari Hindi', 'tiro-devanagari-hindi-devanagari-400-normal.woff2', 400, DEV),
  face('Tiro Devanagari Hindi', 'tiro-devanagari-hindi-latin-400-normal.woff2', 400, LAT),
  ...[400, 700].flatMap((w) => [face('Kalam', `kalam-devanagari-${w}-normal.woff2`, w, DEV), face('Kalam', `kalam-latin-${w}-normal.woff2`, w, LAT)]),
].join('\n');

// the recorded turns, as /api/turn answered them
let history = [];
const responses = data.turns.map((t) => {
  history = [...history, { role: 'user', text: t.heard }, { role: 'assistant', text: t.reply }].slice(-6);
  return { heard: t.heard, reply: t.reply, audio: null, state: { profile: t.profile, history, asked: t.asked }, phase: t.phase, schemes: t.schemes };
});

const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
await p.route('https://fonts.gstatic.com/**', (r) => r.abort());
await p.route('https://fonts.local/*', (r) => {
  const file = fontFiles.get(new URL(r.request().url()).pathname.slice(1));
  return file ? r.fulfill({ contentType: 'font/woff2', body: readFileSync(file) }) : r.abort();
});
await p.route('**/api/speak**', (r) => r.fulfill({ status: 204, body: '' }));
let n = 0;
await p.route('**/api/turn', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(responses[Math.min(n++, responses.length - 1)]) }));

await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.getByRole('button', { name: /मराठी/ }).first().tap();
await p.waitForTimeout(600);
await p.getByRole('button', { name: /लिहून सांगा/ }).tap();

const shoot = async (name, fullPage = false) => {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({ path: join(outDir, name), type: 'jpeg', quality: 82, fullPage });
  console.log('saved', name);
};
for (const [i, t] of data.turns.entries()) {
  await p.fill('input[name="text"]', t.heard);
  await p.press('input[name="text"]', 'Enter');
  // the results screen shows the scheme cards rather than the reply line
  const cue = t.phase === 'results' ? t.schemes[0].name : t.reply.slice(0, 12);
  await p.waitForFunction((k) => document.body.innerText.includes(k), cue, { timeout: 8000 })
    .catch(() => { throw new Error(`turn ${i + 1}: never showed "${cue}"`); });
  if (i === 1) await shoot('saathi-asking.jpg');
}
await p.evaluate(() => scrollTo(0, 0));
await shoot('saathi-results.jpg');
console.log('turns replayed:', n, '| errors:', errors.length ? errors : 'none');
await b.close();
