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
    const DIST = 6.4;      // camera distance. Closer reads as more perspective.

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
      panels.push({ q: [[-SPAN, HGT, z1], [0, RIDGE, z1], [0, RIDGE, z2], [-SPAN, HGT, z2]], order: i * 4, alpha: 0.55 });
      panels.push({ q: [[SPAN, HGT, z1], [0, RIDGE, z1], [0, RIDGE, z2], [SPAN, HGT, z2]], order: i * 4 + 1, alpha: 0.55 });
      // side wall sheeting, which is what stops it reading as a tent. Kept
      // light enough to see the frame through, because the frame is the point.
      panels.push({ q: [[-SPAN, 0, z1], [-SPAN, HGT, z1], [-SPAN, HGT, z2], [-SPAN, 0, z2]], order: i * 4 + 2, alpha: 0.28 });
      panels.push({ q: [[SPAN, 0, z1], [SPAN, HGT, z1], [SPAN, HGT, z2], [SPAN, 0, z2]], order: i * 4 + 3, alpha: 0.28 });
    }
    // gable ends
    [0, FRAMES - 1].forEach((i, k) => {
      const z = zAt(i);
      panels.push({
        q: [[-SPAN, 0, z], [-SPAN, HGT, z], [0, RIDGE, z], [SPAN, HGT, z], [SPAN, 0, z]],
        order: (FRAMES - 2) * 4 + k,
        alpha: 0.3,
      });
    });

    /* ---- schedule: when each thing arrives -------------------------
       Five phases across the act, in erection order. Within a phase
       members arrive in sequence so the eye can follow the crew.    */
    // Front loaded: p is 0 for the whole viewport the stage spends sliding in,
    // so a slow first phase means a screen of almost nothing. The pads are
    // quick and the two rich phases get the room.
    // The assembly finishes at 0.60 and the last 40% belongs to the resolve,
    // where the drawing dissolves into the photograph. Nothing holds on an
    // unchanging frame: that is what made the act feel stuck.
    const PHASE = [
      [0.00, 0.07],  // 0 pads
      [0.05, 0.19],  // 1 columns
      [0.16, 0.33],  // 2 rafters
      [0.29, 0.48],  // 3 purlins, sheeting, cladding
      [0.44, 0.60],  // 4 services
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
    let yaw = -0.92, pitch = 0.21;
    let yawT = yaw, pitchT = pitch;
    let dragging = false, lastX = 0, lastY = 0;

    // Rotation alone, with no perspective. Face normals go through this so a
    // back face can be told from a front one.
    function rot(pt) {
      const [px, py, pz] = pt;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const X = px * cy - pz * sy;
      const Z0 = px * sy + pz * cy;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      return [X, py * cp - Z0 * sp, py * sp + Z0 * cp];
    }

    function project(pt, w, h) {
      const [X, Y, Z] = rot(pt);

      // Fit the building to the box rather than to a magic number: the
      // vertical term keeps the ridge off the top edge, the horizontal term
      // keeps the gable ends inside the gutters at any aspect ratio.
      const s0 = Math.min(h * 0.235, w * 0.128);
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
    const hex = (v, fb) => {
      const s = (v || '').trim() || fb;
      const m = /^#?([0-9a-f]{6})$/i.exec(s);
      if (!m) return [237, 238, 239];
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const INK_C = hex(css.getPropertyValue('--sc-ink'), '#EDEEEF');
    const ACC_C = hex(css.getPropertyValue('--sc-accent'), '#FF6A4D');
    const SOFT_C = hex(css.getPropertyValue('--sc-ink-soft'), '#9AA1A8');
    const SOFT = 'rgb(' + SOFT_C.join(',') + ')';

    /* ---- small vector helpers -------------------------------------- */
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const nrm = (a) => {
      const l = Math.hypot(a[0], a[1], a[2]) || 1;
      return [a[0] / l, a[1] / l, a[2] / l];
    };

    // One fixed light in world space, from high front left. Fixed rather than
    // camera-relative, so turning the building changes which faces are lit,
    // which is the whole reason it reads as an object instead of a diagram.
    const LIGHT = nrm([-0.42, 0.82, -0.39]);

    // depth cue for the remaining line work
    const depthA = (z) => clamp(1.35 - (z - 4.0) * 0.30, 0.22, 1);

    /* ---- a member is a solid, not a line ----------------------------
       Six quads with outward normals, shaded against the light and depth
       sorted with everything else. This is the change that makes the frame
       read as steel standing in space rather than as a wireframe.        */
    function boxFaces(a, b, hw, hh) {
      const d = nrm(sub(b, a));
      const ref = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u = nrm(cross(d, ref));
      const v = nrm(cross(u, d));
      const ends = [a, b];
      const c = [];
      for (const e of ends) {
        for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          c.push(add(e, add(mul(u, su * hw), mul(v, sv * hh))));
        }
      }
      const centre = mul(add(a, b), 0.5);
      const idx = [
        [0, 1, 2, 3], [4, 5, 6, 7],
        [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0],
      ];
      return idx.map((f) => {
        let q = f.map((i) => c[i]);
        let n = nrm(cross(sub(q[1], q[0]), sub(q[2], q[0])));
        const mid = mul(q.reduce(add, [0, 0, 0]), 0.25);
        // force the normal outward, so back-face culling is reliable
        if (dot(sub(mid, centre), n) < 0) { q = [q[0], q[3], q[2], q[1]]; n = mul(n, -1); }
        return { q, n };
      });
    }

    function pushSolid(list, a, b, t, rgb, hw, hh) {
      // members grow from their start point, so the eye follows the erection
      const end = [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
      if (Math.hypot(...sub(end, a)) < 1e-4) return;
      for (const f of boxFaces(a, end, hw, hh)) {
        if (rot(f.n)[2] >= 0) continue;                     // facing away
        const pr = f.q.map((v) => project(v, W, H));
        const z = (pr[0].z + pr[1].z + pr[2].z + pr[3].z) / 4;
        const k = 0.30 + 0.70 * Math.max(0, dot(f.n, LIGHT));
        const fog = clamp(1.15 - (z - 4.2) * 0.13, 0.55, 1);
        const col = 'rgb(' + rgb.map((c) => Math.round(c * k * fog)).join(',') + ')';
        list.push({ z, fn: () => fillQuad(pr, col, clamp(t * 3, 0, 1)) });
      }
    }

    function fillQuad(pr, col, alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(pr[0].x, pr[0].y);
      for (let i = 1; i < pr.length; i++) ctx.lineTo(pr[i].x, pr[i].y);
      ctx.closePath();
      ctx.fill();
    }

    function pad(p, t) {
      if (t <= 0) return;
      const s = 0.30 * t;
      const q = [
        [p[0] - s, 0.012, p[2] - s], [p[0] + s, 0.012, p[2] - s],
        [p[0] + s, 0.012, p[2] + s], [p[0] - s, 0.012, p[2] + s],
      ].map((v) => project(v, W, H));
      ctx.globalAlpha = 0.5 * t;
      ctx.fillStyle = 'rgb(' + SOFT_C.map((c) => Math.round(c * 0.45)).join(',') + ')';
      ctx.beginPath();
      q.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.65 * t;
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // cladding: a real surface, lit like one
    function panel(q, t, rgb, alpha) {
      if (t <= 0) return;
      const pr = q.map((v) => project(v, W, H));
      const n = nrm(cross(sub(q[1], q[0]), sub(q[2], q[0])));
      const facing = rot(n)[2] < 0 ? n : mul(n, -1);
      const k = 0.10 + 0.26 * Math.max(0, dot(facing, LIGHT));
      fillQuad(pr, 'rgb(' + rgb.map((c) => Math.round(c * k)).join(',') + ')', alpha * t);
    }

    // the building throws a shadow, which is most of what anchors it
    function groundShadow(t) {
      if (t <= 0) return;
      const off = [LIGHT[0] * -0.55, 0, LIGHT[2] * -0.55];
      const zext = ((FRAMES - 1) / 2) * GAP;
      const q = [
        [-SPAN * 1.04, 0.004, -zext], [SPAN * 1.04, 0.004, -zext],
        [SPAN * 1.04, 0.004, zext], [-SPAN * 1.04, 0.004, zext],
      ].map((v) => project(add(v, off), W, H));
      ctx.globalAlpha = 0.34 * t;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      q.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
      ctx.closePath();
      ctx.filter = 'blur(14px)';
      ctx.fill();
      ctx.filter = 'none';
    }

    // Setting out: the whole frame drawn faint and dashed from the first
    // frame, the way a drawing carries its setting-out lines before anything
    // is built. It also means the stage is never an empty screen while the
    // act slides in and p is still pinned at 0.
    function settingOut(p) {
      const fade = clamp(1 - (p - 0.45) * 2.2, 0, 1);
      if (fade <= 0.01) return;
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 1.3;
      members.forEach((m) => {
        if (m.kind === 'service') return;
        const A = project(m.a, W, H), B = project(m.b, W, H);
        ctx.globalAlpha = depthA((A.z + B.z) / 2) * 0.9 * fade;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      });
      ctx.restore();
    }

    function ground() {
      ctx.globalAlpha = 0.10;
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 1;
      const ext = 3.6, zext = ((FRAMES - 1) / 2) * GAP + 1.2;
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

    // Scroll is not a smooth input: wheel events arrive in lumps, so a value
    // read straight off --sc-p steps and the whole frame judders with it.
    // Everything downstream reads this lerped value instead.
    let pS = 0, pReady = false;
    function progress() {
      if (still) return 1;
      const raw = getComputedStyle(act).getPropertyValue('--sc-p');
      const n = parseFloat(raw);
      const target = Number.isFinite(n) ? clamp(n, 0, 1) : 0;
      if (!pReady) { pS = target; pReady = true; }
      pS += (target - pS) * 0.12;
      return pS;
    }

    const SECTION = {
      steel: [0.058, 0.115],
      purlin: [0.026, 0.048],
      service: [0.022, 0.022],
    };

    function render() {
      if (!W) resize();
      if (!W) return;
      const p = progress();

      // The camera orbits across the act, so the building is read from more
      // than one side without the reader doing anything. A slow breath is
      // added on top: a frozen render reads as a broken page even when it is
      // correct, and this is what keeps the frame alive once it is complete.
      const breath = still ? 0 : Math.sin(performance.now() / 4200) * 0.045;
      yawT = -0.92 + p * 0.62 + breath;
      if (still) { yaw = -0.92 + p * 0.62; pitch = pitchT; }
      else {
        pitch += (pitchT + Math.sin(performance.now() / 5600) * 0.012 - pitch) * 0.06;
        yaw += (yawT + dragYaw - yaw) * 0.09;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ground();
      groundShadow(clamp((p - 0.10) * 3, 0, 1) * 0.9);
      settingOut(p);

      // painter's algorithm: far things first
      const draws = [];
      pads.forEach((o) => {
        const t = localT(p, 0, o.order, oPads);
        if (t > 0) draws.push({ z: project(o.p, W, H).z + 0.4, fn: () => pad(o.p, t) });
      });
      panels.forEach((o) => {
        const t = localT(p, 3, o.order, oPan);
        if (t > 0) {
          const zz = o.q.reduce((s, v) => s + project(v, W, H).z, 0) / o.q.length;
          draws.push({ z: zz + 0.02, fn: () => panel(o.q, t, INK_C, o.alpha) });
        }
      });
      members.forEach((m) => {
        const t = localT(p, m.phase, m.order, oMem[m.phase]);
        if (t <= 0) return;
        const rgb = m.kind === 'service' ? ACC_C : m.kind === 'purlin' ? SOFT_C : INK_C;
        const [hw, hh] = SECTION[m.kind] || SECTION.steel;
        pushSolid(draws, m.a, m.b, t, rgb, hw, hh);
      });

      draws.sort((a, b) => b.z - a.z);
      for (const d of draws) d.fn();
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

  /* ===========================================================
     3 · THE AUTHOR'S PLATE
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

  const boot = () => {
    document.documentElement.classList.add('js-ready');
    folio();
    portalFrame();
    authorPlate();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
