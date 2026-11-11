import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, motionOn, scrollToId } from './motion';
import { AVAILABILITY, EMAIL, GITHUB, LINKEDIN, PLACE, RESUME, RESUME_PDF, projects, resume, sideProjects, skillsAll } from './data';
import { Arrow, LivePing, Magnetic } from './components/bits';
import { copyEmail, MotionNotice, Nav, Toast } from './components/Chrome';
import { Fusion } from './components/Fusion';
import { Ledger } from './components/Ledger';
import { PatchProof } from './components/PatchProof';

const statText = (stat) => stat.parts.map((x) => `${x.to}${x.suffix || ''}`).join('-');

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="hero-avail"><i aria-hidden="true" />{AVAILABILITY}</p>
        <h1>Don’t take my <span className="hl">word for it.</span></h1>
        <p className="hero-sub">Sahil Pathak, full-stack and AI/ML engineer. This page tests its own claims while you read it.</p>
        <div className="hero-ctas">
          <Magnetic className="btn" href="#work" onClick={(e) => { e.preventDefault(); scrollToId('work'); }}>See the work</Magnetic>
          <Magnetic className="btn btn-ghost" href={RESUME}>Resume</Magnetic>
        </div>
      </div>
      <Ledger />
    </section>
  );
}

function Case({ p, i }) {
  return (
    <article className={`case ${p.device === 'phone' ? 'case--phone' : ''}`} id={`case-${p.id}`} style={{ '--i': i }}>
      <div className="case-text">
        <p className="case-kind">{p.kind}</p>
        <h3>{p.name}</h3>
        <p className="case-lede">{p.lede}</p>
        <dl className="case-specs">
          {p.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <p className="case-stat"><b>{statText(p.stat)}</b><span>{p.stat.label}</span></p>
        <p className="case-links">
          <a className="btn btn-sm" href={p.url}>Visit the site<Arrow /><span className="sr">: {p.name}</span></a>
          {p.code && <a className="btn btn-sm btn-ghost" href={p.code}>Code<Arrow /><span className="sr"> for {p.name}</span></a>}
          <LivePing url={p.url} />
        </p>
      </div>
      <div className="case-shot">
        {p.shots
          ? p.shots.map((s) => <img key={s.src} src={s.src} alt={s.alt} width="390" height="844" loading="lazy" decoding="async" />)
          : <img src={p.shot} alt={p.alt} width="1680" height="1080" loading="lazy" decoding="async" />}
      </div>
    </article>
  );
}

function Work() {
  return (
    <section id="work" className="work" aria-labelledby="work-title">
      <div className="head reveal">
        <h2 id="work-title">Selected work</h2>
        <p className="lede">Two client builds and a voice app. Each one is live, and each link opens the running thing.</p>
      </div>
      <div className="cases">{projects.map((p, i) => <Case key={p.id} p={p} i={i} />)}</div>
    </section>
  );
}

function More() {
  return (
    <section id="more" className="more" aria-labelledby="more-title">
      <div className="head reveal">
        <h2 id="more-title">Also live</h2>
        <p className="lede">No client, no brief. Things I built to find out whether I could, and left running.</p>
      </div>
      <div className="more-grid">
        {sideProjects.map((s) => (
          <article key={s.id} className="tile reveal">
            <img src={s.shot} alt="" width="1680" height="1080" loading="lazy" decoding="async" />
            <div>
              <h3><a className="tile-link" href={s.url}>{s.name}<Arrow /></a></h3>
              <p>{s.text}</p>
              {s.code && <a className="tile-code" href={s.code}>Code<Arrow /><span className="sr"> for {s.name}</span></a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Background() {
  return (
    <section id="background" className="background" aria-labelledby="bg-title">
      <div className="head reveal">
        <h2 id="bg-title">Experience and skills</h2>
        <p className="bg-actions">
          <a className="btn btn-sm" href={RESUME_PDF} download>Download the resume</a>
          <a className="btn btn-sm btn-ghost" href={RESUME}>Read it here</a>
        </p>
      </div>
      <div className="bg-grid">
        <ol className="xp">
          {resume.map((r) => (
            <li key={r.title} className="reveal">
              <p className="xp-when">{r.when}</p>
              <h3>{r.title}</h3>
              <ul>{r.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            </li>
          ))}
        </ol>
        <dl className="skills reveal">
          {skillsAll.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v.split(', ').map((x) => <span key={x}>{x}</span>)}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="reveal">Hiring, or building something that has to stay live?</h2>
      <p className="lede reveal">{AVAILABILITY}. {PLACE}.</p>
      <div className="contact-row reveal">
        <Magnetic className="btn btn-xl" href={`mailto:${EMAIL}`}>Email me</Magnetic>
        <button type="button" className="copy" onClick={copyEmail}>{EMAIL}<span>Copy</span></button>
      </div>
      <ul className="elsewhere">
        <li><a href={LINKEDIN}>LinkedIn<Arrow /></a></li>
        <li><a href={GITHUB}>GitHub<Arrow /></a></li>
        <li><a href={RESUME}>Resume<Arrow /></a></li>
      </ul>
    </section>
  );
}

export default function App() {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOn) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.hero-avail, .hero-sub, .hero-ctas', { opacity: 0, y: 24, duration: 1.1, ease: 'expo.out', stagger: 0.1, delay: 0.5 });
      gsap.from('.ledger', { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', delay: 0.3 });
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 28, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });
      // each case pins under the nav and the next one slides over it; the one underneath steps back
      gsap.matchMedia().add('(min-width: 901px)', () => {
        const cases = gsap.utils.toArray('.case');
        cases.slice(0, -1).forEach((c, i) => {
          gsap.to(c, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: cases[i + 1], start: 'top bottom', end: 'top 15%', scrub: true } });
        });
      });
    }, ref);
    document.fonts.ready.then(() => ctx.add(() => {
      const split = SplitText.create('.hero h1', { type: 'lines', mask: 'lines' });
      gsap.set('.hero h1', { visibility: 'visible' });
      gsap.from(split.lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.1 });
      ScrollTrigger.refresh();
    }));
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref}>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Fusion />
        <PatchProof />
        <More />
        <Background />
        <Contact />
      </main>
      <footer className="footer">
        <p>Sahil Pathak, 2026. Built with React and GSAP, set in Bricolage Grotesque and Archivo.</p>
      </footer>
      <MotionNotice />
      <Toast />
    </div>
  );
}
