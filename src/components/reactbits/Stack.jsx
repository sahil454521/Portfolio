// React Bits' Stack, adapted: the client's photographs as a pile of prints.
// Drag or flick the top one away (or tap it, or press Next) and it goes to
// the bottom of the pile. Changes from the original: a flick counts by its
// velocity, not only its distance; the springs are critically damped except
// the throw, which inherits the hand's speed; a caption and a count sit
// under the pile and are announced; and there is a real button for keyboards.
import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform, animate } from 'motion/react';

import './Stack.css';

const SETTLE = { type: 'spring', bounce: 0, duration: 0.4 };

function Card({ card, depth, onSend, reduced, sensitivity }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // the top print leans the way it is dragged, a little
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const top = depth === 0;
  // a drag that ends where it began still reports a tap; a real drag must not
  const dragged = useRef(false);
  const tap = () => { if (dragged.current) dragged.current = false; else onSend(); };

  const end = (_, info) => {
    dragged.current = true;
    setTimeout(() => { dragged.current = false; }, 0);
    const far = Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity;
    const fast = Math.hypot(info.velocity.x, info.velocity.y) > 600;
    if (far || fast) {
      onSend();
      // it joined the bottom of the pile; bring it home from where it was let go
      animate(x, 0, { ...SETTLE, velocity: info.velocity.x });
      animate(y, 0, { ...SETTLE, velocity: info.velocity.y });
    } else {
      animate(x, 0, { type: 'spring', bounce: 0.2, duration: 0.4, velocity: info.velocity.x });
      animate(y, 0, { type: 'spring', bounce: 0.2, duration: 0.4, velocity: info.velocity.y });
    }
  };

  // the pile: each print further down sits a touch smaller, lower and turned
  const turn = depth === 0 ? 0 : (card.id % 2 ? 1 : -1) * Math.min(depth, 3) * 2.2;
  return (
    <motion.div
      className="prints__card"
      style={{ x, y, rotate: top ? rotate : undefined, zIndex: 100 - depth }}
      animate={{
        scale: 1 - Math.min(depth, 3) * 0.045,
        translateY: Math.min(depth, 3) * 10,
        rotateZ: turn,
        opacity: depth > 3 ? 0 : 1
      }}
      transition={reduced ? { duration: 0 } : SETTLE}
      drag={top}
      dragElastic={0.6}
      dragMomentum={false}
      onDragEnd={top ? end : undefined}
      onDragStart={() => { dragged.current = true; }}
      onTap={top ? tap : undefined}
      whileTap={top && !reduced ? { scale: 0.98 } : undefined}
      aria-hidden={top ? undefined : 'true'}
    >
      <img src={card.image} alt={card.alt} draggable={false} loading="lazy" decoding="async" />
    </motion.div>
  );
}

export default function Stack({ items, aspect = '4 / 5', sensitivity = 110, className = '' }) {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState(() => items.map((it, id) => ({ ...it, id })));
  const send = () => setOrder((o) => [...o.slice(1), o[0]]);
  const now = order[0];
  const n = now.id + 1;

  return (
    <div className={`prints ${className}`.trim()}>
      <div className="prints__pile" style={{ aspectRatio: aspect }}>
        {/* drawn bottom first so the top print is last in the tree */}
        {order.map((card, depth) => ({ card, depth })).reverse().map(({ card, depth }) => (
          <Card key={card.id} card={card} depth={depth} onSend={send} reduced={reduced} sensitivity={sensitivity} />
        ))}
      </div>
      <div className="prints__foot">
        <p className="prints__cap" aria-live="polite">{now.label}</p>
        <span className="prints__count" aria-hidden="true">{n} / {items.length}</span>
        <button type="button" className="prints__next" onClick={send}>
          Next<span className="sr"> photograph, {n === items.length ? 1 : n + 1} of {items.length}</span>
          <span aria-hidden="true"> →</span>
        </button>
      </div>
    </div>
  );
}
