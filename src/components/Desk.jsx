// The hero: a desk where every object is something I built, and every object
// opens. The Three.js scene lives in src/desk/scene.js; this component gives
// it a canvas, hands its clicks to go(id), and renders the headline and the
// list that names the same things for keyboards, screen readers and phones.
import { Fragment, useEffect, useRef, useState } from 'react';
import { MENU, THINGS } from '../data.js';
import { useWindows } from '../lib/windows.jsx';
import { useStatus } from '../lib/status.jsx';
import { useVariableProximity } from '../lib/motion.js';
import ThingLink from './ThingLink.jsx';

const HEADLINE = 'Everything here is in production.';

// Behind the desk, the server's latest reading of every site runs past in
// type the desk stands in front of. It appears when the reading arrives; the
// status board says the same thing to screen readers.
function Ticker() {
  const { status } = useStatus();
  const sites = (status && status.sites) || [];
  const run = sites.map((x) => (
    <span key={x.host}><i data-up={x.up ? '' : undefined} />{x.host} <b>{x.up ? `${x.ms} ms` : 'down'}</b></span>
  ));
  return (
    <div className="desk__ticker" aria-hidden="true" data-on={sites.length ? '' : undefined}>
      <p>{run}{run}</p>
    </div>
  );
}

export default function Desk() {
  const { go, scene, openFromHash } = useWindows();
  const root = useRef(null);
  const canvas = useRef(null);
  const h1 = useRef(null);
  const [fallback, setFallback] = useState(false);
  useVariableProximity(h1);

  useEffect(() => {
    let sc = null, dead = false;
    // Three.js arrives as its own chunk, so the headline paints without
    // waiting for it; the objects' labels are painted with the page's fonts,
    // so the scene also waits for those.
    Promise.all([import('../desk/scene.js'), document.fonts.ready]).then(([{ createDesk }]) => {
      if (dead) return;
      sc = createDesk({ root: root.current, canvas: canvas.current, things: THINGS, onGo: go, onReady: openFromHash });
      if (!sc) { setFallback(true); openFromHash(); return; }
      scene.current = sc;
    });
    return () => { dead = true; if (sc) sc.destroy(); scene.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="desk" aria-labelledby="lede-h">
      <div className="desk__stage" data-desk ref={root} data-fallback={fallback ? '' : undefined}>
        <Ticker />
        <canvas ref={canvas} aria-hidden="true" />
        <div className="desk__frame" data-desk-frame aria-hidden="true"><p><b /><span /></p></div>
      </div>

      <div className="lede">
        <p className="eyebrow">AI/ML and full-stack engineer</p>
        {/* one span per letter, so the headline can thicken under the pointer */}
        <h1 id="lede-h" ref={h1} aria-label={HEADLINE}>
          <span aria-hidden="true">
            {HEADLINE.split(' ').map((w, i) => (
              <Fragment key={i}>
                {i ? ' ' : ''}
                <span className="vp__w">{[...w].map((c, k) => <span key={k}>{c}</span>)}</span>
              </Fragment>
            ))}
          </span>
        </h1>
        <p className="lede__p">
          I am Sahil, final year at IIT Guwahati. Everything on this desk is
          something I built, all of it live.
        </p>
        <p className="lede__act">
          <ThingLink id="phone" className="btn btn--hot">Email me</ThingLink>
          <a className="btn" href="/cv.html">Résumé</a>
        </p>
      </div>

      <ul className="desk__menu" aria-label="On the desk">
        {MENU.map((id) => (
          <li key={id}><ThingLink id={id}>{THINGS[id].menu}</ThingLink></li>
        ))}
      </ul>
    </section>
  );
}
