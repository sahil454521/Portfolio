// Key frames of the restructured page for a visual review: hero, index,
// the Saathi case, Also live and contact, at desktop and phone width.
// node shots-key.mjs <url> [--reduced]  -> lab/shots/key-*.png
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv.find((a) => /^https?:/.test(a)) || 'http://localhost:4500';
const reduced = process.argv.includes('--reduced');
mkdirSync('scrollcraft/lab/shots', { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const p = await b.newPage({ ...opts, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(3500);
  const sfx = `${tag}${reduced ? '-r' : ''}`;
  await p.screenshot({ path: `scrollcraft/lab/shots/key-hero-${sfx}.png` });
  for (const [name, sel, block] of [['index', '#work', 'start'], ['index2', '.ix-row:nth-child(4)', 'center'], ['saathi', '#case-saathi', 'end'], ['also', '#also', 'start'], ['contact', '#contact', 'start']]) {
    await p.evaluate(([s, bl]) => {
      const el = document.querySelector(s);
      const r = el.getBoundingClientRect();
      // a pinned case plays out over its tall track; land where its stage has settled
      const y = bl === 'end' ? r.top + scrollY + r.height - innerHeight * 1.6 : bl === 'center' ? r.top + scrollY - innerHeight / 2 : r.top + scrollY;
      window.scrollTo(0, Math.max(0, y));
    }, [sel, block]);
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `scrollcraft/lab/shots/key-${name}-${sfx}.png` });
  }
  await p.close();
}
await b.close();
console.log('saved key frames');
