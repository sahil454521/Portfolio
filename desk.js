/* =============================================================
   THE DESK
   -------------------------------------------------------------
   basement.studio's hero is its office, and every object in it
   is a way in. This is the same idea for one engineer: a desk
   where every object is something I built.

     two monitors   Desi Totes and AMG, the client sites
     laptop         NeuraCraft, runs here, live
     terminal       AI Terminal, runs here, live
     arcade         Portfolio Quest, playable here, live
     papers         the PPEMDD research
     clipboard      the résumé
     phone          write to me

   Hover frames an object and says what it does; click does it.
   The three apps that allow embedding open in a window that
   grows out of the object's own screen. The rest go to their
   section. Status lights are real: /api/status pings each site.

   Everything clickable here is also a real link in the page
   ([data-thing]), so the desk is a way in, never the only one.
   ============================================================= */
(() => {
  'use strict';

  const root = document.querySelector('[data-desk]');
  if (!root) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const out = (t) => 1 - (1 - t) ** 4;     // the arrival: fast start, long settle

  /* ---- the things: named by the links that lead to them ----------- */
  const links = [...document.querySelectorAll('[data-thing]')];
  const THING = {};
  links.forEach((a) => {
    const id = a.dataset.thing;
    THING[id] = THING[id] || { id, el: a, label: a.dataset.label || a.textContent.trim(), host: a.dataset.host || '' };
  });

  const win = document.querySelector('[data-win]');
  const frameEl = win && win.querySelector('iframe');
  const compose = document.querySelector('dialog[data-compose]');
  let scene = null;          // the 3D side, once it exists
  let openId = null;
  let seq = 0;               // the latest click; an older one still in flight gives way

  /* ---- actions, which work with or without WebGL ------------------- */
  // Every action first moves toward its object, when the desk is in view, so
  // a click visibly goes somewhere: the apps are entered, the rest leaned
  // into, and then the page does what the object stands for.
  async function go(id) {
    const t = THING[id];
    if (!t) return;
    const a = t.el;
    if (a.hasAttribute('data-app')) return openApp(id);
    if (a.hasAttribute('data-compose')) return openDialog(compose, id);
    const my = ++seq;
    if (scene && scene.onScreen()) {
      await scene.flyTo(id, 0.5, 620);
      if (my !== seq) return;
    }
    const href = a.getAttribute('href');
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      // pull back while the page scrolls away, so the desk is whole on return
      if (scene) scene.home();
    } else location.href = href;
  }

  links.forEach((a) => a.addEventListener('click', (e) => {
    // a modified click is a request for a new tab; honour it
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!a.hasAttribute('data-app') && !a.hasAttribute('data-compose')) return;
    e.preventDefault();
    go(a.dataset.thing);
  }));

  function openApp(id) {
    if (!win) return;
    const a = THING[id].el;
    win.querySelector('[data-win-name]').textContent = a.dataset.name || THING[id].label;
    win.querySelector('[data-win-host]').textContent = a.dataset.host || '';
    win.querySelector('[data-win-out]').href = a.href;
    frameEl.title = (a.dataset.name || '') + ', running live';
    // The window opens on the same still the object's screen shows, and the
    // live app fades in over it once it has loaded, so it never flashes blank.
    const view = win.querySelector('[data-win-view]');
    view.style.backgroundImage = a.dataset.still ? `url("${a.dataset.still}")` : '';
    view.removeAttribute('data-loaded');
    frameEl.onload = () => { if (frameEl.getAttribute('src') !== 'about:blank') view.setAttribute('data-loaded', ''); };
    frameEl.src = a.href;
    openDialog(win, id);
  }

  // The window grows out of the object's own screen and shrinks back into
  // it, so it is always clear where it came from and where it went.
  async function openDialog(dlg, id) {
    if (!dlg || dlg.open) return;
    const my = ++seq;
    let from = null;
    if (scene && scene.onScreen()) {
      // close enough that the screen nearly fills the view, so the window
      // growing out of it reads as going inside
      from = await scene.flyTo(id, 0.9, 860);
      if (my !== seq) { if (dlg === win) frameEl.src = 'about:blank'; return; }
    }
    openId = id;
    // Focus stays in this page (on Close) rather than going into the app: a
    // key pressed inside another site's frame never reaches this window, so
    // Escape would stop closing it. The app takes focus when it is clicked.
    dlg.showModal();
    grow(dlg, from, false);
    if (location.hash !== '#' + id) history.pushState({ open: id }, '', '#' + id);
  }

  function shut(dlg, fromHistory) {
    if (!dlg || !dlg.open || dlg.dataset.closing) return;
    dlg.dataset.closing = '1';
    const to = scene && scene.onScreen() ? scene.rectOf(openId) : null;
    grow(dlg, to, true).then(() => {
      dlg.close();
      delete dlg.dataset.closing;
      if (dlg === win) frameEl.src = 'about:blank';     // stop the game, the audio, the requests
      if (scene) scene.home();
      const was = openId;
      openId = null;
      // Clean the address in place. Stepping back would go through the
      // history the app inside the window may have added, and land on a
      // stale #id that reopens a window nobody asked for.
      if (!fromHistory && location.hash === '#' + was) history.replaceState(null, '', location.pathname + location.search);
      const back = THING[was] && document.querySelector(`[data-thing="${was}"]:not([hidden])`);
      if (back && document.activeElement === document.body) back.focus({ preventScroll: true });
    });
  }

  function grow(dlg, rect, reverse) {
    const box = dlg.getBoundingClientRect();
    let frames;
    if (rect && !reduced) {
      const sx = rect.width / box.width, sy = rect.height / box.height;
      const tx = rect.left - box.left, ty = rect.top - box.top;
      frames = [
        { transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`, opacity: 0.2 },
        { transform: 'none', opacity: 1 },
      ];
    } else {
      frames = [{ opacity: 0, transform: reduced ? 'none' : 'scale(0.97)' }, { opacity: 1, transform: 'none' }];
    }
    if (reverse) frames.reverse();
    const opts = { duration: reduced ? 160 : reverse ? 300 : 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' };
    try {
      if (dlg._backdrop) dlg._backdrop.cancel();
      dlg._backdrop = dlg.animate(reverse ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }], { ...opts, pseudoElement: '::backdrop' });
    } catch { /* no ::backdrop animation here; the window still animates */ }
    const run = dlg.animate(frames, opts);
    return run.finished.then(() => run.cancel(), () => {});
  }

  [win, compose].forEach((dlg) => {
    if (!dlg) return;
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); shut(dlg); });
    dlg.querySelectorAll('[data-win-close]').forEach((b) => b.addEventListener('click', () => shut(dlg)));
    // a click on the backdrop is a click on the dialog element itself
    dlg.addEventListener('click', (e) => { if (e.target === dlg) shut(dlg); });
  });

  // Back closes an open window, which is what a phone user expects from a
  // full-screen one. It never opens one: this page shares its history with
  // whatever runs inside the window, so an old #quest can surface here long
  // after that window closed. Only a link opened fresh (#quest) opens it.
  addEventListener('popstate', () => {
    if (openId && location.hash !== '#' + openId) shut(openId === 'phone' ? compose : win, true);
  });

  /* ---- the compose window ----------------------------------------- */
  const form = compose && compose.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const msg = String(f.get('msg') || '').trim();
      const err = form.querySelector('[data-err]');
      if (!msg) { err.hidden = false; form.elements.msg.focus(); return; }
      err.hidden = true;
      const name = String(f.get('name') || '').trim();
      const org = String(f.get('org') || '').trim();
      const subject = `${f.get('about')}${org ? ': ' + org : name ? ': ' + name : ''}`;
      const sign = [name, org].filter(Boolean).join(', ');
      const body = msg + (sign ? `\n\n${sign}` : '');
      location.href = `mailto:sahilpathak2005@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* =================================================================
     THE SCENE
     ================================================================= */
  const THREE = window.THREE;
  const canvas = root.querySelector('canvas');
  let gl = null;
  try {
    gl = THREE && new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { gl = null; }
  if (!gl) { root.setAttribute('data-fallback', ''); openFromHash(); return; }

  document.fonts.ready.then(build);

  function openFromHash() {
    const id = location.hash.slice(1);
    if (THING[id] && (THING[id].el.hasAttribute('data-app') || THING[id].el.hasAttribute('data-compose'))) go(id);
  }

  function build() {
    const ink = '#0E1519', inkSoft = '#566772', hot = '#FFB03B', paper = '#FBFCFC';

    gl.setClearAlpha(0);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    const s3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 80);
    const world = new THREE.Group();
    s3.add(world);

    s3.add(new THREE.HemisphereLight(0xffffff, 0xc9d2d8, 1.9));
    const sun = new THREE.DirectionalLight(0xfff4e6, 2.6);
    sun.position.set(-3.5, 7, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 22 });
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.015;
    s3.add(sun);
    const rim = new THREE.DirectionalLight(0xdde8ff, 0.7);
    rim.position.set(5, 3, -2);
    s3.add(rim);

    // The floor only catches shadow, so the desk stands on the page itself.
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.13 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    world.add(floor);

    /* ---- materials: clay, ink, one accent ----------------------- */
    const clay = new THREE.MeshStandardMaterial({ color: 0xf1f3f4, roughness: 0.86, metalness: 0 });
    const clayDim = new THREE.MeshStandardMaterial({ color: 0xdde2e5, roughness: 0.9, metalness: 0 });
    const inkM = new THREE.MeshStandardMaterial({ color: 0x1b2227, roughness: 0.5, metalness: 0.08 });
    const hotM = new THREE.MeshStandardMaterial({ color: 0xffb03b, emissive: 0xffb03b, emissiveIntensity: 0.35, roughness: 0.45 });
    const aniso = gl.capabilities.getMaxAnisotropy();

    // a box with every edge rounded: a bevelled extrusion of an inset rectangle
    function rbox(w, h, d, r) {
      r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
      const s = new THREE.Shape();
      const x = -w / 2 + r, y = -h / 2 + r;
      s.moveTo(x, y); s.lineTo(x + w - 2 * r, y); s.lineTo(x + w - 2 * r, y + h - 2 * r); s.lineTo(x, y + h - 2 * r); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, {
        depth: Math.max(d - 2 * r, 1e-4), bevelEnabled: true,
        bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 4,
      });
      g.center();
      return g;
    }
    function add(parent, geo, mat, x = 0, y = 0, z = 0) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    // Nothing shows until every screen has its picture: a desk whose monitors
    // light up one at a time looks broken, not loading.
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => reveal();
    const loader = new THREE.TextureLoader(manager);
    let dirty = true;
    // a still of a real site, centre-cropped to the screen it goes on (top kept)
    function still(src, aspect) {
      const t = loader.load(src, () => { dirty = true; wake(); });
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      const a = 1680 / 1080;
      if (aspect < a) { t.repeat.x = aspect / a; t.offset.x = (1 - t.repeat.x) / 2; }
      else { t.repeat.y = a / aspect; t.offset.y = 1 - t.repeat.y; }
      return t;
    }
    function painted(w, h, draw) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      return t;
    }
    const screen = (map) => new THREE.MeshBasicMaterial({ map, toneMapped: false });
    const ledMat = () => new THREE.MeshStandardMaterial({ color: 0xa3adb3, emissive: 0xffb03b, emissiveIntensity: 0, roughness: 0.3 });
    const display = (px, w) => `600 ${px}px "Bricolage Grotesque", Archivo, sans-serif`;
    const text = (px, weight = 500) => `${weight} ${px}px Archivo, sans-serif`;

    const things = {};
    function thing(id, group, face, led) {
      group.traverse((o) => { if (o.isMesh) o.userData.thing = id; });
      things[id] = { id, group, face, led, lift: 0, base: group.position.y, host: THING[id] ? THING[id].host : '' };
    }

    const TOP = 0.74;

    /* ---- the desk -------------------------------------------------- */
    const desk = new THREE.Group();
    world.add(desk);
    add(desk, rbox(2.7, 0.05, 1.04, 0.022), clay, -0.2, TOP - 0.025, 0);
    add(desk, rbox(0.05, TOP - 0.05, 0.92, 0.02), clay, -1.47, (TOP - 0.05) / 2, 0);
    add(desk, rbox(0.05, TOP - 0.05, 0.92, 0.02), clay, 1.07, (TOP - 0.05) / 2, 0);

    /* ---- monitors: the two client sites ----------------------------- */
    function monitor(id, src, x, z, ry) {
      const g = new THREE.Group();
      g.position.set(x, TOP, z); g.rotation.y = ry;
      world.add(g);
      const W = 0.86, H = W * (1080 / 1680);
      add(g, rbox(0.26, 0.018, 0.17, 0.008), clay, 0, 0.009, 0);
      add(g, rbox(0.05, 0.3, 0.028, 0.01), clay, 0, 0.165, -0.04);
      const cy = 0.26 + H / 2;
      add(g, rbox(W + 0.036, H + 0.036, 0.032, 0.012), inkM, 0, cy, -0.012);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), screen(still(src, W / H)));
      face.position.set(0, cy, 0.0046);
      g.add(face);
      const led = add(g, new THREE.SphereGeometry(0.0062, 14, 10), ledMat(), W / 2 - 0.02, cy - H / 2 - 0.009, 0.005);
      thing(id, g, face, led);
    }
    monitor('desi', 'assets/work/desi-1.jpg', -0.78, -0.24, 0.2);
    monitor('amg', 'assets/work/amg-1.jpg', 0.16, -0.27, -0.06);

    /* ---- laptop: NeuraCraft ----------------------------------------- */
    {
      const g = new THREE.Group();
      g.position.set(-1.16, TOP, 0.22); g.rotation.y = 0.46;
      world.add(g);
      const W = 0.44, D = 0.3, LH = 0.3;
      add(g, rbox(W, 0.018, D, 0.008), clay, 0, 0.009, 0);
      const deck = add(g, new THREE.PlaneGeometry(W * 0.84, D * 0.46), clayDim, 0, 0.0185, -0.02);
      deck.rotation.x = -Math.PI / 2;
      const hinge = new THREE.Group();
      hinge.position.set(0, 0.018, -D / 2 + 0.006);
      hinge.rotation.x = -0.3;
      g.add(hinge);
      add(hinge, rbox(W, LH, 0.012, 0.008), inkM, 0, LH / 2, 0);
      const sw = W - 0.03, sh = LH - 0.03;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screen(still('assets/work/neura.jpg', sw / sh)));
      face.position.set(0, LH / 2, 0.0065);
      hinge.add(face);
      const led = add(g, new THREE.SphereGeometry(0.005, 12, 8), ledMat(), W / 2 - 0.03, 0.0185, D / 2 - 0.025);
      thing('neura', g, face, led);
    }

    /* ---- CRT terminal: AI Terminal --------------------------------- */
    {
      const g = new THREE.Group();
      g.position.set(0.84, TOP, -0.1); g.rotation.y = -0.36;
      world.add(g);
      add(g, rbox(0.3, 0.02, 0.26, 0.01), clayDim, 0, 0.01, -0.04);
      add(g, rbox(0.44, 0.37, 0.4, 0.05), clay, 0, 0.205, -0.04);
      add(g, rbox(0.37, 0.29, 0.02, 0.018), inkM, 0, 0.215, 0.165);
      const sw = 0.31, sh = 0.232;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screen(still('assets/work/terminal.jpg', sw / sh)));
      face.position.set(0, 0.215, 0.1756);
      g.add(face);
      add(g, rbox(0.36, 0.018, 0.13, 0.008), clay, 0, 0.009, 0.33);
      const keys = add(g, new THREE.PlaneGeometry(0.32, 0.095), clayDim, 0, 0.0185, 0.33);
      keys.rotation.x = -Math.PI / 2;
      const led = add(g, new THREE.SphereGeometry(0.007, 12, 8), ledMat(), 0.17, 0.05, 0.161);
      thing('term', g, face, led);
    }

    /* ---- arcade: Portfolio Quest, standing beside the desk ---------- */
    {
      const g = new THREE.Group();
      g.position.set(1.62, 0, -0.16); g.rotation.y = -0.44;
      world.add(g);
      add(g, rbox(0.56, 0.92, 0.56, 0.03), clay, 0, 0.46, 0);
      add(g, rbox(0.46, 0.12, 0.02, 0.01), inkM, 0, 0.12, 0.28);
      const deckG = new THREE.Group();
      deckG.position.set(0, 0.95, 0.2); deckG.rotation.x = 0.2;
      g.add(deckG);
      add(deckG, rbox(0.6, 0.05, 0.3, 0.02), clay, 0, 0, 0);
      add(deckG, new THREE.CylinderGeometry(0.007, 0.007, 0.06, 10), inkM, -0.13, 0.05, 0.02);
      add(deckG, new THREE.SphereGeometry(0.02, 16, 12), hotM, -0.13, 0.085, 0.02);
      for (let i = 0; i < 3; i++) add(deckG, new THREE.CylinderGeometry(0.018, 0.018, 0.014, 16), hotM, 0.02 + i * 0.065, 0.03, 0.03 - (i % 2) * 0.03);
      add(g, rbox(0.56, 0.66, 0.42, 0.03), clay, 0, 1.3, -0.07);
      const bezel = add(g, rbox(0.5, 0.42, 0.02, 0.012), inkM, 0, 1.29, 0.15);
      bezel.rotation.x = -0.08;
      const sw = 0.44, sh = 0.33;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screen(still('assets/work/quest.jpg', sw / sh)));
      face.position.set(0, 1.29, 0.1608);
      face.rotation.x = -0.08;
      g.add(face);
      add(g, rbox(0.58, 0.17, 0.44, 0.03), clay, 0, 1.72, -0.06);
      const marquee = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.12), screen(painted(1040, 240, (c, w, h) => {
        c.fillStyle = hot; c.fillRect(0, 0, w, h);
        c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = display(118); c.fillText('PORTFOLIO QUEST', w / 2, h / 2 + 6);
      })));
      marquee.position.set(0, 1.72, 0.1612);
      g.add(marquee);
      const led = add(g, new THREE.SphereGeometry(0.008, 12, 8), ledMat(), 0.24, 0.93, 0.281);
      thing('quest', g, face, led);
    }

    /* ---- papers: the research -------------------------------------- */
    {
      const g = new THREE.Group();
      g.position.set(-0.46, TOP, 0.28); g.rotation.y = 0.18;
      world.add(g);
      for (let i = 0; i < 4; i++) {
        const s = add(g, rbox(0.3, 0.006, 0.42, 0.002), clay, (i % 2) * 0.006 - 0.003, 0.003 + i * 0.0065, 0);
        s.rotation.y = (i - 1.5) * 0.035;
      }
      const page = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.41), screen(painted(580, 820, (c, w, h) => {
        c.fillStyle = paper; c.fillRect(0, 0, w, h);
        c.fillStyle = ink; c.font = display(56); c.fillText('PPEMDD', 44, 108);
        c.fillStyle = inkSoft; c.font = text(21);
        c.fillText('Adaptive multimodal deep learning', 44, 150);
        c.fillText('for depression detection', 44, 178);
        c.fillText('IEEE format, 2026', 44, 214);
        // the mechanism, the same one the research section draws
        const box = (x, y, bw, bh, fill) => { c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, bw, bh, 8); c.fill(); };
        ['Text', 'EEG', 'Wearables', 'Audio, video'].forEach((l, i) => {
          box(44, 280 + i * 54, 150, 38, '#E7ECEF');
          c.fillStyle = ink; c.font = text(18); c.fillText(l, 58, 305 + i * 54);
        });
        box(250, 318, 110, 140, ink);
        c.fillStyle = paper; c.font = text(17, 600); c.fillText('Gate', 262, 350); c.fillText('+ cross-', 262, 392); c.fillText('attention', 262, 414);
        ['Screen', 'PHQ-9', 'DSM-5'].forEach((l, i) => {
          box(410, 312 + i * 54, 126, 38, '#E7ECEF');
          c.fillStyle = ink; c.font = text(18); c.fillText(l, 424, 337 + i * 54);
        });
        c.strokeStyle = inkSoft; c.lineWidth = 2;
        [299, 353, 407, 461].forEach((y) => { c.beginPath(); c.moveTo(196, y); c.lineTo(248, 388); c.stroke(); });
        [331, 385, 439].forEach((y) => { c.beginPath(); c.moveTo(362, 388); c.lineTo(408, y); c.stroke(); });
        c.fillStyle = ink; c.font = display(40); c.fillText('91.24%', 44, 560);
        c.fillStyle = inkSoft; c.font = text(18); c.fillText('accuracy, 2,250 held-out samples', 44, 592);
        c.fillStyle = '#D5DCE0';
        for (let i = 0; i < 6; i++) c.fillRect(44, 640 + i * 26, i === 5 ? 300 : 492, 9);
      })));
      page.rotation.x = -Math.PI / 2;
      page.position.set(0, 0.0065 * 4 + 0.0005, 0);
      g.add(page);
      thing('paper', g, page, null);
    }

    /* ---- clipboard: the résumé -------------------------------------- */
    {
      const g = new THREE.Group();
      g.position.set(0.02, TOP, 0.3); g.rotation.y = -0.1;
      world.add(g);
      add(g, rbox(0.25, 0.012, 0.35, 0.01), inkM, 0, 0.006, 0);
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), screen(painted(440, 600, (c, w, h) => {
        c.fillStyle = paper; c.fillRect(0, 0, w, h);
        c.fillStyle = ink; c.font = display(40); c.fillText('Sahil Pathak', 30, 92);
        c.fillStyle = inkSoft; c.font = text(18); c.fillText('AI/ML and full-stack engineer', 30, 124);
        c.fillStyle = ink; c.font = text(15, 700);
        ['EXPERIENCE', 'RESEARCH', 'PROJECTS', 'EDUCATION'].forEach((l, i) => {
          const y = 178 + i * 104;
          c.fillStyle = ink; c.fillText(l, 30, y);
          c.fillStyle = '#D5DCE0';
          for (let k = 0; k < 3; k++) c.fillRect(30, y + 18 + k * 22, k === 2 ? 220 : 370, 8);
        });
      })));
      sheet.rotation.x = -Math.PI / 2;
      sheet.position.set(0, 0.0125, 0.012);
      g.add(sheet);
      add(g, rbox(0.1, 0.02, 0.04, 0.008), hotM, 0, 0.018, -0.16);
      thing('cv', g, sheet, null);
    }

    /* ---- phone: write to me ------------------------------------------ */
    {
      const g = new THREE.Group();
      g.position.set(0.44, TOP, 0.3); g.rotation.y = -0.3; g.scale.setScalar(1.25);
      world.add(g);
      add(g, rbox(0.11, 0.014, 0.09, 0.006), clay, 0, 0.007, 0);
      const tilt = new THREE.Group();
      tilt.position.set(0, 0.014, 0.01); tilt.rotation.x = -0.34;
      g.add(tilt);
      add(tilt, rbox(0.086, 0.172, 0.01, 0.012), inkM, 0, 0.086, 0);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.074, 0.156), screen(painted(296, 624, (c, w, h) => {
        c.fillStyle = '#F4F6F7'; c.fillRect(0, 0, w, h);
        c.fillStyle = inkSoft; c.font = text(20); c.fillText('New message', 26, 70);
        c.fillStyle = ink; c.font = display(34); c.fillText('To Sahil', 26, 118);
        c.fillStyle = '#D5DCE0';
        for (let k = 0; k < 5; k++) c.fillRect(26, 170 + k * 30, k === 4 ? 150 : 240, 10);
        c.fillStyle = hot; c.beginPath(); c.roundRect(26, 470, 244, 64, 32); c.fill();
        c.fillStyle = ink; c.font = text(24, 600); c.textAlign = 'center'; c.fillText('Send', w / 2, 511);
      })));
      face.position.set(0, 0.086, 0.0056);
      tilt.add(face);
      // the phone is the smallest thing on the desk: an unseen box around it
      // gives the pointer a target it can actually hit
      const reach = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.16), new THREE.MeshBasicMaterial({ visible: false }));
      reach.position.set(0, 0.11, 0.01);
      g.add(reach);
      thing('phone', g, face, null);
    }

    const pickable = [];
    Object.values(things).forEach((t) => t.group.traverse((o) => { if (o.isMesh) pickable.push(o); }));

    /* ---- the camera: framed to the desk, whatever the window -------- */
    const bounds = new THREE.Box3();
    Object.values(things).forEach((t) => bounds.expandByObject(t.group));
    bounds.expandByObject(desk);
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    const DIR = new THREE.Vector3(-0.2, 0.62, 1).normalize();
    const corners = [];
    for (let i = 0; i < 8; i++) {
      corners.push(new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z));
    }

    const v = new THREE.Vector3();
    const box = new THREE.Box3();
    const pose = { pos: new THREE.Vector3(), at: new THREE.Vector3(), ox: 0, oy: 0 };
    const homePose = { pos: new THREE.Vector3(), at: new THREE.Vector3(), ox: 0, oy: 0 };
    let W = 0, H = 0, wide = true;
    const lede = document.querySelector('.desk .lede');

    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = r.width; H = r.height;
      wide = innerWidth > 900;
      gl.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      gl.setSize(W, H, false);
      camera.aspect = W / H;
      // Fit the desk's projected outline, not a bounding sphere, into a box:
      // the right of the frame on a wide screen, clear of the headline; the
      // whole stage on a phone. Measured once from far away, then scaled,
      // because projected size falls off as one over distance.
      const at = sphere.center.clone();
      const far = 14;
      camera.clearViewOffset();
      camera.position.copy(at).addScaledVector(DIR, far);
      camera.lookAt(at);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      corners.forEach((c) => {
        v.copy(c).project(camera);
        x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
      });
      // The box comes from where the headline actually is, not from a fixed
      // share of the width: beside it, or above it, whichever gives the desk
      // more room. A fixed box put the laptop on the headline at mid widths.
      const kFor = (b) => Math.max((x1 - x0) / 2 / b.w, (y1 - y0) / 2 / b.h);
      let box2 = { w: 0.94, h: 0.84, x: 0.5, y: 0.52 };
      if (wide && lede) {
        const lr = lede.getBoundingClientRect();
        const top = 88 / H, bottom = (H - 96) / H;              // under the bar, above the switch
        const left = (lr.right - r.left + 40) / W, right = 0.985;
        const beside = { w: right - left, h: bottom - top, x: (left + right) / 2, y: (top + bottom) / 2 };
        const ceil = (lr.top - r.top - 28) / H;
        const above = { w: 0.94, h: ceil - top, x: 0.5, y: (top + ceil) / 2 };
        const ok = (b) => b.w > 0.2 && b.h > 0.2;
        box2 = [beside, above].filter(ok).sort((a, b) => kFor(a) - kFor(b))[0] || beside;
      }
      const k = kFor(box2);
      homePose.at.copy(at);
      homePose.pos.copy(at).addScaledVector(DIR, far * k);
      // where the outline's centre lands, as a fraction of the frame, then
      // shift the view so it lands in the middle of the box instead
      const cx = ((x0 + x1) / 2 / k) * 0.5 + 0.5, cy = 0.5 - ((y0 + y1) / 2 / k) * 0.5;
      homePose.ox = cx - box2.x;
      homePose.oy = cy - box2.y;
      if (!tween && !openId) copyPose(pose, homePose);
      dirty = true;
    }
    function copyPose(a, b) { a.pos.copy(b.pos); a.at.copy(b.at); a.ox = b.ox; a.oy = b.oy; }

    let tween = null;
    function tweenTo(target, ms, curve = inOut) {
      // start from where the camera actually is, lean included, so a flight
      // never begins with a jump
      if (!openId && !tween && (lean.x || lean.y)) {
        pose.pos.add(new THREE.Vector3(lean.x * 0.22, lean.y * 0.1, 0));
        lean.x = lean.y = lean.tx = lean.ty = 0;
      }
      if (tween) tween.done(false);          // an interrupted flight gives way
      const from = { pos: pose.pos.clone(), at: pose.at.clone(), ox: pose.ox, oy: pose.oy };
      return new Promise((done) => {
        if (reduced || ms === 0) { copyPose(pose, target); dirty = true; wake(); done(true); return; }
        tween = { from, to: target, t0: performance.now(), ms, done, curve };
        wake();
      });
    }

    // where the camera has to be for a screen to fill a share of the frame
    function poseFor(t, fill = 0.7) {
      const f = t.face;
      f.updateWorldMatrix(true, false);
      const P = new THREE.Vector3().setFromMatrixPosition(f.matrixWorld);
      const N = new THREE.Vector3(0, 0, 1).transformDirection(f.matrixWorld);
      const s = new THREE.Vector3().setFromMatrixScale(f.matrixWorld);
      const gp = f.geometry.parameters;
      const vf = (camera.fov * Math.PI) / 180;
      const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
      const dH = (gp.height * s.y / 2) / Math.tan(vf / 2) / fill;
      const dW = (gp.width * s.x / 2) / Math.tan(hf / 2) / fill;
      return { pos: P.clone().addScaledVector(N, Math.max(dH, dW)), at: P, ox: 0, oy: 0 };
    }

    /* ---- projection helpers ------------------------------------------ */
    function toScreen(p) {
      v.copy(p).project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + (v.x * 0.5 + 0.5) * W, y: r.top + (-v.y * 0.5 + 0.5) * H };
    }
    function rectOfObject(o) {
      box.setFromObject(o);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        const p = toScreen(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
        x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
      }
      return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
    }

    /* ---- hover: the frame and its label -------------------------------- */
    const frame = root.querySelector('[data-desk-frame]');
    const fName = frame.querySelector('b');
    const fNote = frame.querySelector('span');
    let hovered = null, pointerIn = false;
    const ndc = new THREE.Vector2(9, 9);
    const ray = new THREE.Raycaster();

    function note(id) {
      const t = things[id];
      const st = t && t.host && statusOf(t.host);
      if (!st) return '';
      return st.up ? `live, ${st.ms} ms` : 'not answering right now';
    }
    function setHover(id) {
      if (id === hovered) return;
      hovered = id;
      canvas.style.cursor = id ? 'pointer' : '';
      if (id) {
        fName.textContent = THING[id].label;
        fNote.textContent = note(id);
        fNote.hidden = !fNote.textContent;
        labW = label.offsetWidth; labH = label.offsetHeight;   // read once per change, not per frame
      }
      frame.toggleAttribute('data-on', !!id);
      wake();
    }
    // The frame glides from one object to the next (about 150ms) instead of
    // jumping, so the eye follows it; the first time it appears it is simply there.
    const label = frame.querySelector('p');
    const fr = { x: 0, y: 0, w: 0, h: 0, on: false };
    let labW = 0, labH = 0;
    function placeFrame(dt) {
      if (!hovered) { fr.on = false; return false; }
      const r = rectOfObject(things[hovered].group);
      const c = canvas.getBoundingClientRect();
      const pad = 10;
      const t = { x: r.left - c.left - pad, y: r.top - c.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
      const k = !fr.on || reduced ? 1 : 1 - Math.exp(-dt / 0.045);
      fr.x += (t.x - fr.x) * k; fr.y += (t.y - fr.y) * k; fr.w += (t.w - fr.w) * k; fr.h += (t.h - fr.h) * k;
      fr.on = true;
      frame.style.transform = `translate(${Math.round(fr.x)}px, ${Math.round(fr.y)}px)`;
      frame.style.width = Math.round(fr.w) + 'px';
      frame.style.height = Math.round(fr.h) + 'px';
      // the label keeps inside the frame of the page, and goes above the object
      // when below it would run into the view switch
      label.style.left = clamp(fr.w / 2, labW / 2 + 8 - fr.x, W - labW / 2 - 8 - fr.x) + 'px';
      label.style.top = fr.y + fr.h + 10 + labH < H - 90 ? 'calc(100% + 10px)' : `${-labH - 10}px`;
      return Math.abs(t.x - fr.x) + Math.abs(t.y - fr.y) + Math.abs(t.w - fr.w) > 0.5;
    }

    function pick() {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickable, false)[0];
      return hit ? hit.object.userData.thing : null;
    }

    /* ---- pointer: lean, hover, drag to turn, click to go ---------------- */
    let lean = { x: 0, y: 0, tx: 0, ty: 0 };
    let yaw = 0, yawV = 0, drag = null, moved = false;
    const YAW = 0.5;

    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      pointerIn = true;
      attract = null;
      if (fine && !reduced) { lean.tx = ndc.x; lean.ty = ndc.y; }
      if (drag && e.pointerId === drag.id) {
        const dx = e.clientX - drag.x;
        if (!drag.live && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) {
          drag.live = true;
          canvas.setPointerCapture(e.pointerId);
          root.setAttribute('data-turning', '');
          setHover(null);
        }
        if (drag.live) {
          const now = e.timeStamp;
          const next = clamp(drag.yaw + dx * 0.004, -YAW, YAW);
          yawV = (next - yaw) / Math.max((now - drag.t) / 1000, 1 / 120);
          drag.t = now;
          yaw = next;
        }
      }
      wake();
    });
    canvas.addEventListener('pointerleave', () => { pointerIn = false; lean.tx = lean.ty = 0; if (!openId) setHover(null); });
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw, t: e.timeStamp, live: false };
      yawV = 0;
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      moved = drag.live;
      drag = null;
      root.removeAttribute('data-turning');
      if (reduced) yawV = 0;
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('click', (e) => {
      if (moved) { moved = false; return; }
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const id = pick();
      if (id) go(id);
    });

    // the links in the page name the same things: focusing one frames it here
    links.forEach((a) => {
      const id = a.dataset.thing;
      const on = () => { if (things[id] && inView) { attract = null; setHover(id); } };
      a.addEventListener('focus', on);
      a.addEventListener('pointerenter', on);
      a.addEventListener('blur', () => setHover(null));
      a.addEventListener('pointerleave', () => { if (!pointerIn) setHover(null); });
    });

    // Once, on arrival, the frame visits each object in turn, so it is clear
    // before anyone has to guess that everything on the desk opens.
    const ORDER = ['desi', 'amg', 'term', 'quest', 'phone', 'cv', 'paper', 'neura'];
    let attract = (fine && !reduced && !location.hash) ? { i: 0, t: Infinity } : null;

    /* ---- status: real, from /api/status ------------------------------ */
    let status = window.__siteStatus || null;
    function statusOf(host) { return status && status.byHost ? status.byHost[host] : null; }
    addEventListener('site-status', (e) => { status = e.detail; if (hovered) fNote.textContent = note(hovered); wake(); });

    /* ---- the public side, for the actions above ----------------------- */
    let inView = true;
    const stage = root.closest('.desk') || root;
    scene = {
      onScreen: () => inView,
      rectOf(id) {
        const t = things[id];
        return t ? rectOfObject(t.face || t.group) : null;
      },
      async flyTo(id, fill, ms) {
        const t = things[id];
        if (!t) return null;
        setHover(null);
        attract = null;
        // the headline steps back while the camera goes in, so the object
        // being entered has the screen to itself
        stage.setAttribute('data-flying', '');
        await tweenTo(poseFor(t, fill), ms);
        return rectOfObject(t.face);
      },
      home() { stage.removeAttribute('data-flying'); tweenTo(homePose, 700); },
    };

    /* ---- the loop ---------------------------------------------------- */
    let awake = false, last = performance.now(), tick = 0;
    function wake() { if (!awake && inView) { awake = true; last = performance.now(); requestAnimationFrame(frameLoop); } }

    function frameLoop(now) {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      let busy = false;

      if (tween) {
        const k = clamp((now - tween.t0) / tween.ms, 0, 1), e = tween.curve(k);
        pose.pos.lerpVectors(tween.from.pos, tween.to.pos, e);
        pose.at.lerpVectors(tween.from.at, tween.to.at, e);
        pose.ox = lerp(tween.from.ox, tween.to.ox, e);
        pose.oy = lerp(tween.from.oy, tween.to.oy, e);
        if (k >= 1) { const d = tween.done; tween = null; d(true); }
        busy = true;
      }

      // drag momentum, decaying, and a soft wall at each end
      if (!drag && Math.abs(yawV) > 0.001) {
        yaw = clamp(yaw + yawV * dt, -YAW, YAW);
        yawV *= Math.pow(0.02, dt);
        if (Math.abs(yaw) >= YAW) yawV = 0;
        busy = true;
      }
      if (Math.abs(world.rotation.y - yaw) > 1e-4) { world.rotation.y += (yaw - world.rotation.y) * 0.25; busy = true; }

      if (!openId && !tween) {
        lean.x += (lean.tx - lean.x) * 0.06;
        lean.y += (lean.ty - lean.y) * 0.06;
        if (Math.abs(lean.tx - lean.x) + Math.abs(lean.ty - lean.y) > 1e-3) busy = true;
      }

      // attract: step the frame through the objects once
      if (attract && now > attract.t) {
        if (attract.i >= ORDER.length) { attract = null; setHover(null); }
        else { setHover(ORDER[attract.i]); attract.i++; attract.t = now + 520; }
      }
      if (attract) busy = true;

      // hover from the ray, when the pointer is over the canvas
      if (pointerIn && !drag && !tween && !openId && !attract) setHover(pick());

      // a hovered object rises a few millimetres, as if picked up
      Object.values(things).forEach((t) => {
        const goal = t.id === hovered && !openId ? 0.028 : 0;
        if (Math.abs(t.lift - goal) > 1e-4) { t.lift += (goal - t.lift) * (reduced ? 1 : 0.2); busy = true; }
        t.group.position.y = t.base + t.lift;
      });

      // status lights breathe while their site is up
      const tt = now / 1000;
      // Breathing keeps the loop awake, so it happens only with a mouse, where
      // the desk is being looked at; on a phone the lights hold steady and the
      // loop sleeps.
      const breathe = !!status && fine && !reduced;
      Object.values(things).forEach((t) => {
        if (!t.led) return;
        const st = statusOf(t.host);
        const m = t.led.material;
        if (!st) { m.emissiveIntensity = 0.15; m.color.setHex(0xc7a266); return; }
        m.color.setHex(st.up ? 0xffb03b : 0x9aa4ab);
        m.emissiveIntensity = st.up ? (breathe ? 0.9 + 0.6 * (0.5 + 0.5 * Math.sin(tt * 2.4 + t.base * 9)) : 1.2) : 0;
      });

      // camera, with the lean added on top of the pose
      camera.position.copy(pose.pos);
      if (!openId && !tween) camera.position.add(new THREE.Vector3(lean.x * 0.22, lean.y * 0.1, 0));
      camera.lookAt(pose.at);
      if (pose.ox || pose.oy) camera.setViewOffset(W, H, pose.ox * W, pose.oy * H, W, H);
      else camera.clearViewOffset();

      const gliding = placeFrame(dt);
      const moving = busy || gliding || drag !== null || dirty;
      // when only the lights are changing, every other frame is plenty
      if (moving || !(tick++ & 1)) gl.render(s3, camera);
      dirty = false;

      awake = moving || breathe;
      if (awake && inView) requestAnimationFrame(frameLoop);
      else awake = false;
    }

    new IntersectionObserver((es) => {
      inView = es.some((e) => e.isIntersecting);
      if (inView) wake();
    }, { rootMargin: '10% 0px' }).observe(root);
    // coming back from the résumé through the browser's own cache
    addEventListener('pageshow', (e) => { if (e.persisted) { tween = null; copyPose(pose, homePose); stage.removeAttribute('data-flying'); dirty = true; wake(); } });

    addEventListener('resize', () => { resize(); wake(); }, { passive: true });
    resize();
    setTimeout(reveal, 5000);          // a slow or failed image must not hold the desk back

    // The desk arrives rather than appears: it starts a little further out and
    // settles in with a long ease-out, once, while the canvas fades up. Then
    // the tour. Reduced motion gets the fade and no travel.
    function reveal() {
      if (root.hasAttribute('data-ready')) return;
      const start = {
        pos: homePose.pos.clone().sub(homePose.at).multiplyScalar(1.16).add(homePose.at).add(new THREE.Vector3(0.3, 0.1, 0)),
        at: homePose.at.clone(), ox: homePose.ox, oy: homePose.oy,
      };
      copyPose(pose, reduced ? homePose : start);
      root.setAttribute('data-ready', '');
      wake();
      tweenTo(homePose, 1300, out).then(() => { if (attract) attract.t = performance.now() + 250; });
      openFromHash();
    }
  }
})();
