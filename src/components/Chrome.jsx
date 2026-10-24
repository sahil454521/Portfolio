import { useEffect, useState } from 'react';
import { motionOn, motionOverridden, setMotion, scrollToId, systemReduced } from '../motion';
import { EMAIL } from '../data';
import { Magnetic } from './bits';

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
export const chapters = [['work', 'Work'], ['research', 'Research'], ['stack', 'Stack'], ['resume', 'Resume'], ['contact', 'Contact']];
const go = (id) => (e) => { e.preventDefault(); scrollToId(id); };

let pushToast = () => {};
export function Toast() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let t;
    pushToast = (m) => { setMsg(m); clearTimeout(t); t = setTimeout(() => setMsg(''), 2200); };
    return () => clearTimeout(t);
  }, []);
  return <div className={`toast ${msg ? 'is-on' : ''}`} role="status" aria-live="polite">{msg}</div>;
}

export async function copyEmail() {
  try { await navigator.clipboard.writeText(EMAIL); pushToast('Email address copied'); }
  catch { pushToast(EMAIL); }
}

export function Nav({ onPalette }) {
  return (
    <header className="nav">
      <a className="nav-name" href="#top" onClick={go('top')}><i aria-hidden="true" />Sahil Pathak</a>
      <nav aria-label="Chapters">
        {chapters.slice(0, 4).map(([id, label]) => <a key={id} href={`#${id}`} onClick={go(id)}>{label}</a>)}
      </nav>
      <button type="button" className="nav-k" onClick={onPalette} aria-label="Open the command menu">
        <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd>
      </button>
      <button type="button" className="nav-motion" aria-pressed={motionOn} onClick={() => setMotion(!motionOn)}>
        <span aria-hidden="true" />Motion
      </button>
      <Magnetic className="btn btn-signal btn-sm" href={`mailto:${EMAIL}`}>Email me</Magnetic>
    </header>
  );
}

// Tells reduced-motion visitors why the page is calm, and how to opt in.
export function MotionNotice() {
  if (motionOn || !systemReduced || motionOverridden) return null;
  return (
    <div className="notice" role="note">
      <p>Your system asks for reduced motion, so this page is calm.</p>
      <button type="button" className="btn btn-signal btn-sm" onClick={() => setMotion(true)}>Turn motion on</button>
      <button type="button" className="notice-x" onClick={() => setMotion(false)} aria-label="Keep motion off">Keep it calm</button>
    </div>
  );
}

export { pushToast };
