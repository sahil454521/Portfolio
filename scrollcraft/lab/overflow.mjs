// Nothing on the page may be wider than the screen: on a phone, one wide
// element widens the whole layout and the browser zooms the page out.
import { chromium } from 'playwright-core';
const url = process.argv[2] || 'http://localhost:4500';
const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const w of [360, 390, 768, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 }, isMobile: w < 500, hasTouch: w < 500 });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  for (let y = 0; y < 12000; y += 700) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter((e) => {
      const b = e.getBoundingClientRect();
      if (!b.width) return false;
      for (let a = e.parentElement; a; a = a.parentElement) {
        const o = getComputedStyle(a).overflowX;
        if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return false;
      }
      return b.right > vw + 1 || b.left < -1;
    }).slice(0, 6).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} (${Math.round(e.getBoundingClientRect().left)}..${Math.round(e.getBoundingClientRect().right)})`);
    return { innerWidth, clientWidth: vw, scrollWidth: document.documentElement.scrollWidth, wide };
  });
  console.log(w, JSON.stringify(r));
  await p.close();
}
await b.close();
