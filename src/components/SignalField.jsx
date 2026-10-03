import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap, ScrollTrigger, motionOn } from '../motion';

// Field -> four lanes -> braid -> one beam, all on the GPU. uProgress comes from the #braid chapter.
const vertexShader = /* glsl */ `
  attribute float aStrand;
  attribute float aT;
  attribute float aSeed;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uMouse;
  uniform vec2 uView;
  uniform float uSize;
  uniform float uPR;
  varying float vHeat;
  varying float vAlpha;

  void main() {
    float p1 = smoothstep(0.0, 0.2, uProgress);
    float p2 = smoothstep(0.4, 0.7, uProgress);
    float p3 = smoothstep(0.72, 0.92, uProgress);

    vec3 f = position * vec3(uView * 1.15, 1.2);
    f.x += sin(uTime * 0.17 + aSeed * 40.0) * 0.07;
    f.y += cos(uTime * 0.13 + aSeed * 23.0) * 0.07;
    vec2 d = f.xy - uMouse;
    float r = length(d);
    f.xy += (d / max(r, 0.001)) * 0.6 * exp(-r * r * 3.5) * (1.0 - p1);

    float x = (aT * 2.0 - 1.0) * uView.x * 1.15;
    float thick = (fract(aSeed * 91.7) - 0.5) * 0.1;
    float depth = (fract(aSeed * 13.3) - 0.5) * 0.3;
    vec3 lanes = vec3(x, (aStrand - 1.5) * uView.y * 0.47 + thick, depth);

    float phase = aStrand * 1.5708;
    float w = aT * 11.0 - uTime * 0.9;
    float amp = uView.y * 0.4;
    vec3 braid = vec3(x, sin(w + phase) * amp + thick, cos(w + phase) * amp * 0.8 + depth);
    vec3 beam = vec3(x, thick * 0.45, depth * 0.3);

    vec3 pos = mix(mix(mix(f, lanes, p1), braid, p2), beam, p3);

    float speck = step(0.93, fract(aSeed * 5.1)) * 0.9;
    vHeat = max(max(speck * (1.0 - p1), p2 * 0.55), p3);
    vAlpha = 0.25 + 0.75 * fract(aSeed * 7.31);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPR * (0.5 + fract(aSeed * 3.7)) * (1.0 + p3 * 0.5) / -mv.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uAlpha;
  varying float vHeat;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 col = mix(vec3(0.84, 0.88, 0.93), uAccent, vHeat);
    gl_FragColor = vec4(col, smoothstep(0.5, 0.0, d) * vAlpha * uAlpha * 0.6);
  }
`;

export default function SignalField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    } catch {
      canvas.remove(); // no WebGL: the page still reads fine on the plain background
      return undefined;
    }
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);

    const small = window.innerWidth < 760;
    const n = small ? 6000 : 14000;
    const pos = new Float32Array(n * 3);
    const strand = new Float32Array(n);
    const t = new Float32Array(n);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = Math.random() * 2 - 1;
      pos[i * 3 + 1] = Math.random() * 2 - 1;
      pos[i * 3 + 2] = Math.random() * 2 - 1;
      strand[i] = Math.floor(Math.random() * 4);
      t[i] = Math.random();
      seed[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aStrand', new THREE.BufferAttribute(strand, 1));
    geometry.setAttribute('aT', new THREE.BufferAttribute(t, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uView: { value: new THREE.Vector2(1, 1) },
      uSize: { value: small ? 22 : 18 },
      uPR: { value: dpr },
      uAlpha: { value: 1 },
      uAccent: { value: new THREE.Color('#FFB547') },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Points(geometry, material));
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.z = 5;

    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const vh = Math.tan((25 * Math.PI) / 180) * 5;
      uniforms.uView.value.set(vh * camera.aspect, vh);
      if (!motionOn) render();
    };
    resize();
    window.addEventListener('resize', resize);

    if (!motionOn) {
      render();
      return () => { window.removeEventListener('resize', resize); geometry.dispose(); material.dispose(); renderer.dispose(); };
    }

    const target = { progress: 0, alpha: 1, mx: 99, my: 99 };
    const onMove = (e) => {
      const v = uniforms.uView.value;
      target.mx = ((e.clientX / window.innerWidth) * 2 - 1) * v.x;
      target.my = -((e.clientY / window.innerHeight) * 2 - 1) * v.y;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const st = [
      ScrollTrigger.create({ trigger: '#braid', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { target.progress = s.progress; } }),
      ScrollTrigger.create({ trigger: '#braid', start: 'bottom bottom', end: 'bottom top', onUpdate: (s) => { target.alpha = 1 - s.progress; } }),
    ];

    // Time-based easing: the field keeps up with the scroll even when frames drop.
    const tick = (time, dt) => {
      if (target.alpha <= 0.01 && uniforms.uAlpha.value <= 0.01) return; // off screen: skip the draw
      const k = 1 - Math.exp(-dt / 110);
      uniforms.uTime.value = time;
      uniforms.uProgress.value += (target.progress - uniforms.uProgress.value) * k;
      uniforms.uAlpha.value += (target.alpha - uniforms.uAlpha.value) * k;
      const m = uniforms.uMouse.value;
      m.x += (target.mx - m.x) * k;
      m.y += (target.my - m.y) * k;
      render();
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.forEach((s) => s.kill());
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="signal-canvas" aria-hidden="true" />;
}
