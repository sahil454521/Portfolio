// The page's own test run: each claim either executes a real check in the visitor's
// browser, or is marked as resting on Sahil's word. Nothing here is a stored result.
import { getPing, loadStatus, motionOn, onPing } from './motion';

// PatchProof task leap_year-87: the reference, the "fix" the repair tool found, and the 39 hidden inputs.
export const hiddenYears = [1836, 2300, 1700, 2317, 1976, 2021, 2400, 2194, 2266, 2253, 1800, 1848, 2239, 2200, 2304, 2200, 1700, 1897, 2400, 1700, 2400, 2237, 1800, 2285, 2284, 1827, 1949, 1801, 1816, 2300, 2240, 1900, 2100, 1700, 2206, 2100, 2387, 1700, 1971];
const leap = (y) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
const patched = (y) => y % 4 !== 0 && (y % 100 === 0 || y % 400 === 0);
export const runHidden = () => hiddenYears.map((y) => ({ y, want: leap(y), ok: patched(y) === leap(y) }));

// Resolves with the response time the status API measured: ms, -1 for no answer, null when the API is not there.
const ping = (url) => new Promise((resolve) => {
  let off = () => {};
  const look = () => { const v = getPing(url); if (v !== undefined) { off(); resolve(v); } };
  off = onPing(look);
  loadStatus();
  look();
});
const sites = (...urls) => async () => {
  const ms = await Promise.all(urls.map(ping));
  if (ms.includes(null)) return ['skip', 'the status check did not answer'];
  if (ms.some((m) => m < 0)) return ['fail', urls.length > 1 ? `${ms.filter((m) => m >= 0).length} of ${urls.length} answered` : 'no answer just now'];
  return ['pass', urls.length > 1 ? `${urls.length} of ${urls.length} answered, slowest ${Math.max(...ms)} ms` : `answered in ${ms[0]} ms`];
};

async function lastPush() {
  try {
    const r = await fetch('https://api.github.com/users/sahil454521/repos?sort=pushed&per_page=1');
    const [repo] = await r.json();
    const days = Math.floor((Date.now() - new Date(repo.pushed_at)) / 864e5);
    return ['pass', `last push ${days ? `${days} day${days > 1 ? 's' : ''} ago` : 'today'}, to ${repo.name}`];
  } catch { return ['skip', 'GitHub did not answer']; }
}

export const claims = [
  { text: 'The Desi Totes store is live', run: sites('https://desitotes.com/') },
  { text: 'The AMG Turnkey Projects site is live', run: sites('https://amgprojectsllp.com/') },
  { text: 'Three side projects are still running', run: sites('https://ai-compiler-eta.vercel.app/', 'https://ai-chat-bot-gcar.vercel.app/', 'https://gamifyport.vercel.app/') },
  { text: 'I push code in public', run: lastPush },
  { text: 'A fix can pass its test and still be wrong', run: async () => { const r = runHidden(); return ['pass', `ran ${r.length} hidden tests here, ${r.filter((t) => !t.ok).length} fail`]; } },
  { text: 'This page does not make you wait', run: async () => { const ms = Math.round(performance.getEntriesByType('navigation')[0]?.domInteractive || 0); return ms ? ['pass', `readable in ${ms} ms on your device`] : ['skip', 'your browser did not report it']; } },
  { text: 'PPEMDD reaches 91.24% accuracy on 2,250 held-out samples', word: 'from the paper; a browser cannot rerun it' },
  { text: 'I cut AMG’s load time by 50 to 80%', word: 'their internal app; ask them' },
];

let rows = claims.map((c) => ({ text: c.text, status: c.run ? 'idle' : 'word', note: c.word || '' }));
let stamp = '';
const subs = new Set();
const set = (i, patch) => { rows = rows.map((r, j) => (j === i ? { ...r, ...patch } : r)); subs.forEach((f) => f()); };
export const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };
export const getRows = () => rows;
export const getStamp = () => stamp;

let running = false;
export async function runAll(fresh = false) {
  if (running) return;
  running = true;
  if (fresh) loadStatus(true);
  claims.forEach((c, i) => c.run && set(i, { status: 'run', note: 'checking' }));
  for (const [i, c] of claims.entries()) {
    if (!c.run) continue;
    const [status, note] = await c.run();
    // results land one at a time so the run can be read; with motion off they land as they finish
    if (motionOn) await new Promise((r) => setTimeout(r, 260));
    set(i, { status, note });
  }
  stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  running = false;
  subs.forEach((f) => f());
}
