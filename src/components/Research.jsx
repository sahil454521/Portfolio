// PPEMDD, with its mechanism drawn as markup so every input is a real
// toggle: switching a signal off makes the paper's point by hand, the model
// still answers from what is left.
import { useState } from 'react';
import CountUp from './reactbits/CountUp.jsx';

const SIGNALS = ['Text', 'EEG', 'Wearables', 'Audio and video'];

// what the paper measured: numbers count, words do not
const RESULTS = [
  ['Accuracy', { to: 91.24, suffix: '%' }],
  ['Recall', { to: 79.23, suffix: '%' }],
  ['F1', { to: 0.7809 }],
  ['Held-out test', { to: 2250, separator: ',', suffix: ' samples, Reddit and WU3D' }],
  ['Built with', 'PyTorch'],
  ['Where', 'VIT, May to July 2026'],
];

export default function Research() {
  const [on, setOn] = useState(SIGNALS.map(() => true));
  const n = on.filter(Boolean).length;
  return (
    <section className="research" id="research" aria-labelledby="research-h">
      <div className="research__head" data-sc-in data-sc-stagger="60">
        <h2 id="research-h">One model, four kinds of signal.</h2>
        <p className="story">PPEMDD screens for depression from text, EEG, wearables and audio or video together, and answers three questions in a single pass.</p>
        <p>I built it end to end as a research intern at VIT, from a review of more than twenty papers to the fused model, and wrote it up as an IEEE-format paper.</p>
      </div>

      <figure className="net" data-net data-empty={n ? undefined : ''} data-sc-reveal="up" data-sc-reveal-at="0.02 0.35">
        <div className="net__flow">
          <div className="net__col net__in" role="group" aria-label="Input signals, each can be switched off">
            {SIGNALS.map((s, i) => (
              <button key={s} type="button" className="net__sig" aria-pressed={on[i]}
                      onClick={() => setOn((v) => v.map((x, k) => (k === i ? !x : x)))}>{s}</button>
            ))}
          </div>
          <span className="net__arrow" aria-hidden="true"><i>encoded</i></span>
          <div className="net__core">
            <p className="net__stage"><b>Dynamic gating</b><span>weights each signal by whether it is there and how far to trust it</span></p>
            <p className="net__stage"><b>Multi-head cross-attention</b><span>lets every signal read the others</span></p>
            <output className="net__count" data-net-count>{n ? `${n} of ${SIGNALS.length} signals in` : 'Needs at least one signal'}</output>
          </div>
          <span className="net__arrow" aria-hidden="true"><i>one pass</i></span>
          <ul className="net__col net__out">
            <li>Depression screen</li>
            <li>PHQ-9 severity</li>
            <li>DSM-5 symptoms</li>
          </ul>
        </div>
        <figcaption>PPEMDD, simplified. Switch a signal off: the gate reweights what is left and the model still answers, which is the availability-aware part of the paper.</figcaption>
      </figure>

      {/* React Bits' CountUp: the four measured numbers count in as the
          row arrives, one after another, so the eye lands on each */}
      <dl className="spec research__spec" data-sc-in data-sc-stagger="50">
        {RESULTS.map(([k, v], i) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{typeof v === 'string' ? v : <CountUp {...v} delay={0.25 + i * 0.12} />}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
