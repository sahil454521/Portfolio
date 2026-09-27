// The two client sites. Each one opens up as you scroll into it, then the
// story, the facts, and the client's own photographs.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useStatus } from '../lib/status.jsx';
import { useNearView } from '../lib/motion.js';
import ScrollExpand from './reactbits/ScrollExpand.jsx';

// React Bits' AccordionGallery carries GSAP, so it loads as the photos near.
const AccordionGallery = lazy(() => import('./reactbits/AccordionGallery.jsx'));

const media = (q) => typeof matchMedia !== 'undefined' && matchMedia(q).matches;

function Status({ host }) {
  const { status } = useStatus();
  const x = status && status.byHost[host];
  return (
    <dd data-status-host={host}>
      <i className={x && !x.up ? 'dot' : 'dot dot--live'} />{' '}
      <span>{x ? (x.up ? `Live, answered in ${x.ms} ms` : 'Not answering right now') : 'Live'}</span>
    </dd>
  );
}

export function Case({ c }) {
  const box = useRef(null);
  const near = useNearView(box);
  const [seen, setSeen] = useState(false);
  useEffect(() => { if (near) setSeen(true); }, [near]);
  const [narrow] = useState(() => media('(max-width: 700px)'));
  const [still] = useState(() => media('(prefers-reduced-motion: reduce)'));
  return (
    <section className={`case case--${c.tint}`} id={c.id} aria-labelledby={`case-${c.n}`}>
      <h2 className="sr" id={`case-${c.n}`}>{c.name}</h2>

      {/* React Bits' ScrollExpand: the site starts as a screen in the page and
          opens to the whole view as you scroll into it, the way the desk's
          screens open when clicked. With reduced motion it is simply open. */}
      <ScrollExpand
        className="case__expand" useWindowScroll enabled={!still}
        src={c.still} alt={c.stillAlt} title={c.name} scrollHint="Scroll into the site"
        startWidth={narrow ? 88 : 62} startHeight={narrow ? 34 : 56} startRadius={10} endRadius={0}
        mediaZoom={1} scrollDistance={still ? 0 : narrow ? 0.8 : 1} holdDistance={still ? 0 : 0.3}
        smoothing={0.08} overlayScrim={0.4}
      >
        <div className="case__over">
          <p className="case__over-kind">{c.kind}</p>
          <p className="case__over-story">{c.story}</p>
          <a className="case__over-go" href={c.href} target="_blank" rel="noopener">Visit {c.host} <span aria-hidden="true">↗</span></a>
        </div>
      </ScrollExpand>

      <div className="case__body" data-sc-in data-sc-stagger="60">
        <div className="case__copy">
          {c.body.map((p) => <p key={p}>{p}</p>)}
        </div>
        <dl className="spec">
          {c.spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          <div><dt>Status</dt><Status host={c.host} /></div>
        </dl>
      </div>

      {/* React Bits' AccordionGallery: the client's own photographs, one
          opening at a time under the pointer, captioned */}
      <div className="case__gallery" ref={box}>
        {seen && (
          <Suspense fallback={null}>
            <AccordionGallery
              items={c.photos.map(([src, alt, , , cap]) => ({ image: src, alt, label: cap }))}
              defaultIndex={0} height={440} gap={10} radius={8} expandRatio={0.5} tilt={5} parallax={0.4}
              grayscale overlayColor="#0E1519" accentColor="#F4F6F7" textColor="#F4F6F7" trigger="hover"
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}
