/* =============================================================
   THE DESK, as a module
   -------------------------------------------------------------
   basement.studio's hero is its office, and every object in it
   is a way in. This is the same idea for one engineer: a desk
   where every object is something I built.

   This file is the Three.js scene and nothing else. React owns
   the page around it (src/components/Desk.jsx) and every action
   (src/lib/windows.jsx): the scene reports a click through
   onGo(id), React answers by flying the camera (flyTo), opening
   a window, and telling the scene when a window covers it
   (setCovered) so it stops drawing.

   Status lights are real: the page dispatches 'site-status' with
   what /api/status found, and the lights follow it.
   ============================================================= */
import * as THREE from 'three';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out = (t) => 1 - (1 - t) ** 4;     // the arrival: fast start, long settle
// A CSS cubic-bezier as a function of time, solved by bisection (x(t) is
// monotonic, so this never misses), so flights use the page's own curves.
function bezier(x1, y1, x2, y2) {
  const f = (t, a, b) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 22; i++) { t = (lo + hi) / 2; if (f(t, x1, x2) < x) lo = t; else hi = t; }
    return f(t, y1, y2);
  };
}
// The iOS sheet curve: it moves the instant you click, then settles long,
// which is what makes a camera flight read as smooth rather than late.
const glide = bezier(0.32, 0.72, 0, 1);

/**
 * @param root    the stage element ([data-desk]) holding the canvas and the frame
 * @param canvas  the canvas to draw into
 * @param things  { id: { label, host } } from src/data.js
 * @param onGo    called with an object's id when it is clicked
 * @param onReady called once the desk has arrived
 * @returns the scene's public side, or null when WebGL is unavailable
 */
export function createDesk({ root, canvas, things: DATA, onGo, onReady }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let gl = null;
  try {
    gl = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { return null; }
  let covered = false;

  const ink = '#0E1519', inkSoft = '#566772', hot = '#FFB03B', paper = '#FBFCFC';

  gl.setClearAlpha(0);
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.0;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  // Nothing on the desk moves during a flight, so the shadows are drawn
  // once and redrawn only when something does. Redrawing them every frame
  // was most of what a flight cost on a slower machine.
  gl.shadowMap.autoUpdate = false;
  gl.shadowMap.needsUpdate = true;

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
  // a still, centre-cropped to the surface it goes on (top kept); site
  // captures are 1680x1080, anything else says its own proportions
  function still(src, aspect, a = 1680 / 1080) {
    const t = loader.load(src, () => { dirty = true; wake(); });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
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
  function thing(id, group, face, led, extra) {
    group.traverse((o) => { if (o.isMesh) o.userData.thing = id; });
    things[id] = { id, group, face, led, lift: 0, base: group.position.y, host: (DATA[id] && DATA[id].host) || '', ...extra };
  }

  const TOP = 0.74;

  /* ---- the desk -------------------------------------------------- */
  const desk = new THREE.Group();
  world.add(desk);
  add(desk, rbox(3.46, 0.05, 1.16, 0.022), clay, -0.08, TOP - 0.025, 0);
  add(desk, rbox(0.05, TOP - 0.05, 1.04, 0.02), clay, -1.76, (TOP - 0.05) / 2, 0);
  add(desk, rbox(0.05, TOP - 0.05, 1.04, 0.02), clay, 1.6, (TOP - 0.05) / 2, 0);

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
  monitor('desi', '/assets/work/desi-1.jpg', -0.5, -0.28, 0.18);
  monitor('amg', '/assets/work/amg-1.jpg', 0.42, -0.3, -0.08);

  /* ---- laptop: NeuraCraft ----------------------------------------- */
  {
    const g = new THREE.Group();
    g.position.set(-1.3, TOP, 0.24); g.rotation.y = 0.46;
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
    const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screen(still('/assets/work/neura.jpg', sw / sh)));
    face.position.set(0, LH / 2, 0.0065);
    hinge.add(face);
    const led = add(g, new THREE.SphereGeometry(0.005, 12, 8), ledMat(), W / 2 - 0.03, 0.0185, D / 2 - 0.025);
    thing('neura', g, face, led);
  }

  /* ---- CRT terminal: AI Terminal --------------------------------- */
  {
    const g = new THREE.Group();
    g.position.set(1.12, TOP, -0.12); g.rotation.y = -0.36;
    world.add(g);
    add(g, rbox(0.3, 0.02, 0.26, 0.01), clayDim, 0, 0.01, -0.04);
    add(g, rbox(0.44, 0.37, 0.4, 0.05), clay, 0, 0.205, -0.04);
    add(g, rbox(0.37, 0.29, 0.02, 0.018), inkM, 0, 0.215, 0.165);
    const sw = 0.31, sh = 0.232;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screen(still('/assets/work/terminal.jpg', sw / sh)));
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
    g.position.set(1.98, 0, -0.18); g.rotation.y = -0.44;
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
    const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), screen(still('/assets/work/quest.jpg', sw / sh)));
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
    g.position.set(-0.36, TOP, 0.3); g.rotation.y = 0.18;
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
    g.position.set(0.08, TOP, 0.32); g.rotation.y = -0.1;
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
    g.position.set(0.44, TOP, 0.33); g.rotation.y = -0.3; g.scale.setScalar(1.25);
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

  /* ---- lamp: the one toy on the desk; it switches on and off ------- */
  {
    const g = new THREE.Group();
    g.position.set(-1.62, TOP, -0.38); g.rotation.y = 0.7;
    world.add(g);
    add(g, new THREE.CylinderGeometry(0.075, 0.085, 0.022, 28), clay, 0, 0.011, 0);
    const arm1 = new THREE.Group(); arm1.position.set(0, 0.022, 0); arm1.rotation.z = -0.28; g.add(arm1);
    add(arm1, new THREE.CylinderGeometry(0.009, 0.009, 0.36, 12), clay, 0, 0.18, 0);
    const arm2 = new THREE.Group(); arm2.position.set(0, 0.36, 0); arm2.rotation.z = 1.25; arm1.add(arm2);
    add(arm2, new THREE.SphereGeometry(0.016, 14, 10), clay, 0, 0, 0);
    add(arm2, new THREE.CylinderGeometry(0.009, 0.009, 0.3, 12), clay, 0, 0.15, 0);
    const head = new THREE.Group(); head.position.set(0, 0.3, 0); head.rotation.z = 0.95; arm2.add(head);
    add(head, new THREE.CylinderGeometry(0.045, 0.085, 0.11, 28, 1, true), clay, 0, -0.04, 0).material.side = THREE.DoubleSide;
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffc877, emissiveIntensity: 1.6 });
    add(head, new THREE.SphereGeometry(0.03, 16, 12), bulbMat, 0, -0.07, 0);
    // a warm pool of light on the desk, no shadow of its own (that would
    // be a second shadow pass for a toy)
    const bulb = new THREE.PointLight(0xffc27a, 1.4, 1.9, 1.6);
    bulb.position.set(0, -0.12, 0);
    head.add(bulb);
    thing('lamp', g, null, null, { label: 'Turn the lamp off', on: true, bulb, bulbMat });
  }

  /* ---- books: the two degrees ------------------------------------------ */
  {
    const g = new THREE.Group();
    g.position.set(-1.3, TOP, -0.4); g.rotation.y = 0.28;
    world.add(g);
    const spine = (label, sub, bg, fg) => painted(120, 560, (c, w, h) => {
      c.fillStyle = bg; c.fillRect(0, 0, w, h);
      c.save(); c.translate(w / 2 + 12, h - 30); c.rotate(-Math.PI / 2);
      c.fillStyle = fg; c.font = display(46); c.fillText(label, 0, 0);
      c.globalAlpha = 0.7; c.font = text(24, 600); c.fillText(sub, 0, -44);
      c.restore();
    });
    [['IIT Guwahati', 'BSc (Hons) DS and AI', '#3F5C6C', '#F4F6F7', 0.058, 0.3],
     ['DY Patil', 'B.Tech CSE', '#6F5C39', '#F4F6F7', 0.05, 0.27],
     ['', '', '#E3E8EB', '#0E1519', 0.04, 0.24]].forEach(([l, sb, bg, fg, w, h], i) => {
      const bookMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(bg), roughness: 0.8 });
      const bk = add(g, rbox(w, h, 0.2, 0.006), bookMat, -0.06 + i * 0.062, h / 2, 0);
      if (i === 2) { bk.rotation.z = -0.22; bk.position.x += 0.02; }
      if (l) {
        const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.92), screen(spine(l, sb, bg, fg)));
        face.position.set(bk.position.x, h / 2, 0.1011);
        g.add(face);
      }
    });
    thing('books', g, null, null);
  }

  /* ---- trophy: hackathons and prizes ---------------------------------------- */
  {
    const g = new THREE.Group();
    g.position.set(-1.0, TOP, -0.2);
    world.add(g);
    const gold = new THREE.MeshStandardMaterial({ color: 0xf2a93b, roughness: 0.32, metalness: 0.55, emissive: 0x3a2200, emissiveIntensity: 0.4 });
    add(g, rbox(0.1, 0.03, 0.1, 0.008), inkM, 0, 0.015, 0);
    add(g, new THREE.CylinderGeometry(0.012, 0.018, 0.07, 16), gold, 0, 0.065, 0);
    const cup = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; cup.push(new THREE.Vector2(0.012 + 0.05 * Math.sin(t * 1.35), t * 0.1)); }
    const bowl = add(g, new THREE.LatheGeometry(cup, 32), gold, 0, 0.1, 0);
    bowl.material = gold;
    [-1, 1].forEach((sd) => {
      const h = add(g, new THREE.TorusGeometry(0.025, 0.006, 8, 20, Math.PI), gold, sd * 0.058, 0.16, 0);
      h.rotation.z = sd * -Math.PI / 2;
    });
    thing('trophy', g, null, null);
  }

  /* ---- the five boards: one light per live site ------------------------------ */
  {
    const g = new THREE.Group();
    g.position.set(1.37, TOP, 0.27); g.rotation.y = -0.55; g.scale.setScalar(1.35);
    world.add(g);
    const leds = [];
    const hosts = ['desitotes.com', 'amgprojectsllp.com', 'ai-compiler-eta.vercel.app', 'ai-chat-bot-gcar.vercel.app', 'gamifyport.vercel.app'];
    for (let i = 0; i < 5; i++) {
      const y = 0.02 + i * 0.045;
      add(g, rbox(0.17, 0.014, 0.12, 0.004), i % 2 ? clayDim : clay, 0, y, 0);
      const led = add(g, new THREE.SphereGeometry(0.0065, 12, 8), ledMat(), 0.062, y + 0.012, 0.055);
      leds.push({ led, host: hosts[i] });
    }
    [[-0.075, -0.05], [0.075, -0.05], [-0.075, 0.05], [0.075, 0.05]].forEach(([x, z]) => add(g, new THREE.CylinderGeometry(0.004, 0.004, 0.2, 8), inkM, x, 0.11, z));
    thing('rack', g, null, null, { leds });
  }

  /* ---- photo: about me --------------------------------------------------------- */
  {
    const g = new THREE.Group();
    g.position.set(-0.84, TOP, 0.36); g.rotation.y = 0.32;
    world.add(g);
    const tilt = new THREE.Group(); tilt.rotation.x = -0.2; g.add(tilt);
    add(tilt, rbox(0.15, 0.19, 0.014, 0.006), inkM, 0, 0.095, 0);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.126, 0.166), screen(still('/assets/me/colophon-poster.jpg', 0.126 / 0.166, 1024 / 577)));
    face.position.set(0, 0.095, 0.0074);
    tilt.add(face);
    add(g, rbox(0.03, 0.08, 0.012, 0.004), inkM, 0, 0.04, -0.045).rotation.x = 0.5;
    thing('photo', g, face, null);
  }

  /* ---- the tote: the shop itself ------------------------------------------------- */
  {
    const g = new THREE.Group();
    g.position.set(0.74, TOP, 0.34); g.rotation.y = -0.36;
    world.add(g);
    const bag = new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.95 });
    add(g, rbox(0.21, 0.22, 0.07, 0.016), bag, 0, 0.11, 0);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.2), new THREE.MeshStandardMaterial({ map: still('/assets/desi/print_daisy_black.jpg', 0.19 / 0.2, 1), roughness: 0.95 }));
    face.position.set(0, 0.11, 0.0356);
    g.add(face);
    [-1, 1].forEach((sd) => {
      const h = add(g, new THREE.TorusGeometry(0.05, 0.006, 8, 24, Math.PI), bag, sd * 0.045, 0.22, 0);
      h.scale.y = 1.3;
    });
    thing('tote', g, face, null);
  }

  const pickable = [];
  Object.values(things).forEach((t) => t.group.traverse((o) => { if (o.isMesh) pickable.push(o); }));

  /* ---- the camera: framed to the desk, whatever the window -------- */
  const bounds = new THREE.Box3();
  Object.values(things).forEach((t) => bounds.expandByObject(t.group));
  bounds.expandByObject(desk);
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  const DIR = new THREE.Vector3(-0.18, 0.72, 1).normalize();
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
      const top = 74 / H, bottom = (H - 92) / H;              // under the bar, above the switch
      const left = (lr.right - r.left + 28) / W, right = 0.99;
      const beside = { w: right - left, h: bottom - top, x: (left + right) / 2, y: (top + bottom) / 2 };
      const ceil = (lr.top - r.top - 16) / H;
      const above = { w: 0.96, h: ceil - top, x: 0.5, y: (top + ceil) / 2 };
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
    if (!tween && !covered) copyPose(pose, homePose);
    dirty = true;
  }
  function copyPose(a, b) { a.pos.copy(b.pos); a.at.copy(b.at); a.ox = b.ox; a.oy = b.oy; }

  let tween = null;
  function tweenTo(target, ms, curve = inOut) {
    // start from where the camera actually is, lean included, so a flight
    // never begins with a jump
    if (!covered && !tween && (lean.x || lean.y)) {
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
    if (!t.face) return poseForObject(t.group, fill);
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

  // an object with no screen is approached along the home direction until
  // its outline fills the given share of the frame
  function poseForObject(o, fill) {
    box.setFromObject(o);
    const c = box.getCenter(new THREE.Vector3());
    const r = box.getBoundingSphere(new THREE.Sphere()).radius;
    const vf = (camera.fov * Math.PI) / 180;
    const d = r / Math.tan(vf / 2) / fill;
    return { pos: c.clone().addScaledVector(DIR, d), at: c, ox: 0, oy: 0 };
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
    if (t && t.leds && status) {
      const up = t.leds.filter((l) => (statusOf(l.host) || {}).up).length;
      return `${up} of ${t.leds.length} sites answering`;
    }
    const st = t && t.host && statusOf(t.host);
    if (!st) return '';
    return st.up ? `live, ${st.ms} ms` : 'not answering right now';
  }
  function setHover(id) {
    if (id === hovered) return;
    hovered = id;
    canvas.style.cursor = id ? 'pointer' : '';
    if (id) {
      fName.textContent = (DATA[id] && DATA[id].label) || things[id].label;
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

  const pointerAt = { x: -1, y: -1 };
  function insideFrame() {
    return !!hovered && fr.on && pointerAt.x >= fr.x && pointerAt.x <= fr.x + fr.w && pointerAt.y >= fr.y && pointerAt.y <= fr.y + fr.h;
  }
  function pick() {
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickable, false)[0];
    return hit ? hit.object.userData.thing : null;
  }

  function toggleLamp() {
    const l = things.lamp;
    l.on = !l.on;
    l.bulb.intensity = l.on ? 1.4 : 0;
    l.bulbMat.emissiveIntensity = l.on ? 1.6 : 0;
    l.label = l.on ? 'Turn the lamp off' : 'Turn the lamp on';
    fName.textContent = l.label;
    labW = label.offsetWidth;
    dirty = true;
    wake();
  }

  /* ---- pointer: lean, hover, drag to turn, click to go ---------------- */
  let lean = { x: 0, y: 0, tx: 0, ty: 0 };
  let yaw = 0, yawV = 0, drag = null, moved = false;
  const YAW = 0.5;

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerAt.x = e.clientX - r.left; pointerAt.y = e.clientY - r.top;
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
  canvas.addEventListener('pointerleave', () => { pointerIn = false; lean.tx = lean.ty = 0; if (!covered) setHover(null); });
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
    pointerAt.x = e.clientX - r.left; pointerAt.y = e.clientY - r.top;
    const id = pick() || (insideFrame() ? hovered : null);
    if (id === 'lamp') toggleLamp();
    else if (id) onGo(id);
  });

  // Once, on arrival, the frame visits each object in turn, so it is clear
  // before anyone has to guess that everything on the desk opens.
  const ORDER = ['desi', 'amg', 'quest', 'term', 'rack', 'phone'];
  let attract = (fine && !reduced && !location.hash) ? { i: 0, t: Infinity } : null;

  /* ---- status: real, from /api/status ------------------------------ */
  let status = window.__siteStatus || null;
  function statusOf(host) { return status && status.byHost ? status.byHost[host] : null; }
  const onStatus = (e) => { status = e.detail; if (hovered) fNote.textContent = note(hovered); wake(); };
  addEventListener('site-status', onStatus);

  /* ---- the public side, for the actions above ----------------------- */
  let inView = true;
  const stage = root.closest('.desk') || root;
  const scene = {
    onScreen: () => inView,
    rectOf(id) {
      const t = things[id];
      return t ? rectOfObject(t.face || t.group) : null;
    },
    async flyTo(id, fill, ms) {
      const t = things[id];
      if (!t || !(t.face || t.group)) return null;
      setHover(null);
      attract = null;
      // the headline steps back while the camera goes in, so the object
      // being entered has the screen to itself
      stage.setAttribute('data-flying', '');
      await tweenTo(poseFor(t, fill), ms, glide);
      return rectOfObject(t.face || t.group);
    },
    home() { stage.removeAttribute('data-flying'); tweenTo(homePose, 820, glide); },
    // React sets this while a window covers the desk: nothing is drawn then
    setCovered(v) { covered = v; if (!v) wake(); },
    // the page's links name the same things: pointing at one frames it here
    highlight(id) {
      if (id && things[id] && inView) { attract = null; setHover(id); } else if (!id && !pointerIn) setHover(null);
    },
    destroy() {
      inView = false;
      io.disconnect();
      removeEventListener('resize', onResize);
      removeEventListener('pageshow', onShow);
      removeEventListener('site-status', onStatus);
      gl.dispose();
    },
  };

  /* ---- the loop ---------------------------------------------------- */
  let awake = false, last = performance.now(), tick = 0;
  function wake() { if (!awake && inView) { awake = true; last = performance.now(); requestAnimationFrame(frameLoop); } }

  function frameLoop(now) {
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    // behind an open window nothing is visible, so nothing is drawn: the
    // app in the window gets the whole machine
    if (covered && !tween) { awake = false; return; }
    let busy = false, moved = false;

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
    if (Math.abs(world.rotation.y - yaw) > 1e-4) { world.rotation.y += (yaw - world.rotation.y) * 0.25; busy = true; moved = true; }

    if (!covered && !tween) {
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
    // A hovered object rises, which can carry its edge out from under the
    // pointer; while the pointer is still inside the frame, the hover holds,
    // so nothing flickers at the edges.
    if (pointerIn && !drag && !tween && !covered && !attract) {
      const hit = pick();
      if (hit || !insideFrame()) setHover(hit);
    }

    // a hovered object rises a few millimetres, as if picked up
    Object.values(things).forEach((t) => {
      const goal = t.id === hovered && !covered ? 0.028 : 0;
      if (Math.abs(t.lift - goal) > 1e-4) { t.lift += (goal - t.lift) * (reduced ? 1 : 0.2); busy = true; moved = true; }
      t.group.position.y = t.base + t.lift;
    });

    // status lights breathe while their site is up
    const tt = now / 1000;
    // Breathing keeps the loop awake, so it happens only with a mouse, where
    // the desk is being looked at; on a phone the lights hold steady and the
    // loop sleeps.
    const breathe = !!status && fine && !reduced;
    const light = (led, host, phase) => {
      const st = statusOf(host);
      const m = led.material;
      if (!st) { m.emissiveIntensity = 0.15; m.color.setHex(0xc7a266); return; }
      m.color.setHex(st.up ? 0xffb03b : 0x9aa4ab);
      m.emissiveIntensity = st.up ? (breathe ? 0.9 + 0.6 * (0.5 + 0.5 * Math.sin(tt * 2.4 + phase)) : 1.2) : 0;
    };
    Object.values(things).forEach((t, i) => {
      if (t.led) light(t.led, t.host, i * 1.3);
      if (t.leds) t.leds.forEach((l, k) => light(l.led, l.host, k * 0.9));
    });

    // camera, with the lean added on top of the pose
    camera.position.copy(pose.pos);
    if (!covered && !tween) camera.position.add(new THREE.Vector3(lean.x * 0.22, lean.y * 0.1, 0));
    camera.lookAt(pose.at);
    if (pose.ox || pose.oy) camera.setViewOffset(W, H, pose.ox * W, pose.oy * H, W, H);
    else camera.clearViewOffset();

    const gliding = placeFrame(dt);
    const moving = busy || gliding || drag !== null || dirty;
    // when only the lights are changing, every other frame is plenty
    if (moved) gl.shadowMap.needsUpdate = true;
    if (moving || !(tick++ & 1)) gl.render(s3, camera);
    dirty = false;

    awake = moving || breathe;
    if (awake && inView) requestAnimationFrame(frameLoop);
    else awake = false;
  }

  const io = new IntersectionObserver((es) => {
    inView = es.some((e) => e.isIntersecting);
    if (inView) wake();
  }, { rootMargin: '10% 0px' });
  io.observe(root);
  // coming back from the résumé through the browser's own cache
  const onShow = (e) => { if (e.persisted) { tween = null; copyPose(pose, homePose); stage.removeAttribute('data-flying'); dirty = true; wake(); } };
  addEventListener('pageshow', onShow);

  const onResize = () => { resize(); wake(); };
  addEventListener('resize', onResize, { passive: true });
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
    if (onReady) onReady();
  }

  return scene;
}
