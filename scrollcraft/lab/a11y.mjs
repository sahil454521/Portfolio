// Tab order, focus visibility, heading outline, alt text and the things a
// screenshot cannot tell you.
import { chromium } from 'playwright-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(process.argv[2] || 'http://localhost:4500', { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const order = [];
for (let i = 0; i < 24; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 42).replace(/\s+/g, ' '),
      href: el.getAttribute('href') || '',
      outline: cs.outlineWidth + ' ' + cs.outlineStyle,
      visible: el.getBoundingClientRect().width > 0,
    };
  });
  if (!info) break;
  order.push(info);
}

const audit = await page.evaluate(() => {
  const heads = [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName + ' ' + h.innerText.trim().slice(0, 40));
  const imgs = [...document.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src').split('/').pop(), alt: i.getAttribute('alt') }));
  const noAlt = imgs.filter((i) => i.alt === null);
  const emptyAlt = imgs.filter((i) => i.alt === '');
  // em dash check: the hard rule forbids it anywhere visible
  const em = (document.body.innerText.match(/—/g) || []).length;
  const lang = document.documentElement.lang;
  return { heads, imgCount: imgs.length, noAlt, emptyAlt: emptyAlt.length, em, lang };
});

console.log('TAB ORDER');
order.forEach((o, i) => console.log(`  ${i + 1}. ${o.tag} "${o.text || o.href}" outline=${o.outline} visible=${o.visible}`));
console.log('\nHEADINGS');
audit.heads.forEach((h) => console.log('  ' + h));
console.log('\nimages:', audit.imgCount, '| missing alt attr:', audit.noAlt.length, '| decorative (alt=""):', audit.emptyAlt);
if (audit.noAlt.length) console.log('  MISSING:', JSON.stringify(audit.noAlt));
console.log('visible em dashes:', audit.em, audit.em ? ' <-- HARD RULE VIOLATION' : '(ok)');
console.log('lang:', audit.lang);

await browser.close();
