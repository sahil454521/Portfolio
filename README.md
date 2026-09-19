# Sahil Pathak

Portfolio. A dark, lit room holding two live commercial sites, in motion.

**The work**, all live

| | |
|---|---|
| [desitotes.com](https://desitotes.com) | Desi Totes, made-to-order cotton canvas totes. Client |
| [amgprojectsllp.com](https://amgprojectsllp.com) | AMG Turnkey Projects LLP, construction and interiors, Pune. Client |
| [ai-compiler-eta.vercel.app](https://ai-compiler-eta.vercel.app) | NeuraCraft, a browser code editor |
| [ai-chat-bot-gcar.vercel.app](https://ai-chat-bot-gcar.vercel.app) | AI Terminal |
| [gamifyport.vercel.app](https://gamifyport.vercel.app) | Portfolio Quest, a pixel-art portfolio you walk around |

## The idea

Both client sites send `X-Frame-Options`, so neither can be embedded live,
which is correct of them. The next most honest thing is stills of the real
pages, captured from production and standing as planes in a WebGL scene.

Scroll rotates the row. Whichever project reaches the centre comes forward and
takes the room; the others sit back beside it, angled away. **Clicking any one
opens that site**, because each panel has a real anchor tracking it, so a
click, a tap and a Tab all land on a real link, and focusing one by keyboard
rotates the row to bring it to the centre.

Adding a project is one row in `index.html` and one still in `assets/work/`.
The layout is derived from each panel's distance from the centre, so it takes
any number without a slot per project.

## Running it

Static site. No build step, no bundler, no framework.

```bash
npx serve . -l 4500
```

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The page |
| `site.css` | The design system: one palette, two faces, the room |
| `site.js` | The rail, the closing clip, and the state the harness verifies |
| `vitrine.js` | The WebGL scene: two live sites as objects, scrubbed by scroll |
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
```

`sheet.mjs` walks the page and tiles the frames into one contact sheet, so the
composition can be read rather than guessed at. `a11y.mjs` checks tab order,
focus visibility, the heading outline and alt text.

Re-capture the client stills with `node scrollcraft/lab/stills.mjs`, the personal ones with `more.mjs` (needs
`ffmpeg` on the machine). `links.mjs` checks the panels are genuinely
clickable, and `fps.mjs` measures the frame rate while scrolling the hero.
