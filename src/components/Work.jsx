// The two client sites, then the wall of what they carry.
import { lazy, Suspense, useRef } from 'react';
import { CARRY, CASES } from '../data.js';
import { useStatus } from '../lib/status.jsx';
import { useNearView, useTilt } from '../lib/motion.js';
import GlareHover from './reactbits/GlareHover.jsx';

// React Bits' DriftWall, loaded only as the wall nears the screen: its
// animation runs every frame, so it should not exist until it can be seen.
const DriftWall = lazy(() => import('./reactbits/DriftWall.jsx'));

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
  const site = useRef(null);
  useTilt(site);
  return (
    <section className={`case case--${c.tint}`} id={c.id} aria-labelledby={`case-${c.n}`}>
      <header className="case__head" data-sc-in data-sc-stagger="60">
        <h2 id={`case-${c.n}`}>{c.name}</h2>
        <p className="case__kind">
          {c.kind}{' '}
          <a className="go go--sm" href={c.href} target="_blank" rel="noopener">{c.host} <span aria-hidden="true">↗</span></a>
        </p>
      </header>

      <figure className="case__site" data-sc-reveal="up" data-sc-reveal-at="0.02 0.4">
        <a ref={site} href={c.href} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
          {/* React Bits' GlareHover: light crosses the capture as it would the glass of a screen */}
          <GlareHover width="100%" height="auto" background="transparent" borderColor="transparent" borderRadius="0"
                      glareOpacity={0.4} glareAngle={-35} glareSize={320} transitionDuration={900}>
            <img src={c.still} alt={c.stillAlt} width="1680" height="1080" loading="lazy" />
          </GlareHover>
        </a>
        <figcaption>{c.host}, captured from the live site.</figcaption>
      </figure>

      <div className="case__body" data-sc-in data-sc-stagger="60">
        <div className="case__copy">
          <p className="story">{c.story}</p>
          {c.body.map((p) => <p key={p}>{p}</p>)}
        </div>
        <dl className="spec">
          {c.spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          <div><dt>Status</dt><Status host={c.host} /></div>
        </dl>
      </div>

      <div className="case__photos">
        {c.photos.map(([src, alt, w, h, cap]) => (
          <figure key={src}><img src={src} alt={alt} width={w} height={h} loading="lazy" /><figcaption>{cap}</figcaption></figure>
        ))}
      </div>
    </section>
  );
}

export function Carry() {
  const box = useRef(null);
  const near = useNearView(box);
  return (
    <section className="carry" aria-labelledby="carry-h">
      <div className="carry__head" data-sc-in data-sc-stagger="60">
        <h2 id="carry-h">What the two sites carry.</h2>
        <p>The bags sell through one, and the buildings are what the other exists to show. Each tile opens where it lives.</p>
      </div>
      <div className="carry__wall" ref={box}>
        {near && (
          <Suspense fallback={null}>
            <DriftWall
              items={CARRY}
              columns={5}
              tileWidth={230}
              tileHeight={156}
              gap={18}
              radius={8}
              tilt={16}
              turn={-12}
              perspective={1200}
              depth={120}
              speed={34}
              variance={0.45}
              parallax={0.6}
              lift={56}
              fade={0.55}
              dim={0.78}
              overlayColor="#EAEDEF"
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}

export default function Work() {
  return (
    <>
      {CASES.map((c) => <Case key={c.id} c={c} />)}
      <Carry />
    </>
  );
}
