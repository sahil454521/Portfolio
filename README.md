# Sahil Pathak

Portfolio. A dark, lit room holding two live commercial sites, in motion.

**The work**
- [amgprojectsllp.com](https://amgprojectsllp.com) — AMG Turnkey Projects LLP, construction and interiors, Pune
- [desitotes.com](https://desitotes.com) — Desi Totes, made-to-order cotton canvas totes

## The idea

Both clients send `X-Frame-Options`, so neither can be embedded live, which is
correct of them. The next most honest thing is stills of the real pages,
captured from production and standing as planes in a WebGL scene. Scroll
interchanges them: whichever is forward comes to the front of the room and
changes what it is showing, and the other falls back. **Clicking either one
opens that site**, because each panel has a real anchor tracking it, so a
click, a tap and a Tab all land on a real link.

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

Re-capture the client stills with `node scrollcraft/lab/stills.mjs` (needs
`ffmpeg` on the machine). `links.mjs` checks the panels are genuinely
clickable, and `fps.mjs` measures the frame rate while scrolling the hero.
