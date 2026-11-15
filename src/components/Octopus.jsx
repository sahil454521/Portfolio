import { useEffect, useRef, useState } from 'react';
import { motionOn } from '../motion';

const LABEL = 'An orange low-poly octopus floating in dark water. Drag it or use the arrow keys to spin it; tap it or press Enter to startle it.';
// after first paint, so the octopus never competes with the headline
const whenIdle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 1200 }) : window.setTimeout(fn, 1));

// The hero's round tank of dark water. The octopus (three.js) loads as its own chunk once the
// tank is near the screen and draws only while the tank is on screen. If WebGL cannot start,
// the dark water stays.
export function Octopus() {
  const tank = useRef(null);
  const canvas = useRef(null);
  const [state, setState] = useState('wait'); // wait | live | off

  useEffect(() => {
    let api = null;
    let gone = false;
    const stop = () => {
      api?.dispose();
      api = null;
      if (!gone) setState('off');
    };
    const seen = new IntersectionObserver(([e]) => api?.setActive(e.isIntersecting));
    const start = () => import('../octopus/scene.js')
      .then(({ createOctopus }) => {
        if (gone) return;
        api = createOctopus(canvas.current, {
          calm: !motionOn,
          onReady: () => { if (!gone) setState('live'); },
          onLost: stop,
        });
        seen.observe(tank.current);
      })
      .catch(stop);
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      whenIdle(start);
    }, { rootMargin: '300px' });
    near.observe(tank.current);
    return () => {
      gone = true;
      near.disconnect();
      seen.disconnect();
      api?.dispose();
    };
  }, []);

  return (
    <div ref={tank} className={`tank${state === 'live' ? ' is-live' : ''}`}>
      {state !== 'off' && <canvas ref={canvas} tabIndex={state === 'live' ? 0 : -1} role="img" aria-label={LABEL} />}
    </div>
  );
}
