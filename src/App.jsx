import { useEffect, useState } from 'react';
import { ScrollTrigger } from './motion';
import { projects } from './data';
import SignalField from './components/SignalField';
import { CommandMenu, MotionNotice, Nav, Toast } from './components/Chrome';
import { Braid, Hero, Project } from './components/Chapters';
import { XRay } from './components/XRay';
import { Fusion } from './components/Fusion';
import { Stack } from './components/Stack';
import { AlsoLive, Contact, Footer, Marquee, Resume } from './components/Closing';

export default function App() {
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    // Positions shift once fonts and images land; re-measure every trigger then.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return (
    <>
      <SignalField />
      <Nav onPalette={() => setPalette(true)} />
      <main>
        <Hero />
        <Braid />
        <div className="solid">
          <div id="work">
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
      <CommandMenu open={palette} setOpen={setPalette} />
      <MotionNotice />
      <Toast />
    </>
  );
}
