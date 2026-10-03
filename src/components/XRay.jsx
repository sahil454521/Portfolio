import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, motionOn } from '../motion';
import { xray } from '../data';

// "I build the surface and the thing underneath it": a lens that cuts through the live site to its workings.
export function XRay() {
  const [active, setActive] = useState(0);
  const [all, setAll] = useState(false);
  const stage = useRef(null);
  const touched = useRef(false);
  const site = xray[active];

  const place = (x, y) => {
    stage.current.style.setProperty('--mx', `${x}px`);
    stage.current.style.setProperty('--my', `${y}px`);
  };
  const fromEvent = (e) => {
    const r = stage.current.getBoundingClientRect();
    place(e.clientX - r.left, e.clientY - r.top);
  };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return; // touch: tap to move the lens, so the page still scrolls
    touched.current = true;
    fromEvent(e);
  };
  const onDown = (e) => { touched.current = true; fromEvent(e); };

  // Until someone touches it, the lens wanders on a slow figure eight, only while on screen.
  useEffect(() => {
    const el = stage.current;
    const centre = () => { const r = el.getBoundingClientRect(); return [r.width, r.height]; };
    const [w, h] = centre();
    place(w * 0.72, h * 0.5);
    if (!motionOn) return undefined;
    const o = { t: 0 };
    const tw = gsap.to(o, {
      t: Math.PI * 2, duration: 9, ease: 'none', repeat: -1, paused: true,
      onUpdate: () => {
        if (touched.current) return;
        const [cw, ch] = centre();
        place(cw * (0.5 + 0.34 * Math.sin(o.t)), ch * (0.5 + 0.3 * Math.sin(o.t * 2)));
      },
    });
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? tw.play() : tw.pause()) });
    return () => { st.kill(); tw.kill(); };
  }, []);

  return (
    <section className="xray" aria-labelledby="xray-title">
      <div className="xray-head">
        <h2 id="xray-title">I build the surface <em>and the thing underneath it.</em></h2>
        <p className="lede">A shop that renders beautifully and loses a cart is not a shop. Move across the site to look underneath.</p>
      </div>

      <div className="xray-controls">
        <div className="tabs" role="group" aria-label="Choose a site">
          {xray.map((s, i) => (
            <button key={s.id} type="button" className="tab" aria-pressed={i === active} onClick={() => setActive(i)}>{s.name}</button>
          ))}
        </div>
        <button type="button" className="tab tab--switch" aria-pressed={all} onClick={() => setAll((v) => !v)}>
          <span aria-hidden="true" />Show everything underneath
        </button>
      </div>

      <div ref={stage} className={`xray-stage ${all ? 'is-all' : ''}`} onPointerMove={onMove} onPointerDown={onDown}>
        <div className="xr-under" aria-hidden="true">
          <img src={site.shot} alt="" />
          {site.notes.map((n) => (
            <div key={n.label} className="xr-box" style={{ left: `${n.box[0]}%`, top: `${n.box[1]}%`, width: `${n.box[2]}%`, height: `${n.box[3]}%` }}>
              <span>{n.label}</span>
            </div>
          ))}
          <p className="xr-stack">{site.stack}</p>
        </div>
        <img className="xr-surface" src={site.shot} alt={site.alt} />
        <span className="xr-ring" aria-hidden="true"><b>underneath</b></span>
      </div>

      <ul className="xray-list" aria-label={`Underneath ${site.name}`}>
        {site.notes.map((n) => <li key={n.label}>{n.label}</li>)}
        <li>{site.stack}</li>
      </ul>
    </section>
  );
}
