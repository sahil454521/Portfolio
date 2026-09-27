// Every action on the page, and what it opens.
//
// A click on the desk, on the list under the headline, or on any "Email me"
// arrives here as go(id). When the desk is on screen the camera moves toward
// the object first, so a click visibly goes somewhere; then the page does
// what the object stands for. A live app is entered: the camera flies into
// its screen until the screen is the whole view, and the app takes over from
// there, so it is the same page, zoomed in. The email form and the status
// board open as windows grown out of their objects; the rest scroll to a
// section or leave for another page.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { THINGS } from '../data.js';
import { useStatus } from './status.jsx';

const Ctx = createContext(null);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLIDE = 'cubic-bezier(0.32, 0.72, 0, 1)';     // the camera's own curve (scene.js)

// After the flight, an app's still is laid exactly over its screen: the same
// picture with the same crop (the scene crops a still the way `cover` and
// `center top` do), so the hand-over cannot be seen. Where the desk does not
// fill the window, as on a phone, the still then keeps zooming until it
// does. Returns the frames for that, or null when there is nothing to do.
function zoomFrames(still, rect) {
  const vw = innerWidth, vh = innerHeight;
  Object.assign(still.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
  const c = document.querySelector('[data-desk] canvas').getBoundingClientRect();
  const r = rect.left + rect.width, b = rect.top + rect.height;
  const cut = [Math.max(c.top, 0) - rect.top, r - Math.min(c.right, vw), b - Math.min(c.bottom, vh), Math.max(c.left, 0) - rect.left].map((n) => Math.max(0, n));
  const k = Math.max(1, vw / rect.width, vh / rect.height);
  const dx = vw / 2 - (rect.left + rect.width / 2), dy = vh / 2 - (rect.top + rect.height / 2);
  if (k < 1.01 && Math.abs(dx) < 2 && Math.abs(dy) < 2 && cut.every((n) => n < 1)) return null;
  return [
    { clipPath: `inset(${cut.map((n) => n + 'px').join(' ')})`, transform: 'none' },
    { clipPath: 'inset(0px 0px 0px 0px)', transform: `translate(${dx}px, ${dy}px) scale(${k})` },
  ];
}
const zoomed = (on) => document.documentElement.toggleAttribute('data-zoomed', on);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The window grows out of the object's screen and shrinks back into it, so it
// is always clear where it came from and where it went.
function grow(dlg, rect, reverse) {
  const reduced = reducedMotion();
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

export function WindowsProvider({ children }) {
  const scene = useRef(null);                     // the 3D desk, set by <Desk/>
  const appRef = useRef(null), composeRef = useRef(null), boardRef = useRef(null);
  const [app, setApp] = useState({ id: null, name: '', host: '', href: '', still: '', src: '', loaded: false });
  const s = useRef({ openId: null, openDlg: null, seq: 0, zoom: null }).current;
  const { status, check } = useStatus();
  const statusRef = useRef(status);
  statusRef.current = status;

  const openDialog = useCallback(async (dlg, id) => {
    if (!dlg || dlg.open) return;
    const my = ++s.seq;
    const sc = scene.current;
    let from = null;
    if (sc && sc.onScreen()) {
      from = await sc.flyTo(id, 0.9, 950);
      if (my !== s.seq) return;                  // a newer click took over
    }
    s.openId = id;
    s.openDlg = dlg;
    if (sc) sc.setCovered(true);
    // Focus stays in this page (on Close) rather than going into the app: a
    // key pressed inside another site's frame never reaches this window, so
    // Escape would stop closing it. The app takes focus when it is clicked.
    dlg.showModal();
    const first = dlg.querySelector('[data-autofocus]');
    if (first) first.focus();
    if (location.hash !== '#' + id) history.pushState({ open: id }, '', '#' + id);
    await grow(dlg, from, false);
  }, [s]);

  const shut = useCallback((dlg, fromHistory) => {
    if (!dlg || !dlg.open || dlg.dataset.closing) return;
    dlg.dataset.closing = '1';
    const sc = scene.current;
    let leave;
    if (dlg === appRef.current) {
      // out the way it came in: the app gives way to its still, the still
      // shrinks back onto the screen, and the camera pulls back from there
      const still = dlg.querySelector('[data-win-still]');
      const reduce = reducedMotion();
      setApp((a) => ({ ...a, loaded: false }));
      zoomed(false);
      // a scroll that ran on past the end of the app moved the page behind
      // it; the desk goes back exactly where the screen was
      if (scrollY !== s.y) scrollTo({ top: s.y, behavior: 'instant' });
      leave = wait(reduce ? 0 : 200).then(() => (s.zoom && !reduce
        ? still.animate([...s.zoom].reverse(), { duration: 420, easing: GLIDE, fill: 'forwards' }).finished
        : dlg.animate([{ opacity: 1 }, { opacity: s.entered ? 1 : 0 }], { duration: s.entered ? 0 : 180, fill: 'forwards' }).finished));
    } else leave = grow(dlg, sc && sc.onScreen() ? sc.rectOf(s.openId) : null, true);
    leave.then(() => {
      dlg.close();
      delete dlg.dataset.closing;
      dlg.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      if (dlg === appRef.current) setApp((a) => ({ ...a, src: '', loaded: false }));  // stop the game, the audio, the requests
      const was = s.openId;
      s.openId = null;
      s.openDlg = null;
      if (sc) { sc.setCovered(false); sc.home(); }
      // Clean the address in place. Stepping back would walk through the
      // history the app inside the window may have added, and land on a stale
      // #id that reopens a window nobody asked for.
      if (!fromHistory && location.hash === '#' + was) history.replaceState(null, '', location.pathname + location.search);
      const back = document.querySelector(`[data-thing="${was}"]`);
      if (back && document.activeElement === document.body) back.focus({ preventScroll: true });
    });
  }, [s]);

  const openApp = useCallback(async (id) => {
    const dlg = appRef.current;
    if (!dlg || dlg.open) return;
    const t = THINGS[id];
    setApp({ id, name: t.name, host: t.host, href: t.app, still: t.still, src: '', loaded: false });
    const my = ++s.seq;
    const sc = scene.current;
    let rect = null;
    if (sc && sc.onScreen()) {
      // the bar and the view switch step aside, and the camera goes in until
      // the screen is the whole view
      zoomed(true);
      rect = await sc.flyTo(id, 1.02, 1250, true);
      if (my !== s.seq) return;                  // a newer click took over
    }
    s.openId = id;
    s.openDlg = dlg;
    const still = dlg.querySelector('[data-win-still]');
    Object.assign(still.style, { left: '', top: '', width: '', height: '' });
    s.entered = !!rect;                          // came in through the desk, leaves through it
    s.y = scrollY;
    s.zoom = rect && zoomFrames(still, rect);
    if (sc) sc.setCovered(true);
    dlg.showModal();
    dlg.querySelector('[data-autofocus]').focus();
    if (location.hash !== '#' + id) history.pushState({ open: id }, '', '#' + id);
    const reduce = reducedMotion();
    if (s.zoom && !reduce) await still.animate(s.zoom, { duration: 520, easing: GLIDE, fill: 'forwards' }).finished;
    else if (!rect) await dlg.animate([{ opacity: 0, transform: reduce ? 'none' : 'scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: GLIDE }).finished;
    // The app starts loading only now, so nothing competes with the flight;
    // its still is the view until it answers.
    if (s.openId === id && !dlg.dataset.closing) setApp((a) => ({ ...a, src: t.app }));
  }, [s]);

  const go = useCallback(async (id) => {
    const t = THINGS[id];
    if (!t) return;
    if (t.app) return openApp(id);
    zoomed(false);                               // this click replaced a flight into an app
    if (t.compose) return openDialog(composeRef.current, id);
    if (t.board) {
      if (!statusRef.current) check(true);
      return openDialog(boardRef.current, id);
    }
    // Another site opens at once, in a new tab: after a flight the browser
    // may no longer count it as the click that asked for it.
    if (t.external) { window.open(t.href, '_blank', 'noopener'); return; }
    const my = ++s.seq;
    const sc = scene.current;
    if (sc && sc.onScreen()) {
      await sc.flyTo(id, 0.5, 720);
      if (my !== s.seq) return;
    }
    if (t.href.startsWith('#')) {
      const target = document.querySelector(t.href);
      if (target) target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
      if (sc) sc.home();               // pull back while the page scrolls away
    } else location.href = t.href;
  }, [openApp, openDialog, check, s]);

  // Only a link opened fresh (…/#quest) opens a window from the address.
  const openFromHash = useCallback(() => {
    const id = location.hash.slice(1);
    const t = THINGS[id];
    if (t && (t.app || t.compose || t.board)) go(id);
  }, [go]);

  // Back closes an open window, which is what a phone user expects from a
  // full-screen one. It never opens one (see openFromHash).
  useEffect(() => {
    const onPop = () => { if (s.openId && location.hash !== '#' + s.openId) shut(s.openDlg, true); };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [s, shut]);

  const value = useMemo(() => ({
    scene, go, shut, openFromHash, app, setApp, refs: { appRef, composeRef, boardRef },
  }), [go, shut, openFromHash, app]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useWindows = () => useContext(Ctx);
