/* =============================================================
   Page code. The engine is untouched, and the vitrine lives in
   its own file.

   Four small things:
     1. the rail       (where you are)
     2. the plate      (the closing clip, scrubbed by scroll)
     3. verify state   (so the pinned hero is visible to the
                        verification harness, which compares
                        engine state rather than pixels)
     4. bits           (three React Bits components, ported)
   ============================================================= */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ===========================================================
     1 · THE RAIL
     =========================================================== */
  function rail() {
    const links = [...document.querySelectorAll('[data-rail]')];
    if (!links.length) return;
    const targets = links.map((a) => document.querySelector(a.getAttribute('href')));

    let queued = false;
    function mark() {
      queued = false;
      const line = innerHeight * 0.42;
      let here = -1;
      targets.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) here = i;
      });
      links.forEach((a, i) => a.toggleAttribute('data-here', i === here));
    }

    addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(mark);
    }, { passive: true });
    mark();
  }

  /* ===========================================================
     2 · THE PLATE
     ---------------------------------------------------------
     Scrubbed by the last stretch of scroll on the page, so it
     finishes as the document does. Never plays on its own, and
     carries no audio track.

     Three mechanisms, because a naive version of this breaks in
     three specific ways: fetch as a Blob so seeking does not
     depend on range requests, lerp the playhead because wheel
     events arrive in lumps, and never queue a seek while the
     decoder is still resolving the last one.
     =========================================================== */
  function plate() {
    const fig = document.querySelector('[data-scrub]');
    if (!fig || reduced.matches) return;      // reduced motion keeps the poster
    const video = fig.querySelector('video');
    if (!video) return;

    const src = (innerWidth <= 760 && fig.dataset.scrubSrcMobile)
      ? fig.dataset.scrubSrcMobile
      : fig.dataset.scrubSrc;

    let ready = false, dur = 0, head = 0, seeking = false, alive = false;

    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        video.src = URL.createObjectURL(b);
        return new Promise((res, rej) => {
          video.onloadedmetadata = res;
          video.onerror = () => rej(new Error('decode'));
        });
      })
      .then(() => {
        dur = video.duration || 0;
        video.currentTime = 0;
        const show = () => { ready = true; fig.setAttribute('data-ready', ''); };
        if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(show);
        else video.onseeked = show;
        start();
      })
      .catch(() => { /* the poster stays, which is a complete state */ });

    // Mapped against the page's remaining scroll rather than the element's own
    // travel: this sits near the end, so it never fully passes through the
    // viewport and an element-travel mapping would stop short of the last frame.
    function progress() {
      const r = fig.getBoundingClientRect();
      const startY = scrollY + r.top - innerHeight;
      const maxY = document.documentElement.scrollHeight - innerHeight;
      return clamp((scrollY - startY) / Math.max(maxY - startY, 1), 0, 1);
    }

    function frame() {
      if (!alive) return;
      requestAnimationFrame(frame);
      if (!ready || !dur) return;
      head += (progress() * dur - head) * 0.18;
      const dead = innerWidth <= 760 ? 0.020 : 0.008;
      if (!seeking && Math.abs(video.currentTime - head) > dead) {
        seeking = true;
        video.currentTime = head;
      }
    }
    video.addEventListener('seeked', () => { seeking = false; });

    function start() { if (!alive) { alive = true; requestAnimationFrame(frame); } }

    new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) start();
      else alive = false;
    }, { rootMargin: '60% 0px' }).observe(fig);
  }

  /* ===========================================================
     3 · VERIFY STATE
     ---------------------------------------------------------
     The hero is driven from --sc-p by the vitrine's own renderer
     and by CSS, so it uses none of the engine's devices. The
     dead-scroll check compares engine state rather than pixels,
     which means an act like this is invisible to it and would be
     reported dead however much it actually moves. shoot.mjs reads
     [data-sc-verify-state] for exactly this case.
     =========================================================== */
  function verifyState() {
    const act = document.querySelector('.stage[data-sc-act]');
    const vit = document.querySelector('[data-vitrine]');
    if (!act || !vit) return;

    let last = '', queued = false, near = false;

    const write = () => {
      queued = false;
      const p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0;
      const v = vit.querySelector('video');
      const t = v && v.currentTime ? v.currentTime.toFixed(2) : '0.00';
      const s = 'p' + p.toFixed(3) + ' t' + t;
      if (s !== last) { vit.setAttribute('data-sc-verify-state', s); last = s; }
    };

    addEventListener('scroll', () => {
      if (!near || queued) return;
      queued = true;
      requestAnimationFrame(write);
    }, { passive: true });

    new IntersectionObserver((es) => {
      near = es.some((e) => e.isIntersecting);
      if (near) write();
    }, { rootMargin: '40% 0px' }).observe(act);

    write();
  }

  /* ===========================================================
     4 · THREE BITS FROM REACT BITS
     ---------------------------------------------------------
     reactbits.dev ships these as React components. There is no
     React here, so they are rewritten against the DOM:

       Variable Proximity  the headline thickens under the pointer
       Tilted Card         the two client sites lean away from it
       Magnet              the one call to action leans towards it

     Pointer only, and off under reduced motion: all three are
     decoration, and a finger has no position between taps. Each
     axis is its own critically damped spring (Apple's default,
     no overshoot), always stepped from its live value, so a
     reversal mid-flight never jumps. One loop, asleep unless a
     spring is still moving.
     =========================================================== */
  function bits() {
    if (reduced.matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const ptr = { x: -1e4, y: -1e4 };
    const tasks = [];
    let awake = false, last = 0;

    // response in seconds; damping ratio 1
    function spring(response) {
      const k = (2 * Math.PI / response) ** 2, c = 4 * Math.PI / response;
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
    addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; wake(); }, { passive: true });
    addEventListener('pointerout', (e) => { if (!e.relatedTarget) { ptr.x = ptr.y = -1e4; wake(); } });

    /* ---- Variable Proximity: the headline ---------------------- */
    const h1 = document.querySelector('.lede h1');
    if (h1) {
      const text = h1.textContent.trim().replace(/\s+/g, ' ');
      const R = 130, BASE = 500, PEAK = 780;
      const letters = [];
      const wrap = document.createElement('span');
      wrap.setAttribute('aria-hidden', 'true');
      text.split(' ').forEach((word, i) => {
        if (i) wrap.append(' ');
        const w = document.createElement('span');
        w.className = 'vp__w';            // a word never breaks mid-letter
        for (const ch of word) {
          const s = document.createElement('span');
          s.textContent = ch;
          w.append(s);
          letters.push({ el: s, s: spring(0.3), cx: 0, cy: 0, wght: BASE });
        }
        wrap.append(w);
      });
      h1.setAttribute('aria-label', text);
      h1.replaceChildren(wrap);

      // Centres are measured at rest and kept relative to the headline, so a
      // frame reads one rect, not thirty.
      let axes = '';
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

      tasks.push((dt) => {
        const o = h1.getBoundingClientRect();
        let busy = false;
        for (const l of letters) {
          const d = Math.hypot(ptr.x - o.left - l.cx, ptr.y - o.top - l.cy);
          const t = Math.max(0, 1 - d / R);
          l.s.to = t * t * (3 - 2 * t);
          if (l.s.step(dt)) busy = true;
          const wght = Math.round(BASE + (PEAK - BASE) * Math.max(0, l.s.x));
          if (wght === l.wght) continue;
          l.wght = wght;
          l.el.style.fontVariationSettings = wght === BASE ? '' : `"wght" ${wght}, ${axes}`;
        }
        return busy;
      });
    }

    /* ---- Tilted Card: the two client sites ---------------------- */
    const AMP = 5;                          // degrees; these are big surfaces
    document.querySelectorAll('.case__site a').forEach((a) => {
      const rx = spring(0.4), ry = spring(0.4);
      let over = false, shown = '';
      a.addEventListener('pointerenter', () => { over = true; });
      a.addEventListener('pointerleave', () => { over = false; wake(); });
      tasks.push((dt) => {
        if (over) {
          const r = a.getBoundingClientRect();
          // the half under the pointer presses away, as if touched
          rx.to = -((ptr.y - r.top) / r.height - 0.5) * 2 * AMP;
          ry.to = ((ptr.x - r.left) / r.width - 0.5) * 2 * AMP;
        } else rx.to = ry.to = 0;
        const busy = rx.step(dt) | ry.step(dt);
        const ang = Math.hypot(rx.x, ry.x);
        // one rotation about the combined axis, via the `rotate` property so it
        // composes with the stylesheet's hover lift instead of replacing it
        const next = ang < 0.01 ? '' : `${rx.x.toFixed(4)} ${ry.x.toFixed(4)} 0 ${ang.toFixed(3)}deg`;
        if (next !== shown) a.style.rotate = shown = next;
        return !!busy;
      });
    });

    /* ---- Magnet: the call to action ----------------------------- */
    const cta = document.querySelector('.end__cta');
    if (cta) {
      const PAD = 70, PULL = 13;
      const mx = spring(0.35), my = spring(0.35);
      let shown = '';
      tasks.push((dt) => {
        const r = cta.getBoundingClientRect();
        // measured from where it rests, not where the magnet has moved it
        const dx = ptr.x - (r.left + r.width / 2 - mx.x);
        const dy = ptr.y - (r.top + r.height / 2 - my.x);
        const near = Math.abs(dx) < r.width / 2 + PAD && Math.abs(dy) < r.height / 2 + PAD;
        mx.to = near ? dx / PULL : 0;
        my.to = near ? dy / PULL : 0;
        const busy = mx.step(dt) | my.step(dt);
        const next = Math.abs(mx.x) + Math.abs(my.x) < 0.05 ? '' : `${mx.x.toFixed(2)}px ${my.x.toFixed(2)}px`;
        if (next !== shown) cta.style.translate = shown = next;
        return !!busy;
      });
    }
  }

  const boot = () => {
    document.documentElement.classList.add('js-ready');
    rail();
    plate();
    verifyState();
    bits();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
