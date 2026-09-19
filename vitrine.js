/* =============================================================
   THE VITRINE
   -------------------------------------------------------------
   A lit room holding every live project as an object you can
   pick up.

   None of these can be embedded: the two client sites send
   X-Frame-Options, and the rest would be slow and fragile as
   iframes. These are stills of the real pages, captured from
   production, standing as planes in a real 3D scene.

   Scroll rotates the row. Whichever project reaches the centre
   comes forward and takes the room; the others sit back beside
   it, angled away. Clicking any one opens that site.

   Every panel is fully opaque at all times. Nothing dissolves
   into anything else, so no site is ever seen through another.
   ============================================================= */
(() => {
  'use strict';

  const root = document.querySelector('[data-vitrine]');
  if (!root) return;

  const canvas = root.querySelector('canvas');
  const act = document.querySelector('.stage[data-sc-act]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  if (!window.THREE) { root.setAttribute('data-fallback', ''); return; }

  // Reduced motion drops the camera, not the content. The row still rotates
  // on scroll, because that is the page working rather than an effect; what
  // goes is the easing and the pointer lean.
  const still = reduced.matches;

  const THREE = window.THREE;
  const PANELS = [...root.querySelectorAll('[data-panel]')].map((el, i) => ({
    el, i,
    src: el.dataset.panelSrc,
    name: el.dataset.panelName || '',
    host: el.dataset.panelHost || '',
    kind: el.dataset.panelKind || '',
  }));
  if (!PANELS.length) { root.setAttribute('data-fallback', ''); return; }
  const N = PANELS.length;

  const showing = root.querySelector('[data-showing]');
  const showN = root.querySelector('[data-showing-n]');
  const showName = root.querySelector('[data-showing-name]');
  const showHost = root.querySelector('[data-showing-host]');
  const showKind = root.querySelector('[data-showing-kind]');

  /* ---- scene ---------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xeaedef, 8.5, 20);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const PANEL_W = 3.15;
  const PANEL_H = PANEL_W * (1080 / 1680);

  // How the row is arranged. A panel's place comes from its distance from
  // whichever one currently holds the centre, so this scales to any number of
  // projects without a slot per project.
  const STEP_X = 2.45;      // sideways spacing between neighbours
  const STEP_Z = 1.45;      // how far each step falls back
  const SMALL = 0.52;       // scale of a panel once it is off centre
  const TURN = 0.42;        // how far an off centre panel angles away
  const VISIBLE = 2;        // neighbours drawn either side; the rest are hidden

  // The share of the frame the centre panel takes. This decides whether the
  // site on it is legible: each still holds a whole page, so a small panel
  // shows that page at well under half size and no source resolution fixes it.
  const FILL_WIDE = 0.60;
  const FILL_STACKED = 0.92;

  const loader = new THREE.TextureLoader();
  const group = new THREE.Group();
  scene.add(group);

  const quad = new THREE.PlaneGeometry(PANEL_W, PANEL_H);

  PANELS.forEach((p) => {
    const face = new THREE.Mesh(quad, new THREE.MeshBasicMaterial({
      toneMapped: false, transparent: true, opacity: 0,
    }));
    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W + 0.07, PANEL_H + 0.07),
      new THREE.MeshBasicMaterial({ color: 0x9aa7b0, transparent: true, opacity: 0 }),
    );
    bezel.position.z = -0.006;
    const mirror = new THREE.Mesh(quad, new THREE.MeshBasicMaterial({
      toneMapped: false, transparent: true, opacity: 0, depthWrite: false,
    }));
    mirror.scale.y = -0.5;
    mirror.position.y = -(PANEL_H / 2) - (PANEL_H * 0.5 / 2) - 0.04;

    const cell = new THREE.Group();
    cell.add(bezel, face, mirror);
    group.add(cell);
    Object.assign(p, { face, bezel, mirror, cell, anchor: new THREE.Vector3() });
  });

  // a soft pool of light behind the row, painted rather than a flat plane
  const glow = document.createElement('canvas');
  glow.width = glow.height = 256;
  const gctx = glow.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.45, 'rgba(226,232,236,0.5)');
  grad.addColorStop(1, 'rgba(234,237,239,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 12),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(glow),
      transparent: true, depthWrite: false, opacity: 0.85,
    }),
  );
  pool.position.set(0, 0, -4);
  scene.add(pool);

  /* ---- load every still before showing anything -------------------
     A room that fills in one panel at a time looks broken. */
  let armed = false;
  Promise.all(PANELS.map((p) => new Promise((res, rej) => {
    loader.load(p.src, (t) => { p.tex = t; res(); }, undefined, rej);
  }))).then(() => {
    PANELS.forEach((p) => {
      const t = p.tex;
      t.colorSpace = THREE.SRGBColorSpace;
      // The stills are minified to fit the panel. Without mipmaps that
      // undersamples the source and reads as soft however sharp it is.
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
      p.face.material.map = t;
      p.face.material.needsUpdate = true;
      p.mirror.material.map = t;
      p.mirror.material.needsUpdate = true;
    });
    armed = true;
    root.setAttribute('data-ready', '');
    resize();
    render();
  }).catch(() => { root.setAttribute('data-fallback', ''); });

  /* ---- scroll is the input, read once per scroll ------------------
     getComputedStyle inside the render loop forces a full style
     recalculation every frame, which is what makes this stutter. */
  let pRaw = 0, pQueued = false;
  function readProgress() {
    pQueued = false;
    if (!act) return;
    const n = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p'));
    if (Number.isFinite(n)) pRaw = clamp(n, 0, 1);
  }
  addEventListener('scroll', () => {
    if (pQueued) return;
    pQueued = true;
    requestAnimationFrame(readProgress);
  }, { passive: true });
  readProgress();

  /* ---- pointer: a lean, not a scroll ------------------------------ */
  let px = 0, py = 0, tx = 0, ty = 0;
  if (!still && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.addEventListener('pointermove', (e) => {
      const r = root.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    });
    root.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
  }

  /* ---- layout ----------------------------------------------------- */
  let W = 0, H = 0, stacked = false, alive = false, pS = 0, lead = -1;

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    W = r.width; H = r.height;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    stacked = innerWidth <= 900;

    // Solve the distance from the CENTRE panel, so it holds a fixed and
    // generous share of the frame whatever the window is, with a guard so a
    // tall panel in a short frame is not cropped either.
    const t = Math.tan((camera.fov * Math.PI) / 180 / 2);
    const FILL = stacked ? FILL_STACKED : FILL_WIDE;
    const forW = (PANEL_W / 2) / FILL / (t * camera.aspect);
    const forH = (PANEL_H / 2 + 0.2) / t;
    camera.position.z = Math.max(forW, forH) + 0.6;
    camera.updateProjectionMatrix();
  }

  /* ---- render ------------------------------------------------------ */
  function render() {
    if (!W) { resize(); if (!W) return; }

    pS += (pRaw - pS) * (still ? 1 : 0.14);

    // Where the row has rotated to. The travel is one panel short of the
    // count, so the first and last each get a full turn at the centre rather
    // than the ends being places the row only passes through.
    const at = pS * (N - 1);

    if (!still) {
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
    }

    PANELS.forEach((p) => {
      const d = p.i - at;                 // distance from the centre, signed
      const m = Math.min(Math.abs(d), 1); // 0 at the centre, 1 once off it
      const far = Math.abs(d) > VISIBLE + 0.5;

      // Hidden from the eye and the mouse, but never removed from the tab
      // order: taking a project out of the DOM makes it unreachable by
      // keyboard, and two of five were unreachable that way.
      p.cell.visible = !far;
      p.el.style.opacity = far ? '0' : '1';
      p.el.style.pointerEvents = far ? 'none' : 'auto';
      if (far) return;

      const sc = lerp(1, SMALL, m);
      p.cell.position.set(
        d * STEP_X * lerp(1, 0.82, m),
        lerp(0.02, -0.12, m),
        -Math.abs(d) * STEP_Z,
      );
      p.cell.rotation.y = -Math.sign(d) * TURN * m;
      p.cell.scale.set(sc, sc, 1);

      // Fully opaque, always. The only thing scroll changes is where a panel
      // is, never how transparent it is, so no site is seen through another.
      p.face.material.opacity = 1;
      p.bezel.material.opacity = 1;
      p.mirror.material.opacity = lerp(0.14, 0.06, m);
    });

    if (still) {
      group.rotation.set(0.02, 0, 0);
      group.position.set(0, 0, 0);
    } else {
      group.rotation.set(0.02 + py * 0.035, px * 0.085, 0);
      group.position.set(0, -py * 0.04, 0);
    }
    group.updateMatrixWorld(true);

    camera.lookAt(0, -0.02, 0);
    renderer.render(scene, camera);
    placeLinks();

    const now = clamp(Math.round(at), 0, N - 1);
    if (showing && now !== lead) {
      lead = now;
      const p = PANELS[now];
      showN.textContent = String(now + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
      showName.textContent = p.name;
      showHost.textContent = p.host;
      if (showKind) showKind.textContent = p.kind;
    }
  }

  /* ---- the links follow their panels -------------------------------
     A plane inside a canvas cannot be clicked, focused or read out. Each
     panel has a real anchor in the DOM, sized and placed from the projection,
     so a click, a tap and a Tab all land on a real link to a real site. */
  const v = new THREE.Vector3();
  function placeLinks() {
    PANELS.forEach((p) => {
      if (!p.cell.visible) return;
      p.anchor.set(0, 0, 0).applyMatrix4(p.cell.matrixWorld);
      v.copy(p.anchor).project(camera);
      const x = (v.x * 0.5 + 0.5) * W;
      const y = (-v.y * 0.5 + 0.5) * H;
      v.set(PANEL_W / 2, 0, 0).applyMatrix4(p.cell.matrixWorld).project(camera);
      const half = Math.abs((v.x * 0.5 + 0.5) * W - x);
      const w = Math.max(half * 2, 44);
      const h = w * (PANEL_H / PANEL_W);
      const s = p.el.style;
      s.width = w + 'px';
      s.height = h + 'px';
      s.transform = `translate3d(${Math.round(x - w / 2)}px, ${Math.round(y - h / 2)}px, 0)`;
      // nearer the centre means nearer the front, for both the eye and the mouse
      s.zIndex = String(10 - Math.round(Math.abs(p.i - pS * (N - 1)) * 2));
    });
  }

  function loop() {
    if (!alive) return;
    requestAnimationFrame(loop);
    if (armed) render();
  }

  /* ---- keyboard: tabbing rotates the row ---------------------------
     Focus has to bring its panel to the centre, or a keyboard user lands on
     a link for something they cannot see. */
  function centreOn(i) {
    if (!act) return;
    const r = act.getBoundingClientRect();
    const top = r.top + scrollY;
    const travel = act.offsetHeight - innerHeight;
    if (travel <= 0) return;
    const target = top + (i / (N - 1)) * travel;
    scrollTo({ top: target, behavior: still ? 'auto' : 'smooth' });
  }

  PANELS.forEach((p) => {
    p.el.addEventListener('focus', () => {
      // only when focus arrived by keyboard; a click already centres nothing
      if (p.el.matches(':focus-visible')) centreOn(p.i);
    });
  });

  addEventListener('resize', () => { resize(); if (armed) render(); }, { passive: true });
  new IntersectionObserver((es) => {
    const vis = es.some((e) => e.isIntersecting);
    if (vis && !alive) { alive = true; resize(); requestAnimationFrame(loop); }
    else if (!vis) alive = false;      // nothing renders offscreen
  }, { rootMargin: '25% 0px' }).observe(root);

  resize();
})();
