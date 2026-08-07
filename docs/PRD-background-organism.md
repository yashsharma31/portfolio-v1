# PRD Addendum: The Ember Organism (single-canvas narrator)

**Owner:** Yash Sharma
**Status:** Direction corrected Aug 2026. **B1.1 done** — travel comet replaced by disperse dust. **B2 done** — hero portrait dissolve lives on the organism; `HeroCanvas` retired. **B2b done** — AI journey formations live on the organism; `JourneyCanvas` retired. **B3 done** — lab / writing / about motifs + contact success burst. Single page-level canvas = `EmberField` only (+ Lab EmberBrush toy).
**Date:** Aug 2026

---

## 0. The vision (owner clarification — locked)

One Pixi canvas. One particle pool. Scroll only moves the DOM; the canvas creates and destroys forms as sections arrive.

The rhythm is not "a comet that crawls with you." The rhythm is:

1. **Assemble** — enter a section → particles gather into that section's form
2. **Hold** — while the section owns the viewport, the form lives (subtle idle motion only)
3. **Disperse** — leave the section → the form breaks apart into a calm scatter / fade
4. **Assemble again** — next section → a new form is born from that scatter

Hero special case: the portrait image sits on top; as you scroll, it hands off into the same particle pool, which then disperses into the first travel scatter before the next section assembles.

Reading: *the page scrolls; the background keeps inventing and releasing shapes for whatever you are looking at.*

## 1. Concept (locked)

**Exactly one fixed full-viewport Pixi `Application` for the whole site.**

| Layer | Role |
|---|---|
| Global organism canvas (layout, fixed, `--z-canvas`) | The only site-wide Pixi context. All section motifs, hero handoff, and AI journey formations run here. |
| Lab EmberBrush | Allowed as a second context: it is an interactive toy inside a card, not a page narrator. |
| HeroCanvas | **Retired (B2)** — portrait sampling lives in the organism (`scene: "hero"`). |
| JourneyCanvas | **Retired (B2b)** — AI formations are organism `scene: "ai"`, scrubbed by `journeyScrub.progress`. |

- Choreography controller maps scroll position → active scene + enter/hold/exit progress (0→1→0).
- Scene boundaries from measured section rects, never hardcoded pixels.
- Each scene = a target formation (Float32Array). Particles steer with exponential damping + stagger.
- **Between scenes: disperse state** — loose low-alpha scatter (or soft fade toward edges), NOT a persistent orbiting comet parked at the top. A brief gather-hint is fine; a standing "crawled circle" pet is not the product.
- Scroll never touches React state (module object + ticker read; house pattern).

### Rejected

- Per-section canvases / multiple page-level WebGL contexts
- three.js
- Persistent traveling comet as the default between-section identity (owner rejected this read)

## 2. Scene map

| Scene | Section | Behavior |
|---|---|---|
| S0 | Hero | Portrait pixels; image on top; scroll → handoff → disperse |
| S1 | Between sections | **Disperse** — calm scatter, low alpha, no strong shape |
| S2 | ProofBar | Assemble contribution lattice → disperse on leave |
| S3 | Work (pinned) | Stay dispersed / nearly off (chapters own the stage) |
| S4 | Lab | Assemble soft edge scatter around the bento → disperse |
| S5 | Experience | Assemble timeline rail + active year digits (right) → disperse |
| S6 | AI journey | Assemble five formations scrubbed by pin progress (`journeyScrub`) → disperse on leave |
| S7 | Writing | Assemble thin text-line motif → disperse |
| S8 | About | Assemble loose halo behind portrait → disperse |
| S9 | Contact | Assemble ring around Send CTA → disperse; success burst on send (**B3 done**) |

One strong formation at a time. Disperse is always quieter than assemble.

## 3. Engineering

- **One** `Application`, transparent, `resizeTo: window`, DPR ≤ 1.5, paused when `document.hidden`.
- Pool ~800 desktop / ~350 small for most scenes; S0 may temporarily elevate (~2,500) then decay; S6 integrates up to ~1,200.
- Targets in viewport space; re-read a few anchor rects per frame.
- Enter/hold/exit driven by scroll progress so reversing scroll reverses the story.
- Reduced motion / WebGL fail → no canvas.
- Mobile (< lg): simple ambient drift only (no full choreography).

## 4. Build phases

- **B1 (done):** engine + proof / experience / contact motifs.
- **B1.1 (done):** travel comet → disperse scatter (nearly invisible full-viewport dust); assemble/disperse blend on motif enter/exit.
- **B2 (done):** Hero handoff into the organism; retire `HeroCanvas`.
- **B2b (done):** Fold AI journey formations into the organism; retire `JourneyCanvas`. `AiJourney` keeps pin + text + prologue scrub; formations run on `EmberField` via `scene: "ai"` reading `journeyScrub.progress`. Geometry in `aiFormations.ts`.
- **B3 (done):** Lab / Writing / About motifs + contact success burst (`burstControl` session-once).

## 5. Owner decisions (locked)

1. **Between-section = disperse, not comet.** No persistent crawled circle as the default identity.
2. **Work:** fully quiet / dispersed — chapters own the stage.
3. **Contact success burst:** yes (**B3 done**).
4. **Single page-level canvas:** non-negotiable. Lab brush may stay local. AI journey folded in at B2b.

## 6. Open confirm before next build

1. ~~Between-section disperse feel~~ — **locked default for B1.1:** nearly invisible scatter (alpha ~0.02–0.08), not a soft ember cloud.
2. ~~AI journey on the global canvas~~ — **done in B2b:** second page-level WebGL context removed.
