# Octopus in the hero: design (approved 2026-11-15)

## Intent
Put the 3D octopus Sahil made with Claude ("Sahil the Octopus" artifact) on the first screen of the portfolio, as a personal, interactive touch, without changing the site's theme.

## Goals
- The octopus is the first thing people see beside the headline.
- The site's theme stays exactly as it is: colours, fonts, light and dark following the system, one orange accent.
- It never slows the first screen or traps scrolling on a phone.

## Non-goals and anti-goals
- No text, card or caption with the octopus: no "Octopus" title, no traits, no line (Sahil asked for it removed).
- No new colour on the page: navy is out.
- No change to any other section, except the claims ledger moving down.
- A failure if it delays the headline, scroll-jacks on touch, or keeps drawing while off screen.

## Approaches considered
Placement: own section before Contact (recommended at first), the hero, beside the contact button, or a floating corner companion. **Sahil picked the hero.**
Look: navy as made, or recoloured to the site's theme. **Sahil picked recoloured:** orange glow (#FF6A3D, the dark-mode accent, since the tank is dark) on the site's charcoal.
Shape: rectangular tank first; **Sahil asked for a smaller round tank.**

## Decided
- Hero right column: a round tank, about 460 px across on desktop and 320 px (82vw at most) on phones, centred in its column. The headline, line and buttons on the left are unchanged.
- Inside: only the octopus, about 62% of the circle's height, same model and motion as the artifact. Drag (or arrow keys) to spin; tap (or Enter / Space) and it jets and flashes. No text appears.
- The claims ledger moves to sit directly under the hero, unchanged in content; the nav's check count jumps to it.
- The tank is dark in both light and dark mode, because the glow needs dark water.

## Constraints and how they are met
- three.js (about 135 KB gzipped) loads as a separate chunk after first paint; the headline is never blocked. A dark circle holds the space and the octopus fades in. If WebGL is not available, a still image of the octopus is shown instead.
- Phones: `touch-action: pan-y`, so up/down swipes scroll the page and sideways drags spin the octopus.
- Drawing stops when the tank is off screen or the tab is hidden.
- The site's motion setting is followed: with motion off, the octopus holds still and only moves when the visitor drags it; a tap flashes it without the jet.
- The canvas is focusable, labelled, and keyboard operable; no em dashes in visible copy.

## Left to the builder
Exact gradient of the placeholder, the intro animation for the tank, the ledger band's layout under the hero, and the still image's export size.
