/* =============================================================
   Page code. The engine is untouched, and the vitrine lives in
   its own file.

   Three small things:
     1. the rail       (where you are)
     2. the plate      (the closing clip, scrubbed by scroll)
     3. verify state   (so the pinned hero is visible to the
                        verification harness, which compares
                        engine state rather than pixels)
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

  const boot = () => {
    document.documentElement.classList.add('js-ready');
    rail();
    plate();
    verifyState();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
