// What the desk opens: a live app, entered through its screen, and two
// windows, the status board and the email form.
import { lazy, Suspense, useState } from 'react';
import { EMAIL } from '../data.js';
import { useStatus } from '../lib/status.jsx';
import { useWindows } from '../lib/windows.jsx';
import { CopyButton } from './More.jsx';
import SplitFlapText from './reactbits/SplitFlapText.jsx';

// These two need Motion, so they arrive in their own chunk just after the
// page paints; the windows they sit in are there from the start.
const StatusMark = lazy(() => import('./reactbits/StatusMark.jsx'));
const JellyRadio = lazy(() => import('./reactbits/JellyRadio.jsx'));

// Escape and a click on the backdrop both close, with the same animation as
// the Close button.
function useDialogProps(ref) {
  const { shut } = useWindows();
  return {
    ref,
    onCancel: (e) => { e.preventDefault(); shut(e.currentTarget); },
    onClick: (e) => { if (e.target === e.currentTarget) shut(e.currentTarget); },
  };
}

// No window: the app is the whole view, reached by flying into its screen
// on the desk (see lib/windows.jsx). Its still is laid over that screen and
// the live app fades in over the still; the one control floats at the foot.
function AppWindow() {
  const { app, setApp, refs, shut } = useWindows();
  const props = useDialogProps(refs.appRef);
  return (
    <dialog className="zoom" data-win aria-labelledby="win-name" {...props}>
      <div className="zoom__still" data-win-still style={{ backgroundImage: app.still ? `url("${app.still}")` : undefined }} />
      <iframe
        className="zoom__app"
        data-loaded={app.loaded ? '' : undefined}
        title={app.name ? `${app.name}, running live` : 'Live app'}
        src={app.src || 'about:blank'}
        allow="clipboard-write; fullscreen; autoplay"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={(e) => { if (e.currentTarget.getAttribute('src') !== 'about:blank') setApp((a) => ({ ...a, loaded: true })); }}
      />
      <div className="zoom__bar">
        <button className="zoom__back" type="button" data-autofocus onClick={() => shut(refs.appRef.current)}>
          <span aria-hidden="true">←</span> Back to the desk
        </button>
        <p className="zoom__name">
          <i className={app.loaded ? 'dot dot--live' : 'dot'} /> <b id="win-name" data-win-name>{app.name}</b>
          <span role="status">{app.loaded ? 'live' : 'starting'}</span>
        </p>
        <a className="zoom__out" data-win-out href={app.href || '#'} target="_blank" rel="noopener">New tab <span aria-hidden="true">↗</span></a>
      </div>
    </dialog>
  );
}

function Board() {
  const { refs, shut } = useWindows();
  const { status, check } = useStatus();
  const [checking, setChecking] = useState(false);
  const [shown, setShown] = useState(false);
  const props = useDialogProps(refs.boardRef);
  const sites = status && status.sites;
  const again = () => { setChecking(true); check(true).then(() => setChecking(false)); };
  let when = 'Checking every site now.';
  if (sites && !checking) {
    const up = sites.filter((x) => x.up).length;
    when = `${up} of ${sites.length} up, checked from the server at ${new Date(status.checked).toLocaleTimeString()}.`;
  }
  return (
    // Opening the board (focus lands on Close) rolls each reading onto its
    // flaps; checking again blanks them and rolls the new ones in.
    <dialog className="win win--board" data-live-board aria-labelledby="board-h" {...props}
            onFocus={() => setShown(true)} onClose={() => setShown(false)}>
      <div className="win__bar">
        <p className="win__title"><b id="board-h">Every site, checked from the server</b></p>
        <button className="win__close" type="button" data-autofocus onClick={() => shut(refs.boardRef.current)}>Close</button>
      </div>
      <div className="board">
        <ul className="board__list" data-board-list>
          {(sites || []).map((x) => (
            <li key={x.host}>
              <Suspense fallback={<i className={x.up ? 'dot dot--live' : 'dot'} />}>
                <span aria-hidden="true" className="board__mark">
                  <StatusMark status={checking ? 'running' : x.up ? 'done' : 'failed'} strike={false} size={18}
                              color="#566772" doneColor="#9C5A08" errorColor="#566772" />
                </span>
              </Suspense>
              <b>{x.host}</b>
              <span className="board__ms" aria-hidden="true">
                <SplitFlapText text={!shown || checking ? '    ' : x.up ? String(x.ms).padStart(4) : 'DOWN'} padTo={4}
                               charset="numeric" flipsPerChar={6} flipDuration={0.07} stagger={0.05}
                               fontSize={19} gap={2} tileRadius={3} tileColor="#0E1519" textColor="#F4F6F7" />
                <small>{x.up ? 'ms' : ''}</small>
              </span>
              <span className="sr">{checking ? 'checking' : x.up ? `answered in ${x.ms} ms` : 'not answering right now'}</span>
            </li>
          ))}
        </ul>
        <div className="board__foot">
          <p data-board-when>{when}</p>
          <button className="btn" type="button" onClick={again}>Check again</button>
        </div>
      </div>
    </dialog>
  );
}

const ABOUTS = ['Hiring', 'A project', 'Something else'];
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function Compose() {
  const { refs, shut } = useWindows();
  const props = useDialogProps(refs.composeRef);
  const [f, setF] = useState({ about: 'Hiring', name: '', email: '', org: '', msg: '', website: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');           // idle | sending | sent | failed
  const [note, setNote] = useState('');
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  // Without a mail provider on the server (or if it fails), the visitor's own
  // email app opens with everything already written, which always works.
  const mailto = () => {
    const subject = `${f.about}${f.org ? ': ' + f.org : f.name ? ': ' + f.name : ''}`;
    const sign = [f.name, f.org].filter(Boolean).join(', ');
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(f.msg.trim() + (sign ? `\n\n${sign}` : ''))}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.msg.trim()) errs.msg = 'Write a line or two first.';
    if (!isEmail(f.email.trim())) errs.email = 'Add an email address I can reply to.';
    setErrors(errs);
    if (Object.keys(errs).length) {
      e.currentTarget.elements[errs.email ? 'email' : 'msg'].focus();
      return;
    }
    setState('sending');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.sent) { setState('sent'); return; }
      if (r.status === 400 && d.errors) { setErrors(d.errors); setState('idle'); return; }
      if (r.status === 429) { setNote(d.error); setState('failed'); return; }
      setState('idle');
      mailto();
    } catch {
      setState('idle');
      mailto();
    }
  };

  return (
    <dialog className="win win--compose" data-compose aria-labelledby="compose-h" {...props}>
      <form className="compose" noValidate onSubmit={submit}>
        <div className="win__bar">
          <p className="win__title"><b id="compose-h">Write to Sahil</b></p>
          <button className="win__close" type="button" onClick={() => shut(refs.composeRef.current)}>Close</button>
        </div>
        {state === 'sent' ? (
          <div className="compose__body compose__sent" role="status">
            <p className="story">Sent. It is in my inbox now.</p>
            <p>I will reply to {f.email}.</p>
          </div>
        ) : (
          <div className="compose__body">
            <div className="compose__about">
              <span>It is about</span>
              <Suspense fallback={null}>
                <JellyRadio items={ABOUTS} value={f.about} onChange={(about) => setF((v) => ({ ...v, about }))}
                            ariaLabel="It is about" size="md" radius={999} swell={0.08} barge={3} jelly={0.8}
                            chipColor="#F4F6F7" activeColor="#0E1519" textColor="#0E1519" activeTextColor="#F4F6F7" />
              </Suspense>
            </div>
            <label className="field"><span>Your name</span><input name="name" autoComplete="name" value={f.name} onChange={set("name")} data-autofocus /></label>
            <label className="field"><span>Your email</span>
              <input name="email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set('email')}
                     aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'err-email' : undefined} />
              {errors.email && <em className="field__err" id="err-email">{errors.email}</em>}
            </label>
            <label className="field"><span>Company or project</span><input name="org" autoComplete="organization" value={f.org} onChange={set('org')} /></label>
            <label className="field"><span>Message</span>
              <textarea name="msg" rows={5} value={f.msg} onChange={set('msg')}
                        aria-invalid={errors.msg ? true : undefined} aria-describedby={errors.msg ? 'err-msg' : undefined} />
              {errors.msg && <em className="field__err" id="err-msg" data-err>{errors.msg}</em>}
            </label>
            {/* filled only by bots */}
            <input className="compose__trap" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
            {state === 'failed' && note && <p className="field__err" role="alert">{note}</p>}
            <div className="compose__act">
              <button className="btn btn--hot" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send'}</button>
              <CopyButton />
            </div>
            <p className="compose__note">Goes straight to my inbox. If that is ever unavailable, your own email app opens with this already written.</p>
          </div>
        )}
      </form>
    </dialog>
  );
}

export default function Windows() {
  return (
    <>
      <AppWindow />
      <Board />
      <Compose />
    </>
  );
}
