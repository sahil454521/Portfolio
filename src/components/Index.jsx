import { scrollToId } from '../motion';
import { index } from '../data';
import { Arrow } from './bits';

// Every project in one line, right under the hero, for the reader with thirty seconds:
// what it is, what it does, what it runs on, and the way into the story, the live thing and the code.
export function WorkIndex() {
  const toStory = (id) => (e) => { e.preventDefault(); scrollToId(id); };
  return (
    <section id="work" className="index" aria-labelledby="index-title">
      <div className="index-head">
        <h2 id="index-title">The work, <em>at a glance.</em></h2>
        <p className="lede">Every project in one line. The first four have the whole story further down; every live link opens the running thing.</p>
      </div>
      <ul className="ix">
        {index.map((r) => (
          <li key={r.name} className="ix-row">
            <h3 className="ix-name">{r.name}</h3>
            <p className="ix-kind">{r.kind}</p>
            <p className="ix-line">{r.line}</p>
            <p className="ix-stack">{r.stack}</p>
            <p className="ix-links">
              {r.story && <a href={`#${r.story}`} onClick={toStory(r.story)}>Story<Arrow down /><span className="sr"> of {r.name}</span></a>}
              {r.live && <a href={r.live}>Live<Arrow /><span className="sr">: {r.name}</span></a>}
              {r.code && <a href={r.code}>Code<Arrow /><span className="sr"> for {r.name}</span></a>}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
