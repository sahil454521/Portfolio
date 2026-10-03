import { useEffect, useRef, useSyncExternalStore } from 'react';
import { gsap, ScrollTrigger, motionOn, loadStatus, getPing, onPing } from '../motion';

const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// A link or button that leans toward the cursor and springs back.
export function Magnetic({ as: Tag = 'a', className = '', strength = 0.35, children, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!motionOn || !fine) return undefined;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { x(0); y(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [strength]);
  return <Tag ref={ref} className={`magnetic ${className}`} {...props}>{children}</Tag>;
}

// Real response time of a live site, from the status API.
export function usePing(url) {
  useEffect(() => { loadStatus(); }, []);
  return useSyncExternalStore(onPing, () => getPing(url));
}

export function LivePing({ url, label = 'live' }) {
  const ms = usePing(url);
  const state = ms === undefined ? 'checking' : ms === null ? 'unknown' : ms < 0 ? 'down' : 'up';
  return (
    <span className={`ping ping--${state}`}>
      <i aria-hidden="true" />
      {state === 'checking' && 'Checking'}
      {state === 'unknown' && label}
      {state === 'down' && 'Unreachable right now'}
      {state === 'up' && <>{label} <b>{ms} ms</b></>}
    </span>
  );
}

// Counts from 0 to `to` when it scrolls into view.
export function CountUp({ to, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const fmt = (v) => `${prefix}${decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US')}${suffix}`;
    if (!motionOn) { el.textContent = fmt(to); return undefined; }
    const o = { v: 0 };
    const tw = gsap.to(o, {
      v: to, duration: 1.6, ease: 'expo.out',
      onUpdate: () => { el.textContent = fmt(o.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, [to, decimals, prefix, suffix]);
  return <span ref={ref} className="count">{`${prefix}${(0).toFixed(decimals)}${suffix}`}</span>;
}

export { ScrollTrigger };
