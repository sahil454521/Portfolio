// The page. The providers hold the two things everything shares: the live
// status from the Node API, and the windows every action can open.
import { useEffect } from 'react';
import { CASES } from './data.js';
import { StatusProvider } from './lib/status.jsx';
import { WindowsProvider } from './lib/windows.jsx';
import TopBar, { ModeSwitch } from './components/TopBar.jsx';
import Desk from './components/Desk.jsx';
import { Case, Carry } from './components/Work.jsx';
import Research from './components/Research.jsx';
import { About, AlsoLive, Build, Contact } from './components/More.jsx';
import Windows from './components/Windows.jsx';

export default function App() {
  // The scroll engine (scroll-craft) reads the data-sc-* attributes the
  // sections render, so it starts once they are all in the page.
  useEffect(() => {
    import('./lib/scrollcraft.js').then(() => {
      if (!window.__scMounted) { window.__scMounted = true; window.ScrollCraft.mount(document.body); }
    });
  }, []);

  return (
    <StatusProvider>
      <WindowsProvider>
        <span data-sc-progress />
        <div className="grain" aria-hidden="true" />
        <a className="skip" href="#work">Skip to the work</a>
        <TopBar />
        <ModeSwitch current="site" />
        <main id="top">
          <Desk />
          <Case c={CASES[0]} />
          <Case c={CASES[1]} />
          <Carry />
          <Research />
          <AlsoLive />
          <Build />
          <About />
          <Contact />
        </main>
        <Windows />
      </WindowsProvider>
    </StatusProvider>
  );
}
