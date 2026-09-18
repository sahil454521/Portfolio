/* =============================================================
   Bespoke page code. The engine is untouched.

   Two things live here:
     1. the load-path folio      (the signature move)
     2. the portal frame drawing (the peak)

   Both read scroll the way the engine exposes it and write nothing
   the engine owns.
   ============================================================= */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

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
        if (top <= line) {
          links[i].setAttribute('data-stamped', '');
          here = i;
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
     2 · THE PORTAL FRAME
     ---------------------------------------------------------
     The peak. A pre engineered steel portal frame, which is the
     thing AMG actually manufactures, built in real 3D and drawn
     with a hand written projector: no library, no generated
     image, no video. Scroll assembles it in the order it is
     actually erected. The pointer looks around it.
     =========================================================== */
  function portalFrame() {
    const canvas = document.querySelector('.peak__canvas');
    const act = document.querySelector('.peak[data-sc-act]');
    if (!canvas || !act) return;
    // Reduced motion keeps the drawing and drops the movement: it is rendered
    // once, complete, so the depth and the argument survive.
    const still = reduced.matches;

    const ctx = canvas.getContext('2d');

    /* ---- geometry -------------------------------------------------
       X across the span, Y up, Z along the length.
       One portal = two columns and two rafters to a ridge.          */
    const SPAN = 2.0;      // half span
    const HGT = 1.45;     // eaves height
    const RIDGE = 1.95;     // ridge height, so the roof pitch lands near 14deg
    const FRAMES = 5;        // number of portals
    const GAP = 1.15;     // bay spacing
    const DIST = 7.4;      // camera distance

    const zAt = (i) => (i - (FRAMES - 1) / 2) * GAP;

    // members: {a, b, phase, order, w, kind}
    const members = [];
    const pads = [];

    for (let i = 0; i < FRAMES; i++) {
      const z = zAt(i);
      // foundation pads
      pads.push({ p: [-SPAN, 0, z], order: i });
      pads.push({ p: [SPAN, 0, z], order: i });
      // columns
      members.push({ a: [-SPAN, 0, z], b: [-SPAN, HGT, z], phase: 1, order: i * 2, w: 2.4, kind: 'steel' });
      members.push({ a: [SPAN, 0, z], b: [SPAN, HGT, z], phase: 1, order: i * 2 + 1, w: 2.4, kind: 'steel' });
      // rafters
      members.push({ a: [-SPAN, HGT, z], b: [0, RIDGE, z], phase: 2, order: i * 2, w: 2.1, kind: 'steel' });
      members.push({ a: [SPAN, HGT, z], b: [0, RIDGE, z], phase: 2, order: i * 2 + 1, w: 2.1, kind: 'steel' });
    }

    // purlins and side rails run along the length, so they are what turns
    // five separate portals into one building
    for (let i = 0; i < FRAMES - 1; i++) {
      const z1 = zAt(i), z2 = zAt(i + 1);
      const runs = [
        [[0, RIDGE, z1], [0, RIDGE, z2]],
        [[-SPAN * 0.5, (HGT + RIDGE) / 2, z1], [-SPAN * 0.5, (HGT + RIDGE) / 2, z2]],
        [[SPAN * 0.5, (HGT + RIDGE) / 2, z1], [SPAN * 0.5, (HGT + RIDGE) / 2, z2]],
        [[-SPAN, HGT, z1], [-SPAN, HGT, z2]],
        [[SPAN, HGT, z1], [SPAN, HGT, z2]],
        [[-SPAN, HGT * 0.55, z1], [-SPAN, HGT * 0.55, z2]],
        [[SPAN, HGT * 0.55, z1], [SPAN, HGT * 0.55, z2]],
      ];
      runs.forEach((r, k) => members.push({ a: r[0], b: r[1], phase: 3, order: i * 7 + k, w: 1.1, kind: 'purlin' }));
    }

    // services: the runs under the roof. Drawn in the accent because on the
    // real delivered job they are painted red, which is where this page's
    // accent came from in the first place.
    for (let i = 0; i < FRAMES - 1; i++) {
      const z1 = zAt(i), z2 = zAt(i + 1);
      [-0.85, -0.3, 0.3, 0.85].forEach((xo, k) => {
        members.push({
          a: [xo, HGT * 0.92, z1], b: [xo, HGT * 0.92, z2],
          phase: 4, order: i * 4 + k, w: 1.4, kind: 'service',
        });
      });
    }

    // cladding panels: faint quads on the roof planes, added last
    const panels = [];
    for (let i = 0; i < FRAMES - 1; i++) {
      const z1 = zAt(i), z2 = zAt(i + 1);
      // roof planes
      panels.push({ q: [[-SPAN, HGT, z1], [0, RIDGE, z1], [0, RIDGE, z2], [-SPAN, HGT, z2]], order: i * 4 });
      panels.push({ q: [[SPAN, HGT, z1], [0, RIDGE, z1], [0, RIDGE, z2], [SPAN, HGT, z2]], order: i * 4 + 1 });
      // side wall sheeting, which is what stops it reading as a tent
      panels.push({ q: [[-SPAN, 0, z1], [-SPAN, HGT, z1], [-SPAN, HGT, z2], [-SPAN, 0, z2]], order: i * 4 + 2 });
      panels.push({ q: [[SPAN, 0, z1], [SPAN, HGT, z1], [SPAN, HGT, z2], [SPAN, 0, z2]], order: i * 4 + 3 });
    }
    // gable ends
    [0, FRAMES - 1].forEach((i, k) => {
      const z = zAt(i);
      panels.push({
        q: [[-SPAN, 0, z], [-SPAN, HGT, z], [0, RIDGE, z], [SPAN, HGT, z], [SPAN, 0, z]],
        order: (FRAMES - 2) * 4 + k,
      });
    });

    /* ---- schedule: when each thing arrives -------------------------
       Five phases across the act, in erection order. Within a phase
       members arrive in sequence so the eye can follow the crew.    */
    // Front loaded: p is 0 for the whole viewport the stage spends sliding in,
    // so a slow first phase means a screen of almost nothing. The pads are
    // quick and the two rich phases get the room.
    const PHASE = [
      [0.00, 0.12],  // 0 pads
      [0.08, 0.30],  // 1 columns
      [0.26, 0.52],  // 2 rafters
      [0.46, 0.76],  // 3 purlins, sheeting, cladding
      [0.70, 0.94],  // 4 services
    ];
    const maxOrder = (arr) => arr.reduce((m, o) => Math.max(m, o.order), 0);
    const oPads = maxOrder(pads);
    const oPan = maxOrder(panels);
    const oMem = {};
    members.forEach((m) => { oMem[m.phase] = Math.max(oMem[m.phase] || 0, m.order); });

    function localT(p, phase, order, maxO) {
      const [s, e] = PHASE[phase];
      const stagger = 0.55;                       // how much of the window is sequencing
      const w = (e - s) * (1 - stagger);
      const start = s + (e - s) * stagger * (maxO ? order / maxO : 0);
      return clamp((p - start) / Math.max(w, 0.01), 0, 1);
    }

    /* ---- camera ---------------------------------------------------- */
    let yaw = -0.62, pitch = 0.16;
    let yawT = yaw, pitchT = pitch;
    let dragging = false, lastX = 0, lastY = 0;

    function project(pt, w, h) {
      const [px, py, pz] = pt;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      let X = px * cy - pz * sy;
      let Z = px * sy + pz * cy;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      let Y = py * cp - Z * sp;
      Z = py * sp + Z * cp;

      // Fit the building to the box rather than to a magic number: the
      // vertical term keeps the ridge off the top edge, the horizontal term
      // keeps the gable ends inside the gutters at any aspect ratio.
      const s0 = Math.min(h * 0.27, w * 0.150);
      const f = s0 * DIST;
      const d = Z + DIST;
      const s = f / d;
      // anchor so the middle of the building sits a little above centre
      const yAnchor = h * 0.54 + (RIDGE * 0.5) * s0;
      return { x: w / 2 + X * s, y: yAnchor - Y * s, z: d, s };
    }

    /* ---- render ---------------------------------------------------- */
    let dpr = 1, W = 0, H = 0;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const css = getComputedStyle(document.querySelector('.ch--structure'));
    const INK = css.getPropertyValue('--sc-ink').trim() || '#EDEEEF';
    const ACCENT = css.getPropertyValue('--sc-accent').trim() || '#FF6A4D';
    const SOFT = css.getPropertyValue('--sc-ink-soft').trim() || '#9AA1A8';

    // depth cue: further members are thinner and quieter. Without this it
    // reads as a flat diagram rather than a thing standing in space.
    const depthA = (z) => clamp(1.35 - (z - 5.2) * 0.30, 0.22, 1);

    function line(a, b, t, colour, weight) {
      if (t <= 0) return;
      const A = project(a, W, H);
      const B = project(b, W, H);
      const ex = lerp(A.x, B.x, t), ey = lerp(A.y, B.y, t);
      const dim = depthA((A.z + B.z) / 2);
      ctx.globalAlpha = dim * clamp(t * 2.2, 0, 1);
      ctx.strokeStyle = colour;
      ctx.lineWidth = weight * dim * (A.s / 90 + 0.55);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    function node(p, t) {
      if (t <= 0) return;
      const P = project(p, W, H);
      const dim = depthA(P.z);
      ctx.globalAlpha = dim * t;
      ctx.fillStyle = INK;
      const r = 2.0 * dim;
      ctx.beginPath();
      ctx.arc(P.x, P.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function pad(p, t) {
      if (t <= 0) return;
      const s = 0.26 * t;
      const q = [
        [p[0] - s, 0, p[2] - s], [p[0] + s, 0, p[2] - s],
        [p[0] + s, 0, p[2] + s], [p[0] - s, 0, p[2] + s],
      ].map((v) => project(v, W, H));
      const dim = depthA(q[0].z);
      ctx.globalAlpha = dim * 0.9 * t;
      ctx.fillStyle = SOFT;
      ctx.beginPath();
      q.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
      ctx.closePath();
      ctx.globalAlpha = dim * 0.22 * t;
      ctx.fill();
      ctx.globalAlpha = dim * 0.8 * t;
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function panel(q, t) {
      if (t <= 0) return;
      const pr = q.map((v) => project(v, W, H));
      const dim = depthA(pr.reduce((s, v) => s + v.z, 0) / 4);
      ctx.globalAlpha = dim * 0.13 * t;
      ctx.fillStyle = INK;
      ctx.beginPath();
      pr.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
      ctx.closePath();
      ctx.fill();
    }

    // Setting out: the whole frame drawn faint and dashed from the first
    // frame, the way a drawing carries its setting-out lines before anything
    // is built. It also means the stage is never an empty screen while the
    // act slides in and p is still pinned at 0.
    function settingOut() {
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 1;
      members.forEach((m) => {
        if (m.kind === 'service') return;
        const A = project(m.a, W, H), B = project(m.b, W, H);
        ctx.globalAlpha = depthA((A.z + B.z) / 2) * 0.30;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      });
      ctx.restore();
    }

    function ground() {
      // a setting-out grid, so the frame stands on something
      ctx.globalAlpha = 0.10;
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 1;
      const ext = 3.4, zext = (FRAMES - 1) / 2 * GAP + 1.1;
      for (let gx = -3; gx <= 3; gx++) {
        const A = project([gx * (ext / 3), 0, -zext], W, H);
        const B = project([gx * (ext / 3), 0, zext], W, H);
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      for (let gz = -3; gz <= 3; gz++) {
        const A = project([-ext, 0, gz * (zext / 3)], W, H);
        const B = project([ext, 0, gz * (zext / 3)], W, H);
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
    }

    function progress() {
      if (still) return 1;
      const raw = getComputedStyle(act).getPropertyValue('--sc-p');
      const n = parseFloat(raw);
      return Number.isFinite(n) ? clamp(n, 0, 1) : 0;
    }

    function render() {
      if (!W) resize();
      if (!W) return;
      const p = progress();

      // the camera orbits a little across the act, so the building is read
      // from more than one side without the reader doing anything
      yawT = -0.86 + p * 0.52;
      if (still) { yaw = yawT; pitch = pitchT; }
      else {
        pitch += (pitchT - pitch) * 0.08;
        yaw += (yawT + dragYaw - yaw) * 0.08;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ground();
      settingOut();

      // painter's algorithm: far things first
      const draws = [];
      pads.forEach((o) => {
        const t = localT(p, 0, o.order, oPads);
        if (t > 0) draws.push({ z: project(o.p, W, H).z, fn: () => pad(o.p, t) });
      });
      panels.forEach((o) => {
        const t = localT(p, 3, o.order, oPan);
        if (t > 0) {
          const zz = o.q.reduce((s, v) => s + project(v, W, H).z, 0) / 4;
          draws.push({ z: zz + 0.01, fn: () => panel(o.q, t) });
        }
      });
      members.forEach((m) => {
        const t = localT(p, m.phase, m.order, oMem[m.phase]);
        if (t <= 0) return;
        const zz = (project(m.a, W, H).z + project(m.b, W, H).z) / 2;
        const colour = m.kind === 'service' ? ACCENT : m.kind === 'purlin' ? SOFT : INK;
        draws.push({
          z: zz,
          fn: () => {
            line(m.a, m.b, t, colour, m.w);
            if (m.kind === 'steel' && t > 0.9) { node(m.a, t); node(m.b, t); }
          },
        });
      });

      draws.sort((a, b) => b.z - a.z).forEach((d) => d.fn());
      ctx.globalAlpha = 1;
    }

    /* ---- pointer: look around it ------------------------------------ */
    let dragYaw = 0, dragYawT = 0;
    if (!still) {
    canvas.addEventListener('pointerdown', (e) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dragYawT = clamp(dragYawT + (e.clientX - lastX) * 0.006, -0.9, 0.9);
      pitchT = clamp(pitchT + (e.clientY - lastY) * 0.003, -0.05, 0.55);
      lastX = e.clientX; lastY = e.clientY;
    });
    const release = (e) => {
      dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    }

    /* ---- loop, gated to visibility ----------------------------------- */
    let alive = false;
    function loop() {
      if (!alive) return;
      dragYaw += (dragYawT - dragYaw) * 0.09;
      render();
      requestAnimationFrame(loop);
    }
    if (!still) {
      const io = new IntersectionObserver((entries) => {
        const vis = entries.some((en) => en.isIntersecting);
        if (vis && !alive) { alive = true; resize(); requestAnimationFrame(loop); }
        else if (!vis) alive = false;
      }, { rootMargin: '30% 0px' });
      io.observe(act);
    }

    addEventListener('resize', () => { resize(); render(); }, { passive: true });

    // The canvas is laid out inside a sticky stage, so its box can arrive
    // after first paint and can change without a window resize. Watching the
    // element itself is what stops a still render landing on a zero-size box.
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => { resize(); render(); }).observe(canvas);
    }
    resize();
    render();
  }

  const boot = () => {
    document.documentElement.classList.add('js-ready');
    folio();
    portalFrame();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
