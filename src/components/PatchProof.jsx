import { useState } from 'react';
import { Arrow } from './bits';

// Counts from results/search.json in the PatchProof repo: 139 seeded bugs, search-based repairer, seed 0.
const runs = [
  { k: 1, correct: 78, overfit: 55 }, { k: 2, correct: 98, overfit: 33 }, { k: 3, correct: 106, overfit: 25 },
  { k: 5, correct: 114, overfit: 16 }, { k: 10, correct: 121, overfit: 9 }, { k: 20, correct: 125, overfit: 3 },
];
const TASKS = 139;
// Task leap_year-87 at one shown test: how its fix did on each of the 39 hidden tests (1 = pass).
const hidden = [...'011101011110110111010111011101011111111'].map(Number);
const CODE = 'https://github.com/sahil454521/Project/tree/claude/gracious-faraday-24cj5i';
const pct = (a, b) => `${Math.round((100 * a) / b)}%`;

export function PatchProof() {
  const [i, setI] = useState(0);
  const [ran, setRan] = useState(false);
  const { k, correct, overfit } = runs[i];
  const passing = correct + overfit;
  const tests = `${k} ${k === 1 ? 'test' : 'tests'}`;

  return (
    <section id="patchproof" className="pp" aria-labelledby="pp-title">
      <div className="head reveal">
        <h2 id="pp-title">A fix that passes its tests can still be wrong.</h2>
        <p className="lede">PatchProof is a benchmark I built to measure how often. It injects 139 bugs into correct Python functions, shows a repair tool a few tests, and scores every fix on tests it never saw.</p>
      </div>

      <div className="pp-grid reveal">
        <div className="pp-panel">
          <label className="pp-k" htmlFor="pp-range">Tests shown to the repair tool<output htmlFor="pp-range">{k}</output></label>
          <input id="pp-range" type="range" min="0" max={runs.length - 1} step="1" value={i}
            onChange={(e) => setI(+e.target.value)} aria-valuetext={`${tests} shown`} />
          <p className="pp-ticks" aria-hidden="true">{runs.map((r) => <span key={r.k}>{r.k}</span>)}</p>
          <dl className="pp-read" aria-live="polite">
            <div><dt><i className="d-ok" />Correct on the hidden tests</dt><dd>{correct}</dd></div>
            <div><dt><i className="d-bad" />Passes what it saw, wrong underneath</dt><dd>{overfit}</dd></div>
            <div><dt><i className="d-none" />Not repaired</dt><dd>{TASKS - passing}</dd></div>
          </dl>
          <p className="pp-say">With {tests} shown, {pct(passing, TASKS)} of bugs look fixed. <b>{pct(overfit, passing)} of those fixes are wrong.</b></p>
        </div>
        {/* one dot per bug, sorted by outcome; the dots repaint as the slider moves */}
        <div className="pp-dots" role="img" aria-label={`${TASKS} bugs: ${correct} fixed correctly, ${overfit} fixed wrongly, ${TASKS - passing} not repaired`}>
          {Array.from({ length: TASKS }, (_, n) => (
            <i key={n} style={{ '--n': n }} className={n < correct ? 'd-ok' : n < passing ? 'd-bad' : 'd-none'} />
          ))}
        </div>
      </div>

      <div className="pp-case reveal">
        <div>
          <h3>One real case from the run</h3>
          <p>A leap-year check has a bug. The tool is shown one test, <code>leap_year(1700)</code> should be <code>False</code>, and finds a one-character change that passes it.</p>
          <a className="pp-code" href={CODE}>Code and full results<Arrow /></a>
        </div>
        <div className="pp-run">
          <pre><code><del>{'return y % 4 == 0 and (y % 100 == 0 or y % 400 == 0)'}</del>{'\n'}<ins>{'return y % 4 != 0 and (y % 100 == 0 or y % 400 == 0)'}</ins></code></pre>
          <p className="pp-shown"><i className="d-ok" />1 of 1 shown tests passes</p>
          <button type="button" className="btn btn-sm" onClick={() => setRan(true)} disabled={ran}>
            {ran ? 'Hidden tests run' : 'Run the 39 hidden tests'}
          </button>
          <div className="pp-hidden" aria-live="polite">
            {ran && <p className="pp-strip" role="img" aria-label="29 hidden tests pass, 10 fail">{hidden.map((ok, n) => <i key={n} style={{ '--n': n }} className={ok ? 'd-ok' : 'd-bad'} />)}</p>}
            <p>{ran && <>29 pass, 10 fail. <code>leap_year(1836)</code> should be <code>True</code>; the fix returns <code>False</code>.</>}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
