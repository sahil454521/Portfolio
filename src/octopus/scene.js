// The octopus in the hero: the three.js scene from the "Sahil the Octopus" artifact, a faceted
// animal with its own water, glow and motes. Recoloured to the site's orange on charcoal, and
// drawn into the canvas it is given, sized to that canvas.
import {
  AdditiveBlending, Box3, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, ColorManagement,
  CylinderGeometry, DoubleSide, Group, IcosahedronGeometry, LinearFilter, LinearSRGBColorSpace, MathUtils, Mesh,
  MeshBasicMaterial, OctahedronGeometry, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial,
  RGBAFormat, RingGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderTarget, WebGLRenderer,
} from 'three';

/* ---------- helpers ---------- */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));
class Spring {
  constructor(x, k, c) { this.x = x; this.v = 0; this.t = x; this.k = k; this.c = c; }
  step(dt) {
    let left = dt;
    while (left > 1e-6) {
      const h = Math.min(left, 1 / 120);
      this.v += (-this.k * (this.x - this.t) - this.c * this.v) * h;
      this.x += this.v * h;
      left -= h;
    }
    return this.x;
  }
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- shaders ---------- */
const QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const NOISE = [
  'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
  'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
  'float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }',
].join('\n');

// Layers, back to front: open water, two sheets of haze, light shafts, the aura, three seabed ridges.
const BG_FS = [
  'varying vec2 vUv;',
  'uniform float uTime, uAspect, uBreath, uPar, uFlash;',
  'uniform vec2 uCenter;',
  'uniform vec3 uGlow, uWater, uVoid;',
  NOISE,
  'void main(){',
  '  vec2 p = (vUv - uCenter) * vec2(uAspect, 1.0);',
  '  float r = length(p);',
  '  float x = (vUv.x - 0.5) * uAspect;',
  '  vec3 col = uVoid + uWater * (0.03 + 0.36 * smoothstep(0.1, 1.2, vUv.y));',
  '  float haze = fbm(p * 1.7 + vec2(uTime * 0.012 + uPar * 0.1, -uTime * 0.009));',
  '  float haze2 = fbm(p * 2.5 + vec2(-uTime * 0.021 + uPar * 0.28, uTime * 0.013) + 7.3);',
  '  col += uWater * (haze * 0.4 + haze2 * 0.22) * (1.0 - smoothstep(0.2, 1.2, r));',
  '  float sx = (p.x - p.y * 0.34) * 1.15 + uPar * 0.12;',
  '  float sh = noise(vec2(sx, uTime * 0.025)) * 0.65 + noise(vec2(sx * 2.1 + 4.0, uTime * 0.04)) * 0.35;',
  '  col += uGlow * smoothstep(0.42, 0.9, sh) * smoothstep(-0.35, 0.8, p.y) * 0.06;',
  '  float aura = 0.2 * exp(-r * r * 12.0) + 0.1 * exp(-r * r * 2.8);',
  '  col += uGlow * aura * (0.82 + 0.18 * uBreath + uFlash * 0.35);',
  '  float h1 = 0.285 + 0.08 * fbm(vec2(x * 1.5 + uPar * 0.05 + 3.1, 1.0));',
  '  float h2 = 0.215 + 0.075 * fbm(vec2(x * 2.3 + uPar * 0.11 + 8.4, 5.0));',
  '  float h3 = 0.13 + 0.07 * fbm(vec2(x * 3.4 + uPar * 0.2 + 1.7, 9.0));',
  '  col = mix(col, uVoid + uWater * 0.3, smoothstep(h1 + 0.012, h1 - 0.012, vUv.y) * 0.85);',
  '  col = mix(col, uVoid + uWater * 0.14, smoothstep(h2 + 0.01, h2 - 0.01, vUv.y) * 0.92);',
  '  col = mix(col, uVoid * 0.9, smoothstep(h3 + 0.008, h3 - 0.008, vUv.y));',
  '  vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);',
  '  col *= 1.0 - 0.55 * smoothstep(0.3, 1.05, length(q) * 1.15);',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n');

const BGOUT_FS = [
  'varying vec2 vUv; uniform sampler2D tex; uniform float uTime;',
  'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
  'void main(){ vec3 c = texture2D(tex, vUv).rgb; float n = hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5;',
  '  gl_FragColor = vec4(c + n * (1.6 / 255.0), 1.0); }',
].join('\n');

// Faceted skin: flat normals from screen derivatives, a key light, a rim, lit facets and photophore dots.
const SKIN_VS = [
  'attribute vec2 aFace;',
  'varying vec3 vView; varying vec2 vFace;',
  'void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz; vFace = aFace; gl_Position = projectionMatrix * mv; }',
].join('\n');
const SKIN_FS = [
  'uniform vec3 uGlow, uBase, uLit, uFog;',
  'uniform float uTime, uCoord, uSeed, uEmit, uPulse, uPulseAmp, uFlash, uFogNear, uFogFar;',
  'varying vec3 vView; varying vec2 vFace;',
  'void main(){',
  '  vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));',
  '  vec3 v = normalize(-vView);',
  '  float ndv = clamp(dot(n, v), 0.0, 1.0);',
  '  vec3 L = normalize(vec3(-0.5, 0.78, 0.42));',
  '  float key = max(dot(n, L), 0.0);',
  '  float sky = n.y * 0.5 + 0.5;',
  '  float spec = pow(max(dot(n, normalize(L + v)), 0.0), 26.0);',
  '  float rim = pow(1.0 - ndv, 2.4);',
  '  float isDot = step(1.5, vFace.y);',
  '  float tw = 0.5 + 0.5 * sin(uTime * (0.7 + vFace.x * 1.1) + vFace.x * 43.0 + uSeed);',
  '  float spot = smoothstep(0.78, 1.0, vFace.y) * (1.0 - isDot) * tw;',
  '  float wave = exp(-pow((uCoord - uPulse) * 4.5, 2.0)) * uPulseAmp;',
  '  vec3 col = mix(uBase, uLit, clamp(key * 0.95 + sky * 0.12, 0.0, 1.0));',
  '  col += uGlow * (uEmit + spot * 0.5 + wave * 0.42 + uFlash * 0.07);',
  '  col += (uGlow + 0.35) * spec * 0.55;',
  '  col += uGlow * rim * (0.8 + uFlash * 0.3 + wave * 0.45);',
  '  float dotGlow = clamp(0.55 + 0.45 * sin(uTime * 1.3 - uCoord * 9.0 + uSeed) + wave * 1.5 + uFlash, 0.0, 1.0);',
  '  col = mix(col, uGlow * 1.25 + 0.25, dotGlow * isDot);',
  '  float fog = smoothstep(uFogNear, uFogFar, -vView.z);',
  '  col = mix(col, uFog, fog * 0.82);',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n');

// Motes: drifting up, swaying, soft when out of focus.
const MOTE_VS = [
  'attribute vec4 aRand;',
  'uniform float uTime, uPx, uFocus, uPar;',
  'varying float vBlur, vAlpha, vBright;',
  'void main(){',
  '  vec3 p = position;',
  '  p.y = mod(p.y + uTime * (0.04 + aRand.z * 0.08) + 8.0, 16.0) - 8.0;',
  '  p.x += sin(uTime * 0.31 + aRand.y * 6.283) * 0.3;',
  '  p.z += cos(uTime * 0.23 + aRand.y * 9.42) * 0.3;',
  '  float c = cos(uPar), s = sin(uPar);',
  '  p.xz = vec2(p.x * c + p.z * s, -p.x * s + p.z * c);',
  '  vec4 mv = viewMatrix * vec4(p, 1.0);',
  '  float depth = -mv.z;',
  '  vBlur = clamp(abs(depth - uFocus) / 6.5, 0.0, 1.0);',
  '  float tw = 0.75 + 0.25 * sin(uTime * (0.8 + aRand.x) + aRand.y * 31.0);',
  '  vBright = aRand.w;',
  '  vAlpha = (0.25 + 0.75 * aRand.w) * mix(1.0, 0.3, vBlur) * tw * smoothstep(0.5, 2.5, depth) * (1.0 - smoothstep(7.0, 8.0, abs(p.y)));',
  '  gl_PointSize = max(1.5, uPx * (0.035 + aRand.x * 0.07) * (1.0 + vBlur * 2.0) / depth);',
  '  gl_Position = projectionMatrix * mv;',
  '}',
].join('\n');
const MOTE_FS = [
  'uniform vec3 uGlow;',
  'varying float vBlur, vAlpha, vBright;',
  'void main(){',
  '  float d = length(gl_PointCoord - 0.5) * 2.0;',
  '  if (d > 1.0) discard;',
  '  float core = 1.0 - d;',
  '  float a = mix(core * core * 1.2, smoothstep(1.0, 0.7, d) * 0.5, vBlur);',
  '  vec3 c = uGlow * (0.7 + 0.8 * vBright) + vec3(0.4, 0.3, 0.25) * core * core * (1.0 - vBlur);',
  '  gl_FragColor = vec4(c, a * vAlpha);',
  '}',
].join('\n');

const BRIGHT_FS = [
  'varying vec2 vUv; uniform sampler2D tex;',
  'void main(){ vec3 c = texture2D(tex, vUv).rgb; float l = max(c.r, max(c.g, c.b));',
  '  gl_FragColor = vec4(c * smoothstep(0.5, 0.92, l), 1.0); }',
].join('\n');
const BLUR_FS = [
  'varying vec2 vUv; uniform sampler2D tex; uniform vec2 dir;',
  'void main(){',
  '  vec3 c = texture2D(tex, vUv).rgb * 0.227027;',
  '  c += (texture2D(tex, vUv + dir * 1.384615).rgb + texture2D(tex, vUv - dir * 1.384615).rgb) * 0.316216;',
  '  c += (texture2D(tex, vUv + dir * 3.230769).rgb + texture2D(tex, vUv - dir * 3.230769).rgb) * 0.07027;',
  '  gl_FragColor = vec4(c, 1.0);',
  '}',
].join('\n');
const COMP_FS = [
  'varying vec2 vUv; uniform sampler2D tex, tex2; uniform float uTime, uNear, uWide;',
  'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
  'void main(){',
  '  vec3 c = texture2D(tex, vUv).rgb * uNear + texture2D(tex2, vUv).rgb * uWide;',
  '  c += (hash(gl_FragCoord.xy + fract(uTime) * 37.0) - 0.5) * (1.4 / 255.0);',
  '  gl_FragColor = vec4(max(c, 0.0), 1.0);',
  '}',
].join('\n');

/**
 * Draws the octopus into `canvas` and keeps it sized to the canvas's CSS box.
 * Throws when WebGL 2 is not available.
 * @param {HTMLCanvasElement} canvas
 * @param {{ calm?: boolean, onReady?: () => void, onLost?: () => void }} [opts]
 *   calm: the site's motion setting is off, so it holds still unless dragged.
 *   onReady: the first frame is drawn. onLost: the GPU context was lost.
 * @returns {{ setActive(on: boolean): void, dispose(): void }}
 */
export function createOctopus(canvas, { calm = false, onReady, onLost } = {}) {
  // The artifact was made on three r128, which wrote colours untouched; keep it that way.
  ColorManagement.enabled = false;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  const rnd = rng(11);
  const ZAXIS = new Vector3(0, 0, 1);

  /* ---------- one hue: the site's orange, lit from within, on charcoal water ---------- */
  const GLOW = new Color(1.0, 0.42, 0.24);
  const BASE = new Color(0.075, 0.03, 0.018);
  const LIT = new Color(0.62, 0.2, 0.08);
  const FOG = new Color(0.03, 0.03, 0.034);
  const WATER = new Color(0.15, 0.155, 0.17);
  const VOID = new Color(0.008, 0.009, 0.011);

  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 1);
  const FOV = 30;
  const TAN = Math.tan(MathUtils.degToRad(FOV / 2));
  const camera = new PerspectiveCamera(FOV, 1, 1, 90);
  const scene = new Scene();

  /* ---------- render targets and screen passes ---------- */
  const target = (depth) => new WebGLRenderTarget(4, 4, { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat, depthBuffer: depth, stencilBuffer: false });
  const rtBg = target(false); const rtA = target(true); const rtB = target(false); const rtC = target(false); const rtD = target(false);
  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadScene = new Scene();
  const screenMat = (fs, uniforms, extra) => new ShaderMaterial({ uniforms, vertexShader: QUAD_VS, fragmentShader: fs, depthTest: false, depthWrite: false, ...extra });
  const BG = { uTime: { value: 0 }, uAspect: { value: 1 }, uBreath: { value: 0 }, uPar: { value: 0 }, uFlash: { value: 0 }, uCenter: { value: new Vector2(0.5, 0.6) }, uGlow: { value: GLOW }, uWater: { value: WATER }, uVoid: { value: VOID } };
  const bgMat = screenMat(BG_FS, BG);
  const brightMat = screenMat(BRIGHT_FS, { tex: { value: null } });
  const blurMat = screenMat(BLUR_FS, { tex: { value: null }, dir: { value: new Vector2() } });
  const compMat = screenMat(COMP_FS, { tex: { value: rtB.texture }, tex2: { value: rtD.texture }, uTime: BG.uTime, uNear: { value: 0.7 }, uWide: { value: 0.6 } }, { blending: AdditiveBlending, transparent: true });
  const quad = new Mesh(new PlaneGeometry(2, 2), bgMat);
  quad.frustumCulled = false;
  quadScene.add(quad);
  function pass(material, src, dst) {
    material.uniforms.tex.value = src.texture;
    quad.material = material;
    renderer.setRenderTarget(dst);
    renderer.render(quadScene, quadCam);
  }
  function blur(src, dst, x, y) { blurMat.uniforms.dir.value.set(x, y); pass(blurMat, src, dst); }

  const backdrop = new Mesh(new PlaneGeometry(2, 2), screenMat(BGOUT_FS, { tex: { value: rtBg.texture }, uTime: BG.uTime }));
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -100;
  scene.add(backdrop);

  /* ---------- geometry: every part is a simple faceted shape ---------- */
  const U = {
    uTime: { value: 0 }, uGlow: { value: GLOW }, uBase: { value: BASE }, uLit: { value: LIT }, uFog: { value: FOG },
    uPulse: { value: 3 }, uPulseAmp: { value: 0 }, uFlash: { value: 0 }, uFogNear: { value: 10 }, uFogFar: { value: 20 },
  };
  function skin(coord, seed, emit) {
    return new ShaderMaterial({
      uniforms: {
        uTime: U.uTime, uGlow: U.uGlow, uBase: U.uBase, uLit: U.uLit, uFog: U.uFog, uPulse: U.uPulse, uPulseAmp: U.uPulseAmp,
        uFlash: U.uFlash, uFogNear: U.uFogNear, uFogFar: U.uFogFar,
        uCoord: { value: coord }, uSeed: { value: seed }, uEmit: { value: emit },
      },
      vertexShader: SKIN_VS,
      fragmentShader: SKIN_FS,
    });
  }
  function faceted(geo, dot) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const n = g.attributes.position.count;
    const a = new Float32Array(n * 2);
    for (let i = 0; i < n; i += 3) {
      const r1 = rnd();
      const r2 = dot ? 2 : rnd();
      for (let k = 0; k < 3; k++) { a[(i + k) * 2] = r1; a[(i + k) * 2 + 1] = r2; }
    }
    g.setAttribute('aFace', new BufferAttribute(a, 2));
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    return g;
  }
  function merge(list) {
    let total = 0;
    list.forEach((g) => { total += g.attributes.position.count; });
    const pos = new Float32Array(total * 3);
    const face = new Float32Array(total * 2);
    let o = 0;
    list.forEach((g) => {
      pos.set(g.attributes.position.array, o * 3);
      face.set(g.attributes.aFace.array, o * 2);
      o += g.attributes.position.count;
    });
    const m = new BufferGeometry();
    m.setAttribute('position', new BufferAttribute(pos, 3));
    m.setAttribute('aFace', new BufferAttribute(face, 2));
    return m;
  }
  function jitter(geo, amount) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i); const y = p.getY(i); const z = p.getZ(i);
      const h = Math.sin(x * 91.7 + y * 47.3 + z * 73.1) * 43758.5453;
      const f = 1 + (h - Math.floor(h) - 0.5) * amount;
      p.setXYZ(i, x * f, y * f, z * f);
    }
  }

  const octo = new Group();
  const body = new Group();
  octo.add(body);
  scene.add(octo);

  // The dome is mantle and head as one form, the way everyone draws an octopus.
  const domeGeo = new IcosahedronGeometry(1, 1);
  {
    const p = domeGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i); const y = p.getY(i); const z = p.getZ(i);
      const taper = 1 - 0.2 * smooth(0, -1, y);
      const back = 1 + 0.16 * smooth(-0.3, 0.9, y) * (z < 0 ? 1 : 0.2);
      p.setXYZ(i, x * taper, y, z * taper * back);
    }
  }
  jitter(domeGeo, 0.06);
  domeGeo.scale(1, 1.1, 0.98);
  const mantle = new Mesh(faceted(domeGeo), skin(0.05, 1.3, 0.03));
  const mantlePivot = new Group();
  mantlePivot.position.set(0, -0.2, 0);
  mantlePivot.rotation.x = -0.12;
  mantle.position.y = 1.05;
  mantlePivot.add(mantle);
  body.add(mantlePivot);

  const collarGeo = new IcosahedronGeometry(0.8, 1);
  jitter(collarGeo, 0.05);
  collarGeo.scale(1, 0.5, 1);
  const collar = new Mesh(faceted(collarGeo), skin(0.3, 2.1, 0.025));
  collar.position.set(0, -0.2, 0.02);
  body.add(collar);

  const pupilMat = new MeshBasicMaterial({ color: new Color(1.0, 0.88, 0.8) });
  const eyes = [];
  [1, -1].forEach((side) => {
    const g = new Group();
    g.position.set(side * 0.43, 0.42, 0.7);
    const bump = new Mesh(faceted(new IcosahedronGeometry(0.25, 1)), skin(0.3, 3 + side, 0));
    const n = new Vector3(side * 0.5, -0.05, 0.86).normalize();
    const pupil = new Mesh(new BoxGeometry(0.27, 0.07, 0.06), pupilMat);
    pupil.position.copy(n).multiplyScalar(0.225);
    pupil.quaternion.setFromUnitVectors(ZAXIS, n);
    const lidGeo = new IcosahedronGeometry(0.272, 1);
    lidGeo.scale(1.02, 0.62, 1.02);
    const lid = new Mesh(faceted(lidGeo), skin(0.3, 5 + side, 0.05));
    lid.position.set(0, 0.13, -0.015);
    g.add(bump, pupil, lid);
    body.add(g);
    eyes.push({ lid, pupil });
  });

  const NSEG = 10;
  const REST = [-0.95, 0.24, 0.22, 0.16, 0.08, -0.14, -0.36, -0.5, -0.6, -0.66];
  const JET = [-0.2, 0.04, 0.03, 0.03, 0.02, 0, -0.03, -0.06, -0.09, -0.12];
  const segGeo = [];
  const segLen = [];
  for (let j = 0; j < NSEG; j++) {
    const len = 0.36 * 0.9 ** j;
    const r0 = 0.22 * 0.855 ** j;
    const r1 = 0.22 * 0.855 ** (j + 1);
    const rm = (r0 + r1) / 2;
    const cone = new CylinderGeometry(r0, r1, len, 6, 1, true);
    cone.translate(0, -len / 2, 0);
    const parts = [faceted(cone), faceted(new IcosahedronGeometry(r0 * 1.03, 0))];
    if (j === NSEG - 1) {
      const tip = new IcosahedronGeometry(r1 * 1.05, 0);
      tip.translate(0, -len, 0);
      parts.push(faceted(tip));
    }
    if (j >= 1 && j <= 8) {
      const d = new OctahedronGeometry(r0 * 0.34, 0);
      d.translate(0, -len * 0.5, rm * 0.96);
      parts.push(faceted(d, true));
    }
    if (j >= 4) {
      [1, -1].forEach((sx) => {
        const sk = new OctahedronGeometry(r0 * 0.3, 0);
        sk.translate(sx * rm * 0.42, -len * 0.5, -rm * 0.82);
        parts.push(faceted(sk, true));
      });
    }
    segGeo.push(merge(parts));
    segLen.push(len);
  }
  const arms = [];
  for (let i = 0; i < 8; i++) {
    const phi = (i + 0.5) * Math.PI / 4;
    const base = new Group();
    base.position.set(Math.cos(phi) * 0.55, -0.3, Math.sin(phi) * 0.55);
    base.rotation.y = Math.PI / 2 - phi;
    const arm = { joints: [], rest: [], phase: rnd() * 6.283, speed: 0.75 + rnd() * 0.35 };
    let parent = base;
    for (let j = 0; j < NSEG; j++) {
      const joint = new Group();
      joint.position.y = j === 0 ? 0 : -segLen[j - 1];
      joint.add(new Mesh(segGeo[j], skin(0.34 + 0.66 * j / (NSEG - 1), i * 1.7 + j * 0.37, 0.02 + j * 0.009)));
      parent.add(joint);
      parent = joint;
      arm.joints.push(joint);
      arm.rest.push(REST[j] * (j >= 6 ? 0.85 + rnd() * 0.4 : 1) + (rnd() - 0.5) * 0.07);
    }
    base.scale.setScalar(0.94 + rnd() * 0.14);
    body.add(base);
    arms.push(arm);
  }
  function poseArms(t, jet) {
    for (let i = 0; i < 8; i++) {
      const a = arms[i];
      for (let j = 0; j < NSEG; j++) {
        const wave = Math.sin(t * a.speed - j * 0.55 + a.phase) * (0.035 + j * 0.016);
        const side = Math.sin(t * a.speed * 0.7 - j * 0.4 + a.phase * 1.3) * (0.015 + j * 0.012);
        const rest = a.rest[j] + wave;
        a.joints[j].rotation.set(rest + (JET[j] - rest) * jet, 0, side * (1 - clamp(jet, 0, 1)));
      }
    }
  }

  // Measure the resting animal once, so the camera can frame it by its real size.
  poseArms(0, 0);
  octo.updateMatrixWorld(true);
  const B = (() => {
    const box = new Box3().setFromObject(octo);
    const reach = Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z));
    return { h: box.max.y - box.min.y, w: reach * 2, offsetY: -(box.max.y + box.min.y) / 2 };
  })();
  body.position.y = B.offsetY;

  /* ---------- motes ---------- */
  const PU = { uTime: U.uTime, uPx: { value: 500 }, uFocus: { value: 15 }, uPar: { value: 0 }, uGlow: { value: GLOW } };
  {
    const N = 340;
    const pos = new Float32Array(N * 3);
    const rand = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rnd() - 0.5) * 15; pos[i * 3 + 1] = (rnd() - 0.5) * 16; pos[i * 3 + 2] = -10 + rnd() * 17;
      rand[i * 4] = rnd(); rand[i * 4 + 1] = rnd(); rand[i * 4 + 2] = rnd(); rand[i * 4 + 3] = rnd() ** 1.8;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aRand', new BufferAttribute(rand, 4));
    const pts = new Points(g, new ShaderMaterial({ uniforms: PU, vertexShader: MOTE_VS, fragmentShader: MOTE_FS, transparent: true, depthWrite: false, blending: AdditiveBlending }));
    pts.frustumCulled = false;
    scene.add(pts);
  }

  /* ---------- reaction: a ring of light and a jet of motes ---------- */
  const ring = new Mesh(new RingGeometry(0.986, 1, 128), new MeshBasicMaterial({ color: GLOW, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
  ring.visible = false;
  scene.add(ring);
  const dotTex = (() => {
    const cv = document.createElement('canvas');
    cv.width = 64; cv.height = 64;
    const g = cv.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new CanvasTexture(cv);
  })();
  const JETN = 40;
  const jetPos = new Float32Array(JETN * 3);
  const jetVel = new Float32Array(JETN * 3);
  const jetGeo = new BufferGeometry();
  jetGeo.setAttribute('position', new BufferAttribute(jetPos, 3));
  const jetPts = new Points(jetGeo, new PointsMaterial({ map: dotTex, color: new Color(1.0, 0.62, 0.45), size: 0.16, sizeAttenuation: true, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }));
  jetPts.frustumCulled = false;
  jetPts.visible = false;
  scene.add(jetPts);

  /* ---------- state ---------- */
  const S = { t: 0, clock: 0, yaw: 0.32, yawVel: 0, pitch: 0.1, sway: calm ? 0 : 1, lastInput: -10, flash: 0, pulse: 3, jetHold: 0, ring: 1, jetLife: 1, blink: 2.2, blinkP: 0 };
  const jet = new Spring(0, 110, 10);
  const lift = new Spring(0, 20, 4.4);
  const squeeze = new Spring(0, 120, 12);
  const V = { w: 1, h: 1, bh: 1, yc: 0, ah: 1, aw: 1 };
  const drag = { on: false, id: -1, x: 0, y: 0, moved: 0, at: 0, last: 0 };
  let dirty = true; // a resize or a key since the last frame

  // A tap flashes it; with motion on it also jets up and throws a ring and a burst of motes.
  function react() {
    S.lastInput = S.clock;
    S.flash = 1;
    S.pulse = 0;
    dirty = true;
    if (calm) return;
    S.jetHold = 0.2;
    lift.v += 2.6;
    squeeze.v += 3.2;
    S.ring = 0;
    S.jetLife = 0;
    octo.updateMatrixWorld(true);
    const o = new Vector3(0, -0.5, 0);
    body.localToWorld(o);
    for (let i = 0; i < JETN; i++) {
      const a = rnd() * 6.283;
      const r = rnd() * 0.3;
      jetPos[i * 3] = o.x + Math.cos(a) * r; jetPos[i * 3 + 1] = o.y - rnd() * 0.3; jetPos[i * 3 + 2] = o.z + Math.sin(a) * r;
      jetVel[i * 3] = Math.cos(a) * (0.3 + rnd() * 0.9); jetVel[i * 3 + 1] = -(1.6 + rnd() * 2.6); jetVel[i * 3 + 2] = Math.sin(a) * (0.3 + rnd() * 0.9);
    }
    jetPts.visible = true;
  }

  function tick(dt) {
    S.clock += dt;
    if (!calm) S.t += dt;
    const t = S.t;
    U.uTime.value = t;
    BG.uTime.value = t;

    if (!drag.on) {
      S.yaw += S.yawVel * dt;
      S.yawVel *= Math.exp(-2.6 * dt);
      S.pitch = damp(S.pitch, 0.1, 2.2, dt);
    }
    const idle = !drag.on && S.clock - S.lastInput > 2.5 && !calm;
    S.sway = damp(S.sway, idle ? 1 : 0, 1.2, dt);
    octo.rotation.y = S.yaw + Math.sin(S.clock * 0.33) * 0.2 * S.sway;
    octo.rotation.x = S.pitch;

    jet.t = S.jetHold > 0 ? 1 : 0;
    if (S.jetHold > 0) S.jetHold -= dt;
    jet.step(dt); lift.step(dt); squeeze.step(dt);
    S.flash *= Math.exp(-3.2 * dt);
    if (S.pulse < 3) S.pulse += dt * 1.9;
    U.uPulse.value = S.pulse;
    U.uPulseAmp.value = Math.max(0, 1 - S.pulse / 1.6);
    U.uFlash.value = S.flash;

    const breath = Math.sin(t * 1.45);
    const sq = clamp(squeeze.x, -0.2, 0.3);
    body.position.y = B.offsetY + Math.sin(t * 0.8) * 0.07 + lift.x;
    body.rotation.z = Math.sin(t * 0.55 + 1) * 0.035;
    body.rotation.x = Math.sin(t * 0.47) * 0.04 - clamp(lift.v, -2, 2) * 0.03;
    mantle.scale.set(1 + breath * 0.04 - sq * 0.5, 1 - breath * 0.025 + sq * 0.28, 1 + breath * 0.04 - sq * 0.5);
    poseArms(t, jet.x);

    S.blink -= dt;
    if (S.blink < 0) { S.blinkP = 1; S.blink = 3 + rnd() * 3.5; }
    let lidY = 0.105;
    if (S.blinkP > 0) { S.blinkP -= dt / 0.24; lidY -= 0.09 * Math.sin(Math.PI * clamp(1 - S.blinkP, 0, 1)); }
    eyes[0].lid.position.y = lidY; eyes[1].lid.position.y = lidY;
    const wide = 1 + S.flash * 0.25 + Math.sin(t * 0.9) * 0.04;
    eyes[0].pupil.scale.set(wide, 1 + S.flash * 0.5, 1); eyes[1].pupil.scale.set(wide, 1 + S.flash * 0.5, 1);

    BG.uBreath.value = breath;
    BG.uPar.value = octo.rotation.y;
    BG.uFlash.value = S.flash;
    PU.uPar.value = octo.rotation.y * 0.3;

    if (S.ring < 1) {
      S.ring = Math.min(1, S.ring + dt / 0.9);
      const e = 1 - (1 - S.ring) ** 3;
      ring.visible = true;
      ring.position.set(0, lift.x * 0.5, 0);
      ring.quaternion.copy(camera.quaternion);
      ring.scale.setScalar(1.1 + e * 2.3);
      ring.material.opacity = (1 - S.ring) ** 2 * 0.5;
    } else ring.visible = false;
    if (S.jetLife < 1) {
      S.jetLife = Math.min(1, S.jetLife + dt / 1.1);
      const k = Math.exp(-2.4 * dt);
      for (let i = 0; i < JETN * 3; i++) { jetPos[i] += jetVel[i] * dt; jetVel[i] *= k; }
      jetGeo.attributes.position.needsUpdate = true;
      jetPts.material.opacity = (1 - S.jetLife) ** 1.5 * 0.95;
    } else jetPts.visible = false;
  }

  function render() {
    quad.material = bgMat;
    renderer.setRenderTarget(rtBg);
    renderer.render(quadScene, quadCam);

    backdrop.visible = false;
    PU.uPx.value = rtA.height / (2 * TAN);
    renderer.setRenderTarget(rtA);
    renderer.clear();
    renderer.render(scene, camera);
    pass(brightMat, rtA, rtB);
    blur(rtB, rtA, 1 / rtB.width, 0);
    blur(rtA, rtB, 0, 1 / rtB.height);
    blur(rtB, rtC, 1 / rtC.width, 0);
    blur(rtC, rtD, 0, 1 / rtC.height);
    blur(rtD, rtC, 1.7 / rtC.width, 0);
    blur(rtC, rtD, 0, 1.7 / rtC.height);

    backdrop.visible = true;
    PU.uPx.value = V.bh / (2 * TAN);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
    quad.material = compMat;
    renderer.render(quadScene, quadCam);
  }

  /* ---------- framing: centred in the canvas, at most 62% of its height ---------- */
  const PERSP = 1.0;
  function fit() {
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    if (!vw || !vh) return;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(vw, vh, false);
    const bw = Math.round(vw * pr);
    const bh = Math.round(vh * pr);
    const qw = Math.max(2, Math.round(bw / 4)); const qh = Math.max(2, Math.round(bh / 4));
    const ew = Math.max(2, Math.round(bw / 8)); const eh = Math.max(2, Math.round(bh / 8));
    rtBg.setSize(qw, qh); rtA.setSize(qw, qh); rtB.setSize(qw, qh); rtC.setSize(ew, eh); rtD.setSize(ew, eh);

    const top = Math.max(12, vh * 0.03);
    const bottom = vh - Math.max(10, vh * 0.02);
    const free = Math.max(80, bottom - top);
    const frac = Math.min(0.62, free * 0.96 / vh, vw * 0.9 * (B.h / B.w) / vh);
    V.w = vw; V.h = vh; V.bh = bh; V.yc = top + free / 2; V.ah = frac * vh; V.aw = V.ah * B.w / B.h;
    const dist = B.h * PERSP / (2 * TAN * frac);
    camera.aspect = vw / vh;
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(vw, vh, 0, vh / 2 - V.yc, vw, vh);
    U.uFogNear.value = dist - 0.4;
    U.uFogFar.value = dist + 2.6;
    PU.uFocus.value = dist;
    BG.uCenter.value.set(0.5, 1 - V.yc / vh);
    BG.uAspect.value = vw / vh;
    dirty = true;
  }

  /* ---------- input ---------- */
  // pointer position in the canvas's own pixels (the intro animation may be scaling it)
  function local(e) {
    const r = canvas.getBoundingClientRect();
    const k = r.width ? canvas.clientWidth / r.width : 1;
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
  }
  function onAnimal(x, y) {
    const dx = (x - V.w / 2) / (V.aw * 0.56);
    const dy = (y - V.yc) / (V.ah * 0.54);
    return dx * dx + dy * dy <= 1;
  }
  function down(e) {
    if (drag.on) return;
    drag.on = true; drag.id = e.pointerId; drag.x = e.clientX; drag.y = e.clientY; drag.moved = 0;
    drag.at = drag.last = performance.now();
    S.yawVel = 0;
    S.lastInput = S.clock;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* older browsers */ }
  }
  function move(e) {
    if (!drag.on || e.pointerId !== drag.id) return;
    const now = performance.now();
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const step = dx * 0.0085;
    drag.x = e.clientX; drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    S.yaw += step;
    S.pitch = clamp(S.pitch + dy * 0.004, -0.3, 0.5);
    S.yawVel = S.yawVel * 0.5 + (step / (Math.max(8, now - drag.last) / 1000)) * 0.5;
    drag.last = now;
    S.lastInput = S.clock;
  }
  function release(e, tap) {
    if (!drag.on || e.pointerId !== drag.id) return;
    drag.on = false;
    S.lastInput = S.clock;
    if (performance.now() - drag.last > 90) S.yawVel = 0;
    S.yawVel = clamp(S.yawVel, -7, 7);
    if (tap && drag.moved < 7 && performance.now() - drag.at < 400) {
      const [x, y] = local(e);
      if (onAnimal(x, y)) react();
    }
  }
  const up = (e) => release(e, true);
  const cancel = (e) => release(e, false);
  function key(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      S.yaw += e.key === 'ArrowLeft' ? -0.3 : 0.3;
      S.lastInput = S.clock;
      dirty = true;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      react();
    }
  }

  /* ---------- run ---------- */
  let active = true;
  let lost = false;
  let raf = 0;
  let last = performance.now();
  // with motion off it only draws while something is moving
  const moving = () => drag.on || Math.abs(S.yawVel) > 1e-4 || S.flash > 1e-3 || Math.abs(S.pitch - 0.1) > 1e-4 || S.blinkP > 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now;
    if (!active || lost || document.hidden) return;
    if (calm && !dirty && !moving()) return;
    dirty = false;
    tick(dt);
    render();
  }
  function contextLost(e) {
    e.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    onLost?.();
  }

  const listeners = [['pointerdown', down], ['pointermove', move], ['pointerup', up], ['pointercancel', cancel], ['lostpointercapture', cancel], ['keydown', key], ['webglcontextlost', contextLost]];
  listeners.forEach(([type, fn]) => canvas.addEventListener(type, fn));
  const resize = new ResizeObserver(fit);
  resize.observe(canvas);
  fit();
  tick(1 / 60);
  render();
  dirty = false;
  raf = requestAnimationFrame(loop);
  onReady?.();

  return {
    setActive(on) {
      active = on;
      if (on) { last = performance.now(); dirty = true; }
    },
    dispose() {
      lost = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      listeners.forEach(([type, fn]) => canvas.removeEventListener(type, fn));
      const owned = new Set([bgMat, brightMat, blurMat, compMat]);
      [scene, quadScene].forEach((root) => root.traverse((o) => {
        if (o.geometry) owned.add(o.geometry);
        if (o.material) owned.add(o.material);
      }));
      owned.forEach((x) => x.dispose());
      [rtBg, rtA, rtB, rtC, rtD, dotTex].forEach((x) => x.dispose());
      renderer.dispose();
    },
  };
}
