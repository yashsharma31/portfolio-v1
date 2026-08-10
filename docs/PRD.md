# PRD: Portfolio 2026 Redesign ("Canvas")

**Owner:** Yash Sharma
**Status:** Approved for build. This document is the single source of truth. No design decisions are re-litigated during implementation.
**Repo:** `/Users/yashsharma/Portfolio/portfolio` (Next.js 15, React 19, single-page app)
**Date:** Aug 2026

---

## 0. How to use this document (for AI agents)

1. Read Section 1-6 fully before writing any code. They contain every locked decision.
2. Build strictly in the phase order of Section 7. Each phase has an executable prompt, file list, and acceptance criteria.
3. Before starting a phase, load these skills from `.cursor/skills/`:
   - `taste-skill/SKILL.md` (always: layout, copy, AI-tell bans, pre-flight check)
   - `redesign-skill/SKILL.md` (always: work with existing stack, don't break function)
   - `emil-design-eng/SKILL.md` + `animate/SKILL.md` (any phase that adds motion)
   - `review-animations/SKILL.md` (Phase 7 polish pass)
4. After every phase: run `npm run test:e2e`, read the captured screenshots (desktop + mobile), fix what looks wrong, re-run until green. The Playwright loop in Section 8 is mandatory, not optional.
5. Copy rules are absolute: zero em-dashes (`—`/`–`) anywhere visible. Max 1 eyebrow per 3 sections. No filler verbs ("elevate", "seamless", "unleash"). Sentence case headers except the locked display headlines in Section 6.
6. Anything marked `[PENDING-INPUT]` waits for content from Yash (git history, screenshots, testimonials). Build the slot with real structure and clearly labeled placeholder data; never invent metrics.

---

## 1. Product definition

### 1.1 Design read (locked)

Reading this as: **a design-engineer portfolio for hiring managers, founders, and design-conscious engineers, with a dark, craft-forward, canvas-native language, leaning toward native Tailwind + Motion + GSAP + Pixi.js.**

The core insight: Yash's professional edge is twofold. His craft signature is **canvas/WebGL editor engineering** (Pixi.js photo and video editors, Slate.js rich text at Glue Labs, 2022-2025); his current seniority proof is **secure, telemetry-driven product engineering at Trential** (SDE-2: TruWallet with NFC passport scanning and biometrics, the TruEnroll evaluation portal, Web Wallet v4). Every dev portfolio *claims* skills; this one must **prove them in the page itself**. The canvas hero and Lab demonstrate the craft; the work chapters demonstrate the production seniority.

**Timeline of record (from LinkedIn profile + monthly reports, Aug 2026):**
- Trential, Gurugram: SDE-2 (Mar 2026-present), SDE (Mar 2025-Feb 2026)
- Glue Labs: SDE (Jun 2023-Mar 2025), SDE Intern (Mar 2022-May 2023)
- Bennett University, BTech CS (2019-2023)
- 4+ years total, shipping since March 2022

### 1.2 Dials (locked)

- `DESIGN_VARIANCE: 7` (asymmetric, offset layouts; strict single column under 768px)
- `MOTION_INTENSITY: 7` (real choreography: scroll chapters, canvas hero, spring physics; all gated by reduced-motion)
- `VISUAL_DENSITY: 3` (airy, gallery-like; `py-24` to `py-40` sections)

### 1.3 Goals

1. A visitor understands within 5 seconds: *this person builds high-craft interfaces, from WebGL canvas tools to secure production wallets.*
2. Every claim is backed by something interactive, visual, or verifiable (live GitHub data, real product screenshots, working demos).
3. The page feels engineered: 60fps motion, instant response, no jank, works beautifully on mobile.
4. A recruiter can reach "contact" in one scroll gesture or one click at any time.

### 1.4 Non-goals

- No multi-page IA. One page (`/`) plus utility routes (404, redirects). `/contact` becomes a redirect to `/#contact`.
- No CMS, no database. All content lives in typed data files.
- No light mode. The page theme is locked dark (Section 3.1). `prefers-color-scheme` is intentionally ignored; document this in code comments.
- No blog hosting. Writing stays on Medium, pulled via the existing RSS route.

### 1.5 Audience and success behavior

| Audience | What they need | Success |
|---|---|---|
| Hiring manager / recruiter | Fast proof of competence, resume, contact | Downloads resume or emails within 2 minutes |
| Founder / freelance client | Evidence he can build their editor/canvas product | Reaches contact with a project in mind |
| Fellow engineers / design-eng community | Craft details worth sharing | Plays with the lab demos, shares the link |

---

## 2. Content strategy

### 2.1 Content inventory (what exists today)

| Current section | Content | Verdict |
|---|---|---|
| Profile card (sticky left) | Photo, name, one-liner, socials | **Rework** into hero + about. Kill the fixed 400px card layout entirely. |
| Stats ("~3 years, +18 projects, +28 worked libraries") | Weak, fuzzy numbers | **Replace** with verifiable stats (Section 2.3) |
| GitHub contributions graph | Live via `github-contributions-api.jogruber.de`, user `yashsharma31` | **Keep + redesign.** Live data is a strength. |
| Recent Projects (Glue, Dashgen, xG) | 1.5 years stale, text-only gradient cards | **Replace** with the new chapter set: TruWallet, TruEnroll, Glue canvas suite (canonical data: `src/data/projects.ts`) |
| Experience (was Glue Labs SDE + intern only) | 1.5 years stale | **Replace** with the 4-role timeline: Trential SDE-2, Trential SDE, Glue Labs SDE, Glue Labs intern (max 3 bullets each, strongest verified facts only). Canonical data: `src/data/experience.ts`. |
| Tech stack (16 icon tiles in 5 categories) | Icon-grid wall | **Demote** to one compact line inside About. Icon walls are filler. |
| Resume download | `Yash-Sharma-Resume.pdf` | **Keep** (nav + about) |
| Blog (Medium RSS, live) | Working API route with `rss-parser` | **Keep + redesign** as editorial list rows |
| Certifications (11 items, 2020-2021) | Junior-era signal, dilutes seniority | **Cut from page.** They remain in the resume PDF. |
| Contact (giant type + 3 info cards + gradient CTA) | Info cards are filler | **Keep giant type,** cut the 3 cards, inline the form |
| `utils/constants.ts` stale data (Cursor.so experience, fake projects) | Dead/false placeholder data | **Delete.** It is unused, false, and dangerous for SEO scrapers. |
| Particle background (2D canvas dots) | Generic | **Replace** with the Pixi hero canvas (Section 5.1) |

### 2.2 New content to add

1. **Case studies** (3): TruWallet + Web Wallet v4 (Trential), TruEnroll evaluation platform (Trential), Glue canvas suite (Glue Labs; xG folds in here). Structure per Section 6.3. Bullets are sourced from the LinkedIn profile and 2026 monthly reports (already provided). `[PENDING-INPUT: Trential product visuals and permission (marketing site assets or app-store screenshots; portals are auth-walled); Dashgen is out of the chapters, optionally mentioned in About]`
2. **The Lab** (3 interactive demos): small, self-contained proof-of-craft widgets (Section 6.4). These are new builds.
3. **"Now" line:** SDE-2 at Trential + availability status, one sentence in hero and contact.
4. **Open-source / GitHub facts:** pulled live: total contributions (current year), current streak, public repos.
5. **About:** 2 short paragraphs of real voice (first person, plain language) + photo + compact stack line + resume link. `[PENDING-INPUT: 3-4 personal facts worth telling: what he's learning, what he wants to build next]`
6. **Optional, only if real:** 1-2 testimonial quotes from colleagues. `[PENDING-INPUT]` Skip the section entirely if not provided; never fabricate.

### 2.3 Stats policy (hard rule)

Only verifiable numbers ship. Approved sources: GitHub API (live), the LinkedIn profile PDF, the 2026 monthly reports, and facts confirmed by Yash. Verified numeric pool: 4+ years experience (since 03/2022), 30% video-editor efficiency gain (Glue), 50% campaign setup reduction (xG), 40% email editor UX gain, 15% editing efficiency (Slate.js RTE), 100+ ops cases audited (May 2026). Trential chapters may ship with zero numeric metrics; feature facts (NFC, biometrics, liveness) carry them. The strings "~3 years / +18 projects / +28 worked libraries" are banned. If a metric can't be verified, the layout drops it gracefully.

### 2.4 Copy voice

First person, concrete, quietly confident. Short sentences. No hype verbs, no "passionate about". Model sentence: "I build canvas editors and the interfaces around them." All display headlines are locked in Section 6; body copy follows this voice and passes the taste-skill copy self-audit.

---

## 3. Design system (locked)

### 3.1 Theme and color

One theme: **dark, locked at page level.** No section inversions.

```css
/* globals.css - the only color tokens allowed. No other hex values in components. */
:root {
  --bg: #0b0b0d;            /* page base, off-black, cool */
  --bg-elevated: #131316;   /* raised surfaces, cards when justified */
  --bg-subtle: #1a1a1f;     /* hover fills, input backgrounds */
  --line: rgba(255 255 255 / 0.08);        /* hairlines, borders */
  --line-strong: rgba(255 255 255 / 0.16); /* hover borders */
  --text: #f4f4f5;          /* primary text (not pure white) */
  --text-secondary: #a1a1aa;/* body copy on dark */
  --text-tertiary: #63636b; /* metadata, captions */
  --accent: #e8763a;        /* ember orange, THE one accent */
  --accent-soft: #f09a6b;   /* accent at body-text sizes (contrast-safe) */
  --accent-glow: rgba(232 118 58 / 0.14); /* canvas/hover tint only */
}
```

Rules:
- **One accent (ember orange) for the whole page.** Links, active nav, CTA, canvas particles, GitHub heat scale, focus rings. Nothing blue, nothing purple, nothing indigo. The old indigo/purple gradient system is deleted.
- Neutral family is cool zinc only. Never mix warm grays in.
- Accent on text smaller than 18px uses `--accent-soft` (passes WCAG AA on `--bg`).
- Shadows are tinted to background (`rgba(0 0 0 / …)` on this palette is fine), never used to fake elevation on flat lists.
- Grain: one fixed, `pointer-events-none` full-viewport noise overlay at ~3% opacity, `z-index: var(--z-grain)`. Applied once in layout, never on scrolling containers.

### 3.2 Typography

- **Display + UI: Satoshi Variable** (Fontshare, free license). Self-hosted via `next/font/local`, `font-display: swap`, weights 400-900 variable.
- **Mono: JetBrains Mono** via `next/font/google`, used for: all numerals/stats, code, nav-adjacent metadata, GitHub data. `font-variant-numeric: tabular-nums` on all stat numbers.
- Poppins is removed.
- Scale: display headlines `clamp(2.5rem, 6vw, 5rem)`, `tracking-tighter`, `leading-[0.95]` (verified: keeps the locked hero headline at exactly 2 lines at 1440px inside the 1200px container); section headers `text-3xl md:text-5xl tracking-tight`; body `text-base md:text-lg text-[--text-secondary] leading-relaxed max-w-[65ch]`.
- Emphasis inside headlines: same-family italic or a weight jump, never a second family, never gradient text.
- `text-wrap: balance` on all headlines, `text-wrap: pretty` on body.

### 3.3 Shape, spacing, z-index

- **Radius system (locked):** interactive elements (buttons, inputs, pills) = `9999px` (full pill); containers/cards/images = `16px`; nothing else. Documented rule, applied everywhere.
- Section rhythm: `py-24 md:py-40`. Container: `max-w-[1200px] mx-auto px-5 md:px-8`.
- Full-height moments use `min-h-[100dvh]`, never `h-screen`.
- Z-scale in one constants file: `--z-canvas: 0, --z-content: 10, --z-nav: 40, --z-overlay: 50, --z-grain: 60`. No other z-index values permitted.

### 3.4 Iconography

- **Single family: `@phosphor-icons/react`**, weight `"regular"` for UI, `"fill"` only for the active nav state. `react-icons` is fully removed (it currently mixes 8 families).
- Brand logos (GitHub, LinkedIn, X, tech marks) come from Phosphor's brand set or `simple-icons`; never hand-rolled SVG paths.

### 3.5 Motion language (locked)

Derived from `emil-design-eng` + `animate`:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* entrances, reveals */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen movement */
--dur-press: 140ms; --dur-ui: 200ms; --dur-reveal: 600ms;
```

- Every pressable element: `active:scale-[0.97]`, `transition: transform 140ms var(--ease-out)`.
- Entrances: `opacity 0→1` + `translateY 16-24px→0`, `--dur-reveal`, `--ease-out`, staggers 40-70ms, `viewport={{ once: true, amount: 0.3 }}`.
- Nothing enters from `scale(0)`. Nothing uses `ease-in`. Nothing uses `transition: all`. No UI transition over 300ms (scroll-driven scrub excluded, it has no duration).
- Springs (`type: "spring", duration: 0.5, bounce: 0.15`) only for pointer physics and drag.
- Library separation: **Motion** for component/micro animation; **GSAP + ScrollTrigger** only for pinned scroll chapters; **Pixi.js** only inside canvas leaf components. Never two of these in one component tree.
- Hover motion gated behind `@media (hover: hover) and (pointer: fine)`.
- `useReducedMotion()` / `prefers-reduced-motion`: canvas becomes a static rendered frame, pinned chapters become plain stacked sections, reveals become opacity-only. This ships *with* each feature, not after.
- Banned everywhere: `window.addEventListener("scroll")`, scroll math in React state, `useState` for pointer/scroll values (use `useMotionValue`/`useScroll`/ScrollTrigger).

### 3.6 Stack (upgraded baseline + additions)

**Baseline (already upgraded on `redesign/canvas-2026`, build + e2e verified):** Next.js 16.3, React 19.2, Tailwind CSS 4.3 (CSS-first config via `@theme` in `globals.css`; `tailwind.config.ts` removed by the official codemod; PostCSS uses `@tailwindcss/postcss`), Motion 13 (stricter types: `ease`/`type` values need `as const` or typed constants), `@emailjs/browser` replacing deprecated `emailjs-com`, Node 20 (`.nvmrc` updated).

**Additions (install in Phase 0):**

| Package | Purpose | Justification |
|---|---|---|
| `gsap` | ScrollTrigger pinned work chapters | Only maintained option for pin/scrub choreography |
| `lenis` | Smooth inertial scroll | Cinematic feel expected at MOTION 7; disabled under reduced motion; native fallback |
| `pixi.js` (v8) | Hero canvas + lab demos | On-brand: the exact engine Yash uses professionally |
| `@phosphor-icons/react` | Icon system | One family, replaces react-icons |
| `clsx` + `tailwind-merge` | `cn()` utility | Sanity for conditional classes |

Removed: `react-icons` (after migration), Poppins import, `emailjs-com` (done, swapped for `@emailjs/browser`). Kept: `motion`, `react-hot-toast` (contact form feedback), `rss-parser`, `@vercel/analytics`, `sharp`.

Tokens are defined CSS-first in `globals.css` via Tailwind v4 `@theme` (e.g. `--color-accent`, `--color-elevated`, `--color-line`, `--font-display`, `--font-mono`) so utilities like `text-accent`, `bg-elevated`, `border-line` exist natively. No `tailwind.config.ts`.

---

## 4. Information architecture (locked)

> **Addendum (Aug 2026):** an approved ninth section, "Inside the black box" (`#ai`, between Experience and Writing), is specified in `docs/PRD-ai-journey.md`. It amends this table; build only on owner command.
>
> **Addendum 2 (Aug 2026):** the site-wide background upgrades to a persistent particle narrator ("the Ember Organism"), specified in `docs/PRD-background-organism.md`. Phased build, each phase on owner command.
>
> **Addendum 3 (Aug 2026):** optional session-once loading / starting screen ("First Ember"), specified in `docs/PRD-loading-screen.md`. Concept matrix + recommended C1 Ember Birth; build only after owner locks Section 8 decisions.

Single page, 8 sections, in this exact order. Anchor IDs preserve existing slugs for SEO where a section survives.

| # | Section | Anchor | Layout family (all 8 must differ) |
|---|---|---|---|
| 1 | Hero | `#top` | Full-viewport canvas manifesto, left-anchored type |
| 2 | Proof bar | (none, part of hero flow) | Single mono data strip, live GitHub numbers |
| 3 | Selected Work | `#projects` | GSAP sticky-stack chapters (3 pinned cards) |
| 4 | The Lab | `#lab` | Asymmetric bento (2fr/1fr grid, real visual variation) |
| 5 | Experience | `#experience` | Left vertical rail timeline, right content |
| 6 | Writing | `#blog` | Editorial hairline list rows (no cards) |
| 7 | About | `#about` | Split: photo left, prose right, stack line below |
| 8 | Contact | `#contact` | Giant-type full-width finale + inline form |

Footer: one line (name, year, "Built with Next.js and Pixi.js" + source link), no link farm.

Removed routes/sections: `/contact` page (301 redirect to `/#contact` via `next.config.js` redirects), Certifications, Stats grid, standalone Tech Stack, Resume section (link moves to nav + About).

**Navigation (rebuilt):** slim fixed top bar, 64px, one line: wordmark "YS" left; links Work / Lab / Experience / Writing / About right; one CTA button "Get in touch" (accent pill). Active section tracked via IntersectionObserver, indicated with accent text + Phosphor fill icon. On mobile: wordmark + CTA only, plus a bottom-sheet menu (Motion, origin-aware). Scroll progress: 2px accent line under the nav bar driven by `useScroll` (Motion), no re-renders.

**CTA intent lock:** exactly one contact intent label on the whole page: **"Get in touch"** (nav CTA, hero secondary link, contact form submit reads "Send message" as a form action, allowed as distinct intent). Portfolio intent label: **"See the work"** (hero primary, scrolls to `#projects`). No other CTA phrasings anywhere.

**Eyebrow budget:** 8 sections → max 3 eyebrows total. Allocated: Selected Work ("SELECTED WORK 2022-2026" in mono caps), The Lab ("THE LAB"), and none elsewhere. Hero, Experience, Writing, About, Contact use bare headlines.

---

## 5. Signature interactive elements (the "new UX")

### 5.1 Hero canvas (Pixi.js v8) — scroll-dissolve artwork

> **Reworked Aug 2026 (owner decision):** Yash supplied a commissioned dark/ember illustration of himself surrounded by editor-UI motifs (`public/images/hero-art.jpg`). It replaces the halftone profile-photo treatment. The particle engine stayed; what it samples changed.

The single most important build. The hero's right side (60% at `lg`) shows the illustration as a plain `next/image` (priority, the LCP element, edge-feathered with a CSS radial mask shared by image and canvas). Behind it, a Pixi particle field samples the *same artwork* into true-color particles:

- Grid sampling at 128 cols (halved on `hardwareConcurrency <= 4`), cells below the artwork's dark-background luminance (`< 0.095`) skipped. Each particle keeps the sampled RGB as tint; alpha and radius scale with luminance (mid-tones boosted so the editor UI and mountains survive the dissolve).
- **Scroll dissolve:** progress `p = scrollY / (0.65 * viewport)`. Over the first ~22% of `p` the crisp image crossfades into the particle rendering; particles then scatter *upward* (embers, 120-500px per particle) with x-jitter and the canvas fades out by `p = 1`. Fully reversible — scrolling back reforms the artwork.
- Idle (any time canvas is visible): particles breathe with sine drift. Pointer within 110px repels with velocity-based spring return.
- Engineering constraints: `dpr = min(devicePixelRatio, 2)`; ticker paused when hero is offscreen (IntersectionObserver) and when `document.hidden`; full `app.destroy()` cleanup on unmount; lazy-loaded via `next/dynamic` with `ssr: false`. LCP is the artwork `<img>` + headline, never blocked by Pixi.
- Fallbacks: `prefers-reduced-motion` → static artwork only (no canvas mount). WebGL unavailable → static artwork (silent catch).
- The old sharp-generated halftone poster (`scripts/generate-hero-poster.mjs`, `public/images/hero-poster.png`) is no longer used by the hero; the halftone motif is retained for the OG image (5.5).

### 5.2 Work chapters (GSAP sticky-stack)

Three case-study cards pin and stack per the canonical skeleton in `taste-skill` Section 5.A: `start: "top top"`, `pin: true`, `pinSpacing: false`, previous card scales to 0.92 / dims to 0.55 as the next arrives. Desktop only; below `lg` the cards render as plain stacked sections with standard reveals. Each chapter interior per Section 6.3.

### 5.3 The Lab demos (proof-of-craft)

Three small interactive widgets, each an isolated `"use client"` leaf, lazy-mounted when scrolled into view:

1. **Ember brush** (Pixi) — *builds in Phase 7, replacing the retired mini editor.* A blank canvas you paint on: strokes emit the same true-color ember particles as the hero, which drift, glow, and dissipate over a few seconds; a mono "clear" action resets. Pure ParticleContainer + ticker (no filter pipeline, which is what sank the mini editor: a Pixi v8 `BindGroup.setResource` null crash on any filtered re-render). Ties the whole page's particle motif into one touchable loop.
   - *Rejected alternates:* pen-tool bezier playground (echoes the artwork's curve-editor motif but reads as a tutorial, not a toy); kinetic type tester (weakest craft proof of the three).
   - *Retired:* the Pixi mini image editor (exposure/grain/halftone sliders). Owner disliked it and the v8 filter crash made every slider blank the canvas. Removed Aug 2026.
2. **Spring playground** (Motion): a draggable ball with editable stiffness/damping sliders and a live spring-curve trace. Proves motion literacy.
3. **Text scramble clock** (vanilla + WAAPI): live IST clock whose digits scramble-settle on minute change. Proves restraint + typography. (Also the only place a "clock" is allowed; it is a demo, not decor.)

Bento composition (interim, until the ember brush ships): spring playground spans 2 columns, clock takes the third. Final composition: ember brush spans 2 columns, spring + clock stack in the third. Each cell has a real visual (the demo itself), a one-line title, and a "view source" link to the GitHub file. No empty cells.

### 5.4 GitHub proof bar (live data)

Reuses the existing contributions API (`jogruber.de/v4/yashsharma31`), rebuilt as a single full-width strip under the hero: 52-week contribution ribbon rendered as SVG rects tinted on the ember scale (5 levels from `--bg-subtle` to `--accent`), plus three mono numbers: contributions this year, current streak, years shipping (from 03/2022). Numbers count up once on first view (600ms, ease-out, tabular-nums so nothing shifts). Error state: strip hides gracefully, numbers fall back to resume facts.

### 5.5 Micro-details (the compounding layer)

- Custom text selection color (`::selection` accent on dark).
- Focus-visible rings: 2px accent offset ring, everywhere, tested by keyboard walk.
- Magnetic pull (max 6px translate, spring) on the nav CTA and hero primary CTA only. Nowhere else.
- Anchor scrolling via Lenis with `scroll-behavior: smooth` fallback; scroll-padding accounts for nav height.
- `#contact` form: label-above inputs, inline validation, skeleton-free (form is instant), submit button morphs to success state (blur-crossfade per emil-design-eng), toast on failure with retry.
- Custom 404: giant type "Nothing here.", one link home, same theme.
- OG image regenerated to match the new brand (dark, Satoshi, ember accent, halftone portrait motif).

---

## 6. Section-by-section spec (locked copy and structure)

### 6.1 Hero (`#top`)

- Full `min-h-[100dvh]`, artwork + canvas as right-anchored background layer (`--z-canvas`, 60% width at `lg`, dimmed to 30% opacity under `md` where it sits behind the text), content left-anchored, vertically centered, `pt` respecting 64px nav.
- Text stack (4 elements, hero discipline):
  1. Headline (locked copy, wraps to ~4 lines in the narrower left column): `I build editors, canvases,` / `and interfaces that feel fast.` — with `feel fast.` in the accent color (per the approved hero mockup). Display scale, Satoshi 800.
  2. Subtext (locked, 14 words): `SDE-2 at Trential. Four years shipping secure wallets, evaluation portals, and WebGL canvas editors.`
  3. CTAs: primary "See the work" (accent pill, scrolls to `#projects`), secondary "Get in touch" (text link + arrow, scrolls to `#contact`).
  4. Nothing else. No tagline, no trust strip, no scroll cue, no version label, no locale strip.
- Entrance: headline lines mask-reveal upward (80ms stagger), subtext + CTAs fade up after 200ms. One-time, `--ease-out`.

### 6.2 Proof bar

Directly under hero fold: full-width hairline-top strip, mono type. Left: contribution ribbon (5.4). Right: `1,847 contributions this year · 12 day streak · shipping since 2022` (values live; middle-dot used once per the ration, this is the single metadata strip on the page). No heading, no eyebrow.

### 6.3 Selected Work (`#projects`)

Eyebrow (1 of 2): `SELECTED WORK 2022-2026`. Header: `Three products, shipped and in production.` (sentence case, text-5xl).

Each chapter card (`bg-elevated`, radius 16, internal 12-col grid):

- Left (cols 1-5): project name (text-4xl), role + period (mono, tertiary), 2-sentence description in plain voice, up to 2 real metrics as mono stat pairs (verified pool in Section 2.3; zero metrics is allowed), stack pills (max 5, pill radius, `bg-subtle`), external link where a public URL exists.
- Right (cols 6-12): real product visual in a device/browser frame (real `<img>`, AVIF/WebP, `next/image`), subtle parallax drift (max 20px) inside the pinned scene.
- Chapters (locked order, canonical data in `src/data/projects.ts`):
  1. **TruWallet + Web Wallet v4** (Trential, 2025-present): secure credential wallet across React Native and web. NFC passport scanning, FaceID/TouchID with liveness checks, DigiLocker and Stripe integrations, GrowthBook A/B testing, full Mixpanel/Sentry telemetry behind a proxy layer. Phone-frame visual.
  2. **TruEnroll** (Trential, 2025-present): credential evaluation platform for universities. Dynamic grading scales, real-time GPA calculators, OCR document review, platform-wide accessibility overhaul, end-to-end analytics. Browser-frame visual.
  3. **Glue canvas suite** (Glue Labs, 2022-2025): WebGL photo and video editors on Pixi.js + React, Slate.js rich text editor, email tooling (xG). Metrics: 30% rendering efficiency gain, 50% faster campaign setup. Browser-frame visual.
- Visual acquisition (Phase 2 task): `glue.is` captured live at 1600x1000 via `scripts/capture-work.ts`. Trential visuals `[PENDING-INPUT: marketing-site assets or app-store screenshots + permission; portals are auth-walled, never screenshot real candidate data]`. Interim placeholder is a labeled `picsum` seed, flagged loudly in the PR notes.

### 6.4 The Lab (`#lab`)

Eyebrow (2 of 2): `THE LAB`. Header: `Small things, built to be touched.` Sub-line (one sentence, 14 words max): `Every demo runs live on this page. View the source of each.`
Bento per 5.3. Each demo card: demo canvas/widget fills the cell, title + one-line caption below inside the cell, mono "source ↗" link.

### 6.5 Experience (`#experience`)

Header: `Where the hours went.` No eyebrow.
Vertical accent rail on the left (2px, `--line`, accent segment marks active item on scroll). Four entries from `src/data/experience.ts` (Trential SDE-2 03/2026-present; Trential SDE 03/2025-02/2026; Glue Labs SDE 06/2023-03/2025; Glue Labs Intern 03/2022-05/2023), each: role + company (text-2xl), period (mono tertiary), exactly 3 strongest bullets (fact-first, sourced from LinkedIn + monthly reports), stack line in mono. Reveal: rows fade up staggered.

### 6.6 Writing (`#blog`)

Header: `Notes on building things.` No eyebrow.
Editorial rows, not cards: each post = hairline-top row (`border-t border-line`, the only divider, no bottom borders) with title (text-xl, hover → accent-soft), date + read-time in mono tertiary right-aligned, whole row is the link. Max 4 posts from the existing Medium API route; skeleton rows while loading (shaped like the rows); error state hides the section body and shows a single "Read on Medium ↗" link. Footer link of section: `All posts on Medium ↗`.

### 6.7 About (`#about`)

Header: `About` (bare, small; this section's design is the photo).
Split at `lg`: left cols 1-5 = portrait photo (real, radius 16, duotone-treated to palette: near-black + subtle ember highlight, prepared as an actual processed asset via `scripts/`); right cols 6-12 = two short paragraphs `[PENDING-INPUT: personal facts; may mention Bennett University BTech CS 2019-2023 and "exploring AI since 2022"]` + a single mono stack line: `TypeScript · React · React Native · Next.js · Pixi.js · WebGL · Motion · Redux · Tailwind · Python` + resume link `Download resume (PDF)` + socials (GitHub, LinkedIn, X as Phosphor icons). Below `lg`: photo above prose, single column.

### 6.8 Contact (`#contact`)

Header (locked, giant display, 2 lines): `Let's build` / `something together.` Same display scale as hero.
Under it, one sentence: `I read everything sent here. Expect a reply within two days.` (verifiable behavior only; adjust if untrue).
Inline form (max-w-xl, left-aligned under the type): Name, Email, Message; labels above; inline errors below fields; submit "Send message" (accent pill, full-pill radius, morph-to-success). Transport: existing EmailJS wiring from `ContactForm.tsx`, envs from `.env`. Beside/below form: direct email as plain text link (`yash.sh0031@gmail.com`) and the three social icons. No info cards, no work-hours grid, no location strip.

### 6.9 Footer

One hairline-top row: `© 2026 Yash Sharma` left; `Built with Next.js and Pixi.js · Source ↗` right (mono, tertiary; the one permitted middle-dot here). No columns.

---

## 7. Build plan (phases, prompts, acceptance criteria)

Work on branch `redesign/canvas-2026`. One commit per phase minimum. Never break `npm run build`.

### Phase 0: Foundation and demolition

**Prompt:**
> Load `.cursor/skills/taste-skill/SKILL.md` and `.cursor/skills/redesign-skill/SKILL.md`. On branch `redesign/canvas-2026` (stack already upgraded to Next 16 / Tailwind 4 / Motion 13, see PRD 3.6): install `gsap lenis pixi.js @phosphor-icons/react clsx tailwind-merge`. Create the token system exactly as PRD Section 3.1/3.3/3.5 in `globals.css` using Tailwind v4 `@theme` (colors accent/bg/elevated/subtle/line/text, fonts, easings as CSS vars); replace the codemod's compatibility border-color block once components are migrated. Replace Poppins with self-hosted Satoshi Variable (`src/fonts/`, next/font/local, download from Fontshare) + JetBrains Mono (next/font/google). Create `src/utils/cn.ts`, `src/utils/z.ts` (z-scale constants), `src/components/motion/Reveal.tsx` (shared whileInView fade-up with reduced-motion handling; Motion 13 typing: use typed easing constants), `src/components/providers/SmoothScroll.tsx` (Lenis, disabled on reduced motion, anchor handling). Add the grain overlay to layout. Delete: `ParticleBackground.tsx`, `Certifications.tsx`, `Stats.tsx`, `PremiumTools.tsx`, `Resume.tsx`, stale exports in `utils/constants.ts` (keep only `CONTACT_LINKS`), the `/contact` page (add 301 redirect `/contact` → `/#contact` in `next.config.js`; keep `ContactForm` component for Phase 6 reuse). Build a temporary skeleton page that renders section placeholders in PRD Section 4 order with correct anchors, nav per PRD 4 (new `Navbar.tsx`, Phosphor icons, active tracking, progress line), and footer. Fix the legacy `objectFit` image props while touching layout. `npm run build` must pass; `npm run test:e2e` must pass; read the screenshots.

**Accept:** build green; e2e green; nav one line at 1024px+, 64px tall; tokens visible (dark bg, Satoshi rendering); zero react-icons imports outside not-yet-migrated files; `/contact` redirects.

### Phase 1: Hero + canvas

**Prompt:**
> Load `taste-skill`, `emil-design-eng`, `animate`. Build PRD 6.1 hero and 5.1 Pixi canvas: `src/components/hero/Hero.tsx` (server-renderable text) + `src/components/hero/HeroCanvas.tsx` (`"use client"`, next/dynamic ssr:false, Pixi v8 particle halftone of `/images/profile.jpeg` per PRD 5.1 including poster crossfade, DPR cap, offscreen pause, destroy cleanup, reduced-motion poster, hardware tiering). Generate the static poster asset with a script (`scripts/generate-hero-poster.mjs` using sharp: halftone-style processed frame). Locked copy from PRD 6.1 verbatim. Entrance choreography per 6.1. Then extend `tests/smoke.spec.ts` with hero assertions (headline text visible, CTA scrolls to #projects, no console errors) and run the Playwright loop until screenshots look right on desktop + mobile.

**Accept:** LCP element is poster/headline, not canvas; interaction runs 60fps on desktop (verify via DevTools trace once); reduced-motion shows static poster (test with `page.emulateMedia({ reducedMotion: "reduce" })` in a new spec); e2e green.

### Phase 2: Selected Work

**Prompt:**
> Load `taste-skill` (Section 5.A skeleton is mandatory), `emil-design-eng`. Use the existing `src/data/projects.ts` content module (three case studies per PRD 6.3; do not rewrite copy). Write `scripts/capture-work.ts` (Playwright chromium: screenshot glue.is at 1600x1000, save to `public/images/work/`, run it); TruWallet/TruEnroll visuals use provided assets or clearly labeled placeholders until PENDING-INPUT 1 resolves. Build `src/components/work/WorkChapters.tsx` with the GSAP sticky-stack exactly per the canonical skeleton (`start: "top top"`, pin, pinSpacing false, scale/dim driven by next card), plain stacked fallback under `lg` and under reduced motion, chapter interior per PRD 6.3. Extend e2e: section renders 3 chapters, images load (no 404s), pinning does not trap scroll on mobile viewport. Playwright screenshot loop.

**Accept:** desktop scroll-through feels continuous (verify by scrubbing screenshots at 3 scroll positions); mobile = simple stack; no layout shift from image loads (explicit aspect ratios); e2e green.

### Phase 3: The Lab

**Prompt:**
> Load `taste-skill`, `emil-design-eng`, `animate`. Build PRD 5.3/6.4: `src/components/lab/` with `MiniEditor.tsx` (Pixi, exposure/grain/halftone sliders on one bundled image), `SpringPlayground.tsx` (Motion springs, draggable ball, stiffness/damping sliders, SVG curve trace), `ScrambleClock.tsx` (WAAPI scramble on minute tick, IST). Each: isolated client leaf, lazy-mounted via `next/dynamic` + in-view trigger, cleanup on unmount, reduced-motion static variants, "source ↗" links to the GitHub blob URLs. Bento grid per PRD 5.3 composition. Extend e2e: sliders change canvas state (screenshot diff before/after slider move), clock renders, no console errors. Screenshot loop.

**Accept:** all three demos interactive in e2e; total lazy JS for lab < 120KB gz beyond shared Pixi chunk; e2e green.

### Phase 4: Proof bar + Experience

**Prompt:**
> Load `taste-skill`. Build PRD 5.4 proof bar (rebuild data fetch from existing `GitHubContributions.tsx` logic into `src/components/proof/ProofBar.tsx`: SVG ribbon on ember scale, three count-up mono stats, graceful error fallback, then delete the old component) and PRD 6.5 Experience (`src/data/experience.ts` from current real content tightened to 3 bullets each; rail layout with scroll-tracked accent segment via IntersectionObserver). Extend e2e: proof bar renders with data or fallback; experience shows 2 entries. Screenshot loop.

**Accept:** ribbon tinted only in palette tokens; numbers tabular-nums, count up once; e2e green including a mocked-API-failure test (`page.route` abort → fallback renders).

### Phase 5: Writing + About

**Prompt:**
> Load `taste-skill`. Build PRD 6.6 Writing (reuse `/api/medium` route and `utils/medium.ts`; editorial hairline rows, skeleton rows, error → single Medium link) and PRD 6.7 About (duotone portrait: add `scripts/duotone-portrait.mjs` with sharp → `public/images/about-portrait.jpg`; prose slots with `[PENDING-INPUT]` placeholder paragraphs clearly marked in the data file; mono stack line; resume PDF link moved from old component; Phosphor social icons). Extend e2e: writing rows or fallback render; about image loads; resume link resolves 200. Screenshot loop.

**Accept:** no cards in writing section (rows only, single top hairlines); about collapses correctly at mobile; e2e green.

### Phase 6: Contact + finale + 404

**Prompt:**
> Load `taste-skill`, `emil-design-eng`, `animate`. Build PRD 6.8: giant-type contact section with inline form. Port EmailJS logic from `src/components/ContactForm.tsx` into `src/components/contact/ContactSection.tsx` (labels above, inline validation, morph-to-success submit per emil blur-crossfade pattern, react-hot-toast only for transport failure), then delete the old contact page/components. Build custom `src/app/not-found.tsx` per PRD 5.5. Footer per PRD 6.9. Regenerate `public/og-image.png` per PRD 5.5 (script with sharp or a generated asset; dark, Satoshi, ember, halftone motif) and update metadata if needed. Extend e2e: form validates empty submit inline (no browser alert), 404 page renders themed, footer link ok. Screenshot loop.

**Accept:** exactly one "Get in touch" intent label on page (grep the built HTML); form success/failure states verified with `page.route` mock of EmailJS; e2e green.

### Phase 7: Polish, audit, ship

**Prompt:**
> Load `.cursor/skills/review-animations/SKILL.md` (+ STANDARDS.md), `improve-animations/AUDIT.md`, and `taste-skill` Section 14. First build the **ember brush** Lab demo per PRD 5.3.1 (`src/components/lab/EmberBrush.tsx`: Pixi ParticleContainer, pointer strokes emit ember particles that drift up and fade over ~3s, mono clear button, no filter pipeline, reduced-motion static variant, lazy mount, e2e: stroke changes canvas + clear resets) and restore the final bento composition (brush spans 2 cols, spring + clock stack in the third). Then run the full animation review across all new components and fix every flagged item (the review table format is mandatory in the PR description). Then run the entire taste-skill Pre-Flight Check as a literal checklist against the built page and fix failures. Then: Lighthouse (desktop + mobile emulation) targeting LCP < 2.5s, CLS < 0.1, INP < 200ms, Performance ≥ 90 mobile; keyboard-only walk (focus visible everywhere, skip-to-content link added); copy self-audit of every visible string (zero em-dashes: `rg "—|–" src/` must return nothing); cross-viewport Playwright screenshots at 360, 768, 1024, 1440, 1920 read and corrected; `npm run build` bundle check (initial route JS < 250KB gz excluding lazy chunks). Delete all dead files, run `npm run lint`. Final full e2e suite green.

**Accept:** every checkbox of taste-skill Section 14 honestly ticked; Lighthouse numbers recorded in PR; zero em-dash grep; suite green.

---

## 8. Testing and verification loop (mandatory every phase)

1. `npm run test:e2e` runs the growing suite in `tests/` (dev server auto-starts via `playwright.config.ts`; desktop 1440x900 + Pixel 7 projects already configured).
2. Every phase adds its assertions to the suite; nothing is removed without cause.
3. **Screenshot reading is required:** after tests pass, capture full-page screenshots (the `visual snapshot` test attaches them), open and *read* them, and fix visual defects before calling the phase done. A passing assertion with a broken-looking screenshot is a failed phase.
4. Console errors fail tests (already wired in `smoke.spec.ts`); keep that invariant for every new page state.
5. Reduced-motion, API-failure, and mobile behaviors get explicit specs (Phases 1, 4, 2 respectively).
6. Performance checks (Lighthouse, bundle size) run at Phase 7 gate minimum; earlier if a phase feels heavy.

## 9. SEO and migration safety

- Keep: metadata.ts structure, JSON-LD Person schema (jobTitle "Software Development Engineer II", worksFor Trential, `knowsAbout` adds React Native/GSAP/Motion; `sameAs` uses the real handles in `CONTACT_LINKS`), sitemap.ts, robots config, canonical, analytics.
- Anchor slugs `#projects`, `#experience`, `#blog`, `#contact` preserved; `#lab`, `#about` added; `#tech-stack`, `#certifications`, `#resume` removed from nav (dead anchors are harmless but remove stale internal links).
- `/contact` 301 → `/#contact`.
- OG image, favicons, webmanifest re-exported in the new brand.
- `next/image` everywhere; hero poster `priority`; work screenshots explicit `sizes`.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Pixi hero janks low-end mobiles | Device tiering, DPR cap, offscreen pause, poster fallback; test on Pixel 7 project |
| GSAP pin fights Lenis | Use the documented Lenis + ScrollTrigger `scrollerProxy`-free integration (Lenis `on scroll` → `ScrollTrigger.update`); verify scrub in Phase 2 |
| EmailJS quota/failure | Failure toast + plain `mailto:` fallback always visible |
| Medium RSS flakiness | Section-level fallback link (PRD 6.6); API route already caches |
| Screenshot rights for work | Own-work products; confirm with Yash before ship `[PENDING-INPUT]` |
| Bundle creep from Pixi + GSAP | All heavy code lazy, initial-route budget enforced Phase 7 |

## 11. Decision log (why, in one line each)

- **Pixi over three.js:** authenticity; it is his production tool, and the hero doubles as proof of work.
- **Ember orange:** zero collision with the blue/purple dev-portfolio default; warm against cool zinc; one accent everywhere.
- **Satoshi + JetBrains Mono:** taste-skill approved pairing; free licenses; variable weight for display punch.
- **Sticky-stack for work, not horizontal pan:** three chapters read as depth, not breadth; mobile fallback is trivial.
- **Certifications cut:** 2020-21 entry-level certs undercut a senior design-engineer story; resume keeps them.
- **Trential chapters lead, Glue chapter anchors:** recency and seniority first (secure wallets, enterprise portals), then the canvas-craft chapter that the hero and Lab visually echo. Dashgen dropped from chapters (not on the LinkedIn record).
- **Dark-only:** the canvas hero and duotone treatment are designed for dark; a light theme would double every asset and QA cost for near-zero audience gain.
- **Full stack upgrade up front (Next 16, Tailwind 4, Motion 13):** owner override of the no-churn rule; upgrading before the rebuild means every new component is written once against current APIs (CSS-first tokens, Motion 13 types) instead of migrated later.
- **Commissioned hero illustration + scroll-dissolve (Aug 2026):** Yash supplied a brand-matched illustration (dark, ember, editor-UI motifs) and approved a mockup with it. It replaces the halftone photo poster as the hero visual; the Pixi engine now samples the artwork into true-color particles that dissolve upward on scroll and reform at top. More personality than the photo halftone, same proof-of-craft.
- **Hero art ships as a background-removed PNG (Aug 2026):** Yash supplied a 3072px upscale; `scripts/process-hero-art.mjs` flood-fills the flat backdrop from the borders to transparency (protecting dark interior pixels), feathers the edge, and emits a 2048w PNG. The art now floats on the page bg with no rectangle edge and no CSS mask, and stays crisp at retina.
- **Mini editor retired, ember brush replaces it (Aug 2026, builds Phase 7):** owner disliked the editor demo, and Pixi v8's filter pipeline crashed (`BindGroup.setResource` on null) on every re-render with any filter attached, blanking the canvas. The replacement uses the particle system only, which is already proven in the hero.

## 12. Inputs still owed by Yash (`[PENDING-INPUT]` registry)

Received Aug 2026: LinkedIn profile PDF + monthly reports Feb-July 2026 (timeline, Trential products, verified facts). Incorporated into Sections 1.1, 2.3, 6.3, 6.5 and `src/data/`.

Still pending:
1. Trential product visuals + permission (marketing-site assets or app-store screenshots for TruWallet/TruEnroll; portals are auth-walled, no real candidate data ever).
2. Glue canvas suite visuals: glue.is no longer resolves and gluelabs.com pivoted to an unrelated product (verified Aug 2026), so nothing truthful can be captured live. Yash must supply editor screenshots or recordings; the chapter ships a labeled placeholder and no external link until then. Also: whether Dashgen gets an About mention.
3. Two short personal paragraphs (or raw facts) for About.
4. Optional real testimonials (skip section if none).
5. Confirmation of the "reply within two days" contact promise.
6. **Updated resume PDF** (the bundled `Yash-Sharma-Resume.pdf` predates Trential and is now wrong; replace before Phase 5 ships the About section).
7. Availability status for the "Now" line (open to offers? not looking?).

None of these block Phases 0-4; slots are structured so content drops in without design changes.
