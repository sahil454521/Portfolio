// React Bits' CountUp, with two changes. The count is a fixed ease-out
// instead of the original's overdamped spring, whose tail kept the last
// decimals of "91.24" ticking for seconds after the number had been read.
// And the moving digits are hidden from screen readers, which get the final
// value once rather than every frame of the count.
import { useCallback, useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

import './CountUp.css';

const EASE_OUT = [0.22, 1, 0.36, 1];

const decimals = (n) => {
  const s = String(n);
  return s.includes('.') && parseInt(s.split('.')[1], 10) !== 0 ? s.split('.')[1].length : 0;
};

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 1.2,
  className = '',
  startWhen = true,
  separator = '',
  prefix = '',
  suffix = '',
  onStart,
  onEnd
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();
  const places = Math.max(decimals(from), decimals(to));

  const format = useCallback(
    (v) => {
      const s = Intl.NumberFormat('en-US', {
        useGrouping: !!separator,
        minimumFractionDigits: places,
        maximumFractionDigits: places
      }).format(v);
      return separator ? s.replace(/,/g, separator) : s;
    },
    [places, separator]
  );

  const start = direction === 'down' ? to : from;
  const end = direction === 'down' ? from : to;

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(reduced ? end : start);
  }, [start, end, format, reduced]);

  useEffect(() => {
    if (!inView || !startWhen || reduced) return undefined;
    onStart?.();
    const controls = animate(start, end, {
      delay,
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => { if (ref.current) ref.current.textContent = format(v); },
      onComplete: () => onEnd?.()
    });
    return () => controls.stop();
    // onStart and onEnd are callbacks, not reasons to count again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, startWhen, reduced, start, end, delay, duration, format]);

  return (
    <span className={`count-up ${className}`.trim()}>
      <span className="count-up__read">{prefix}{format(end)}{suffix}</span>
      <span aria-hidden="true">{prefix}<span ref={ref} />{suffix}</span>
    </span>
  );
}
