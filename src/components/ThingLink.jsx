// A link to one of the things on the desk. It is a real link first (it works
// with no script, and a modified click still opens a new tab); otherwise it
// hands the click to go(id), and pointing at it frames the same object on the
// desk, so the page and the desk always name the same things.
import { forwardRef } from 'react';
import { THINGS } from '../data.js';
import { useWindows } from '../lib/windows.jsx';

const ThingLink = forwardRef(function ThingLink({ id, className, children, ...rest }, ref) {
  const { go, scene } = useWindows();
  const t = THINGS[id];
  const intercept = t.app || t.compose || t.board;
  const newTab = t.app || t.external ? { target: '_blank', rel: 'noopener' } : {};
  const light = (on) => () => scene.current && scene.current.highlight(on ? id : null);
  return (
    <a
      ref={ref}
      className={className}
      href={t.app || t.href}
      data-thing={id}
      {...newTab}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || !intercept) return;
        e.preventDefault();
        go(id);
      }}
      onFocus={light(true)} onBlur={light(false)}
      onMouseEnter={light(true)} onMouseLeave={light(false)}
      {...rest}
    >
      {children}
    </a>
  );
});

export default ThingLink;
