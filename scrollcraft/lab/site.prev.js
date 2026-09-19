/* =============================================================
   Bespoke page code. The engine is untouched.

   Two things live here:
     1. the load-path folio   (the signature move)
     2. the author's plate    (the closing clip)
     3. verify state          (so the peak is visible to the harness)

   The peak needs no JavaScript at all: its plates and its survey
   are driven from the act's --sc-p in CSS, which composites
   rather than relaying out.

   Both read scroll the way the engine exposes it and write nothing
   the engine owns.
   ============================================================= */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ===========================================================
     1 · THE LOAD-PATH FOLIO
     ---------------------------------------------------------
     A structural elevation standing in the margin. It is a real
     1D mass-spring chain: 56 nodes with lateral freedom, pinned
     at both ends, solved every frame. Scrolling loads it, so the
     member deflects and rings the way a loaded member actually
     does, and settles when you stop.

     Passing a chapter stamps its node. By the colophon the
     margin holds a drawn section of the document you just read,
     and every node is a link.
     =========================================================== */
  function folio() {
    const root = document.querySelector('.folio');
    if (!root) return;
    const path = root.querySelector('.folio__member');
    const links = [...root.querySelectorAll('[data-folio-node]')];
    const targets = links.map((a) => document.querySelector(a.getAttribute('href')));

    const N = 56;
    const x = new Float32Array(N);   // lateral displacement
    const v = new Float32Array(N);   // lateral velocity
    const REST = 60;                 // the datum, in viewBox units
    const H = 1000;

    // physics constants, tuned so a normal scroll bends it a few units and a
    // flick makes it ring twice before settling. Past that it reads as jelly.
    const K_NEIGHBOUR = 0.32;
    const K_REST = 0.014;
    const DAMP = 0.918;
    const DRIVE = 0.34;
    const MAX = 26;

    let lastY = window.scrollY;
    let running = false;

    function load() {
      const y = window.scrollY;
      const dv = y - lastY;
      lastY = y;
      if (!dv) return;

      const doc = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = clamp(y / doc, 0, 1);
      const hit = Math.round(p * (N - 1));
      const force = clamp(dv, -90, 90) * DRIVE;

      // load spreads over a few nodes; a point load on one node looks like a spike
      for (let o = -3; o <= 3; o++) {
        const i = hit + o;
        if (i <= 0 || i >= N - 1) continue;
        v[i] += force * (1 - Math.abs(o) / 4) / 3;
      }
      start();
    }

    function step() {
      let energy = 0;
      for (let i = 1; i < N - 1; i++) {
        const pull = (x[i - 1] + x[i + 1] - 2 * x[i]) * K_NEIGHBOUR;
        v[i] += pull - x[i] * K_REST;
        v[i] *= DAMP;
        x[i] = clamp(x[i] + v[i], -MAX, MAX);
        energy += Math.abs(v[i]) + Math.abs(x[i]) * 0.02;
      }
      x[0] = x[N - 1] = 0;
      v[0] = v[N - 1] = 0;
      return energy;
    }

    function draw() {
      let d = '';
      for (let i = 0; i < N; i++) {
        const py = (i / (N - 1)) * H;
        const px = REST + x[i];
        d += (i ? 'L' : 'M') + px.toFixed(2) + ' ' + py.toFixed(1);
      }
      path.setAttribute('d', d);
    }

    function frame() {
      const energy = step();
      draw();
      if (energy > 0.05) requestAnimationFrame(frame);
      else running = false;
    }

    function start() {
      if (running || reduced.matches) return;
      running = true;
      requestAnimationFrame(frame);
    }

    // stamping: a chapter is stamped once its head has crossed the reading line
    function stamp() {
      const line = innerHeight * 0.42;
      let here = -1;
      targets.forEach((el, i) => {
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        // Stamps track position rather than accumulating forever. A folio that
        // shows every chapter stamped while you are still on the title page is
        // telling you something untrue about where you are.
        if (top <= line) {
          links[i].setAttribute('data-stamped', '');
          here = i;
        } else {
          links[i].removeAttribute('data-stamped');
        }
      });
      links.forEach((a, i) => a.toggleAttribute('data-here', i === here));
    }

    draw();
    stamp();

    let ticking = false;
    addEventListener('scroll', () => {
      load();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { stamp(); ticking = false; });
      }
    }, { passive: true });

    // reduced motion keeps the meaning (stamps, position, navigation) and
    // drops the deflection only.
    reduced.addEventListener('change', () => {
      if (reduced.matches) { x.fill(0); v.fill(0); draw(); }
    });
  }

  /* ===========================================================
     2 · THE AUTHOR'S PLATE
     ---------------------------------------------------------
     The closing clip, scrubbed by the last stretch of scroll on
     the page, so it finishes exactly as the document does. It
     never plays on its own and has no audio track.

     Three mechanisms carried over from how the engine drives its
     own clips, because a naive implementation of this looks
     broken in three specific ways:
       - fetch as a Blob, so seeking does not depend on the host
         answering range requests
       - lerp the playhead, because wheel events arrive in lumps
         and a 1:1 write reproduces every gap in them
       - never queue a seek while the decoder is still resolving
         the last one, or a fast flick piles them up and freezes
     =========================================================== */
  function authorPlate() {
    const fig = document.querySelector('[data-scrub]');
    if (!fig || reduced.matches) return;          // reduced motion keeps the poster
    const video = fig.querySelector('video');
    if (!video) return;

    const src = (innerWidth <= 760 && fig.dataset.scrubSrcMobile)
      ? fig.dataset.scrubSrcMobile
      : fig.dataset.scrubSrc;

    let ready = false, dur = 0, target = 0, playhead = 0, seeking = false, alive = false;

    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
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
        // wait for a real painted frame before dropping the poster
        const show = () => { ready = true; fig.setAttribute('data-ready', ''); };
        if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(show);
        else video.onseeked = show;
        start();
      })
      .catch(() => { /* poster stays; nothing else to do */ });

    // Mapped against the page's remaining scroll rather than the element's own
    // travel: the colophon is the last thing on the page, so it never fully
    // passes through the viewport and an element-travel mapping would stop
    // short of the final frame.
    function progress() {
      const r = fig.getBoundingClientRect();
      const startY = scrollY + r.top - innerHeight;
      const maxY = document.documentElement.scrollHeight - innerHeight;
      const span = Math.max(maxY - startY, 1);
      return clamp((scrollY - startY) / span, 0, 1);
    }

    function frame() {
      if (!alive) return;
      if (ready && dur) {
        target = progress() * dur;
        playhead += (target - playhead) * 0.18;
        const gap = Math.abs(video.currentTime - playhead);
        const dead = innerWidth <= 760 ? 0.020 : 0.008;
        if (!seeking && gap > dead) {
          seeking = true;
          video.currentTime = playhead;
        }
      }
      requestAnimationFrame(frame);
    }
    video.addEventListener('seeked', () => { seeking = false; });

    function start() {
      if (alive) return;
      alive = true;
      requestAnimationFrame(frame);
    }

    // only run the loop while the plate is anywhere near the screen
    new IntersectionObserver((es) => {
      const vis = es.some((e) => e.isIntersecting);
      if (vis) start();
      else alive = false;
    }, { rootMargin: '60% 0px' }).observe(fig);
  }


  /* ===========================================================
     3 · VERIFY STATE
     ---------------------------------------------------------
     The peak is driven entirely from --sc-p in CSS, so it uses
     none of the engine's own devices. The dead-scroll check
     compares engine state rather than pixels, which means an
     act like this one is invisible to it and would be reported
     dead however much it actually moves.

     shoot.mjs reads [data-sc-verify-state] for exactly this
     case. This publishes a compact description of what is
     actually on screen, so the check sees the real thing.
     =========================================================== */
  function verifyState() {
    const act = document.querySelector('.peak[data-sc-act]');
    const fig = document.querySelector('.fig');
    if (!act || !fig) return;

    let last = '', queued = false, near = false;

    const write = () => {
      queued = false;
      const p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0;
      const enter = clamp((p - 0.20) * 1.85, 0, 1);
      const marks = [0, 1, 2, 3].filter((i) => p > 0.17 + i * 0.21).length;
      const datum = clamp((p - 0.55) / 0.42, 0, 1);
      const s = 'p' + p.toFixed(2) + ' in' + enter.toFixed(2) +
                ' m' + marks + ' d' + datum.toFixed(2);
      if (s !== last) { fig.setAttribute('data-sc-verify-state', s); last = s; }
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

  const boot = () => {
    document.documentElement.classList.add('js-ready');
    folio();
    authorPlate();
    verifyState();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
