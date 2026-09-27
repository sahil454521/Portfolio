// A filmstrip of opening an app from the desk: frames every ~90ms from the
// click until the live app shows, then Back, laid out on one contact sheet
// (lab/shots/film-<id>[-m].png) so the motion can be judged as a whole.
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://localhost:4500';
const id = process.argv.find((a) => /^(quest|term|neura)$/.test(a)) || 'quest';
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const vp = mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 };
const p = await b.newPage(mobile ? { viewport: vp, isMobile: true, hasTouch: true } : { viewport: vp });
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]', { timeout: 20000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);

const frames = [];
const grab = async (label) => frames.push({ label, png: (await p.screenshot({ type: 'jpeg', quality: 60 })).toString('base64') });
const t0 = Date.now();
await p.evaluate((id) => document.querySelector(`[data-thing="${id}"]`).click(), id);
while (Date.now() - t0 < 4200) await grab(`+${Date.now() - t0}ms`);
const back = await p.$('.zoom__back');
const hit = await p.evaluate(() => {
  const r = document.querySelector('.zoom__back').getBoundingClientRect();
  const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return el ? el.className || el.tagName : 'none';
});
console.log('what is under the Back button:', hit);
await back.evaluate((el) => el.click());
const t1 = Date.now();
while (Date.now() - t1 < 2200) await grab(`back +${Date.now() - t1}ms`);

// one contact sheet; --from=ms --to=ms --every=n pick a stretch, larger
const arg = (k, d) => Number((process.argv.find((x) => x.startsWith(`--${k}=`)) || `=${d}`).split('=')[1]);
const from = arg('from', -1), to = arg('to', 1e9), every = arg('every', 1), big = process.argv.includes('--big');
frames.splice(0, frames.length, ...frames.filter((f, i) => {
  const ms = Number(f.label.replace(/[^0-9]/g, '')) + (f.label.startsWith('back') ? 10000 : 0);
  return ms >= from && ms <= to && i % every === 0;
}));
const cols = mobile ? (big ? 5 : 8) : big ? 3 : 5, w = mobile ? (big ? 240 : 160) : big ? 420 : 256, h = Math.round((w * vp.height) / vp.width);
const html = `<body style="margin:0;background:#222;font:11px sans-serif;color:#eee;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:4px;padding:4px">` +
  frames.map((f) => `<div><img src="data:image/jpeg;base64,${f.png}" width="${w}" height="${h}" style="display:block"><div>${f.label}</div></div>`).join('') + '</body>';
const sheet = await b.newPage({ viewport: { width: cols * (w + 4) + 4, height: 400 } });
await sheet.setContent(html);
await sheet.waitForTimeout(300);
const out = `scrollcraft/lab/shots/film-${id}${mobile ? '-m' : ''}.png`;
await sheet.screenshot({ path: out, fullPage: true });
console.log(out, frames.length, 'frames');
await b.close();
fs.existsSync(out);
