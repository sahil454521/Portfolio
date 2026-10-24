// What a recruiter gets in the first thirty seconds, checked rather than
// assumed: who, what, which degrees, what he is looking for, and the way to
// the résumé and email, all on the first screen; then every project in one
// scannable index close below it, with live and code links. Prints
// RECRUITER PASS only when every check holds at desktop and phone width.
// node recruiter.mjs <url> [--reduced]
import { chromium } from 'playwright-core';

const url = process.argv.find((a) => /^https?:/.test(a)) || 'http://localhost:4500';
const reduced = process.argv.includes('--reduced');
const OWN_CODE = ['github.com/sahil454521/sarkari-saathi', 'github.com/sahil454521/AiCompiler', 'github.com/sahil454521/ai-chat-bot'];
const PROJECTS = ['Desi Totes', 'AMG', 'Sarkari Saathi', 'PPEMDD', 'NeuraCraft', 'AI Terminal', 'Portfolio Quest'];
const FIRST_SCREEN = [/Sahil Pathak/, /full-stack/i, /AI\/ML/, /DY Patil International University/, /IIT Guwahati/, /internships/i, /2027/];

const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const failures = [];
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failures.push(what); };

for (const [label, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
]) {
  const ctx = await b.newContext({ ...opts, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(3500); // the hero's entrance has finished

  // text that is actually visible inside the first viewport
  const first = await p.evaluate(() => {
    const out = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const n = walk.currentNode;
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0 || el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) out.push(n.textContent.trim());
    }
    return out.join(' ');
  });
  for (const re of FIRST_SCREEN) check(re.test(first), `${label}: first screen shows ${re}`);
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].filter((a) => {
    const r = a.getBoundingClientRect();
    return r.width && r.bottom > 0 && r.top < innerHeight;
  }).map((a) => a.getAttribute('href')));
  check(links.some((h) => /^\/cv/.test(h) || /Resume\.pdf$/i.test(h)), `${label}: first screen links the résumé`);
  check(links.some((h) => /^mailto:/.test(h)), `${label}: first screen links email`);

  const body = await p.evaluate(() => document.body.innerText);
  check(!/Final year at IIT Guwahati/i.test(body), `${label}: the old "Final year at IIT Guwahati" line is gone`);

  const idx = await p.evaluate(() => {
    const w = document.querySelector('#work');
    if (!w) return null;
    return { top: (w.getBoundingClientRect().top + scrollY) / innerHeight, text: w.innerText, hrefs: [...w.querySelectorAll('a[href]')].map((a) => a.href) };
  });
  check(!!idx && idx.top <= 1.3, `${label}: the project index starts within 1.3 screens (${idx ? idx.top.toFixed(2) : 'none'})`);
  if (idx) {
    for (const name of PROJECTS) check(idx.text.includes(name), `${label}: index lists ${name}`);
    for (const c of OWN_CODE) check(idx.hrefs.some((h) => h.includes(c)), `${label}: index links code ${c}`);
    const live = idx.hrefs.filter((h) => /^https:\/\/(?!github\.com)/.test(h)).length;
    check(live >= 6, `${label}: index has live links (${live})`);
  }
  const all = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href));
  check(!all.some((h) => /github\.com\/DesiTote/i.test(h)), `${label}: nothing links the Desi Totes repo`);

  // Sarkari Saathi's case: bring it into view so its lazy images load
  const saathi = await p.evaluate(() => { const s = document.querySelector('#case-saathi'); if (!s) return false; s.scrollIntoView(); return true; });
  check(saathi, `${label}: Sarkari Saathi has its own case`);
  if (saathi) {
    await p.waitForTimeout(1500);
    const imgs = await p.evaluate(() => [...document.querySelectorAll('#case-saathi img')].map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, alt: i.alt })));
    check(imgs.length >= 2 && imgs.every((i) => i.ok && i.alt), `${label}: both Saathi screenshots load, with alt text (${imgs.map((i) => i.src).join(', ')})`);
  }

  check(errors.length === 0, `${label}: no page errors ${errors.join(' | ')}`);
  await ctx.close();
}

for (const w of [360, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  let widest = 0;
  for (let y = 0; y < 40; y++) {
    widest = Math.max(widest, await p.evaluate(() => document.documentElement.scrollWidth));
    const more = await p.evaluate(() => { const before = scrollY; scrollBy(0, innerHeight); return scrollY > before; });
    if (!more) break;
    await p.waitForTimeout(120);
  }
  check(widest <= w, `${w}px: no sideways scroll (widest ${widest})`);
  await ctx.close();
}

await b.close();
console.log(failures.length ? `RECRUITER FAIL (${failures.length})` : 'RECRUITER PASS');
process.exit(failures.length ? 1 : 0);
