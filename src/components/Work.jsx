// The two client sites. Each is laid out the same way, so they read as a
// series: what it is and what it runs on, then the site itself in a browser
// window whose address bar reports whether it is up right now, then the
// notes beside the client's own photographs.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useStatus } from '../lib/status.jsx';
import { useNearView } from '../lib/motion.js';

// React Bits' Stack: the client's photographs as a pile of prints, loaded as
// they come near.
const Stack = lazy(() => import('./reactbits/Stack.jsx'));

function useLive(host) {
  const { status } = useStatus();
  const x = status && status.byHost[host];
  if (!x) return { state: 'checking', text: 'Checking' };
  return x.up ? { state: 'up', text: `Live, ${x.ms} ms` } : { state: 'down', text: 'Not answering' };
}

// A browser window around the capture. The bar is real: the host, whether it
// answered the last check and how fast, and a way in.
function Window({ c }) {
  const live = useLive(c.host);
  return (
    <figure className="case__window" data-sc-reveal="up" data-sc-reveal-at="0.02 0.3">
      <div className="case__bar">
        <span className="case__lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="case__url">
          <span className="case__lock" aria-hidden="true" />
          <span>{c.host}</span>
        </span>
        <span className="case__live" data-state={live.state} data-status-host={c.host}>
          <i className="case__dot" aria-hidden="true" />{live.text}
        </span>
        <a className="case__visit" href={c.href} target="_blank" rel="noopener">
          Visit<span className="sr"> {c.host}</span> <span aria-hidden="true">↗</span>
        </a>
      </div>
      <a className="case__shot" href={c.href} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
        <img src={c.still} alt="" width="1680" height="1080" loading="lazy" decoding="async" />
      </a>
      <figcaption className="sr">{c.stillAlt}</figcaption>
    </figure>
  );
}

export function Case({ c }) {
  const box = useRef(null);
  const near = useNearView(box);
  const [seen, setSeen] = useState(false);
  useEffect(() => { if (near) setSeen(true); }, [near]);
  return (
    <section className={`case case--${c.tint}`} id={c.id} aria-labelledby={`case-${c.n}`}>
      <header className="case__head" data-sc-in data-sc-stagger="60">
        <p className="case__kind">{c.kind}</p>
        <h2 id={`case-${c.n}`}>{c.name}</h2>
      </header>

      <div className="case__intro" data-sc-in data-sc-stagger="60">
        <p className="case__story">{c.story}</p>
        <dl className="spec case__spec">
          {c.spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </div>

      <Window c={c} />

      <div className="case__more">
        <div className="case__copy" data-sc-in data-sc-stagger="60">
          {c.body.map((p) => <p key={p}>{p}</p>)}
        </div>
        {/* React Bits' Stack: drag, flick or tap the top print to see the
            next; the caption says what it is */}
        <div className="case__gallery" ref={box}>
          {seen && (
            <Suspense fallback={null}>
              <Stack
                items={c.photos.map(([src, alt, , , cap]) => ({ image: src, alt, label: cap }))}
                aspect={c.tint === 'cotton' ? '4 / 5' : '4 / 3'}
              />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
