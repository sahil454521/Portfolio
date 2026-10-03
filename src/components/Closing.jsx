import { useEffect, useRef } from 'react';
import { gsap, motionOn } from '../motion';
import { EMAIL, GITHUB, LINKEDIN, RESUME, RESUME_PDF, resume, sideProjects } from '../data';
import { Magnetic } from './bits';
import { copyEmail } from './Chrome';

export function AlsoLive() {
  return (
    <section id="also" className="also" aria-labelledby="also-title">
      <h2 id="also-title">Also live.</h2>
      <p className="lede">No client, no brief. Things I built to find out whether I could, and left running.</p>
      <div className="accordion">
        {sideProjects.map((s) => (
          <a key={s.id} className="slice" href={s.url}>
            <img src={s.shot} alt="" width="1680" height="1080" loading="lazy" decoding="async" />
            <div className="slice-body">
              <h3>{s.name}</h3>
              <p>{s.text}</p>
              <span className="go">{s.verb}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function Resume() {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOn) return undefined;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.rcard');
      cards.slice(0, -1).forEach((card, i) => {
        gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, {
          scale: 0.92, filter: 'brightness(0.3)', ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top 75%', end: 'top 25%', scrub: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="resume" className="resume" ref={ref} aria-labelledby="resume-title">
      <div className="resume-head">
        <h2 id="resume-title">Resume.</h2>
        <div className="resume-actions">
          <Magnetic className="btn btn-ghost" href={RESUME}>Open the full resume</Magnetic>
          <Magnetic className="btn btn-signal" href={RESUME_PDF} download>Download PDF</Magnetic>
        </div>
      </div>
      <div className="cards">
        {resume.map((r, i) => (
          <article key={r.title} className="rcard" style={{ '--i': i }}>
            <div className="rcard-top"><h3>{r.title}</h3><p className="rcard-when">{r.when}</p></div>
            <ul>{r.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}

const stackWords = ['PyTorch', 'React', 'Node and Express', 'FastAPI', 'MongoDB', 'scikit-learn', 'Razorpay', 'Three.js', 'Hugging Face', 'Next.js'];

export function Marquee() {
  const row = stackWords.map((w, i) => <span key={w} className={i % 2 ? 'mq-out' : ''}>{w}<i aria-hidden="true" /></span>);
  return (
    <div className="marquee" aria-label={`Stack: ${stackWords.join(', ')}`}>
      <div className="marquee-track" aria-hidden="true">{row}{row}</div>
    </div>
  );
}

export function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">Hiring, or building something that has to <em>stay live?</em></h2>
      <div className="contact-row">
        <Magnetic className="btn btn-signal btn-xl" href={`mailto:${EMAIL}`}>Email me</Magnetic>
        <button type="button" className="copy" onClick={copyEmail}>{EMAIL}<span>Copy</span></button>
      </div>
      <ul className="elsewhere">
        <li><a href={RESUME}>Resume</a></li>
        <li><a href={LINKEDIN}>LinkedIn</a></li>
        <li><a href={GITHUB}>GitHub</a></li>
      </ul>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <p>Built with React, Three.js and GSAP. Set in Cabinet Grotesk, Satoshi and Geist Mono.</p>
      <p>Sahil Pathak, 2026</p>
    </footer>
  );
}
