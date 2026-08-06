# PRD Addendum: "Inside the black box" (AI journey section)

**Owner:** Yash Sharma
**Status:** Approved concept, awaiting build command. Amends `docs/PRD.md` (IA section 4). All rules of the main PRD apply here unchanged (tokens, copy rules, motion language, stats policy, testing loop).
**Date:** Aug 2026

---

## 0. Why this section exists

Yash's AI story is real seniority signal, not a buzzword paragraph: using AI tools since GitHub Copilot launched (2021), formal deep-learning coursework in college on top of the CS degree, hand-built classic ML models on GPU, and a deliberate habit of reading model thinking traces to understand how agents reason. Every dev site says "AI-powered". This section *shows* he understands the machine by drawing it, in the site's own ember-particle language.

The page already proves canvas craft (hero, ember brush). This section reuses that exact proof language to tell a personal story, so it feels inevitable, not bolted on.

## 1. Concept (locked)

**"Inside the black box" — a scroll-driven journey through a neural network, where each stage of the network is a chapter of the story.**

One pinned Pixi canvas. One particle pool (~1,200 particles). As the visitor scrolls, the same particles reorganize through five formations, each matching a story beat that scrolls past as text. The metaphor: the page itself is the black box, and scrolling walks you through it, input to output.

This follows the proven sticky-canvas scrollytelling pattern (pinned visual, narrative text flows past, scrub controlled by the reader) and the engineering standard for it: GSAP ScrollTrigger writes a single progress value to a plain object; the Pixi ticker reads it. Scroll never touches React state.

### Rejected alternates (do not revisit)

- **three.js / R3F 3D scene:** a second WebGL engine on a page whose identity is Pixi. Doubles bundle, splits craft story, breaks PRD 3.5 library separation.
- **Chat/terminal replay of prompts:** cliché by 2026, and it proves prompt usage, not understanding.
- **Static timeline with icons:** wastes the strongest material on the weakest format.

## 2. Placement (amends PRD.md section 4)

New section 6 of 9, anchor `#ai`, between **Experience** and **Writing**:

| # | Section | Anchor |
|---|---|---|
| 5 | Experience | `#experience` |
| 6 | **Inside the black box** | `#ai` |
| 7 | Writing | `#blog` |

Rationale: Experience ends the "where I worked" record; the AI journey explains "how I think"; its final beat (sharing what I learn) hands off directly into the Writing rows. Nav does NOT add a link (nav stays 5 links + CTA; the section is discovered by scroll, which suits a narrative interlude). Eyebrow budget: unchanged (this section uses a bare headline).

## 3. Copy (locked, first person, zero em-dashes)

Header: `Inside the black box.`
Sub-line (one sentence): `Five years of taking AI apart to see how it thinks.`

Five stages. Each stage = mono year label + short title + 2-3 sentence body. Copy below is locked pending Yash's fact check (flagged items in section 8).

1. **`2021 · Autocomplete`**
   `Copilot ships, and I am on it the same week. Ghost text finishing my code felt like a trick worth understanding, not just using.`
2. **`2022 · Fundamentals`**
   `I took the deep learning coursework seriously at Bennett: neural nets, backprop, then transformers and attention. Once you have traced a forward pass by hand, the black box has edges.`
3. **`2023 · Small models`**
   `I trained the classics myself on GPU: linear regression, random forests, the unglamorous machine learning that teaches you what data actually does. Small models, real intuition.`
4. **`2024-25 · Burning tokens`**
   `When LLMs took off I used them past any reasonable budget, on purpose. I read the thinking traces, watched agents plan and fail, and learned where the reasoning bends.`
5. **`2026 · Sharing it`**
   `Now I write about what I find: articles and posts on LinkedIn about building with AI. The fastest way to test what you know is to explain it.`

Constraints honored: no invented metrics (stats policy 2.3), no hype verbs, sentence case, the only numerals are years (mono, tabular).

## 4. Visual spec: the five formations

One pool of ember-palette particles (site ramp: `#c85f2e`, `#e8763a`, `#f09a6b`, rare warm whites; same weighted distribution as EmberBrush). Formations are precomputed target point sets; on scrub, each particle eases toward its target in the active formation with per-particle stagger, so transitions read as reorganization, not teleport. Connection lines (thin, `--line` to `--accent-glow`) draw via one shared Graphics layer where specified.

| Stage | Formation | Motion detail |
|---|---|---|
| 1 Autocomplete | Scattered dim field; a single line of "token" rectangles assembles left to right, the trailing half ghosted (dimmer, 40% alpha), like completion text | Tokens snap in one by one on scrub; ghost half flickers subtly |
| 2 Fundamentals | Particles snap to a 4-layer network lattice (input, 2 hidden, output), edges draw between layers | A forward-pass pulse of brightness travels input to output, driven by scrub position within the stage |
| 3 Small models | Lattice dissolves into a 2D scatter plot; a regression line iterates from a bad fit to the best fit; a few particles form axis ticks | Line angle/intercept interpolate with scrub (gradient descent made visible) |
| 4 Burning tokens | Scatter becomes two facing token rows with an attention web between them; the web's line opacities shift as scrub moves (different heads attending) | Highest particle brightness of the section; a slow ember rise off the web (hero echo) |
| 5 Sharing it | Web settles into calm horizontal text-skeleton rows (an article taking shape), brightness cools toward `--text-tertiary` | Rows settle with 40-70ms stagger; end state is nearly still, hands off visually to the Writing section |

Canvas composition: right 55% at `lg` (mirrors hero balance), text steps scroll in the left column, each step `min-h-[100vh]` for comfortable read pace. Total pinned distance ~500vh.

## 5. Engineering (locked)

- **Files:** `src/components/ai/AiJourney.tsx` (section shell, GSAP pin, step markup), `src/components/ai/JourneyCanvas.tsx` (`"use client"` Pixi leaf, `next/dynamic` `ssr:false`, lazy in-view mount), `src/data/ai-journey.ts` (typed stage copy + formation params).
- **Scrub contract:** ScrollTrigger (`pin: true`, `scrub: true`, `start: "top top"`) writes `{ progress }` to a module-scoped plain object. The Pixi ticker reads it every frame and derives `stageIndex` + `stageLocal`. No React state, no `window.addEventListener("scroll")` (PRD 3.5 ban).
- **Library separation (PRD 3.5):** GSAP owns pin/scrub; Pixi owns rendering; Motion is not imported anywhere in `src/components/ai/`.
- **Particle engine:** reuse the EmberBrush patterns: object pool, `ParticleContainer` with position/vertex/color dynamics, zero filters (Pixi v8 filter pipeline is a known crash), DPR `min(devicePixelRatio, 2)`, ticker paused when offscreen (IntersectionObserver) and on `document.hidden`, full `app.destroy()` on unmount, WebGL failure falls back to the stacked layout. Pool halves on `hardwareConcurrency <= 4`.
- **Formations:** precomputed once per resize as `Float32Array` target sets; transition = per-particle exponential ease toward target (lerp with damping), which stays cheap and interruption-proof under scrub reversal.
- **Fallbacks (parallel design, not a disable flag):** below `lg` and under `prefers-reduced-motion`, no pin and no canvas. The five stages render as a stacked editorial timeline: mono year rail (reuses the Experience rail language), stage title, body, and one static SVG glyph per stage (line of tokens, lattice, scatter+line, attention web, text rows) drawn in palette tokens. This layout must stand on its own as a designed artifact.
- **Budget:** lazy chunk for the canvas < 40KB gz beyond the shared Pixi chunk (engine already loaded by hero). 60fps scrub on desktop verified by DevTools trace once.

## 6. About section tie-in

About paragraph two (currently `[PENDING-INPUT]`) gets the journey in one breath, locked copy:

`I have been poking at AI since Copilot shipped in 2021: deep learning coursework at Bennett, small models trained by hand, and far too many tokens burned reading how agents think. I write about it on LinkedIn.`

`LinkedIn` links to the profile from `CONTACT_LINKS`.

## 7. Build plan (phases, for delegation)

### Phase A1: Data + fallback layout first

> Create `src/data/ai-journey.ts` with the five locked stages (section 3). Build `AiJourney.tsx` rendering ONLY the stacked fallback layout (mobile/reduced-motion design in section 5) with the five static SVG glyphs, section header and sub-line, anchored `#ai`, placed between Experience and Writing in `page.tsx`. Reveal on scroll per PRD 3.5 entrance rules. Update About paragraph two per section 6. Extend e2e: section renders 5 stages, glyphs visible, no console errors. This phase ships value even if the canvas slips.

### Phase A2: Pinned canvas experience

> Build `JourneyCanvas.tsx` per section 5 engineering contract and the five formations per section 4. Wire GSAP pin + scrub in `AiJourney.tsx` at `lg`+ with motion allowed; keep A1 layout as the fallback branch. Verify scrub reversal (scroll up mid-stage) reorganizes smoothly. Extend e2e: desktop project asserts pinning does not trap scroll; reduced-motion spec asserts stacked layout; screenshot loop at 3 scrub positions.

### Phase A3: Polish pass

> Animation review per `review-animations` skill on the section; Lighthouse re-check (LCP unaffected since everything here is lazy); cross-viewport screenshots 360/768/1024/1440; copy self-audit (`rg "—|–" src/ docs/PRD-ai-journey.md` returns nothing).

**Accept (all phases):** e2e green including reduced-motion spec; 60fps scrub trace on desktop; zero console errors; the fallback layout reads as designed, not degraded; no Motion imports in `src/components/ai/`; bundle budget met.

## 8. Pending inputs from Yash

1. Fact check the locked copy years: Copilot start (2021 preview vs 2022 GA), which college terms covered DL/transformers, when the GPU model-building happened.
2. LinkedIn article links, if any should be surfaced (optional: the last stage could link `Read the posts ↗` to the LinkedIn profile; ships without it).
3. Confirm the phrase `past any reasonable budget` is a tone he wants (it is self-aware, not boastful, but it is a voice call).

None of these block Phase A1/A2; copy slots are structured for drop-in edits.
