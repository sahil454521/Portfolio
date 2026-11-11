import { useEffect, useSyncExternalStore } from 'react';
import { getRows, getStamp, runAll, subscribe } from '../checks';

const label = { idle: 'queued', run: 'checking', pass: 'pass', fail: 'fail', skip: 'no answer', word: 'my word' };
export const useChecks = () => {
  const rows = useSyncExternalStore(subscribe, getRows);
  const stamp = useSyncExternalStore(subscribe, getStamp);
  const live = rows.filter((r) => r.status !== 'word');
  return { rows, stamp, pass: live.filter((r) => r.status === 'pass').length, live: live.length, word: rows.length - live.length };
};

// The hero: the page runs its own claims as a test suite, in the visitor's browser, on load.
export function Ledger() {
  const { rows, stamp, pass, live, word } = useChecks();
  useEffect(() => { runAll(); }, []);
  return (
    <div className="ledger">
      <ol aria-live="polite">
        {rows.map((r) => (
          <li key={r.text} data-s={r.status}>
            <span className="ledger-s">{label[r.status]}</span>
            <span className="ledger-t">{r.text}</span>
            <span className="ledger-n">{r.note}</span>
          </li>
        ))}
      </ol>
      <p className="ledger-sum">
        <span>{stamp ? <><b>{pass} of {live}</b> checks passed on your device at {stamp}. {word} claims rest on my word, and are marked.</> : 'Running the checks on your device.'}</span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => runAll(true)} disabled={!stamp}>Run again</button>
      </p>
    </div>
  );
}
