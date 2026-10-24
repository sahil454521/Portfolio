import { lazy, Suspense, useEffect, useState } from 'react';
import { ScrollTrigger } from './motion';
import { projects } from './data';
import { WorkIndex } from './components/Index';
import { MotionNotice, Nav, Toast } from './components/Chrome';
import { Braid, Hero, Project } from './components/Chapters';
import { XRay } from './components/XRay';
import { Fusion } from './components/Fusion';
import { Stack } from './components/Stack';
import { AlsoLive, Contact, Footer, Marquee, Resume } from './components/Closing';

// Three.js is most of the page's script and only paints the background, so it
// arrives after the words do: the headline never waits for the particle field.
const SignalField = lazy(() => import('./components/SignalField'));
const loadMenu = () => import('./components/CommandMenu');
const CommandMenu = lazy(loadMenu);

export default function App() {
  const [palette, setPalette] = useState(false);
  const [menuWanted, setMenuWanted] = useState(false);

  // Cmd/Ctrl+K works from the first frame; the menu's code follows when idle or on first use.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setMenuWanted(true); setPalette((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    const idle = window.requestIdleCallback ? requestIdleCallback(() => loadMenu()) : setTimeout(loadMenu, 2500);
    return () => { window.removeEventListener('keydown', onKey); (window.cancelIdleCallback || clearTimeout)(idle); };
  }, []);

  useEffect(() => {
    // Positions shift once fonts and images land; re-measure every trigger then.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return (
    <>
      <Suspense fallback={null}><SignalField /></Suspense>
      <Nav onPalette={() => { setMenuWanted(true); setPalette(true); }} />
      <main>
        <Hero />
        {/* every project, one line each, before anything else asks for scroll */}
        <div className="solid solid--index"><WorkIndex /></div>
        <Braid />
        <div className="solid">
          <div id="cases">
            {projects.map((p, i) => <Project key={p.id} p={p} flip={i % 2 === 1} />)}
          </div>
          <XRay />
          <Fusion />
          <Stack />
          <AlsoLive />
          <Resume />
          <Marquee />
          <Contact />
        </div>
      </main>
      <Footer />
      {menuWanted && <Suspense fallback={null}><CommandMenu open={palette} setOpen={setPalette} /></Suspense>}
      <MotionNotice />
      <Toast />
    </>
  );
}
