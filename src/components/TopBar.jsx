// One bar across the top: who, where to go, whether it is all still up, the
// one action. And the switch at the foot of every page between this view and
// the plain résumé a hiring process actually files.
import { SECTIONS } from '../data.js';
import { useStatus } from '../lib/status.jsx';
import { useSectionTracking } from '../lib/motion.js';
import ThingLink from './ThingLink.jsx';

const IDS = SECTIONS.map(([href]) => href);

export default function TopBar() {
  const { status } = useStatus();
  const here = useSectionTracking(IDS);
  const sites = status && status.sites;
  const up = sites ? sites.filter((x) => x.up).length : 0;
  return (
    <header className="top">
      <a className="top__mark" href="#top">Sahil Pathak</a>
      <nav className="top__nav" aria-label="Sections">
        {SECTIONS.map(([href, name, count], i) => (
          <a key={href} href={href} data-rail data-here={i === here ? '' : undefined}>
            {name}{count ? <sup>{count}</sup> : null}
          </a>
        ))}
      </nav>
      <p className="top__live" data-live hidden={!sites}
         title={sites ? sites.map((x) => `${x.host}: ${x.up ? x.ms + ' ms' : 'down'}`).join(', ') : undefined}>
        <i className="dot dot--live" /> <span data-live-text>{sites ? `${up} of ${sites.length} live` : ''}</span>
      </p>
      <ThingLink id="phone" className="top__cta">Email me</ThingLink>
    </header>
  );
}

export function ModeSwitch({ current = 'site' }) {
  return (
    <nav className="mode" aria-label="View">
      <a href="/" aria-current={current === 'site' ? 'page' : undefined}>Site</a>
      <a href="/cv.html" aria-current={current === 'cv' ? 'page' : undefined}>Résumé</a>
    </nav>
  );
}
