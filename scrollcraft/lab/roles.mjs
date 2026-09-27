// "Hiring for": each chip walks the desk's frame through its role's objects,
// with the reason each is there, and says the same to a screen reader.
import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://localhost:4500';
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForSelector('[data-desk][data-ready]', { timeout: 20000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);
for (const role of ['AI/ML', 'Full-stack']) {
  await p.getByRole('button', { name: role, exact: true }).click();
  const seen = [];
  for (let i = 0; i < 4; i++) {
    await p.waitForTimeout(i ? 1900 : 400);
    seen.push(await p.evaluate(() => {
      const f = document.querySelector('[data-desk-frame]');
      return f.hasAttribute('data-on') ? `${f.querySelector('b').textContent} / ${f.querySelector('span').textContent}` : '(no frame)';
    }));
    if (i === 1) await p.screenshot({ path: `scrollcraft/lab/shots/roles-${role.replace('/', '')}${mobile ? '-m' : ''}.png` });
  }
  console.log(role + ':\n  ' + seen.join('\n  '));
  console.log('  read out:', (await p.textContent('.lede p.sr')).slice(0, 90) + '…');
  await p.waitForTimeout(2200);
}
console.log('errors:', errors.length ? errors : 'none');
await b.close();
