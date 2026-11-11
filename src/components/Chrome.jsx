import { useEffect, useState } from 'react';
import { motionOn, motionOverridden, setMotion, scrollToId, systemReduced } from '../motion';
import { EMAIL } from '../data';

const links = [['work', 'Work'], ['research', 'Research'], ['more', 'Projects'], ['background', 'Experience']];
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

export function Nav() {
  return (
    <header className="nav">
      <a className="skip" href="#work">Skip to the work</a>
      <div className="nav-in">
        <a className="nav-name" href="#top" onClick={go('top')}>Sahil Pathak</a>
        <nav aria-label="Sections">
          {links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={go(id)}>{label}</a>)}
        </nav>
        <a className="btn btn-sm" href={`mailto:${EMAIL}`}>Email me</a>
      </div>
    </header>
  );
}

// Tells reduced-motion visitors why the page is calm, and how to opt in.
export function MotionNotice() {
  if (motionOn || !systemReduced || motionOverridden) return null;
  return (
    <div className="notice" role="note">
      <p>Your system asks for reduced motion, so this page is calm.</p>
      <button type="button" className="btn btn-sm" onClick={() => setMotion(true)}>Turn motion on</button>
      <button type="button" className="notice-x" onClick={() => setMotion(false)}>Keep it calm</button>
    </div>
  );
}
