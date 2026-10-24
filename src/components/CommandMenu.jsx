import { useEffect } from 'react';
import { Command } from 'cmdk';
import { lenis, motionOn, setMotion, scrollToId } from '../motion';
import { EMAIL, GITHUB, LINKEDIN, RESUME, projects, sideProjects } from '../data';
import { chapters, copyEmail } from './Chrome';

// cmdk arrives in its own chunk, the first time the menu is asked for (or when the page is idle).
export default function CommandMenu({ open, setOpen }) {
  useEffect(() => { if (lenis) (open ? lenis.stop() : lenis.start()); }, [open]);

  const run = (fn) => () => { setOpen(false); fn(); };
  const links = [
    ...projects.map((p) => [p.name, p.url]),
    ...sideProjects.map((p) => [p.name, p.url]),
    ...[...projects, ...sideProjects].filter((p) => p.code).map((p) => [`${p.name} code`, p.code]),
    ['Resume', RESUME], ['GitHub', GITHUB], ['LinkedIn', LINKEDIN],
  ];

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command menu" overlayClassName="cmdk-overlay" contentClassName="cmdk-panel">
      <Command.Input placeholder="Jump to a chapter, open a project, copy the email" />
      <Command.List>
        <Command.Empty>Nothing matches. Try desi, resume or email.</Command.Empty>
        <Command.Group heading="Go to">
          {chapters.map(([id, label]) => <Command.Item key={id} value={`go ${label}`} onSelect={run(() => scrollToId(id))}>{label}</Command.Item>)}
        </Command.Group>
        <Command.Group heading="Open">
          {links.map(([label, url]) => (
            <Command.Item key={label} value={`open ${label}`} onSelect={run(() => window.open(url, '_blank', 'noopener'))}>
              {label}<span>{new URL(url, window.location.href).host}</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Do">
          <Command.Item value="copy email" onSelect={run(copyEmail)}>Copy email address<span>{EMAIL}</span></Command.Item>
          <Command.Item value="write email" onSelect={run(() => { window.location.href = `mailto:${EMAIL}`; })}>Write an email</Command.Item>
          <Command.Item value="motion" onSelect={run(() => setMotion(!motionOn))}>Turn motion {motionOn ? 'off' : 'on'}</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
