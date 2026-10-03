import { useState } from 'react';
import { CountUp } from './bits';

const signals = ['Text', 'EEG', 'Wearables', 'Audio and video'];
const outputs = ['Depression screen', 'PHQ-9 severity', 'DSM-5 symptoms'];
// ponytail: fixed illustrative trust per signal; the paper's gate is learned per sample.
const trust = [1, 1.2, 0.8, 1];
const inY = [12.5, 37.5, 62.5, 87.5];
const outY = [16.67, 50, 83.33];

// Two signals per wire, half a cycle apart, so one is always travelling.
const inA = { keyPoints: '0;1;1', keyTimes: '0;0.5;1' };
const inB = { keyPoints: '1;1;0;1', keyTimes: '0;0.5;0.5;1' };
const outA = { keyPoints: '0;0;1', keyTimes: '0;0.5;1' };
const outB = { keyPoints: '0;1;0;0', keyTimes: '0;0.5;0.5;1' };

function Dot({ path, timing, off }) {
  return (
    <path className={`fdot ${off ? 'off' : ''}`} d="M0 0h.01">
      <animateMotion dur="2.6s" repeatCount="indefinite" calcMode="linear" {...timing}><mpath href={`#${path}`} /></animateMotion>
    </path>
  );
}

export function Fusion() {
  const [on, setOn] = useState([true, true, true, true]);
  const total = trust.reduce((s, t, i) => s + (on[i] ? t : 0), 0);
  const count = on.filter(Boolean).length;
  const toggle = (i) => setOn((o) => o.map((v, j) => (j === i ? !v : v)));

  return (
    <section id="research" className="fusion" aria-labelledby="fusion-title">
      <div className="fusion-head">
        <h2 id="fusion-title">One model, <em>four kinds of signal.</em></h2>
        <p className="lede">PPEMDD screens for depression from text, EEG, wearables and audio or video together, and answers three questions in a single pass.</p>
        <p className="fusion-note">I built it end to end as a research intern at VIT, from a review of more than twenty papers to the fused model, and wrote it up as an IEEE-format paper.</p>
      </div>

      <figure className={`gate ${count ? '' : 'empty'}`} aria-labelledby="gate-cap">
        <p className="gate-try">Try it: switch a signal off.</p>
        <div className="gate-grid">
          <div className="gate-in" role="group" aria-label="Signals going in">
            {signals.map((s, i) => (
              <button key={s} type="button" className="sig" aria-pressed={on[i]} onClick={() => toggle(i)}>{s}</button>
            ))}
          </div>
          <div className="gate-wire" aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              {inY.map((y, i) => (
                <path key={y} id={`fin${i}`} className={`strand ${on[i] ? '' : 'off'}`}
                  style={{ '--w': `${on[i] ? 1.5 + (trust[i] / total) * 18 : 1.5}px` }}
                  d={`M0 ${y}C30 ${y} 20 50 50 50`} />
              ))}
              {outY.map((y, i) => <path key={y} id={`fout${i}`} className="out" d={`M50 50C80 50 70 ${y} 100 ${y}`} />)}
              <g className="flow">
                {inY.map((y, i) => [<Dot key={`a${i}`} path={`fin${i}`} timing={inA} off={!on[i]} />, <Dot key={`b${i}`} path={`fin${i}`} timing={inB} off={!on[i]} />])}
                {outY.map((y, i) => [<Dot key={`c${i}`} path={`fout${i}`} timing={outA} />, <Dot key={`d${i}`} path={`fout${i}`} timing={outB} />])}
              </g>
            </svg>
            <span className="gate-node" />
          </div>
          <ul className="gate-out" aria-label="Answers coming out">
            {outputs.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
        <p className="gate-status" aria-live="polite">
          {count ? <><b>{count} of 4</b> signals in, one pass</> : 'No signal in. Switch one on and the model answers again.'}
        </p>
        <figcaption id="gate-cap">PPEMDD, simplified. When a signal drops out, the dynamic gate reweights what is left by whether it is there and how far to trust it, and multi-head cross-attention lets every signal read the others.</figcaption>
      </figure>

      <dl className="metrics">
        <div><dt>Accuracy</dt><dd><CountUp to={91.24} decimals={2} suffix="%" /></dd></div>
        <div><dt>Recall</dt><dd><CountUp to={79.23} decimals={2} suffix="%" /></dd></div>
        <div><dt>F1</dt><dd><CountUp to={0.7809} decimals={4} /></dd></div>
        <div><dt>Held-out test</dt><dd><CountUp to={2250} /> <small>samples, Reddit and WU3D</small></dd></div>
      </dl>
    </section>
  );
}
