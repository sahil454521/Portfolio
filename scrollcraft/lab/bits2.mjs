// The React Bits pieces inside the windows: the board's flaps and marks, and
// the compose chips. Screenshots each state into lab/shots.
import { chromium } from 'playwright-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4500';
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 1152, height: 870 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const shot = (n) => p.screenshot({ path: `scrollcraft/lab/shots/bits2-${n}.png` });
const flaps = () => p.$$eval('dialog[data-live-board] .split-flap-text', (els) => els.map((e) => e.getAttribute('aria-label') || '(blank)'));
const marks = () => p.$$eval('dialog[data-live-board] .status-mark', (els) => els.map((e) => e.dataset.status));

await p.goto(url + '/#rack', { waitUntil: 'load' });
await p.waitForSelector('dialog[data-live-board][open]', { timeout: 25000 });
await p.waitForTimeout(250);
const mid = await flaps();
await shot('board-rolling');
await p.waitForTimeout(2200);
console.log('board open, mid-roll:', mid.join(' | '));
console.log('board open, settled :', (await flaps()).join(' | '), ' marks:', (await marks()).join(','));
await shot('board');
await p.click('dialog[data-live-board] .board__foot .btn');
await p.waitForTimeout(150);
console.log('checking            :', (await flaps()).join(' | '), ' marks:', (await marks()).join(','));
await shot('board-checking');
await p.waitForFunction(() => !document.querySelector('dialog[data-live-board] .status-mark[data-status="running"]'), null, { timeout: 15000 });
await p.waitForTimeout(2000);
console.log('checked again       :', (await flaps()).join(' | '), ' marks:', (await marks()).join(','));
const sr = await p.$$eval('dialog[data-live-board] .sr', (els) => els.map((e) => e.textContent));
console.log('read aloud          :', sr.join(' | '));
await shot('board-again');
await p.keyboard.press('Escape');
await p.waitForTimeout(600);

await p.goto('about:blank');
await p.goto(url + '/#phone', { waitUntil: 'load' });
await p.waitForSelector('dialog[data-compose][open] .jelly-radio', { timeout: 25000 });
await p.waitForTimeout(700);
const chips = async () => p.$$eval('dialog[data-compose] [role=radio]', (els) => els.map((e) => `${e.textContent}${e.getAttribute('aria-checked') === 'true' ? '*' : ''}`).join(', '));
console.log('chips               :', await chips());
await p.click('dialog[data-compose] [role=radio]:nth-child(2)');
await p.waitForTimeout(90);
await shot('chips-mid');
await p.waitForTimeout(700);
console.log('after a click       :', await chips());
await p.focus('dialog[data-compose] [role=radio][aria-checked=true]');
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(500);
console.log('after ArrowRight    :', await chips(), ' focus:', await p.evaluate(() => document.activeElement.textContent));
await shot('chips');
console.log('errors:', errors.length ? errors : 'none');
await b.close();
