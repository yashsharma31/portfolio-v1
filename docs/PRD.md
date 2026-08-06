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

The core insight: Yash's professional edge is **canvas/WebGL editor engineering** (Pixi.js photo editor, video creator, rich text editor at Glue Labs). Every dev portfolio *claims* skills; this one must **prove them in the page itself**. The portfolio is the demo.

### 1.2 Dials (locked)

- `DESIGN_VARIANCE: 7` (asymmetric, offset layouts; strict single column under 768px)
- `MOTION_INTENSITY: 7` (real choreography: scroll chapters, canvas hero, spring physics; all gated by reduced-motion)
- `VISUAL_DENSITY: 3` (airy, gallery-like; `py-24` to `py-40` sections)

### 1.3 Goals

1. A visitor understands within 5 seconds: *this person builds canvas tools and high-craft interfaces.*
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
| Recent Projects (Glue, Dashgen, xG) | Real work, text-only gradient cards | **Promote** to full case-study chapters with real screenshots |
| Experience (Glue Labs SDE + intern) | Real, metric-backed bullets | **Keep + tighten** (max 3 bullets each, strongest metrics only) |
| Tech stack (16 icon tiles in 5 categories) | Icon-grid wall | **Demote** to one compact line inside About. Icon walls are filler. |
| Resume download | `Yash-Sharma-Resume.pdf` | **Keep** (nav + about) |
| Blog (Medium RSS, live) | Working API route with `rss-parser` | **Keep + redesign** as editorial list rows |
| Certifications (11 items, 2020-2021) | Junior-era signal, dilutes seniority | **Cut from page.** They remain in the resume PDF. |
| Contact (giant type + 3 info cards + gradient CTA) | Info cards are filler | **Keep giant type,** cut the 3 cards, inline the form |
| `utils/constants.ts` stale data (Cursor.so experience, fake projects) | Dead/false placeholder data | **Delete.** It is unused, false, and dangerous for SEO scrapers. |
| Particle background (2D canvas dots) | Generic | **Replace** with the Pixi hero canvas (Section 5.1) |

### 2.2 New content to add

1. **Case studies** (3): Glue canvas editor, Dashgen, xG video/email tooling. Structure per Section 6.3. `[PENDING-INPUT: git commit history will refine the "what I actually built" bullets; real product screenshots or permission to capture live sites]`
2. **The Lab** (3 interactive demos): small, self-contained proof-of-craft widgets (Section 6.4). These are new builds.
3. **"Now" line:** current role + availability status, one sentence in hero and contact.
4. **Open-source / GitHub facts:** pulled live: total contributions (current year), current streak, public repos.
5. **About:** 2 short paragraphs of real voice (first person, plain language) + photo + compact stack line + resume link. `[PENDING-INPUT: 3-4 personal facts worth telling: what he's learning, what he wants to build next]`
6. **Optional, only if real:** 1-2 testimonial quotes from colleagues. `[PENDING-INPUT]` Skip the section entirely if not provided; never fabricate.

### 2.3 Stats policy (hard rule)

Only verifiable numbers ship. Approved sources: GitHub API (live), resume facts (3+ years at Glue Labs), product facts confirmed by Yash. The strings "~3 years / +18 projects / +28 worked libraries" are banned. If a metric can't be verified, the layout drops it gracefully.

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

### 5.1 Hero canvas (Pixi.js v8)

The single most important build. An interactive particle field rendered in Pixi:

- ~4,000-8,000 particles (device-tiered) forming a halftone portrait of Yash's profile photo (sampled from image luminance at build/load time).
- Idle: particles breathe with subtle simplex-noise drift.
- Pointer: particles within a 120px radius repel with spring return (velocity-based, not position-snapped). On touch: same behavior on drag.
- On scroll past 30% of viewport: particles scatter along +y with opacity fade (scroll-linked, ScrollTrigger scrub or Pixi ticker fed by Lenis progress).
- All particles tinted between `--text-tertiary` and `--accent` by sample brightness. The accent glow is the only color moment.
- Engineering constraints: `dpr = min(devicePixelRatio, 2)`; `ticker` paused when hero is offscreen (IntersectionObserver) and when `document.hidden`; full `app.destroy()` cleanup on unmount; lazy-loaded via `next/dynamic` with `ssr: false`; a static PNG poster renders instantly and crossfades to canvas when ready (LCP is the poster + headline, never blocked by Pixi).
- Fallbacks: `prefers-reduced-motion` → static poster only. Devices with `navigator.hardwareConcurrency <= 4` → particle count halved. WebGL unavailable → poster.

### 5.2 Work chapters (GSAP sticky-stack)

Three case-study cards pin and stack per the canonical skeleton in `taste-skill` Section 5.A: `start: "top top"`, `pin: true`, `pinSpacing: false`, previous card scales to 0.92 / dims to 0.55 as the next arrives. Desktop only; below `lg` the cards render as plain stacked sections with standard reveals. Each chapter interior per Section 6.3.

### 5.3 The Lab demos (proof-of-craft)

Three small interactive widgets, each an isolated `"use client"` leaf, lazy-mounted when scrolled into view:

1. **Mini image editor** (Pixi): one image, three sliders (exposure, grain, halftone). Proves the day-job skill directly. Filters via Pixi filters, 60fps.
2. **Spring playground** (Motion): a draggable ball with editable stiffness/damping sliders and a live spring-curve trace. Proves motion literacy.
3. **Text scramble clock** (vanilla + WAAPI): live IST clock whose digits scramble-settle on minute change. Proves restraint + typography. (Also the only place a "clock" is allowed; it is a demo, not decor.)

Bento composition: editor demo spans 2 columns (landscape), spring + clock stack in the third column. Each cell has a real visual (the demo itself), a one-line title, and a "view source" link to the GitHub file. No empty cells.

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

- Full `min-h-[100dvh]`, canvas as background layer (`--z-canvas`), content left-anchored on the 12-col grid (cols 1-7), vertically centered, `pt` respecting 64px nav, max `pt-24` beyond it.
- Text stack (4 elements, hero discipline):
  1. Headline (2 lines locked): `I build editors, canvases,` / `and interfaces that feel fast.` Display scale, Satoshi 800.
  2. Subtext (locked, 18 words): `Design engineer at Glue Labs. Three years shipping WebGL photo tools, video editors, and rich text systems.`
  3. CTAs: primary "See the work" (accent pill, scrolls to `#projects`), secondary "Get in touch" (text link + arrow, scrolls to `#contact`).
  4. Nothing else. No tagline, no trust strip, no scroll cue, no version label, no locale strip.
- Entrance: headline lines mask-reveal upward (80ms stagger), subtext + CTAs fade up after 200ms. One-time, `--ease-out`.

### 6.2 Proof bar

Directly under hero fold: full-width hairline-top strip, mono type. Left: contribution ribbon (5.4). Right: `1,847 contributions this year · 12 day streak · shipping since 2022` (values live; middle-dot used once per the ration, this is the single metadata strip on the page). No heading, no eyebrow.

### 6.3 Selected Work (`#projects`)

Eyebrow (1 of 2): `SELECTED WORK 2022-2026`. Header: `Three products, one canvas obsession.` (sentence case, text-5xl).

Each chapter card (`bg-elevated`, radius 16, internal 12-col grid):

- Left (cols 1-5): project name (text-4xl), role + period (mono, tertiary), 2-sentence description in plain voice, up to 2 real metrics as mono stat pairs (only resume-verified numbers: e.g. Glue "30% faster rendering", "150ms load-time cut"), stack pills (max 5, pill radius, `bg-subtle`), link "Visit glue.is" with arrow (external).
- Right (cols 6-12): real product screenshot in a browser-chrome frame (real `<img>`, AVIF/WebP, `next/image`), subtle parallax drift (max 20px) inside the pinned scene.
- Chapters: **Glue** (canvas photo/video editor, Pixi.js + React), **Dashgen** (multi-model AI workspace), **xG** (video creator + email tooling). `[PENDING-INPUT: refined bullets from git history]`
- Screenshot acquisition (Phase 2 task): capture live `glue.is` and `dashgen.in` at 1600x1000 via the Playwright script `scripts/capture-work.ts`; xG uses provided assets `[PENDING-INPUT]`; interim placeholder is a labeled `picsum` seed, flagged loudly in the PR notes.

### 6.4 The Lab (`#lab`)

Eyebrow (2 of 2): `THE LAB`. Header: `Small things, built to be touched.` Sub-line (one sentence, 14 words max): `Every demo runs live on this page. View the source of each.`
Bento per 5.3. Each demo card: demo canvas/widget fills the cell, title + one-line caption below inside the cell, mono "source ↗" link.

### 6.5 Experience (`#experience`)

Header: `Where the hours went.` No eyebrow.
Vertical accent rail on the left (2px, `--line`, accent segment marks active item on scroll). Two entries (Glue Labs SDE 06/2023-present; Intern 03/2022-05/2023), each: role + company (text-2xl), period (mono tertiary), exactly 3 strongest bullets (metric-first, from current copy, tightened), stack line in mono. Reveal: rows fade up staggered. `[PENDING-INPUT: any freelance/other roles from git history]`

### 6.6 Writing (`#blog`)

Header: `Notes on building things.` No eyebrow.
Editorial rows, not cards: each post = hairline-top row (`border-t border-line`, the only divider, no bottom borders) with title (text-xl, hover → accent-soft), date + read-time in mono tertiary right-aligned, whole row is the link. Max 4 posts from the existing Medium API route; skeleton rows while loading (shaped like the rows); error state hides the section body and shows a single "Read on Medium ↗" link. Footer link of section: `All posts on Medium ↗`.

### 6.7 About (`#about`)

Header: `About` (bare, small; this section's design is the photo).
Split at `lg`: left cols 1-5 = portrait photo (real, radius 16, duotone-treated to palette: near-black + subtle ember highlight, prepared as an actual processed asset via `scripts/`); right cols 6-12 = two short paragraphs `[PENDING-INPUT: personal facts]` + a single mono stack line: `TypeScript · React · Next.js · Pixi.js · WebGL · Motion · GSAP · Tailwind · Zustand · Node` + resume link `Download resume (PDF)` + socials (GitHub, LinkedIn, X as Phosphor icons). Below `lg`: photo above prose, single column.

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
> Load `taste-skill` (Section 5.A skeleton is mandatory), `emil-design-eng`. Create `src/data/projects.ts` typed content module with the three case studies (copy per PRD 6.3, metrics only from resume facts). Write `scripts/capture-work.ts` (Playwright chromium: screenshot glue.is and dashgen.in at 1600x1000, save to `public/images/work/`, run it). Build `src/components/work/WorkChapters.tsx` with the GSAP sticky-stack exactly per the canonical skeleton (`start: "top top"`, pin, pinSpacing false, scale/dim driven by next card), plain stacked fallback under `lg` and under reduced motion, chapter interior per PRD 6.3. Extend e2e: section renders 3 chapters, images load (no 404s), pinning does not trap scroll on mobile viewport. Playwright screenshot loop.

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
> Load `.cursor/skills/review-animations/SKILL.md` (+ STANDARDS.md), `improve-animations/AUDIT.md`, and `taste-skill` Section 14. First run the full animation review across all new components and fix every flagged item (the review table format is mandatory in the PR description). Then run the entire taste-skill Pre-Flight Check as a literal checklist against the built page and fix failures. Then: Lighthouse (desktop + mobile emulation) targeting LCP < 2.5s, CLS < 0.1, INP < 200ms, Performance ≥ 90 mobile; keyboard-only walk (focus visible everywhere, skip-to-content link added); copy self-audit of every visible string (zero em-dashes: `rg "—|–" src/` must return nothing); cross-viewport Playwright screenshots at 360, 768, 1024, 1440, 1920 read and corrected; `npm run build` bundle check (initial route JS < 250KB gz excluding lazy chunks). Delete all dead files, run `npm run lint`. Final full e2e suite green.

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

- Keep: metadata.ts structure, JSON-LD Person schema (update `knowsAbout` to add GSAP/Motion; fix `sameAs` URLs to the real handles in `CONTACT_LINKS`), sitemap.ts, robots config, canonical, analytics.
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
- **Dark-only:** the canvas hero and duotone treatment are designed for dark; a light theme would double every asset and QA cost for near-zero audience gain.
- **Full stack upgrade up front (Next 16, Tailwind 4, Motion 13):** owner override of the no-churn rule; upgrading before the rebuild means every new component is written once against current APIs (CSS-first tokens, Motion 13 types) instead of migrated later.

## 12. Inputs still owed by Yash (`[PENDING-INPUT]` registry)

1. Git commit history (refines case-study bullets and may add roles/projects).
2. xG visual assets; confirmation to use glue.is / dashgen.in screenshots.
3. Two short personal paragraphs (or raw facts) for About.
4. Optional real testimonials (skip section if none).
5. Confirmation of the "reply within two days" contact promise.
6. Updated resume PDF if the current one is stale.

None of these block Phases 0-4; slots are structured so content drops in without design changes.
