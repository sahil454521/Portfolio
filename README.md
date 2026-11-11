# Sahil Pathak

Portfolio of an AI/ML and full-stack engineer. One page, light or dark with the system, one orange accent. The hero pairs the claim with real screens of two running projects.

**The work**, all live

| | |
|---|---|
| [desitotes.com](https://desitotes.com) | Desi Totes, made-to-order cotton canvas totes. Client |
| [amgprojectsllp.com](https://amgprojectsllp.com) | AMG Turnkey Projects LLP, construction and interiors, Pune. Client |
| [ai-compiler-eta.vercel.app](https://ai-compiler-eta.vercel.app) | NeuraCraft, a browser code editor ([code](https://github.com/sahil454521/AiCompiler)) |
| [sarkari-saathi-kjgb.onrender.com](https://sarkari-saathi-kjgb.onrender.com) | Sarkari Saathi, find government schemes by talking in Marathi, Hindi or English ([code](https://github.com/sahil454521/sarkari-saathi)) |
| [ai-chat-bot-gcar.vercel.app](https://ai-chat-bot-gcar.vercel.app) | AI Terminal, ask about any web page ([code](https://github.com/sahil454521/ai-chat-bot)) |
| [gamifyport.vercel.app](https://gamifyport.vercel.app) | Portfolio Quest, a pixel-art portfolio you walk around |

## The sections

| Section | What it does |
|---|---|
| Hero | Who, the degrees and availability, beside real screens of Desi Totes and Sarkari Saathi |
| Proof | Three numbers, each explained further down the page |
| Selected work | Desi Totes, AMG and Sarkari Saathi as cards that pin under the nav and stack on scroll, each with live status from the API |
| PPEMDD | Switch any of the four signals off; the gate reweights the rest |
| PatchProof | A slider over the benchmark's real results, one dot per bug, and one real wrong fix whose hidden tests the visitor can run |
| Also live | The three side projects |
| Experience and skills | The resume entries, and every skill on the resume by group |
| Contact | Email, copy-to-clipboard, LinkedIn, GitHub, resume |

Lenis smooth scroll runs on GSAP's ticker. Motion follows `prefers-reduced-motion`; reduced-motion visitors get a calm page and a notice offering full motion. `?motion` in the URL forces it on. Fonts (Bricolage Grotesque, Archivo) are self-hosted in `public/assets/fonts`.

## Running it

A React and GSAP front end over a Node and Express API, built with Vite.

```bash
npm install
npm run dev        # the site and the API together, http://localhost:4500
npm run build      # production build into dist/ (index.html and cv.html)
npm run preview    # serve the production build, API included
```

On Vercel the front end is the Vite build and the API is one serverless function (`api/index.js`) running the same Express app.

### The API

| Route | What it does |
|---|---|
| `GET /api/status` | Fetches every live project from the server and times it; cached at the edge for a minute. The page's live readings and the Check again button use it |
| `POST /api/contact` | Sends an email form. Needs `RESEND_API_KEY` set on Vercel; without it the caller is told to fall back to mailto. Not used by the current page, kept for later |
| `GET /api/health` | Whether the API is up, and whether mail is configured |

## What is in here

| Path | What it is |
|---|---|
| `index.html`, `src/main.jsx`, `src/App.jsx` | The React app |
| `src/data.js` | Every fact, link, metric and skill link the page shows, in one place |
| `src/motion.js` | Motion preference, Lenis on the GSAP ticker, the live status store |
| `src/components/` | The nav, toast and motion notice (`Chrome.jsx`), the PPEMDD gate (`Fusion.jsx`) and shared pieces (`bits.jsx`); the sections themselves are in `App.jsx` |
| `src/styles.css` | The whole design system |
| `cv.html`, `src/styles/site.css` | The resume as plain, printable HTML, with its own stylesheet |
| `server/`, `api/index.js` | The Express app, the status checker and the Vercel function |
| `public/work/` | Stills of the live sites, and Sarkari Saathi's screens (`saathi-*.jpg`, made by `scrollcraft/lab/saathi-shots.mjs` from the app's own recorded output) |
| `public/assets/` | The resume's fonts and PDF |
| `docs/spec.md` | The design spec for this version |
| `legacy/` | The first React portfolio, kept intact |
| `scrollcraft/` | Brief and browser test scripts; the `lab/` scripts other than `a11y.mjs` were written for the previous design |

## Checking a change

```bash
npm run build && npm run preview
node scrollcraft/lab/a11y.mjs http://localhost:4500                 # tab order, headings, alt text, no em dashes
node scrollcraft/lab/cv-pdf.mjs http://localhost:4500               # re-print the resume PDF after editing cv.html; reports the page count
```

The resume prints in Calibri. On a machine without it, add `--carlito <folder of carlito-latin-*.woff2>` to `cv-pdf.mjs` (Carlito has Calibri's exact metrics, from `npm pack @fontsource/carlito`), or the fallback face is wider and the one page becomes two.

The browser scripts drive Chrome at its Windows path; set `CHROME` to another Chromium to run them elsewhere. They need `playwright-core` (`npm i --no-save playwright-core`).
