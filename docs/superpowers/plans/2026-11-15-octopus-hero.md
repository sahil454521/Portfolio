# Octopus in the Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero's claims ledger with a round tank holding the 3D octopus (recoloured to the site's theme, no text), and move the ledger to a band directly under the hero.

**Architecture:** The artifact's three.js scene becomes a plain module, `src/octopus/scene.js`, with one entry point that draws into a given canvas and sizes itself to that canvas. A React component, `src/components/Octopus.jsx`, renders the round tank, loads the scene as its own chunk after first paint, pauses it off screen, and swaps in a still image when WebGL is missing or lost. `Ledger` is unchanged; `App.jsx` renders it in a new `#checks` section after the hero.

**Tech Stack:** React 19, Vite 8, GSAP 3, three.js 0.187 (new dependency), browser checks with `playwright-core` in `scrollcraft/lab/`.

**Spec:** `docs/superpowers/specs/2026-11-15-octopus-hero-design.md`. Scene source: the "Sahil the Octopus" artifact's `index.html` (build-session copy: `/home/claude/octo-artifact/index.html`, script lines 175-872). Approved look: the round-tank mock, recoloured as in `/home/claude/scripts/make_mocks.py`.

## Global Constraints
- `src/styles.css`: add rules only. No edits to `:root` tokens, `@font-face`, the dark-mode block or any existing rule.
- Glow #FF6A3D. The tank is dark in light and dark mode.
- Tank: a circle, 460px across on desktop, `min(320px, 82vw)` at `max-width: 900px`, centred in its column.
- Octopus height capped at 62% of the tank (`frac` cap `0.62`).
- Nothing but the octopus in the tank: no title, traits, caption or card.
- three.js ships in its own chunk (`scene-[hash].js`), loaded after first paint; never in the main bundle.
- Canvas `touch-action: pan-y`.
- No drawing while the tank is off screen or the tab is hidden.
- Motion off (`motionOn === false`, `src/motion.js`): no idle animation; it moves only while dragged; tap / Enter / Space flash it without the jet.
- Canvas once live: `tabIndex 0`, `role="img"`, `aria-label`; ArrowLeft / ArrowRight spin; Enter / Space react.
- No em dashes in visible copy or labels.
- Lab scripts use `playwright-core` and Chrome from `process.env.CHROME`, like `scrollcraft/lab/a11y.mjs`.

## Review Focus
1. GPU context lost (phone tab backgrounded, driver reset): the still image appears, never a black circle. Test: Task 3, `a lost GPU context falls back to the still`.
2. Rotating a phone or resizing the window: the canvas follows the tank and nothing stretches. Test: Task 2, `canvas follows a resize`.
3. A finger swiping up over the tank: the page scrolls. Test: Task 2, `an upward swipe over the tank scrolls the page`.
4. Keyboard: the focus ring is visible and round; Space on the octopus does not scroll the page. Tests: Task 2.
5. Slow network: while three.js downloads, the dark placeholder holds the layout with no shift. Test: Task 2, `no layout shift while three.js loads`.

## Running the checks
Once: `npm install` and `npm i --no-save playwright-core`; set `CHROME` to a Chromium binary.
Each run: `pkill -f "vite preview"; npm run build && (setsid nohup npm run preview > /tmp/preview.log 2>&1 &) && sleep 2 && node scrollcraft/lab/octopus.mjs http://localhost:4500 <group>`.
Groups: `layout`, `scene`, `fallback`; no group runs all. The script exits 1 if any check fails.

---

### Task 1: Ledger under the hero, round tank in its place

**Files:**
- Create: `scrollcraft/lab/octopus.mjs`, `src/components/Octopus.jsx`
- Modify: `src/App.jsx` (Hero, new Checks section, intro animation), `src/components/Chrome.jsx:35` (nav score link), `src/styles.css` (append), `README.md` (sections table)

**Interfaces:**
- Produces: `export function Octopus()` rendering `<div className="tank" />` (Task 2 fills it); section `#checks` (class `checks`) directly after `.hero`, wrapping `<div className="reveal"><Ledger /></div>`.

- [ ] **Step 1: Write the check script with the `layout` group**

Harness: `check(name, ok, info)` prints `PASS`/`FAIL` and counts failures; `open(browser, { width, height, reduced, phone, delayScene })` makes a context (`reducedMotion: reduced ? 'reduce' : 'no-preference'`, `isMobile`/`hasTouch`/`deviceScaleFactor: 2` when `phone`), adds init scripts that count WebGL draws into `window.__draws` (wrap `drawArrays`/`drawElements` on both WebGL prototypes) and sum unexpected layout shifts into `window.__cls`, routes `**/assets/scene-*.js` through a `delayScene` ms wait when set, records request URLs, loads the page, awaits `document.fonts.ready`, removes `.notice`. Launch Chrome with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.

```js
// layout, 1440x900 then 390x844
check('ledger is no longer in the hero', d.ledgersInHero === 0);
check('the section after the hero is #checks with the ledger', d.nextId === 'checks' && d.ledgerInChecks);
check('tank is a 460px circle on desktop', Math.abs(d.w - 460) <= 1 && Math.abs(d.h - d.w) <= 1 && d.radius === '50%');
check('tank sits in the right column', d.tankCx > d.heroCx);
check('tank holds no text', d.text === '');
check('nav check count jumps to the ledger', d.scoreHref === '#checks');
check('tank is min(320px, 82vw) and centred on a phone', Math.abs(p.w - Math.min(320, 390 * 0.82)) <= 1 && Math.abs(p.cx - 195) <= 1);
```

- [ ] **Step 2: Run it and see it fail**

Run the `layout` group. Expected: FAIL on every check (no `.tank`, ledger still in the hero).

- [ ] **Step 3: Implement**

- `App.jsx`: Hero renders `<Octopus />` where `<Ledger />` was. Add `function Checks()` returning `<section id="checks" className="checks" aria-label="Claims, checked live"><div className="reveal"><Ledger /></div></section>`, rendered right after `<Hero />`. In the intro, replace the `.ledger` tween with `gsap.from('.tank', { opacity: 0, scale: 0.94, duration: 1.2, ease: 'expo.out', delay: 0.3 })`.
- `Chrome.jsx`: `.nav-score` gets `href="#checks"` and `onClick={go('checks')}`.
- `styles.css`, appended under a comment: `.tank` (position relative, `justify-self: center`, `width: min(460px, 100%)`, `aspect-ratio: 1`, `border-radius: 50%`, dark radial-gradient water sampled from the mock, `box-shadow: 0 0 0 1px var(--line), var(--shadow)`); `@media (max-width: 900px) { .tank { width: min(320px, 82vw); } }`; `.checks { padding-top: 0; }`; at `min-width: 901px` the ledger list flows in two columns, top to bottom (`columns: 2`, rows `break-inside: avoid`).
- `README.md`: the Hero row describes the octopus tank; a new Checks row carries the ledger description.

- [ ] **Step 4: Run it and see it pass**

Run the `layout` group. Expected: 7 PASS. Also `node scrollcraft/lab/a11y.mjs http://localhost:4500`: headings unchanged, 0 em dashes.

- [ ] **Step 5: Commit** `git add -A && git commit -m "Move the claims ledger under the hero and give the hero a round tank"`

### Task 2: The live octopus in the tank

**Files:**
- Create: `src/octopus/scene.js`
- Modify: `src/components/Octopus.jsx`, `src/styles.css` (append), `src/App.jsx` (footer line), `package.json` + `package-lock.json` (`npm install three@^0.187.0`), `README.md` (file table, checking section), `scrollcraft/lab/octopus.mjs` (`scene` group)

**Interfaces:**
- Consumes: `.tank` from Task 1; `motionOn` from `src/motion.js`.
- Produces: `export function createOctopus(canvas: HTMLCanvasElement, opts?: { calm?: boolean, onReady?: () => void, onLost?: () => void }): { setActive(on: boolean): void, dispose(): void }`. Throws when WebGL 2 is unavailable. `onReady` fires after the first frame; `onLost` on `webglcontextlost`. Octopus states: `wait | live | off` (`off` keeps the placeholder; Task 3 turns it into `still`). `.tank.is-live` once the first frame is drawn.

- [ ] **Step 1: Add the `scene` group**

```js
check('octopus goes live and draws', live && draws > 0);
check('canvas buffer matches the tank', c.width === Math.round(c.clientWidth * Math.min(dpr, 2)) && Math.abs(c.clientWidth - tankWidth) <= 1);
check('canvas follows a resize', /* same at 390x844 (width ≈ min(320, 390 * 0.82)), then back at 1440x900 (≈ 460) */);
check('stops drawing off screen', drawsAfterScrollingToBottom === drawsOneSecondLater);
check('starts again when back in view', drawsAfterScrollingToTop > drawsOneSecondLater);
check('three.js is not in the main bundle', !mainJs.includes('WebGLRenderer') && requests.some((u) => /\/assets\/scene-[^/]+\.js$/.test(u)));
check('canvas is labelled and focusable', role === 'img' && tabIndex === 0 && label.length > 20 && !label.includes('—'));
// motion off (reduced: true): element screenshots of '.tank canvas' compared with Buffer.equals
check('holds still with motion off', drawsUnchangedOver1500ms && shotA.equals(shotA2));
check('drag spins it with motion off', !shotAfter140pxMouseDrag.equals(shotA2));
check('Tab reaches the octopus with a round focus ring', focused && outlineStyle !== 'none' && borderRadius === '50%');
check('Space does not scroll the page', scrollYAfterSpace === scrollYBefore);
check('Space or Enter startles it', !shot120msAfterSpace.equals(shotBefore));
// phone: true, CDP Input.dispatchTouchEvent from 75% down the tank, 10 moves of 30px up
check('an upward swipe over the tank scrolls the page', touchAction === 'pan-y' && scrolledBy > 100);
// reduced: true, delayScene: 3000; zero window.__cls at 1.5s, before the scene arrives
check('no layout shift while three.js loads', notLiveAt1500ms && tankRectBefore === tankRectAfter && cls < 0.001);
```

- [ ] **Step 2: Run it and see it fail.** Expected: `octopus goes live` FAILs (no canvas); layout group still passes.

- [ ] **Step 3: Port the scene into `createOctopus` in `src/octopus/scene.js`**

From the artifact script, keep shaders, geometry, motes, ring, jet, springs, tick and render as they are, with these changes:
1. Named imports from `three`. Before anything else: `ColorManagement.enabled = false`; the renderer gets `outputColorSpace = LinearSRGBColorSpace` (keeps r128's untouched colours). `new WebGLRenderer({ canvas, antialias: true, alpha: false })`; no `powerPreference`. Drop the `isWebGL2` / derivatives check and `extensions: { derivatives: true }`.
2. Colours: `GLOW (1.0, 0.42, 0.24)`, `BASE (0.075, 0.03, 0.018)`, `LIT (0.62, 0.2, 0.08)`, `FOG (0.03, 0.03, 0.034)`, `NAVY` renamed `WATER (0.15, 0.155, 0.17)`, `VOID (0.008, 0.009, 0.011)`; pupils `(1.0, 0.88, 0.8)`; jet motes `(1.0, 0.62, 0.45)`; in `MOTE_FS` `vec3(0.25, 0.3, 0.4)` becomes `vec3(0.4, 0.3, 0.25)`.
3. Remove the card, chips, traits, trait label (`placeTrait`, `showTrait`, `anchor`), the `window.claude.hot` block, `testMode` and the script loader.
4. `calm` replaces every `reduceMq.matches`. When calm: `S.t` does not advance, no idle sway, and `react()` sets only `flash` and `pulse` (no jet, lift, squeeze, ring or jet motes). Each frame runs `tick` and `render` only when active, visible (`!document.hidden`) and, if calm, something is moving: dragging, `|yawVel| > 1e-4`, `flash > 1e-3`, `|pitch - 0.1| > 1e-4`, or a resize / key since the last frame.
5. `fit()` reads `canvas.clientWidth` / `clientHeight`; `top = max(12, h * 0.03)`, `bottom = h - max(10, h * 0.02)`, `frac = min(0.62, free * 0.96 / h, w * 0.9 * (B.h / B.w) / h)`. A `ResizeObserver` on the canvas calls it; no window listeners.
6. Pointer positions are relative to `canvas.getBoundingClientRect()`. A tap off the animal does nothing. Drag ends on `pointerup`, `pointercancel` and `lostpointercapture`. Keys: ArrowLeft / ArrowRight spin by 0.3; Enter / Space call `react()`; all `preventDefault`.
7. `setActive(on)` gates drawing and resets the frame clock on resume. `webglcontextlost`: `preventDefault`, stop, call `onLost`. `dispose()` cancels the frame, disconnects the observer, removes listeners, disposes every geometry, material, render target and texture, then the renderer.

- [ ] **Step 4: Mount it from `Octopus.jsx`**

The tank renders `<canvas tabIndex={live ? 0 : -1} role="img" aria-label="An orange low-poly octopus floating in dark water. Drag it or use the arrow keys to spin it; tap it or press Enter to startle it.">`. An `IntersectionObserver` with `rootMargin: '300px'` starts loading once; loading waits for `requestIdleCallback` (timeout 1200 ms; `setTimeout` where it is missing), then `import('../octopus/scene.js')` and `createOctopus(canvas, { calm: !motionOn, onReady, onLost })`. A second `IntersectionObserver` calls `setActive(isIntersecting)`. A throw, a failed import or `onLost` dispose the scene and set `off`. Unmount disposes everything.
CSS, appended: canvas `position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; opacity: 0; touch-action: pan-y; cursor: grab; transition: opacity 700ms var(--ease-out)`; `.tank.is-live canvas { opacity: 1 }`; `:active` grabbing; `.tank canvas:focus-visible { outline-offset: 4px; border-radius: 50%; }` (overrides the global 8px radius).
Footer: "Built with React, GSAP and three.js, set in Bricolage Grotesque and Archivo." README: list `src/octopus/scene.js`, `src/components/Octopus.jsx`, `scrollcraft/lab/octopus.mjs`; add the octopus check under "Checking a change".

- [ ] **Step 5: Run it and see it pass.** `scene` and `layout` groups all PASS. Compare a 1440x900 dark-mode hero screenshot with the approved round-tank mock: same colours, size and pose.

- [ ] **Step 6: Commit** `git add -A && git commit -m "Put the 3D octopus in the hero tank"`

### Task 3: A still image when WebGL is missing or lost

**Files:**
- Create: `scrollcraft/lab/octopus-still.mjs`, `public/octopus.webp`
- Modify: `src/components/Octopus.jsx`, `src/styles.css` (append), `README.md`, `scrollcraft/lab/octopus.mjs` (`fallback` group)

**Interfaces:**
- Consumes: `createOctopus` and its `onLost` from Task 2.
- Produces: state `still` (replaces `off`), rendering `<img src="/octopus.webp" alt="An orange low-poly octopus floating in dark water." width="920" height="920" decoding="async">` in place of the canvas.

- [ ] **Step 1: Add the `fallback` group**

```js
// a second Chrome launched with --disable-webgl --disable-3d-apis
check('without WebGL the tank shows the still', img.complete && img.naturalWidth === 920 && img.alt.length > 10 && !canvasPresent);
// normal Chrome, once live: canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()
check('a lost GPU context falls back to the still', imgWithin5s && !canvasPresent);
check('still image is under 80 KB', statSync('public/octopus.webp').size < 80000);
```

- [ ] **Step 2: Run it and see it fail.** Expected: all three FAIL.

- [ ] **Step 3: Write `octopus-still.mjs`.** At 1440x900, `deviceScaleFactor: 2`, motion off, dark scheme: wait for `.tank.is-live`, screenshot `.tank canvas` (920x920 PNG), re-encode in the page through a 2D canvas with `toDataURL('image/webp', 0.82)`, write `public/octopus.webp`. Run it.

- [ ] **Step 4: Switch `off` to `still` in `Octopus.jsx`;** CSS: `.tank img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; }`. README: `public/octopus.webp`, made by `scrollcraft/lab/octopus-still.mjs`.

- [ ] **Step 5: Run all groups and see them pass.**

- [ ] **Step 6: Commit** `git add -A && git commit -m "Show a still of the octopus when WebGL is missing or lost"`

## Finish
- [ ] `node scrollcraft/lab/octopus.mjs http://localhost:4500` (all groups) and `node scrollcraft/lab/a11y.mjs http://localhost:4500`: all PASS, 0 em dashes.
- [ ] Hero screenshots at 1440x900 light and dark and 390x844 light, compared with the approved mock.
- [ ] Push `octopus-hero` and open a pull request against `main`, with the screenshots described and the preview link from Vercel.
