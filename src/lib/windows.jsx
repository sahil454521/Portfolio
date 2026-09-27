// Every action on the page, and the three windows they can open.
//
// A click on the desk, on the list under the headline, or on any "Email me"
// arrives here as go(id). When the desk is on screen the camera moves toward
// the object first, so a click visibly goes somewhere; then the page does
// what the object stands for: open a live app in a window that grows out of
// the object's own screen, open the email form or the status board, scroll to
// a section, or leave for another page.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { THINGS } from '../data.js';
import { useStatus } from './status.jsx';

const Ctx = createContext(null);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const s = useRef({ openId: null, openDlg: null, seq: 0, pendingSrc: null }).current;
  const { status, check } = useStatus();
  const statusRef = useRef(status);
  statusRef.current = status;

  const openDialog = useCallback(async (dlg, id) => {
    if (!dlg || dlg.open) return;
    const my = ++s.seq;
    const sc = scene.current;
    let from = null;
    if (sc && sc.onScreen()) {
      // close enough that the screen nearly fills the view, so the window
      // growing out of it reads as going inside
      from = await sc.flyTo(id, 0.9, 950);
      if (my !== s.seq) { s.pendingSrc = null; return; }   // a newer click took over
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
    // The app starts loading only now: loading it while the window grew is
    // what dropped frames there. Its still covers the wait.
    if (dlg === appRef.current && s.pendingSrc && s.openId === id && !dlg.dataset.closing) {
      const src = s.pendingSrc;
      s.pendingSrc = null;
      setApp((a) => ({ ...a, src }));
    }
  }, [s]);

  const shut = useCallback((dlg, fromHistory) => {
    if (!dlg || !dlg.open || dlg.dataset.closing) return;
    dlg.dataset.closing = '1';
    const sc = scene.current;
    const to = sc && sc.onScreen() ? sc.rectOf(s.openId) : null;
    grow(dlg, to, true).then(() => {
      dlg.close();
      delete dlg.dataset.closing;
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

  const openApp = useCallback((id) => {
    const t = THINGS[id];
    setApp({ id, name: t.name, host: t.host, href: t.app, still: t.still, src: '', loaded: false });
    s.pendingSrc = t.app;
    openDialog(appRef.current, id);
  }, [openDialog, s]);

  const go = useCallback(async (id) => {
    const t = THINGS[id];
    if (!t) return;
    if (t.app) return openApp(id);
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
