/* =============================================================
   THE VITRINE
   -------------------------------------------------------------
   A lit room holding the two sites as objects you can pick up.

   Both clients send X-Frame-Options, so neither can be embedded
   live. These are stills of the real pages, captured from
   production, standing as planes in a real 3D scene.

   Scroll interchanges them: whichever is forward comes to the
   front of the room and changes what it is showing, and the
   other falls back. Clicking either one opens that site.

   Stills rather than footage on purpose. Nothing decodes, so
   nothing stutters, and a still at 1600px is sharper than any
   clip small enough to ship.
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
  const smooth = (v, a, b) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  if (!window.THREE) { root.setAttribute('data-fallback', ''); return; }

  // Reduced motion drops the camera, not the content. The interchange still
  // happens on scroll, because that is the page working rather than an effect;
  // what goes is the easing, the orbit and the pointer tilt.
  const still = reduced.matches;

  const THREE = window.THREE;
  const PANELS = [...root.querySelectorAll('[data-panel]')].map((el, i) => ({
    el, i,
    a: el.dataset.panelA,
    b: el.dataset.panelB,
    rot: parseFloat(el.dataset.panelRot) || 0,
    name: el.dataset.panelName || '',
    host: el.dataset.panelHost || '',
  }));
  if (!PANELS.length) { root.setAttribute('data-fallback', ''); return; }

  const showing = root.querySelector('[data-showing]');
  const showN = root.querySelector('[data-showing-n]');
  const showName = root.querySelector('[data-showing-name]');
  const showHost = root.querySelector('[data-showing-host]');

  /* ---- scene ---------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xeaedef, 7.6, 18);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const PANEL_W = 3.15;
  const PANEL_H = PANEL_W * (1000 / 1600);
  const FOCUS_Z = 1.15;

  const loader = new THREE.TextureLoader();
  const load = (url) => new Promise((res, rej) => loader.load(url, res, undefined, rej));

  const group = new THREE.Group();
  scene.add(group);

  const quad = new THREE.PlaneGeometry(PANEL_W, PANEL_H);

  PANELS.forEach((p) => {
    // two faces, one per still, cross faded as the panel takes the room
    const mkFace = () => new THREE.Mesh(quad, new THREE.MeshBasicMaterial({
      toneMapped: false, transparent: true, opacity: 0,
    }));
    p.faceA = mkFace();
    p.faceB = mkFace();
    p.faceB.position.z = 0.001;

    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W + 0.07, PANEL_H + 0.07),
      new THREE.MeshBasicMaterial({ color: 0x9aa7b0, transparent: true }),
    );
    bezel.position.z = -0.006;
    p.bezel = bezel;

    const mirror = new THREE.Mesh(quad, new THREE.MeshBasicMaterial({
      toneMapped: false, transparent: true, opacity: 0, depthWrite: false,
    }));
    mirror.scale.y = -0.5;
    mirror.position.y = -(PANEL_H / 2) - (PANEL_H * 0.5 / 2) - 0.04;
    p.mirror = mirror;

    const cell = new THREE.Group();
    cell.add(bezel, p.faceA, p.faceB, mirror);
    group.add(cell);
    p.cell = cell;
    p.anchor = new THREE.Vector3();
  });

  // a soft pool of light behind the panels, painted rather than a flat plane
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.45, 'rgba(226,232,236,0.5)');
  grad.addColorStop(1, 'rgba(234,237,239,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 11),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(glowCanvas),
      transparent: true, depthWrite: false, opacity: 0.85,
    }),
  );
  pool.position.set(0, 0, -3.2);
  scene.add(pool);

  /* ---- load every still before showing anything -------------------
     A room that fills in one panel at a time looks broken. */
  let armed = false;
  Promise.all(PANELS.flatMap((p) => [
    load(p.a).then((t) => { p.texA = t; }),
    load(p.b).then((t) => { p.texB = t; }),
  ])).then(() => {
    PANELS.forEach((p) => {
      [[p.texA, p.faceA], [p.texB, p.faceB]].forEach(([t, m]) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        m.material.map = t;
        m.material.needsUpdate = true;
      });
      p.mirror.material.map = p.texA;
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

  /* ---- pointer ---------------------------------------------------- */
  let px = 0, py = 0, tx = 0, ty = 0;
  if (!still && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.addEventListener('pointermove', (e) => {
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
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

    // Solve the distance from the FOCUSED panel, since that is the thing being
    // read and the thing that should hold a fixed share of the frame at any
    // window size. A hand picked distance fits one window and clips in others.
    const t = Math.tan((camera.fov * Math.PI) / 180 / 2);
    const FILL = stacked ? 0.94 : 0.72;
    const forW = (PANEL_W / 2) / FILL / (t * camera.aspect);
    const forH = (PANEL_H / 2 + 0.16) / t;
    camera.position.z = Math.max(forW, forH) + FOCUS_Z;
    camera.updateProjectionMatrix();
  }

  /* ---- render ------------------------------------------------------ */
  function render() {
    if (!W) { resize(); if (!W) return; }

    pS += (pRaw - pS) * (still ? 1 : 0.14);
    const hand = smooth(pS, 0.40, 0.62);       // 0 = first site forward
    const focus = [1 - hand, hand];

    if (!still) {
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
    }

    PANELS.forEach((p, i) => {
      const f = focus[i];
      const side = i === 0 ? -1 : 1;
      const restX = stacked ? side * 0.26 : side * 1.58;
      const restY = stacked ? side * -1.02 : 0;

      p.cell.position.set(
        lerp(restX, 0, f),
        lerp(restY, 0.04, f),
        lerp(-1.5, FOCUS_Z, f),
      );
      p.cell.rotation.y = lerp(p.rot, -0.03 * side, f);
      const sc = lerp(0.82, 1, f);
      p.cell.scale.set(sc, sc, 1);

      // The forward panel also changes what it is showing, driven by its own
      // window rather than by focus: focus sits at 1 for most of a panel's
      // turn, so keying the swap to it meant the second still was up the whole
      // time and the first was only ever glimpsed during the handover.
      const swap = i === 0
        ? smooth(pS, 0.12, 0.38)     // Desi: hero, then the printed range
        : smooth(pS, 0.64, 0.90);    // AMG: hero, then the projects
      const a = lerp(0.36, 1, f);
      p.faceA.material.opacity = a * (1 - swap);
      p.faceB.material.opacity = a * swap;
      p.bezel.material.opacity = a;
      p.mirror.material.opacity = 0.13 * f;
      const want = swap > 0.5 ? p.texB : p.texA;
      if (p.mirror.material.map !== want) {
        p.mirror.material.map = want;
        p.mirror.material.needsUpdate = true;
      }

      p.cell.updateMatrixWorld();
      p.anchor.set(0, 0, 0).applyMatrix4(p.cell.matrixWorld);
    });

    if (still) {
      group.rotation.set(0, 0, 0);
      group.position.set(0, 0, 0);
    } else {
      group.rotation.y = px * 0.10;
      group.rotation.x = 0.02 + py * 0.04;
      group.position.set(0, -py * 0.05, 0);
    }
    group.updateMatrixWorld(true);
    PANELS.forEach((p) => p.anchor.set(0, 0, 0).applyMatrix4(p.cell.matrixWorld));

    camera.lookAt(0, -0.02, 0);
    renderer.render(scene, camera);
    placeLinks();

    const now = hand < 0.5 ? 0 : 1;
    if (showing && now !== lead) {
      lead = now;
      showN.textContent = now === 0 ? '01' : '02';
      showName.textContent = PANELS[now].name;
      showHost.textContent = PANELS[now].host;
    }
  }

  /* ---- the links follow their panels -------------------------------
     A plane inside a canvas cannot be clicked, focused or read out. Each
     panel has a real anchor in the DOM, and it is moved to wherever that
     panel has ended up on screen, so a click, a tap and a Tab all land on
     a real link to a real site. */
  const v = new THREE.Vector3();
  function placeLinks() {
    PANELS.forEach((p) => {
      v.copy(p.anchor).project(camera);
      const x = (v.x * 0.5 + 0.5) * W;
      const y = (-v.y * 0.5 + 0.5) * H;
      // measure the panel's width on screen rather than assuming it
      v.set(PANEL_W / 2, 0, 0).applyMatrix4(p.cell.matrixWorld).project(camera);
      const half = Math.abs((v.x * 0.5 + 0.5) * W - x);
      const w = Math.max(half * 2, 48);
      const h = w * (PANEL_H / PANEL_W);
      const s = p.el.style;
      s.width = w + 'px';
      s.height = h + 'px';
      s.transform = `translate3d(${Math.round(x - w / 2)}px, ${Math.round(y - h / 2)}px, 0)`;
      s.zIndex = p.cell.position.z > 0 ? 4 : 3;
    });
  }

  function loop() {
    if (!alive) return;
    requestAnimationFrame(loop);
    if (armed) render();
  }

  addEventListener('resize', () => { resize(); if (armed) render(); }, { passive: true });
  new IntersectionObserver((es) => {
    const vis = es.some((e) => e.isIntersecting);
    if (vis && !alive) { alive = true; resize(); requestAnimationFrame(loop); }
    else if (!vis) alive = false;      // nothing renders offscreen
  }, { rootMargin: '25% 0px' }).observe(root);

  resize();
})();
