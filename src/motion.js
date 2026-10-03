import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const KEY = 'motion';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

// Follows the OS by default. The visible toggle (or ?motion) overrides it for this visitor.
export const systemReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motionOn = new URLSearchParams(location.search).has('motion')
  || (read() ? read() === 'on' : !systemReduced);
export const motionOverridden = read() !== null;
document.documentElement.dataset.motion = motionOn ? 'on' : 'off';

export function setMotion(on) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* private mode: falls back to the OS */ }
  location.reload();
}

export let lenis = null;
if (motionOn) {
  lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -20 });
  else el.scrollIntoView();
}

// Live status comes from the site's own API (GET /api/status, server/status.js): every project is
// fetched and timed from the server and cached at the edge for a minute. Any HTTP answer counts as up,
// since a 403 from bot protection is still a site answering. `fresh` asks past the cache.
const byHost = new Map(); // host -> ms, or -1 when it did not answer
const listeners = new Set();
let inflight = null;
let loaded = false;
const notify = () => listeners.forEach((fn) => fn());

export function loadStatus(fresh = false) {
  if (inflight || (loaded && !fresh)) return;
  if (fresh) { byHost.clear(); loaded = false; notify(); }
  inflight = fetch(`/api/status${fresh ? `?fresh=${Date.now()}` : ''}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(({ sites }) => sites.forEach((s) => byHost.set(s.host, s.code > 0 ? s.ms : -1)))
    .catch(() => {}) // no API (a plain static host): sites show as links without a reading
    .finally(() => { inflight = null; loaded = true; notify(); });
}
// undefined while checking, a number when known, null when the API had nothing for it.
export const getPing = (url) => {
  const host = new URL(url).host;
  if (byHost.has(host)) return byHost.get(host);
  return loaded ? null : undefined;
};
export const onPing = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export { gsap, ScrollTrigger, SplitText };
