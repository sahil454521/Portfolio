# BRIEF — Sahil Pathak, portfolio

Status: **interviewed** (4 structural questions answered by the user on 2026-09-18).
Topics 1, 3, 6 were answered in the user's opening message. Topics 2 and 5 are
**authored** from the answered structure and marked as such below.

---

## The eight topics

**1. Vibe, in their words (verbatim).**
> "premium and trusted", "look like more editorial rather than not like a
> diffrent bunch of ai generated asset", "3d scroll interactive animation
> website which should be interactive wile scrolling adn looks good"

Two of those are stated as negatives, and the negatives are the sharper brief:
not-AI-looking, not-template. The positive is *editorial* plus *trusted*.

References: none given. Not pushed for, because the user named an aesthetic
family directly, which is what references exist to establish.

**2. The scroll journey (AUTHORED, from the chapter structure the user chose).**
Title page, then four chapters, then a colophon. Client work before lab work,
because the argument of this page is "real businesses run on things I shipped",
and lab projects weaken that if they come first.

**3. The energy curve (verbatim fragment + authored detail).**
User said "premium and trusted". Authored: the page opens quiet, escalates
through two client chapters to a single loud moment, then decompresses and
stops. Loudness lives almost entirely in one chapter.

**4. Feeling curve and the one moment.** See the two sections below. Required.

**5. One thing no other site does (AUTHORED).** See "Signature move".

**6. Distance from premium-minimal (verbatim).**
> "editorial"

Answered directly. Aesthetic family is **Editorial**, per uniqueness.md §5:
paper, folios, measure, restraint.

**7. One unbroken world, or distinct scenes (answered).**
> **Distinct chapters.** Hard cuts between scenes, like spreads in a printed
> magazine. Each project gets its own ground, type scale and colour temperature.

This is the load-bearing answer. It selects **chaptered editorial** grammar and
it forbids a continuous world underneath. There is no persistent canvas spanning
chapters on this page, deliberately.

**8. Assets (answered, all four approved).**
- Capture the two live sites myself. Done.
- Desi Totes product photography from `Desktop/finalisedwebsitedesitote`. Done,
  10 files, real studio photography on real wood and plaster.
- A real photo of the user. `profile.jpg` / `profile2.jpg` from the old repo.
- AMG construction and interior photography from the live site. Done, 8 files,
  real delivered projects.

**No AI image generation. No `KIE_AI_API_KEY`, no spend, no generated frames
anywhere on this page.** Every photograph on it is a real photograph of real
work. This is the direct mechanical answer to "not a bunch of AI generated
assets", and it is a stronger answer than any prompt-craft would have been.

---

## Feeling curve

One line per chapter: the emotion, then what on screen causes it.
Written before the chapters were built.

| # | Chapter | Feeling | What causes it |
|---|---|---|---|
| — | Title page | **Composure** | Nothing moves but the type setting itself. No media above the fold. Authored silence. |
| 01 | The Brief | **Recognition** | A plain unhyped statement of what he does, a real face in real light, set in a narrow column like a standfirst. |
| 02 | Cloth | **Warmth** | Hard cut to the client's own cream ground. Cotton, weave, a bag on a wooden table. Tactile after a page of cold type. |
| 03 | Structure | **Weight** — THE PEAK | Hard cut to graphite. A structural frame assembles member by member under the reader's own hand, then resolves into a real ISO certified company's live site. |
| 04 | Workbench | **Curiosity** | Cold catalogue labels, facts not pitch. Deliberately short, because lab work has not earned a chapter the size of client work. |
| — | Colophon | **Resolve** | Smallest type on the site. One address. The page stops rather than fades. |

No two adjacent chapters carry the same feeling. Checked.
The chapter before the peak (Cloth, warmth) is quieter than the peak. Checked.

## The peak

**Chapter 03, Structure.** It gets the largest span on the page by a visible
margin, the asset budget, and the silence in front of it.

The sentence a visitor would say to a friend:

> "There's a bit where a steel frame builds itself as you scroll, and then it
> turns out to be an actual construction company whose website he made."

## The tell-someone sentence

> It's the site where **the thing assembling under your scroll turns out to be a
> real company's real building.**

## Authored silence

Three places. The verification pass must not report these as dead scroll.

1. **The title page.** No media, no motion except the title setting. It exists
   to make the first hard cut land.
2. **The approach to the peak.** The last third of Chapter 02 empties out before
   Chapter 03 cuts in. Silence in front of the peak, per feel.md §2.
3. **The colophon.** Deliberately inert. The page has stopped.

---

## Palette decision, and one documented exception

Page ground is a **drafting sheet**: cool off-white, ink near black, secondary
text tinted cool rather than flat grey, accent a drawing set vermilion. The
vermilion is evidenced, not invented: AMG's own delivered interiors run red
service lines across the soffit, visible in `assets/amg/acl7.jpg`.

**Exception, documented deliberately:** Chapter 02 cuts to Desi Totes' real
cream *ground*. uniqueness.md §5 bans the cream-and-brass artisan palette as a
*default*. It appears here exactly once, as a **quoted brand identity** inside
its own chapter, hard cut on both sides, and it is the client's actual ground
taken from their live site. The page's own identity is never cream.

**Corrected during the build:** the first plan gave that chapter Desi Totes'
ochre accent as well. That would have put two hues on one page, which the
two-stop licence in taste.md explicitly does not cover. The accent stays the
page's vermilion in every chapter, at two lightnesses keyed to the ground:
`#B8331C` on the two light grounds, `#FF6A4D` on the graphite. One hue, and the
cream never brings brass with it. This is my document about their brand, not a
copy of their website.

Chapter 03 cuts to graphite so the frame reads as a lit object.
Three grounds, hard cuts, no interpolation between them. Per grammar.

## Type

Two families, per the typography floor.

- **Display: Newsreader.** Editorial serif, variable, holds up at both 8rem and
  18px, so it can carry headings and body without a third family.
- **Text: IBM Plex Mono.** The drafting voice. Folios, chapter numbers, captions,
  specs, labels. Never body copy.

Not Inter, not Satoshi, not a geometric sans with a violet gradient on it.

---

## Facts, and what is still unverified

The old repo contains placeholder and contradictory content that **must not be
carried forward onto a page whose whole claim is "trusted"**:

- `src/pages/About.jsx` lists a degree at `"Your University Name"` and, directly
  beneath it, a second degree at `"Indian Institute of Technology (IIT),Ghuwati"`.
  Both cannot be right and the first is plainly a placeholder.
- `github.com/yourusername` and `linkedin.com/in/yourusername` are placeholders.
- Skill lists include TensorFlow, PyTorch, Computer Vision and Adobe XD with no
  corroborating work anywhere in the repo.

**Nothing in that list ships until the user confirms it.** Pending confirmation,
the page states only what is independently evidenced:

**Evidenced and safe to state:**
- Two live production sites: `amgprojectsllp.com`, `desitotes.com`.
- AMG Projects LLP: ISO certified, Pune, civil construction, PEB, interiors,
  modular furniture, MEP, HVAC. Real named clients visible on the site
  (HDFC, Plastic Omnium Auto Exteriors, Pinnacle Mobility Solutions / EKA).
  Figures on their own site: 25+ years, 50+ projects, 90% repeat orders.
  **These are AMG's numbers about AMG, and the page labels them that way.**
  They are not presented as the user's metrics.
- Desi Totes: 320 GSM cotton canvas, made to order in India, black and off
  white, printed and plain, with and without zip, INR and USD, free shipping
  over ₹999. All read off the live site.
- Own projects, named in the old repo: AiCompiler (ML code suggestion in a
  VS Code style editor), AI-Terminal (chat and URL analysis), AI-Ecommerce.
- Stack, evidenced by the repos: React 19, Vite, Tailwind, GSAP, Framer Motion,
  Node, Express, MongoDB.
- Email: `sahilpathak2005@gmail.com`.

**No invented statistics. No counters without a real number behind them.**
Per the hard rules table.

---

## Feel check (run cold against the contact sheet, then diffed)

| Chapter | Intended | Felt | Verdict |
|---|---|---|---|
| Title page | Composure | Composed, quiet | matches |
| 01 The brief | Recognition | Credentials | **drifted** |
| 02 Cloth | Warmth | Warm, tactile | matches |
| 03 Structure | Weight (peak) | Weight | matches, and it is the peak |
| 04 Workbench | Curiosity | Cold, short, factual | matches |
| Colophon | Resolve | Resolved, stops | matches |

**The one drift, and what was done about it.** Chapter one reads slightly more
formal than "recognition". The title block is a credential object, so it pulls
that way. It was left in rather than softened: it is carrying the identity
because no usable portrait exists yet (see below), and the chapter's opening
line does the recognition work on its own. When a real portrait arrives it goes
in that slot and the chapter should land closer to the intended feeling. Noted
here rather than quietly reclassified.

**Peak confirmed on the sheet.** Chapter three is the largest visual change on
the page and holds the most scroll room by a wide margin (a 4.6 viewport-height
pinned act inside a chapter that runs about 6.4 of the page's 13.9). It is also
the only 3D on the page, which is the asset budget going to the peak and
nowhere else.

**The close resolves.** The last screen is the colophon plate ending on
"End of document." It does not fade out and it does not become a link farm.

## The portrait, unresolved

Both photographs in the old repo (`profile.jpg`, `profile2.jpg`) are soft,
low-light candid group shots with other identifiable people in frame. A tight
crop was tried and rejected: at the size the layout needs, the softness is
obvious and a third party is still partly in shot.

Two separate reasons not to ship them, and either is sufficient:
1. They read as snapshots, which works against the one word the user asked for
   most, "premium".
2. Publishing other people's faces on a public site is not the user's to decide
   on their behalf.

Chapter one therefore carries a **drawing title block** instead, which is a real
editorial object rather than an apology for a missing image. The slot takes a
portrait with no other change to the markup.
