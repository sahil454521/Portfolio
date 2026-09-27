// The rest of the page: the personal projects, how I build, who I am, and
// how to reach me.
import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ALSO, EMAIL, GITHUB, LINKEDIN, STACK, THINGS } from '../data.js';
import { useMagnet, useNearView, useScrub } from '../lib/motion.js';
import { useWindows } from '../lib/windows.jsx';
import ThingLink from './ThingLink.jsx';
import LogoLoop from './reactbits/LogoLoop.jsx';
import SpotlightCard from './reactbits/SpotlightCard.jsx';
import { SiFastapi, SiHuggingface, SiMongodb, SiNextdotjs, SiNodedotjs, SiPytorch, SiRazorpay, SiReact, SiScikitlearn, SiThreedotjs } from 'react-icons/si';

// React Bits' FolderFloat carries matter-js for its weightless pills, so it
// arrives as its own chunk rather than with the first paint.
const FolderFloat = lazy(() => import('./reactbits/FolderFloat.jsx'));
// React Bits' Lanyard brings React Three Fiber and a physics engine, so it
// loads only when the contact section comes near.
const Lanyard = lazy(() => import('./reactbits/Lanyard.jsx'));

// Without WebGL the badge just is not there; the email button beside it is.
class Quiet extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

// The badge a new hire is issued, already made out: pull it, throw it, or
// click it to write to me. It draws only while it is on screen.
function Badge() {
  const { go } = useWindows();
  const box = useRef(null);
  const near = useNearView(box, '20% 0px');
  const [seen, setSeen] = useState(false);
  // about a megabyte, most of it the physics engine: not on a saved-data plan
  useEffect(() => { if (near && !(navigator.connection && navigator.connection.saveData)) setSeen(true); }, [near]);
  return (
    <div className="end__badge" ref={box} aria-hidden="true">
      {seen && (
        <Quiet>
          <Suspense fallback={null}>
            <Lanyard active={near} position={[0, 0, 16]} gravity={[0, -40, 0]} onSelect={() => go('phone')} />
          </Suspense>
        </Quiet>
      )}
    </div>
  );
}

// Right under the desk, what it all runs on: React Bits' LogoLoop, each
// tool linking to the place on this page where it is running. It pauses
// under the pointer, and exists only while it is near the screen, since it
// moves every frame.
const ICONS = {
  PyTorch: SiPytorch, React: SiReact, 'Node and Express': SiNodedotjs, FastAPI: SiFastapi, MongoDB: SiMongodb,
  'scikit-learn': SiScikitlearn, Razorpay: SiRazorpay, 'Three.js': SiThreedotjs, 'Hugging Face': SiHuggingface, 'Next.js': SiNextdotjs,
};
export function RunsOn() {
  const box = useRef(null);
  const near = useNearView(box);
  return (
    <section className="band" ref={box} aria-labelledby="band-h">
      <h2 className="band__label" id="band-h">Runs on</h2>
      <div className="band__loop">
        {near && (
          <LogoLoop
            logos={STACK} speed={36} gap={44} logoHeight={16} pauseOnHover fadeOut fadeOutColor="#EAEDEF" ariaLabel="Tools, each linking to where it runs"
            // the loop repeats the row to fill the width; only the first copy is reachable by keyboard
            renderItem={({ label, value }, key) => {
              const Icon = ICONS[label];
              return (
                <a className="band__tool" href={value} tabIndex={String(key).startsWith('0-') ? undefined : -1}>
                  {Icon && <Icon aria-hidden="true" />}{label}
                </a>
              );
            }}
          />
        )}
      </div>
    </section>
  );
}

export function AlsoLive() {
  return (
    <section className="also" id="also" aria-labelledby="also-h">
      <div className="also__head" data-sc-in data-sc-stagger="60">
        <h2 id="also-h">Also live</h2>
        <p>No client, no brief. Things I built to find out whether I could, and left running.</p>
      </div>
      <ol className="also__list" data-sc-in data-sc-stagger="70">
        {ALSO.map(({ id, name, verb, desc }) => {
          const t = THINGS[id];
          return (
            <li key={id}>
              {/* React Bits' SpotlightCard: a warm light follows the pointer along the row */}
              <SpotlightCard className="also__item" spotlightColor="rgba(255, 176, 59, 0.2)">
                <a className="also__row" href={t.app} target="_blank" rel="noopener">
                  <img src={t.still} alt="" width="1680" height="1080" loading="lazy" />
                  <span className="also__text"><strong>{name}</strong><span>{desc}</span></span>
                  <span className="also__host">{t.host} <span aria-hidden="true">↗</span></span>
                </a>
                <ThingLink id={id} className="also__run">{verb}</ThingLink>
              </SpotlightCard>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const fine = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

export function Build() {
  const go = (value) => {
    if (value.startsWith('#')) document.querySelector(value)?.scrollIntoView({ behavior: 'smooth' });
    else location.href = value;
  };
  return (
    <section className="build" id="build" aria-labelledby="build-h">
      <div className="build__head" data-sc-in data-sc-stagger="60">
        <h2 id="build-h">Both ends, or it is not finished.</h2>
        <p>
          A shop that renders beautifully and loses a cart is not a shop. I build
          the surface and the thing underneath it, and I stay on afterwards,
          which is the part that decides whether either was any good. A model
          that scores well and never leaves the notebook is the same mistake.
        </p>
        {/* the stack as a folder: open it and each tool floats out, and picking
            one goes to the place on this page where it is used */}
        <div className="stack">
          <Suspense fallback={null}>
            <FolderFloat
              items={STACK}
              label="The stack"
              sublabel={`${STACK.length} tools, each where it is used`}
              trigger={fine ? 'hover' : 'click'}
              closeOnSelect
              physics
              drift={0.45}
              onSelect={go}
              folderColor="#E89A2A"
              frontColor="#FFB03B"
              paperColor="#FBFCFC"
              itemColor="#FFFFFF"
              itemTextColor="#0E1519"
              labelColor="#0E1519"
              width={220}
              height={150}
              radius={10}
              spread={200}
              lift={24}
              tilt={7}
            />
          </Suspense>
        </div>
      </div>

      <ol className="build__list" data-sc-in data-sc-stagger="70">
        <li><h3>Interface</h3><p>React, Next.js and Vite, Tailwind for the system, GSAP and Three.js where motion has to carry meaning. Real markup, keyboard order, reduced motion honoured.</p></li>
        <li><h3>Service</h3><p>Node and Express, FastAPI and Flask, over MongoDB, Firestore or Convex. Catalogue, cart, orders and auth, and Razorpay with the states that go wrong handled.</p></li>
        <li><h3>Models</h3><p>PyTorch, TensorFlow and Hugging Face for the deep work, scikit-learn when a small model is the right answer. Evaluation that never peeks at the test set.</p></li>
        <li><h3>Running</h3><p>Vercel and Render, CI on every push, image budgets and lazy media. Then the part nobody photographs: fixing it in production.</p></li>
      </ol>
    </section>
  );
}

export function About() {
  const plate = useRef(null);
  useScrub(plate, '/assets/me/colophon.mp4', '/assets/me/colophon-m.mp4');
  return (
    <section className="me" id="me" aria-labelledby="me-h">
      <figure className="me__plate" data-scrub ref={plate}>
        <img className="me__poster" src="/assets/me/colophon-poster.jpg" alt="Sahil Pathak" width="1024" height="577" />
        <video className="me__clip" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      </figure>
      <div className="me__text" data-sc-in data-sc-stagger="60">
        <h2 id="me-h">Sahil Pathak</h2>
        <p className="story">Final year of a B.Tech in computer science, with a BSc (Hons) in data science and AI at IIT Guwahati running alongside it.</p>
        <p>The client sites are the argument for the web side, and the paper is the argument for the models. They took real briefs, and the sites take real money and real enquiries. The rest is how I find out what I can build next.</p>
        <dl className="spec spec--wide">
          <div><dt>Experience</dt><dd>Research intern, VIT, May to July 2026</dd><dd>Software developer, AMG Turnkey Projects, January to June 2025</dd></div>
          <div><dt>Education</dt><dd>B.Tech, Computer Science, DY Patil International University, 2023 to 2027</dd><dd>BSc (Hons), Data Science and AI, IIT Guwahati, 2023 to 2027</dd></div>
          <div><dt>Recognition</dt><dd>Smart India Hackathon, top 15 in the college round</dd><dd>SharkIndia, prize for an AI solution</dd></div>
          <div><dt>Based</dt><dd>Pune, India</dd></div>
        </dl>
      </div>
    </section>
  );
}

// Recruiters paste an address into their own tools more often than they
// click mailto. Failure is silent: the address is printed beside it anyway.
export function CopyButton() {
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  return (
    <button className="copy" type="button" data-done={done ? '' : undefined}
      onClick={() => navigator.clipboard && navigator.clipboard.writeText(EMAIL).then(() => {
        setDone(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(false), 1600);
      }, () => {})}>
      {done ? 'Copied' : 'Copy address'}
    </button>
  );
}

export function Contact() {
  const cta = useRef(null);
  useMagnet(cta);
  return (
    <footer className="end" id="contact">
      <div className="end__inner" data-sc-in data-sc-stagger="60">
        <Badge />
        <h2>Hiring, or building something that has to stay live?</h2>
        <div className="end__act">
          <ThingLink id="phone" className="end__cta" ref={cta}>
            <span>Email me</span>
            <em>{EMAIL}</em>
          </ThingLink>
          <CopyButton />
        </div>
        <ul className="end__links">
          <li><a className="lnk" href="/cv.html">Résumé</a></li>
          <li><a className="lnk" href={LINKEDIN} target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a className="lnk" href={GITHUB} target="_blank" rel="noopener">GitHub</a></li>
        </ul>
        <dl className="end__meta">
          <div><dt>Set in</dt><dd>Bricolage Grotesque and Archivo</dd></div>
          <div><dt>Built with</dt><dd>React and Vite, Three.js for the desk, a Node and Express API for the status lights and the email form</dd></div>
          <div><dt>Photography</dt><dd>AMG Projects and Desi Totes, used with permission</dd></div>
        </dl>
      </div>
    </footer>
  );
}
