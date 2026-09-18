/* =============================================================
   THE VITRINE
   -------------------------------------------------------------
   A lit room holding the two sites, running.

   Both clients send X-Frame-Options, so they cannot be embedded
   live. This is the honest next best thing: real footage of the
   real pages, captured from production, mapped onto planes in a
   real 3D scene, and scrubbed by the visitor's scroll.

   So scrolling this page scrolls the sites it is about. That is
   the whole idea, and it only works because they exist.
   ============================================================= */
(() => {
  'use strict';

  const root = document.querySelector('[data-vitrine]');
  if (!root) return;

  const canvas = root.querySelector('canvas');
  const act = document.querySelector('.stage[data-sc-act]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px)');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // No WebGL at all falls back to the posters, which are already in the markup.
  if (!window.THREE) { root.setAttribute('data-fallback', ''); return; }

  // Reduced motion keeps the room and drops the movement. Falling back to two
  // flat images here was wrong: the depth is the design, not decoration, and
  // "reduce motion" is a common OS setting rather than a rare one. The scene
  // still builds, renders once, and holds.
  const still = reduced.matches;

  const THREE = window.THREE;
  const PANELS = [...root.querySelectorAll('[data-panel]')].map((el) => ({
    el,
    src: coarse.matches && el.dataset.panelSrcMobile ? el.dataset.panelSrcMobile : el.dataset.panelSrc,
    x: parseFloat(el.dataset.panelX) || 0,
    rot: parseFloat(el.dataset.panelRot) || 0,
  }));
  if (!PANELS.length) { root.setAttribute('data-fallback', ''); return; }

  /* ---- scene ---------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  // Fog is doing the depth here rather than a postprocess pass: it costs
  // nothing and it is what stops the far panel reading as a sticker.
  scene.fog = new THREE.Fog(0x080b0e, 6.4, 15.5);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.26, 6.9);

  const PANEL_W = 3.6;
  const PANEL_H = PANEL_W * (640 / 1024);

  const videos = [];
  const group = new THREE.Group();
  scene.add(group);

  PANELS.forEach((p, i) => {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    v.setAttribute('aria-hidden', 'true');
    videos.push({ v, ready: false, dur: 0, head: 0, seeking: false });

    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;

    // The footage is the subject, so it is unlit. Lighting it would tint a
    // screenshot of somebody's real website, which is the one thing that must
    // stay true.
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W, PANEL_H),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );

    // A thin lit surround, which is where the room's light actually lands and
    // what makes the panel read as an object rather than an image.
    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W + 0.075, PANEL_H + 0.075),
      new THREE.MeshBasicMaterial({ color: 0x2a343d }),
    );
    bezel.position.z = -0.006;

    // Reflection: a flipped copy under the floor line, faded out. A real
    // mirror pass costs a second render of the whole scene for something the
    // eye reads in the first 40 pixels.
    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W, PANEL_H),
      new THREE.MeshBasicMaterial({
        map: tex, toneMapped: false, transparent: true, opacity: 0.13,
        depthWrite: false,
      }),
    );
    mirror.scale.y = -1;
    mirror.position.y = -PANEL_H - 0.12;

    const cell = new THREE.Group();
    cell.add(bezel, face, mirror);
    group.add(cell);
    p.cell = cell;
    p.mirror = mirror;
    p.i = i;
  });

  // A soft pool of light behind the panels, so they stand in a room rather
  // than float in a void. Painted as a radial gradient rather than given a
  // flat colour: a plane with hard edges reads as a rectangle somebody forgot
  // to delete, which is exactly what it looked like.
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(46,70,92,0.95)');
  grad.addColorStop(0.45, 'rgba(26,40,54,0.45)');
  grad.addColorStop(1, 'rgba(8,11,14,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 11),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(glowCanvas),
      transparent: true, depthWrite: false, opacity: 0.85,
    }),
  );
  pool.position.set(0, -0.25, -3.2);
  scene.add(pool);

  /* ---- load the footage ------------------------------------------
     Fetched as Blobs so seeking does not depend on the host answering
     range requests, then held until every panel has a painted frame:
     a vitrine that fills in one panel at a time looks broken. */
  let armed = false;
  Promise.all(PANELS.map((p, i) => fetch(p.src)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((b) => {
      const { v } = videos[i];
      v.src = URL.createObjectURL(b);
      return new Promise((res, rej) => {
        v.onloadedmetadata = () => { videos[i].dur = v.duration || 0; v.currentTime = 0; };
        v.onseeked = () => { videos[i].ready = true; res(); };
        v.onerror = () => rej(new Error('decode'));
        setTimeout(res, 9000);
      });
    })))
    .then(() => {
      armed = true;
      root.setAttribute('data-ready', '');
      // With motion reduced there is no loop, so park both clips on a frame
      // that shows something worth seeing and draw the scene once.
      if (still) {
        videos.forEach((s2) => { if (s2.dur) s2.v.currentTime = s2.dur * 0.34; });
        setTimeout(() => { resize(); draw(); }, 400);
      }
    })
    .catch(() => { root.setAttribute('data-fallback', ''); });

  /* ---- scroll is the playhead ------------------------------------ */
  function progress() {
    if (!act) return 0;
    const n = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p'));
    return Number.isFinite(n) ? clamp(n, 0, 1) : 0;
  }

  /* ---- pointer: look into the case ------------------------------- */
  let px = 0, py = 0, tx = 0, ty = 0, dragging = false, lx = 0, ly = 0;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  if (fine.matches && !still) {
    root.addEventListener('pointermove', (e) => {
      if (dragging) return;
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    root.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
  }
  if (!still) root.addEventListener('pointerdown', (e) => {
    dragging = true; lx = e.clientX; ly = e.clientY;
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tx = clamp(tx + (e.clientX - lx) * 0.004, -1.6, 1.6);
    ty = clamp(ty + (e.clientY - ly) * 0.003, -0.9, 0.9);
    lx = e.clientX; ly = e.clientY;
  });
  const release = (e) => { dragging = false; try { root.releasePointerCapture(e.pointerId); } catch {} };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);

  /* ---- loop ------------------------------------------------------- */
  let W = 0, H = 0, alive = false, pS = 0, pInit = false;

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    W = r.width; H = r.height;
    const dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    layout();
    camera.updateProjectionMatrix();
  }

  // Art-directed per frame shape rather than scaled down. Side by side in a
  // landscape frame; stacked and overlapping in a portrait one, because two
  // panels side by side on a phone are two postage stamps.
  let stacked = false;
  function layout() {
    stacked = W / H < 1.05;
    PANELS.forEach((p) => {
      if (stacked) {
        p.cell.position.set(p.i === 0 ? -0.42 : 0.42, p.i === 0 ? 1.28 : -1.28, p.i === 0 ? 0 : 0.35);
        p.cell.rotation.y = p.rot * 0.55;
        p.mirror.visible = p.i === 1;
      } else {
        p.cell.position.set(p.x, 0, 0);
        p.cell.rotation.y = p.rot;
        p.mirror.visible = true;
      }
    });
    camera.position.z = stacked ? 7.4 : 6.9;
    pool.position.y = stacked ? -0.1 : -0.25;
  }

  function draw() {
    if (!W) { resize(); if (!W) return; }
    group.rotation.y = stacked ? -0.06 : -0.14;
    group.rotation.x = 0.02;
    group.position.set(0, 0.02, -0.4);
    camera.lookAt(0, -0.05, 0);
    renderer.render(scene, camera);
  }

  function frame() {
    if (!alive) return;
    requestAnimationFrame(frame);
    if (!W) { resize(); if (!W) return; }

    const target = progress();
    if (!pInit) { pS = target; pInit = true; }
    pS += (target - pS) * 0.11;          // wheel events arrive in lumps

    // scrub each site by the page's own progress
    if (armed) {
      videos.forEach((s) => {
        if (!s.ready || !s.dur) return;
        const want = pS * s.dur;
        s.head += (want - s.head) * 0.2;
        if (!s.seeking && Math.abs(s.v.currentTime - s.head) > 0.01) {
          s.seeking = true;
          s.v.currentTime = s.head;
        }
      });
    }

    px += (tx - px) * 0.055;
    py += (ty - py) * 0.055;

    // the case turns a little as you travel, and a little more as you point
    group.rotation.y = (stacked ? -0.06 : -0.14) + pS * (stacked ? 0.14 : 0.30) + px * 0.16;
    group.rotation.x = 0.02 + py * 0.05;
    group.position.z = -0.9 + pS * (stacked ? 0.7 : 1.15);
    group.position.y = 0.02 - py * 0.06;

    camera.lookAt(0, -0.05, 0);
    renderer.render(scene, camera);
  }

  videos.forEach((s) => s.v.addEventListener('seeked', () => { s.seeking = false; }));

  addEventListener('resize', () => { resize(); if (still) draw(); }, { passive: true });
  new IntersectionObserver((es) => {
    const vis = es.some((e) => e.isIntersecting);
    if (still) { if (vis) { resize(); draw(); } return; }
    if (vis && !alive) { alive = true; resize(); requestAnimationFrame(frame); }
    else if (!vis) alive = false;      // nothing renders offscreen
  }, { rootMargin: '25% 0px' }).observe(root);

  resize();
})();
