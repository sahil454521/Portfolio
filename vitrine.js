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
  const lerp = (a, b, t) => a + (b - a) * t;
  // smoothstep: the handover eases in and out instead of cutting
  const smooth = (v, a, b) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  // No WebGL at all falls back to the posters, which are already in the markup.
  if (!window.THREE) { root.setAttribute('data-fallback', ''); return; }

  // Reduced motion drops the camera, not the content. Scrolling still runs
  // both sites, because that is the page working rather than an effect; what
  // goes is the orbit, the push in and the pointer, which are the parts that
  // actually trigger anyone. Hiding the whole scene, or freezing it so scroll
  // does nothing, both made the page worse for a setting a lot of people have
  // switched on.
  const still = reduced.matches;

  const THREE = window.THREE;
  const PANELS = [...root.querySelectorAll('[data-panel]')].map((el) => ({
    el,
    src: coarse.matches && el.dataset.panelSrcMobile ? el.dataset.panelSrcMobile : el.dataset.panelSrc,
    rot: parseFloat(el.dataset.panelRot) || 0,
    name: el.dataset.panelName || '',
    host: el.dataset.panelHost || '',
  }));

  const showing = root.querySelector('[data-showing]');
  const showN = root.querySelector('[data-showing-n]');
  const showName = root.querySelector('[data-showing-name]');
  const showHost = root.querySelector('[data-showing-host]');
  if (!PANELS.length) { root.setAttribute('data-fallback', ''); return; }

  /* ---- scene ---------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  // Fog is doing the depth here rather than a postprocess pass: it costs
  // nothing and it is what stops the far panel reading as a sticker.
  scene.fog = new THREE.Fog(0xeaedef, 7.2, 17);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.26, 6.9);

  const PANEL_W = 3.15;
  const PANEL_H = PANEL_W * (640 / 1024);
  const FOCUS_Z = 1.15;          // how far forward the focused panel sits

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
    // The panels sit at an angle and the resting one is scaled down, so
    // without this the footage resamples to mush along the tilt.
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // The footage is the subject, so it is unlit. Lighting it would tint a
    // screenshot of somebody's real website, which is the one thing that must
    // stay true.
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W, PANEL_H),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }),
    );

    // A thin lit surround, which is where the room's light actually lands and
    // what makes the panel read as an object rather than an image.
    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W + 0.075, PANEL_H + 0.075),
      new THREE.MeshBasicMaterial({ color: 0x9aa7b0, transparent: true }),
    );
    bezel.position.z = -0.006;

    // Reflection: a flipped copy under the floor line, faded out. A real
    // mirror pass costs a second render of the whole scene for something the
    // eye reads in the first 40 pixels.
    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W, PANEL_H),
      new THREE.MeshBasicMaterial({
        map: tex, toneMapped: false, transparent: true, opacity: 0.14,
        depthWrite: false,
      }),
    );
    mirror.scale.y = -0.5;
    mirror.position.y = -(PANEL_H / 2) - (PANEL_H * 0.5 / 2) - 0.04;

    const cell = new THREE.Group();
    cell.add(bezel, face, mirror);
    p.face = face; p.bezel = bezel;
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
    })
    .catch(() => { root.setAttribute('data-fallback', ''); });

  /* ---- scroll is the playhead ------------------------------------
     Read once per scroll, never inside the render loop. Calling
     getComputedStyle every frame forces a full style recalculation every
     frame, which is most of what made this stutter. Scroll position only
     changes on scroll, so that is when it is read. */
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
  let W = 0, H = 0, alive = false, pS = 0, pInit = false, showLead = -1;

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
  //
  // The camera distance is then SOLVED rather than guessed, so the whole
  // arrangement fits whatever window it lands in. Hand-picked distances fit
  // the one window they were picked in and clip in every other.
  let stacked = false, bx = 0, by = 0;
  function layout() {
    stacked = innerWidth <= 900;
    PANELS.forEach((p) => {
      if (stacked) {
        p.cell.position.set(p.i === 0 ? -0.30 : 0.30, p.i === 0 ? 0.88 : -0.88, p.i === 0 ? 0 : 0.35);
        p.cell.rotation.y = p.rot * 0.55;
        p.mirror.visible = p.i === 1;
      } else {
        p.cell.position.set(p.x, 0, 0);
        p.cell.rotation.y = p.rot;
        p.mirror.visible = true;
      }
    });

    bx = 0;
    by = stacked ? 0.10 : -0.04;

    // Solve the distance from the FOCUSED panel: it is the thing being read,
    // so it is the thing that should hold a fixed share of the frame at any
    // window size. Everything else is positioned relative to it.
    const vfov = (camera.fov * Math.PI) / 180;
    const t = Math.tan(vfov / 2);
    const FILL = stacked ? 0.94 : 0.72;
    const need = (PANEL_W / 2) / FILL / (t * camera.aspect);
    // guard so a tall panel in a short frame is not cropped either
    const needH = (PANEL_H / 2 + Math.abs(by) + 0.12) / t;
    camera.position.z = Math.max(need, needH) + FOCUS_Z;
    pool.position.set(0, by, -3.2);
  }

  function frame() {
    if (!alive) return;
    requestAnimationFrame(frame);
    if (!W) { resize(); if (!W) return; }

    const target = pRaw;
    if (!pInit) { pS = target; pInit = true; }
    pS += (target - pS) * 0.14;          // wheel events arrive in lumps

    // Two acts, one per site. Each one holds the frame while it plays its own
    // scroll end to end, then hands over. Running both at once against the
    // same progress meant neither was ever actually being read.
    const hand = smooth(pS, 0.44, 0.60);       // 0 = first site, 1 = second
    const focus = [1 - hand, hand];
    if (armed) {
      videos.forEach((s, i) => {
        if (!s.ready || !s.dur) return;
        // Seek only the panel that currently holds the frame. Seeking both
        // doubled the decoder work for a clip nobody is reading.
        if (focus[i] < 0.15) return;
        const local = i === 0
          ? clamp(pS / 0.50, 0, 1)             // Desi Totes runs 0.00 to 0.50
          : clamp((pS - 0.50) / 0.50, 0, 1);   // AMG runs 0.50 to 1.00
        s.head += (local * s.dur - s.head) * 0.22;
        // a deadband wide enough that a seek always buys a visible change
        if (!s.seeking && Math.abs(s.v.currentTime - s.head) > 0.035) {
          s.seeking = true;
          s.v.currentTime = s.head;
        }
      });
    }

    // place each panel between resting and focused
    PANELS.forEach((p, i) => {
      const f = focus[i];
      const side = i === 0 ? -1 : 1;
      const restX = stacked ? side * 0.30 : side * 1.62;
      const restY = stacked ? side * -1.05 : 0.02;
      p.cell.position.set(
        lerp(restX, 0, f),
        by + lerp(restY, 0.06, f),
        lerp(-1.5, FOCUS_Z, f),
      );
      p.cell.rotation.y = lerp(p.rot, -0.03 * side, f);
      const sc = lerp(0.82, 1, f);
      p.cell.scale.set(sc, sc, 1);
      const a = lerp(0.34, 1, f);
      p.face.material.opacity = a;
      p.bezel.material.opacity = a;
      p.mirror.material.opacity = 0.14 * f;
    });

    // name whichever one currently has the frame
    const lead = hand < 0.5 ? 0 : 1;
    if (showing && lead !== showLead) {
      showLead = lead;
      showN.textContent = lead === 0 ? '01' : '02';
      showName.textContent = PANELS[lead].name;
      showHost.textContent = PANELS[lead].host;
    }

    if (still) {
      // held: the sites still run and still hand over, the camera does not
      group.rotation.set(0.02, 0, 0);
      group.position.set(0, 0, 0);
    } else {
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
      // the case turns a little as you travel, and a little more as you point
      // the room itself barely moves now: the panels carry the sequence
      group.rotation.y = px * 0.10;
      group.rotation.x = 0.02 + py * 0.04;
      group.position.set(0, -py * 0.05, 0);
    }

    camera.lookAt(0, -0.05, 0);
    renderer.render(scene, camera);
  }

  videos.forEach((s) => s.v.addEventListener('seeked', () => { s.seeking = false; }));

  addEventListener('resize', resize, { passive: true });
  new IntersectionObserver((es) => {
    const vis = es.some((e) => e.isIntersecting);
    if (vis && !alive) { alive = true; resize(); requestAnimationFrame(frame); }
    else if (!vis) alive = false;      // nothing renders offscreen
  }, { rootMargin: '25% 0px' }).observe(root);

  resize();
})();
