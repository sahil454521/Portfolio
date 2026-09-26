# Sahil Pathak

Portfolio of an AI/ML and full-stack engineer. The hero is a desk in 3D where every object is something I built and every object opens: the arcade plays Portfolio Quest, the terminal runs AI Terminal, the laptop runs NeuraCraft, all live in the page. Status lights are real, checked by a serverless function. Then the client work, the research and the résumé, in the order someone hiring asks for them.

**The work**, all live

| | |
|---|---|
| [desitotes.com](https://desitotes.com) | Desi Totes, made-to-order cotton canvas totes. Client |
| [amgprojectsllp.com](https://amgprojectsllp.com) | AMG Turnkey Projects LLP, construction and interiors, Pune. Client |
| [ai-compiler-eta.vercel.app](https://ai-compiler-eta.vercel.app) | NeuraCraft, a browser code editor |
| [ai-chat-bot-gcar.vercel.app](https://ai-chat-bot-gcar.vercel.app) | AI Terminal |
| [gamifyport.vercel.app](https://gamifyport.vercel.app) | Portfolio Quest, a pixel-art portfolio you walk around |

## The idea

Borrowed from basement.studio, whose hero is its office and whose objects are
the navigation. Here it is a desk, and each object is one piece of work:

| Object | Opens |
|---|---|
| Two monitors | The Desi Totes and AMG case studies |
| Arcade cabinet | Portfolio Quest, playable in a window that grows out of its screen |
| CRT terminal | AI Terminal, running live |
| Laptop | NeuraCraft, running live |
| Stack of papers | The PPEMDD research |
| Clipboard | The résumé |
| Phone | A compose window that opens the visitor's own email app |

The two client sites refuse framing (`X-Frame-Options`), correctly, so they are
stills of the real pages. The three personal apps allow it, so they run.

Every object is also a real link in the page (`[data-thing]`), so the desk is a
way in, never the only one: keyboards, screen readers and phones use the list.

`api/status.js` fetches every site and times it. The top bar shows how many
are up, each object's light breathes while its site answers, and each case
says how fast it answered. Cached at the edge for a minute.

## Running it

Static site. No build step, no bundler, no framework.

```bash
npx serve . -l 4500
```

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The page |
| `cv.html` | The résumé as plain, printable HTML: the page's second view |
| `assets/Sahil_Pathak_Resume.pdf` | Printed from `cv.html` by `scrollcraft/lab/cv-pdf.mjs`; re-run it after editing the résumé |
| `site.css` | The design system: one palette, two faces, the room |
| `site.js` | Section tracking in the top bar, the closing clip, live status, the pointer effects, the research diagram, copy-to-clipboard |
| `desk.js` | The desk: the scene, hover frames, camera flights, the app and compose windows |
| `api/status.js` | Checks every live site from the server; the page lights up with the answer |
| `scrollcraft.css` / `scrollcraft.js` | Scroll engine. Not edited, themed by tokens |
| `assets/work/` | Stills of both client sites, captured from production |
| `assets/amg`, `assets/desi` | Real client photography |
| `scrollcraft/BRIEF.md` | Why the page is shaped this way |
| `scrollcraft/lab/` | Recording, verification and audit scripts |
| `legacy/` | The previous React and Vite portfolio, kept intact |

## Verifying a change

```bash
npx serve . -l 4500
node scrollcraft/lab/sheet.mjs http://localhost:4500
node scrollcraft/lab/sheet.mjs http://localhost:4500 --mobile
node scrollcraft/lab/a11y.mjs http://localhost:4500
node scrollcraft/lab/hire.mjs http://localhost:4500
node scrollcraft/lab/desk.mjs http://localhost:4500
```

`sheet.mjs` walks the page and tiles the frames into one contact sheet, so the
composition can be read rather than guessed at. `a11y.mjs` checks tab order,
focus visibility, the heading outline and alt text.

Re-capture the client stills with `node scrollcraft/lab/stills.mjs`, the personal ones with `more.mjs` (needs
`ffmpeg` on the machine). `links.mjs` checks the panels are genuinely
clickable, and `fps.mjs` measures the frame rate while scrolling the hero.
