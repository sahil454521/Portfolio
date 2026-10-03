import { Fragment, useEffect, useRef } from 'react';
import { gsap, SplitText, motionOn, scrollToId } from '../motion';
import { EMAIL, strands } from '../data';
import { CountUp, LivePing, Magnetic } from './bits';

export function Hero() {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOn) return undefined;
    const ctx = gsap.context(() => {}, ref);
    document.fonts.ready.then(() => ctx.add(() => {
      const split = SplitText.create('.hero h1', { type: 'lines', mask: 'lines' });
      gsap.set('.hero h1', { visibility: 'visible' });
      gsap.from(split.lines, { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
      gsap.from('.hero-sub, .hero-ctas', { opacity: 0, y: 28, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.75 });
      gsap.to('.hero-inner', {
        yPercent: -22, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }));
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-inner">
        <h1>Everything here is <em>in production.</em></h1>
        <p className="hero-sub">Final year at IIT Guwahati. Client sites taking real money, a research model, three side projects. All live.</p>
        <div className="hero-ctas">
          <Magnetic className="btn btn-signal" href="#work" onClick={(e) => { e.preventDefault(); scrollToId('work'); }}>See the work</Magnetic>
          <Magnetic className="btn btn-ghost" href={`mailto:${EMAIL}`}>Email me</Magnetic>
        </div>
      </div>
      <p className="hero-hint" aria-hidden="true">Move the cursor through the field</p>
    </section>
  );
}

// Label heights match the four WebGL lanes: (strand - 1.5) * 0.47 of the half-height.
const laneTops = ['14.75%', '38.25%', '61.75%', '85.25%'];

export function Braid() {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOn) return undefined;
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .from('.strand-label', { opacity: 0, x: -40, stagger: 0.025, duration: 0.1 }, 0.1)
        .to('.strand-label', { opacity: 0, x: 40, stagger: 0.02, duration: 0.08 }, 0.4)
        .from('.braid-line', { opacity: 0, scale: 0.9, filter: 'blur(14px)', duration: 0.12 }, 0.8)
        .from('.braid-sub', { opacity: 0, y: 20, duration: 0.08 }, 0.86)
        .to({}, { duration: 0.06 }, 0.94);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="braid" className="braid" ref={ref} aria-labelledby="braid-title">
      <div className="braid-stage">
        {strands.map(([name, desc], i) => (
          <p key={name} className="strand-label" style={{ top: laneTops[i] }}><b>{name}</b><span>{desc}</span></p>
        ))}
        <h2 id="braid-title" className="braid-line">Both ends, or it is <em>not finished.</em></h2>
        <p className="braid-sub">Interface, service, models, running. One signal.</p>
      </div>
    </section>
  );
}

export function Project({ p, flip }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOn) return undefined;
    const mm = gsap.matchMedia(ref);
    mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, (c) => {
      const desk = c.conditions.desk;
      const tl = gsap.timeline({
        scrollTrigger: desk
          ? { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 }
          : { trigger: '.laptop', start: 'top 90%', end: 'top 30%', scrub: 0.8 },
      });
      tl.fromTo('.lid', { rotateX: -94 }, { rotateX: 6, ease: 'power2.inOut', duration: 0.5 }, 0)
        .fromTo('.laptop', { scale: 0.8, yPercent: 12 }, { scale: 1, yPercent: 0, ease: 'power2.out', duration: 0.5 }, 0)
        .fromTo('.screen img', { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.3 }, 0.3)
        .fromTo('.screen-glow', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.32);
      if (desk) {
        tl.from('.proj-info > *', { opacity: 0, y: 48, stagger: 0.045, duration: 0.22 }, 0.04).to({}, { duration: 0.3 });
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <section className={`project ${flip ? 'project--flip' : ''}`} ref={ref} aria-labelledby={`${p.id}-title`}>
      <div className="project-stage">
        <div className="proj-info">
          <h2 id={`${p.id}-title`}>{p.name}</h2>
          <p className="proj-kind">{p.kind}</p>
          <p className="lede">{p.lede}</p>
          <p className="proj-body">{p.body}</p>
          <dl className="specs">
            {p.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className="proj-stat">
            <span className="stat-num">
              {p.stat.parts.map((part, i) => <Fragment key={i}>{i > 0 && <span className="stat-dash">-</span>}<CountUp {...part} /></Fragment>)}
            </span>
            <span className="stat-label">{p.stat.label}</span>
          </p>
          <div className="proj-live">
            <LivePing url={p.url} label={p.host} />
            <Magnetic className="btn btn-ghost btn-sm" href={p.url}>Visit the site</Magnetic>
          </div>
        </div>
        <a className="laptop" href={p.url} aria-label={`Open ${p.host}`}>
          <div className="lid">
            <div className="screen">
              <img src={p.shot} alt={p.alt} width="1680" height="1080" loading="lazy" decoding="async" />
              <span className="screen-glow" aria-hidden="true" />
            </div>
          </div>
          <div className="deck" aria-hidden="true"><span /></div>
        </a>
      </div>
    </section>
  );
}
