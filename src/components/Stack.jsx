import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceRadial, forceSimulation, forceX, forceY } from 'd3-force';
import { loadStatus, motionOn, scrollToId } from '../motion';
import { GITHUB, RESUME, graph, liveSites, projectInfo, skillGroups } from '../data';
import { CountUp, Magnetic, usePing } from './bits';

const groupOf = Object.fromEntries(Object.entries(skillGroups).flatMap(([g, list]) => list.map((s) => [s, g])));
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

function useGraph() {
  return useMemo(() => {
    const nodes = [
      ...graph.skills.map((id) => ({ id, kind: 'skill', r: Math.max(26, id.length * 3.6) })),
      ...graph.projects.map((id) => ({ id, kind: 'project', r: 44 })),
    ];
    const links = graph.links.map(([s, t]) => ({ source: s, target: t }));
    const near = new Map(nodes.map((n) => [n.id, new Set([n.id])]));
    graph.links.forEach(([s, t]) => { near.get(s).add(t); near.get(t).add(s); });
    return { nodes, links, near };
  }, []);
}

function Constellation({ sel, setSel, hot, setHot, group, setGroup }) {
  const svgRef = useRef(null);
  const [, redraw] = useReducer((x) => x + 1, 0);
  const sim = useRef(null);
  const mouse = useRef({ x: -1e4, y: -1e4 });
  const box = useRef({ w: 600, h: 460 });
  const { nodes, links, near } = useGraph();

  useEffect(() => {
    const svg = svgRef.current;
    const measure = () => { box.current = { w: svg.clientWidth, h: svg.clientHeight }; };
    measure();
    const { w, h } = box.current;
    nodes.forEach((d) => { d.x = w / 2 + (Math.random() - 0.5) * w * 0.7; d.y = h / 2 + (Math.random() - 0.5) * h * 0.7; });

    // The cursor is a soft magnet: nearby dots lean toward it, so they are easy to catch.
    const magnet = () => {
      const m = mouse.current;
      nodes.forEach((d) => {
        const dx = m.x - d.x; const dy = m.y - d.y; const dist = Math.hypot(dx, dy);
        if (dist > 16 && dist < 140 && d.fx == null) { const f = (1 - dist / 140) * 0.9; d.vx += (dx / dist) * f; d.vy += (dy / dist) * f; }
      });
    };
    const s = forceSimulation(nodes)
      .force('link', forceLink(links).id((d) => d.id).distance(78).strength(0.35))
      .force('charge', forceManyBody().strength(-260))
      .force('collide', forceCollide((d) => d.r).strength(0.9))
      .force('center', forceCenter(w / 2, h / 2))
      .force('x', forceX(w / 2).strength(0.04))
      .force('y', forceY(h / 2).strength(0.07))
      .force('magnet', motionOn && fine ? magnet : null)
      .on('tick', () => {
        const b = box.current;
        nodes.forEach((d) => { d.x = Math.max(d.r, Math.min(b.w - d.r, d.x)); d.y = Math.max(72, Math.min(b.h - 20, d.y)); });
        redraw();
      });
    if (!motionOn) { s.stop(); s.tick(300); redraw(); }
    sim.current = s;

    const ro = new ResizeObserver(() => {
      measure();
      const b = box.current;
      s.force('center', forceCenter(b.w / 2, b.h / 2)).force('x', forceX(b.w / 2).strength(0.04)).force('y', forceY(b.h / 2).strength(0.07));
      if (motionOn) s.alpha(0.5).restart(); else { s.tick(120); redraw(); }
    });
    ro.observe(svg);
    // Only simulate while on screen.
    const io = new IntersectionObserver(([e]) => { if (!motionOn) return; if (e.isIntersecting) s.alphaTarget(0.02).restart(); else s.alphaTarget(0).stop(); });
    io.observe(svg);
    return () => { s.stop(); ro.disconnect(); io.disconnect(); };
  }, [nodes, links]);

  // Selecting pulls the node's neighbours into orbit around it and pushes everything else to the rim.
  useEffect(() => {
    const s = sim.current;
    if (!s) return;
    const { w, h } = box.current;
    const set = sel ? near.get(sel) : null;
    nodes.forEach((d) => { if (d.id === sel) { d.fx = w / 2; d.fy = h / 2; } else { d.fx = null; d.fy = null; } });
    s.force('orbit', sel
      ? forceRadial((d) => (set.has(d.id) ? 120 : Math.min(w, h) * 0.47), w / 2, h / 2).strength((d) => (d.id === sel ? 0 : set.has(d.id) ? 0.7 : 0.35))
      : null);
    s.force('link').strength(sel ? 0.08 : 0.35);
    if (motionOn) s.alpha(0.9).restart(); else { s.tick(200); redraw(); }
  }, [sel, nodes, near]);

  const local = (e) => { const r = svgRef.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  // Drag with pointer capture; release hands the pointer's velocity to the node so it can be flung.
  const grab = (d) => (e) => {
    e.stopPropagation();
    const el = e.currentTarget;
    const [sx, sy] = local(e);
    const off = [d.x - sx, d.y - sy];
    let last = [sx, sy, performance.now()];
    let vel = [0, 0];
    let moved = 0;
    el.setPointerCapture(e.pointerId);
    d.dragging = true;
    sim.current.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
    const move = (ev) => {
      const [x, y] = local(ev);
      const now = performance.now();
      const dt = Math.max(1, now - last[2]);
      vel = [((x - last[0]) / dt) * 16, ((y - last[1]) / dt) * 16];
      moved += Math.hypot(x - last[0], y - last[1]);
      last = [x, y, now];
      d.fx = x + off[0]; d.fy = y + off[1];
      if (!motionOn) { d.x = d.fx; d.y = d.fy; redraw(); }
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      sim.current.alphaTarget(motionOn ? 0.02 : 0);
      d.dragging = false;
      if (moved < 6) { setSel((cur) => (cur === d.id ? null : d.id)); return; } // a click, not a drag
      if (d.id !== sel) { d.fx = null; d.fy = null; d.vx = vel[0] * 0.9; d.vy = vel[1] * 0.9; }
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  const focus = sel || hot;
  const lit = (id) => {
    if (focus) return near.get(focus).has(id);
    if (group) return groupOf[id] === group || (graph.projects.includes(id) && [...near.get(id)].some((n) => groupOf[n] === group));
    return true;
  };
  const edgeHot = (l) => (focus ? l.source.id === focus || l.target.id === focus : group ? groupOf[l.source.id] === group : false);

  return (
    <div className="graph-wrap">
      <div className="chips" role="group" aria-label="Filter by layer">
        {['All', ...Object.keys(skillGroups)].map((g) => {
          const on = (g === 'All' && !group) || g === group;
          return <button key={g} type="button" className="chip" aria-pressed={on} onClick={() => { setSel(null); setGroup(g === 'All' ? null : g); }}>{g}</button>;
        })}
      </div>
      <svg ref={svgRef} className="constellation" role="img" aria-label="Skills linked to the projects that use them"
        onPointerMove={(e) => { const [x, y] = local(e); mouse.current = { x, y }; }}
        onPointerLeave={() => { mouse.current = { x: -1e4, y: -1e4 }; }}
        onClick={(e) => { if (e.target === svgRef.current) setSel(null); }}>
        {links.map((l, i) => {
          if (typeof l.source !== 'object') return null; // d3 resolves endpoints on its first tick
          const on = edgeHot(l);
          const dim = (focus || group) && !on;
          return <line key={i} x1={l.source.x} y1={l.source.y} x2={l.target.x} y2={l.target.y} className={`edge ${on ? 'is-hot' : ''} ${dim ? 'is-dim' : ''}`} />;
        })}
        {nodes.map((d) => (
          <g key={d.id} tabIndex={0} role="button" aria-pressed={sel === d.id} aria-label={d.id}
            className={`node node--${d.kind} ${lit(d.id) ? '' : 'is-dim'} ${near.get(d.id).size === 1 ? 'is-loose' : ''} ${sel === d.id ? 'is-sel' : ''}`}
            transform={`translate(${d.x || 0},${d.y || 0})`}
            onPointerEnter={() => { setHot(d.id); if (d.id !== sel) { d.fx = d.x; d.fy = d.y; } }}
            onPointerLeave={() => { setHot(null); if (d.id !== sel && !d.dragging) { d.fx = null; d.fy = null; } }}
            onFocus={() => setHot(d.id)} onBlur={() => setHot(null)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel((c) => (c === d.id ? null : d.id)); } }}
            onPointerDown={grab(d)}>
            {d.kind === 'project' && <circle className="halo" r="16" />}
            <circle r={d.kind === 'project' ? 8 : 4.5} />
            <text y={d.kind === 'project' ? -16 : -11}>{d.id}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Detail({ id, setSel }) {
  const { near } = useGraph();
  if (!id) {
    return (
      <div className="detail">
        <h3>Pull on the graph</h3>
        <p>Amber dots are projects, white dots are skills. Click a project to pull its stack in. Click a skill to see where it runs. Fling anything.</p>
        <p className="detail-count"><b>{graph.skills.length}</b> skills <b>{graph.projects.length}</b> projects <b>{graph.links.length}</b> real links</p>
      </div>
    );
  }
  const linked = [...near.get(id)].filter((x) => x !== id);
  const info = projectInfo[id];
  if (info) {
    return (
      <div className="detail">
        <p className="detail-kind">{info.kind}</p>
        <h3>{id}</h3>
        <p>{info.text}</p>
        <p className="detail-sub">Built with</p>
        <div className="detail-chips">{linked.map((s) => <button key={s} type="button" className="chip" onClick={() => setSel(s)}>{s}</button>)}</div>
        <a className="btn btn-ghost btn-sm" href={info.href} onClick={(e) => { if (info.href.startsWith('#')) { e.preventDefault(); scrollToId(info.href.slice(1)); } }}>{info.cta}</a>
      </div>
    );
  }
  return (
    <div className="detail">
      <p className="detail-kind">{groupOf[id]}</p>
      <h3>{id}</h3>
      {linked.length
        ? <><p className="detail-sub">Runs in</p><div className="detail-chips">{linked.map((p) => <button key={p} type="button" className="chip chip--project" onClick={() => setSel(p)}>{p}</button>)}</div></>
        : <p>In my stack, but not in a project on this page yet.</p>}
    </div>
  );
}

function LiveRow({ name, url }) {
  const ms = usePing(url);
  return (
    <li className={`live-row ${ms == null ? '' : ms < 0 ? 'is-down' : 'is-up'}`}>
      <i aria-hidden="true" /><a href={url}>{name}</a>
      <span>{ms === undefined ? 'checking' : ms === null ? 'open' : ms < 0 ? 'unreachable' : `${ms} ms`}</span>
    </li>
  );
}

export function Stack() {
  const [sel, setSel] = useState(null);
  const [hot, setHot] = useState(null);
  const [group, setGroup] = useState(null);
  const spot = (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    cell.style.setProperty('--mx', `${e.clientX - r.left}px`);
    cell.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section id="stack" className="stack" aria-labelledby="stack-title">
      <h2 id="stack-title">The stack, <em>wired to the work.</em></h2>
      <p className="lede">Every line is a project that really runs on that skill. Click, drag and fling.</p>
      <div className="bento" onPointerMove={spot}>
        <div className="cell c-graph">
          <Constellation sel={sel} setSel={setSel} hot={hot} setHot={setHot} group={group} setGroup={setGroup} />
        </div>
        <div className="cell c-detail" aria-live="polite"><Detail id={sel || hot} setSel={setSel} /></div>
        <div className="cell c-live">
          <div className="live-head">
            <div>
              <h3>Live right now</h3>
              <p className="cell-note">Fetched and timed from the server, at most a minute ago.</p>
            </div>
            <button type="button" className="chip" onClick={() => loadStatus(true)}>Check again</button>
          </div>
          <ul>{liveSites.map(([n, u]) => <LiveRow key={u} name={n} url={u} />)}</ul>
        </div>
        <div className="cell c-metric">
          <p className="big"><CountUp to={50} />-<CountUp to={80} suffix="%" /></p>
          <p>Load time cut at AMG Turnkey Projects.</p>
        </div>
        <div className="cell c-metric">
          <p className="big"><CountUp to={91.24} decimals={2} suffix="%" /></p>
          <p>PPEMDD accuracy on 2,250 held-out samples.</p>
        </div>
        <div className="cell c-roles">
          <h3>Open to AI/ML and full-stack roles</h3>
          <p>Final year, B.Tech in computer science with a BSc (Hons) in data science and AI at IIT Guwahati alongside. Based in Pune, India.</p>
        </div>
        <Magnetic className="cell c-link" href={RESUME} strength={0.12}><h3>Resume</h3><p>The full CV, one page.</p></Magnetic>
        <Magnetic className="cell c-link" href={GITHUB} strength={0.12}><h3>GitHub</h3><p>sahil454521</p></Magnetic>
      </div>
    </section>
  );
}
