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
| Five stacked boards | A status board: every live site, checked from the server just now |
| Framed photo | About me |
| Books | Education, on the résumé |
| Trophy | Hackathons and prizes, on the résumé |
| Tote bag | The Desi Totes shop, in a new tab |
| Lamp | Switches on and off; the one toy on the desk |

The two client sites refuse framing (`X-Frame-Options`), correctly, so they are
stills of the real pages. The three personal apps allow it, so they run.

Every object is also a real link in the page (`[data-thing]`), so the desk is a
way in, never the only one: keyboards, screen readers and phones use the list.

`api/status.js` fetches every site and times it. The top bar shows how many
are up, each object's light breathes while its site answers, and each case
says how fast it answered. Cached at the edge for a minute.

## Running it

A React front end over a Node and Express API, built with Vite.

```bash
npm install
npm run dev        # the site and the API together, http://localhost:4500
npm run build      # production build into dist/
npm run preview    # serve the production build, API included
```

On Vercel the front end is the Vite build and the API is one serverless
function (`api/index.js`) running the same Express app.

### The API

| Route | What it does |
|---|---|
| `GET /api/status` | Fetches every live project from the server and times it; cached at the edge for a minute |
| `POST /api/contact` | Sends the email form. Needs `RESEND_API_KEY` set on Vercel; without it the page opens the visitor's own email app with the message written |
| `GET /api/health` | Whether the API is up, and whether mail is configured |

To turn on real sending: create a free key at resend.com (sign up with the
address the mail should reach), then in Vercel add the environment variable
`RESEND_API_KEY`. Optional: `CONTACT_TO` (defaults to my address) and
`CONTACT_FROM` (defaults to Resend's test sender).

## What is in here

| Path | What it is |
|---|---|
| `index.html`, `src/main.jsx`, `src/App.jsx` | The React app |
| `src/data.js` | Every object, link and project the page names, in one place |
| `src/desk/scene.js` | The Three.js desk, driven by React |
| `src/lib/windows.jsx` | Every action, and the app, status and email windows |
| `src/lib/status.jsx` | Live status from the API, shared by the page |
| `src/lib/motion.js` | Pointer effects (Variable Proximity, Tilted Card, Magnet), the video scrub, section tracking |
| `src/components/` | The sections; `reactbits/` holds the React Bits pieces: LogoLoop (the Runs on band under the desk, each tool linking to where it runs), ScrollExpand (each client case, opening from its frame to full bleed as you scroll, with the story on a dark panel), AccordionGallery (each client's photographs, GSAP, loaded lazily), CountUp (the research numbers, counting in once and landing on what the paper measured), SpotlightCard (the Also live rows), FolderFloat (the stack), Lanyard (the 3D badge in the contact section, React Three Fiber and Rapier, loaded only near it and skipped on saved-data plans), and in the windows LatticeLoader (the zoom bar, timing each app's start-up), SplitFlapText (status board times), StatusMark (per-site check) and JellyRadio (email topic) |
| `scrollcraft/lab/badge.mjs` | Paints the badge and its strap from React Bits' `card.glb` into `public/assets/badge/` |
| `src/styles/` | The design system, and the scroll engine's styles |
| `server/` | The Express app and the status checker |
| `api/index.js` | The Vercel function that runs the Express app |
| `cv.html` | The résumé as plain, printable HTML |
| `public/assets/` | Photos, site stills, fonts, the résumé PDF |
| `scrollcraft/lab/` | Browser tests and capture scripts |
| `legacy/` | The first React portfolio, kept intact |

## Verifying a change

```bash
npm run preview
node scrollcraft/lab/sheet.mjs http://localhost:4500
node scrollcraft/lab/sheet.mjs http://localhost:4500 --mobile
node scrollcraft/lab/a11y.mjs http://localhost:4500
node scrollcraft/lab/hire.mjs http://localhost:4500
node scrollcraft/lab/desk.mjs http://localhost:4500
node scrollcraft/lab/clicks.mjs http://localhost:4500 1152x870
node scrollcraft/lab/flight.mjs http://localhost:4500 quest
node scrollcraft/lab/zoom.mjs http://localhost:4500 quest      # also term, neura; add --mobile
node scrollcraft/lab/film.mjs http://localhost:4500
node scrollcraft/lab/roles.mjs http://localhost:4500
node scrollcraft/lab/cases.mjs http://localhost:4500
node scrollcraft/lab/overflow.mjs http://localhost:4500
node scrollcraft/lab/bits.mjs http://localhost:4500
node scrollcraft/lab/bits2.mjs http://localhost:4500
node scrollcraft/lab/badge-check.mjs http://localhost:4500
node scrollcraft/lab/countup.mjs http://localhost:4500         # add --reduced
node scrollcraft/lab/fps.mjs http://localhost:4500
```

The scripts drive Chrome at its default Windows path; set `CHROME` to any other
Chromium binary to run them elsewhere.

`sheet.mjs` walks the page and tiles the frames into one contact sheet, so the
composition can be read rather than guessed at. `a11y.mjs` checks tab order,
focus visibility, the heading outline and alt text. `zoom.mjs` and `film.mjs`
capture opening an app from the desk (stages, and a filmstrip), `roles.mjs`
walks the Hiring for chips, `cases.mjs` shoots each case at rest, opened and
its photographs, `countup.mjs` checks the research numbers settle on the paper's values
without moving the row, and `overflow.mjs` checks nothing is wider than a phone.

Re-capture the client stills with `node scrollcraft/lab/stills.mjs`, the personal ones with `more.mjs` (needs
`ffmpeg` on the machine). `fps.mjs` measures the frame rate while scrolling the hero.
