// Pointer effects and scroll-driven bits, as hooks. Three of them come from
// React Bits (Variable Proximity, Tilted Card, Magnet), rebuilt to share one
// animation loop: every axis is its own critically damped spring (Apple's
// default, no overshoot), stepped from its live value so a reversal never
// jumps, and the loop sleeps unless a spring is still moving. Pointer only,
// and off under reduced motion: all three are decoration, and a finger has no
// position between taps.
import { useEffect, useRef, useState } from 'react';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---- the shared loop --------------------------------------------------- */
const ptr = { x: -1e4, y: -1e4 };
const tasks = new Set();
let awake = false, last = 0, wired = false;

function spring(response) {
  const k = (2 * Math.PI / response) ** 2, c = 4 * Math.PI / response;   // damping ratio 1
  return {
    x: 0, v: 0, to: 0,
    step(dt) {
      this.v += (-k * (this.x - this.to) - c * this.v) * dt;
      this.x += this.v * dt;
      return Math.abs(this.x - this.to) > 1e-3 || Math.abs(this.v) > 1e-3;
    },
  };
}
function frame(t) {
  const dt = Math.min(Math.max((t - last) / 1000, 0), 1 / 30) || 1 / 60;
  last = t;
  let busy = false;
  for (const f of tasks) busy = f(dt) || busy;
  awake = busy;
  if (busy) requestAnimationFrame(frame);
}
function wake() {
  if (awake) return;
  awake = true;
  last = performance.now();
  requestAnimationFrame(frame);
}
function wire() {
  if (wired) return;
  wired = true;
  addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; wake(); }, { passive: true });
  addEventListener('pointerout', (e) => { if (!e.relatedTarget) { ptr.x = ptr.y = -1e4; wake(); } });
}
function usePointerTask(ref, make) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !fine()) return undefined;
    wire();
    const { step, cleanup } = make(el);
    tasks.add(step);
    wake();
    return () => { tasks.delete(step); if (cleanup) cleanup(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ---- Variable Proximity: the headline thickens under the pointer ------- */
export function useVariableProximity(ref, { radius = 130, base = 500, peak = 780 } = {}) {
  usePointerTask(ref, (h1) => {
    const letters = [...h1.querySelectorAll('.vp__w span')].map((el) => ({ el, s: spring(0.3), cx: 0, cy: 0, wght: base }));
    let axes = '';
    // centres measured at rest, relative to the headline, so a frame reads
    // one rect rather than thirty
    const measure = () => {
      axes = getComputedStyle(h1).fontVariationSettings;
      const o = h1.getBoundingClientRect();
      for (const l of letters) {
        const r = l.el.getBoundingClientRect();
        l.cx = r.left + r.width / 2 - o.left;
        l.cy = r.top + r.height / 2 - o.top;
      }
    };
    document.fonts.ready.then(measure);
    addEventListener('resize', measure);
    return {
      cleanup: () => removeEventListener('resize', measure),
      step(dt) {
        const o = h1.getBoundingClientRect();
        let busy = false;
        for (const l of letters) {
          const d = Math.hypot(ptr.x - o.left - l.cx, ptr.y - o.top - l.cy);
          const t = Math.max(0, 1 - d / radius);
          l.s.to = t * t * (3 - 2 * t);
          if (l.s.step(dt)) busy = true;
          const wght = Math.round(base + (peak - base) * Math.max(0, l.s.x));
          if (wght === l.wght) continue;
          l.wght = wght;
          l.el.style.fontVariationSettings = wght === base ? '' : `"wght" ${wght}, ${axes}`;
        }
        return busy;
      },
    };
  });
}

/* ---- Tilted Card: a client site leans away from the pointer ----------- */
export function useTilt(ref, amp = 5) {
  usePointerTask(ref, (a) => {
    const rx = spring(0.4), ry = spring(0.4);
    let over = false, shown = '';
    const enter = () => { over = true; };
    const leave = () => { over = false; wake(); };
    a.addEventListener('pointerenter', enter);
    a.addEventListener('pointerleave', leave);
    return {
      cleanup: () => { a.removeEventListener('pointerenter', enter); a.removeEventListener('pointerleave', leave); },
      step(dt) {
        if (over) {
          const r = a.getBoundingClientRect();
          // the half under the pointer presses away, as if touched
          rx.to = -((ptr.y - r.top) / r.height - 0.5) * 2 * amp;
          ry.to = ((ptr.x - r.left) / r.width - 0.5) * 2 * amp;
        } else rx.to = ry.to = 0;
        const busy = rx.step(dt) | ry.step(dt);
        const ang = Math.hypot(rx.x, ry.x);
        // one rotation about the combined axis, through the `rotate` property,
        // so it composes with the stylesheet's hover lift
        const next = ang < 0.01 ? '' : `${rx.x.toFixed(4)} ${ry.x.toFixed(4)} 0 ${ang.toFixed(3)}deg`;
        if (next !== shown) a.style.rotate = shown = next;
        return !!busy;
      },
    };
  });
}

/* ---- Magnet: the call to action leans toward the pointer --------------- */
export function useMagnet(ref, { pad = 70, pull = 13 } = {}) {
  usePointerTask(ref, (el) => {
    const mx = spring(0.35), my = spring(0.35);
    let shown = '';
    return {
      step(dt) {
        const r = el.getBoundingClientRect();
        // measured from where it rests, not where the magnet has moved it
        const dx = ptr.x - (r.left + r.width / 2 - mx.x);
        const dy = ptr.y - (r.top + r.height / 2 - my.x);
        const near = Math.abs(dx) < r.width / 2 + pad && Math.abs(dy) < r.height / 2 + pad;
        mx.to = near ? dx / pull : 0;
        my.to = near ? dy / pull : 0;
        const busy = mx.step(dt) | my.step(dt);
        const next = Math.abs(mx.x) + Math.abs(my.x) < 0.05 ? '' : `${mx.x.toFixed(2)}px ${my.x.toFixed(2)}px`;
        if (next !== shown) el.style.translate = shown = next;
        return !!busy;
      },
    };
  });
}

/* ---- the plate: the closing clip, scrubbed by scroll ------------------- */
// Scrubbed by the last stretch of scroll on the page, so it finishes as the
// document does. Three mechanisms, because a naive version breaks in three
// ways: fetch as a Blob so seeking does not depend on range requests, lerp
// the playhead because wheel events arrive in lumps, and never queue a seek
// while the decoder is still resolving the last one.
export function useScrub(figRef, src, srcMobile) {
  useEffect(() => {
    const fig = figRef.current;
    const video = fig && fig.querySelector('video');
    if (!video || reduced()) return undefined;              // reduced motion keeps the poster
    let ready = false, dur = 0, head = 0, seeking = false, alive = false, dead = false, url = '';

    const progress = () => {
      const r = fig.getBoundingClientRect();
      const startY = scrollY + r.top - innerHeight;
      const maxY = document.documentElement.scrollHeight - innerHeight;
      return clamp((scrollY - startY) / Math.max(maxY - startY, 1), 0, 1);
    };
    const tick = () => {
      if (!alive || dead) return;
      requestAnimationFrame(tick);
      if (!ready || !dur) return;
      head += (progress() * dur - head) * 0.18;
      const deadband = innerWidth <= 760 ? 0.02 : 0.008;
      if (!seeking && Math.abs(video.currentTime - head) > deadband) { seeking = true; video.currentTime = head; }
    };
    const start = () => { if (!alive) { alive = true; requestAnimationFrame(tick); } };
    const onSeeked = () => { seeking = false; };
    video.addEventListener('seeked', onSeeked);

    fetch(innerWidth <= 760 && srcMobile ? srcMobile : src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        if (dead) return undefined;
        url = URL.createObjectURL(b);
        video.src = url;
        return new Promise((res, rej) => { video.onloadedmetadata = res; video.onerror = () => rej(new Error('decode')); });
      })
      .then(() => {
        if (dead) return;
        dur = video.duration || 0;
        video.currentTime = 0;
        const show = () => { ready = true; fig.setAttribute('data-ready', ''); };
        if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(show);
        else video.onseeked = show;
        start();
      })
      .catch(() => { /* the poster stays, which is a complete state */ });

    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) start(); else alive = false;
    }, { rootMargin: '60% 0px' });
    io.observe(fig);
    return () => { dead = true; io.disconnect(); video.removeEventListener('seeked', onSeeked); if (url) URL.revokeObjectURL(url); };
  }, [figRef, src, srcMobile]);
}

/* ---- where you are: the section under the top bar --------------------- */
export function useSectionTracking(ids) {
  const [here, setHere] = useState(-1);
  useEffect(() => {
    let queued = false;
    const mark = () => {
      queued = false;
      const line = innerHeight * 0.42;
      let at = -1;
      ids.forEach((id, i) => {
        const el = document.querySelector(id);
        if (el && el.getBoundingClientRect().top <= line) at = i;
      });
      setHere(at);
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(mark); } };
    addEventListener('scroll', onScroll, { passive: true });
    mark();
    return () => removeEventListener('scroll', onScroll);
  }, [ids]);
  return here;
}

/* ---- near the viewport: mount heavy things only when they can be seen -- */
export function useNearView(ref, margin = '40% 0px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((es) => setNear(es.some((e) => e.isIntersecting)), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}
