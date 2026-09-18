# Sahil Pathak

Portfolio. A scroll-driven editorial document about two live commercial sites.

**Live work**
- [amgprojectsllp.com](https://amgprojectsllp.com) — AMG Turnkey Projects LLP, construction and interiors, Pune
- [desitotes.com](https://desitotes.com) — Desi Totes, made-to-order cotton canvas totes

## Running it

It is a static site. No build step, no framework, no bundler.

```bash
npx serve .
```

Any static server works. Open the root and that is the site.

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The page. Real markup; the engine reads `data-sc-*` off it |
| `site.css` | The design system: three grounds, two families, one accent hue |
| `site.js` | The two bespoke pieces: the load-path folio, and the portal frame renderer |
| `scrollcraft.css` / `scrollcraft.js` | The scroll engine. Not edited. Themed by tokens only |
| `assets/` | Real photography. Nothing on this page is AI generated |
| `scrollcraft/BRIEF.md` | Why the page is shaped the way it is |
| `scrollcraft/lab/` | Verification scripts: contact sheets, accessibility audit, image tooling |
| `legacy/` | The previous React and Vite portfolio, kept intact |

## Verifying a change

```bash
npx serve . -l 4500
node scrollcraft/lab/sheet.mjs http://localhost:4500
node scrollcraft/lab/sheet.mjs http://localhost:4500 --mobile
node scrollcraft/lab/a11y.mjs http://localhost:4500
```

`sheet.mjs` walks the whole page and tiles the frames into one contact sheet, so
the composition can be read rather than guessed at. `a11y.mjs` checks tab order,
focus visibility, the heading outline and alt text.
