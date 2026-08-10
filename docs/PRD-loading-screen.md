# PRD Addendum: Loading / Starting Screen ("First Ember")

**Owner:** Yash Sharma
**Status:** Owner decisions locked Aug 2026. **L0–L2 done** (center tackle → spread → slide-up curtain). Amends `docs/PRD.md` (motion 3.5, z-scale 3.3, hero 6.1) and `docs/PRD-background-organism.md` (S0 hero scene).
**Date:** Aug 2026
**Design read:** *a craft-forward portfolio opening credit for hiring managers and design-engineers, in the existing ember-particle language, not a generic spinner and not a 4-second Awwwards hostage.*

### Owner locks (Section 8 — closed)

| Decision | Lock |
|---|---|
| Primary concept | **C1 Ember Birth** (tackle story) |
| Mark | **Abstract ember cluster** + striker from below |
| Mobile | **Same tackle story** (fewer particles; no separate wipe) |
| Skip control | **Visible `Skip` after craft starts + `Escape`** |
| Persistence | **Every full reload** (no session skip; test bypass key only) |

---

## 0. How to use this document (for AI agents)

1. Read this file + `docs/PRD.md` Sections 1, 3.5, 6.1 and `docs/PRD-background-organism.md` before writing code.
2. Load skills before implementation:
   - `taste-skill/SKILL.md` (anti-slop, copy, pre-flight)
   - `emil-design-eng/SKILL.md` + `animate/SKILL.md` (motion gate, tool pick, curves)
   - `find-animation-opportunities/SKILL.md` Gate (frequency / purpose / speed / reduced-motion) as the acceptance filter
3. Do not invent a second WebGL engine. The starting screen must reuse `EmberField` / Pixi v8 or stay CSS/DOM.
4. Copy rules from main PRD remain absolute (zero em-dashes, no hype verbs).
5. Concept and Section 8 locks are closed (C1 tackle + Skip/Escape + every reload). Build in phase order L0→L3.

---

## 1. Problem and why it exists

### 1.1 Current state

On first paint the site mounts:

1. `EmberFieldMount` (Pixi organism, cold-start + hero portrait sampling)
2. Navbar + hero CSS entrance (`.hero-line-inner` / `.hero-fade`)
3. Grain overlay, Lenis, fonts

There is **no gate**. Visitors can see a half-warmed canvas, a hero reveal that starts before particles exist, and a brief "empty dark page" flash while Pixi initializes. That is the only legitimate reason for a starting screen.

### 1.2 Job of the starting screen

Name the purpose in animate-skill terms (required):

| Purpose | How this feature uses it |
|---|---|
| **Preventing a jarring change** | Hide cold Pixi / font / hero-art flash |
| **Explanation** (marketing-tier, rare) | Opening credit that proves the craft language before the hero copy |
| **Delight** | Allowed on each reload while craft is being tuned; revisit frequency later if it fatigues |

If the page is ready in under ~400ms and Pixi is warm (or skipped), **the starting screen must not show**. A loader that invents wait is a defect.

### 1.3 Non-goals

- No circular spinner, no indeterminate ring, no "Loading…" with a bouncing ellipsis.
- No forced 2–6s intro when assets are already ready (Hon Tran / Monotonomo 2026: slow loads disguised as art direction are a usability penalty).
- No second Pixi `Application`, no three.js, no Barba page router for a single-page site.
- No audio, no "press to enter" gate (extra friction for recruiters).
- No progress theater that lies (fake 0→100 while nothing is loading).
- No Mario / 8-bit theme park. Pixel language here means **ember particles and grid cells**, not nostalgia costume.

---

## 2. Product requirements (locked constraints)

### 2.1 When it runs

| Condition | Behavior |
|---|---|
| Full page load / reload | Show |
| Test bypass `ember-intro-bypass=1` | Skip (Playwright only) |
| `prefers-reduced-motion: reduce` | Skip choreography |
| WebGL unavailable / organism disabled | Skip; page paints normally |
| Deep link to `#projects`, `#contact`, etc. | Skip (never trap anchored entry) |

### 2.2 Timing budget (hard)

Grounded in 2026 motion research (Monotonomo motion budget; splash production patterns):

| Budget | Value | Rationale |
|---|---|---|
| Max total intro choreography | **900–1200ms** wall clock | Opening credit tier; still under "feels stuck" |
| Cap of all *other* first-viewport motion after handoff | **≤800ms** including existing hero CSS | Hero rise is already 600ms + 200ms delay |
| Single phase max | **500ms** | Nothing over 500ms feels sluggish |
| Min show time (if shown) | **800ms** (L0 solid; L1+ may use 400–600ms once craft fills the time) | Avoid flicker; keeps Skip (600ms) hittable |
| Exit wipe / dissolve | **300–450ms**, `--ease-in-out` | Spatial handoff into hero |
| Hard timeout | **2500ms** | Always release; never stuck overlay |

**Handoff rule:** hero CSS entrance (`.hero-*`) starts **as the cover exits**, not after a dead pause. Overlap 100–150ms so the eye never hits a static frame (Codrops / Hanenkamp pattern: loader lift and hero settle share the timeline).

### 2.3 Readiness signals (real, not fake)

The intro may wait on the **union** of:

1. `document.fonts.ready` (Satoshi + JetBrains)
2. Hero art decode: `HeroVisual` / portrait image `decode()` or `complete`
3. Ember organism "warm" signal: first successful Pixi tick **or** explicit `fieldControl.ready = true` after pool init (module object, not React state)
4. Optional: `requestAnimationFrame` double-rAF so first paint of the cover itself is committed

Exit when: `(all critical ready OR hard timeout) AND minShowElapsed`.

Progress UI (if any) must map to **real** fractions of the above, or show **no** percentage.

### 2.4 Accessibility and interaction

- Overlay is `role="status"` with `aria-live="polite"` and a short label (`"Starting"` / brand mark only). No assertive spam.
- `aria-hidden="true"` on page content while covered; restore on exit; **remove overlay from DOM** after exit (not just `display:none`).
- Body scroll locked while visible (`overflow: hidden` on `html`); Lenis paused; unlock on exit.
- Focus: move focus to `#top` / skip-link target on exit; never trap Tab inside a non-interactive cover.
- Skip control: optional small mono `Skip` (bottom-right, ink-tertiary) after 600ms. Keyboard: `Escape` skips.
- Color contrast: mark/text on `--color-page` uses `--color-ink` or `--color-accent-soft` only.

### 2.5 Performance

- Cover layer is DOM + CSS (`transform` / `opacity` only) **or** a formation mode on the **existing** EmberField. No new heavy chunk on the critical path beyond what organism already loads.
- Cap DPR as organism already does (`≤1.5`).
- Intro must not delay LCP of the hero headline (headline stays in SSR HTML; cover sits above).
- After exit: zero ongoing RAF cost from the intro module.

### 2.6 Design system compliance

- Colors: only tokens from PRD 3.1 / `globals.css`.
- Type: Satoshi for any wordmark; JetBrains Mono for counters / status.
- Z-index: intro uses `--z-overlay` (50), under grain (60) so grain still reads as site skin; nav stays hidden or fades in on handoff (nav must not flash above the cover mid-intro).
- Motion tokens: `--ease-out`, `--ease-in-out`, existing `DUR` / CSS vars. No new easings.
- Library separation: Motion **or** CSS for DOM cover; Pixi only via EmberField; no GSAP for the intro (GSAP reserved for scroll chapters).

---

## 3. Visual language: "pixels of what we can do"

This site's pixels are not 8-bit sprites. They are the **ember particle vocabulary** already shipping:

| Pixel material | Source of truth | Intro use |
|---|---|---|
| Soft-dot particles (ember ramp) | `EmberField` `EMBER_RAMP` | Assemble / disperse / birth |
| Portrait sample grid | Hero scene `HERO_GRID_COLS` | Resolve from coarse → fine, or birth from portrait |
| Year / digit formations | `digitFormations.ts` | Optional counter glyphs |
| Proof lattice cells | ProofBar motif | Optional grid wipe |
| Disperse dust | Between-scene state | Start state and exit state |

**Brand test for the cover:** if you remove the nav and the hero copy, the first 800ms must still feel like *this* portfolio (ember + dark zinc + Satoshi/mono), not a template preloader.

---

## 4. Concept matrix (owner picks one)

Scores: **Fit** (on-brand), **Craft proof** (shows Yash's edge), **Risk** (perf / a11y / complexity), **Recruiter cost** (does it slow the hire funnel). Higher Fit/Craft is better; higher Risk/Cost is worse.

### C1 — Ember Birth (recommended default)

**Beat sheet**

1. Full-viewport `--color-page` cover.
2. Disperse dust (organism already knows this state) gathers for ~500–700ms into a centered mark: monogram `YS` **or** a single ember cluster the size of the eventual portrait core.
3. Hold 120–180ms (one breath).
4. Mark dissolves / expands into the hero portrait formation while the DOM cover opacity goes 1→0 (300–400ms).
5. Hero CSS lines rise in overlap; nav fades in.

**Why it wins:** reuses organism + S0 handoff language; proves the canvas craft in the first second; no fake progress.

| Fit | Craft | Risk | Cost |
|---|---|---|---|
| 9 | 10 | 4 | 3 |

### C2 — Digit Warm Count

Mono tabular counter `00`→`100` built from the same digit particle formations used in Experience years. Counter maps to real readiness (fonts 25%, image 40%, pixi 35%). At 100, digits shatter into disperse, cover lifts.

| Fit | Craft | Risk | Cost |
|---|---|---|---|
| 8 | 9 | 5 | 4 |

**Reject if:** readiness is usually instant (counter becomes theater). Prefer C1 unless warm times regularly exceed ~800ms on mid phones.

### C3 — Pixel Curtain (grid wipe)

CSS or canvas grid of ~24×14 cells (accent / ink / page). Cells flip or scale-out in a diagonal wipe revealing the already-mounted hero. No Pixi dependency for the wipe itself; organism warms underneath.

| Fit | Craft | Risk | Cost |
|---|---|---|---|
| 7 | 6 | 3 | 3 |

**Good as:** reduced-complexity fallback or mobile variant of C1.

### C4 — Word Pulse (Snellenberg-style)

Centered mono/Satoshi words cycle: `canvas` → `editors` → `interfaces` → name mark, then SVG/CSS curtain exits. Classic Awwwards intro.

| Fit | Craft | Risk | Cost |
|---|---|---|---|
| 5 | 4 | 3 | 5 |

**Rejected as primary:** generic creative-dev trope by 2026; does not use the ember language; spends delight budget on text the hero already says.

### C5 — Portrait Pixelate → Sharp

Hero image starts heavily pixelated (`image-rendering: pixelated` or canvas downsample) and resolves to full fidelity as decode + organism warm complete, then cover dies.

| Fit | Craft | Risk | Cost |
|---|---|---|---|
| 8 | 8 | 4 | 3 |

**Compatible** as a **phase inside C1** (birth ends as portrait sharpen). Do not ship as a standalone long zoom.

### C6 — Silent First Paint (no intro)

No overlay. Skeleton-safe SSR hero + organism fades in via existing alpha lerp.

| Fit | Craft | Risk | Cost |
|---|---|---|---|
| 6 | 2 | 1 | 1 |

**Required behavior** when skip conditions hit. Also the correct product if owner decides any intro is too much.

### Explicitly rejected concepts

| Concept | Why rejected |
|---|---|
| Indeterminate CSS spinner | Taste-skill ban; proves nothing |
| Full-screen video splash | LCP / bandwidth tax; not on-system |
| "Click to enter" | Recruiter friction |
| 3–6s cinematic forced hold | Research + animate gate: usability penalty |
| Second WebGL / three.js preloader | Breaks organism single-canvas rule |
| Fake progress to 100% | Dishonest state indication |
| 8-bit Mario / game HUD | Off-brand costume |

---

## 5. Recommended product: C1 Ember Birth (spec)

### 5.1 Experience summary

Opening credit on every full reload: embers assemble into a mark, dissolve into the living hero organism, and the existing hero typography entrance plays through the exit. Total wall time target **~1.0s** on a warm cache, **≤2.5s** hard stop on cold.

### 5.2 Copy (if any)

**No visible wordmark.** The mark is an abstract ember cluster only.

- Optional mono status: `Starting` (visible in L0 so the cover is not a blank same-color pause; L1 may demote to sr-only once the cluster reads)
- Visible control: mono `Skip` (available for the full cover duration)

Banned on the cover: taglines, "Welcome", "Please wait", role strings, fake percentages, `YS`, `Yash`.

### 5.3 Choreography (locked values)

| Phase | Duration | What happens |
|---|---|---|
| Idle | 400ms | Dense ember cluster already at viewport center |
| Strike | 550ms | Larger accent dot rises from below and hits the cluster |
| Impact | 80ms | Brief freeze / flash so the tackle reads |
| Spread | 700ms | Particles explode radially across the viewport |
| Slide open | 850ms | Cover `translateY(0 → -100%)`; hero CSS starts at slide start |

Reduced motion / deep link: skip the whole sequence.

Mobile: **same tackle story** (fewer particles under 1024px). No separate wipe.

### 5.4 Engineering sketch

```
src/components/intro/
  IntroGate.tsx          // client: skip logic, session, a11y, timeout
  IntroCover.tsx         // DOM cover + Skip + reduced-motion path
src/components/background/
  fieldControl.ts        // add ready + introPhase signals (module object)
  EmberField.tsx         // scene: "intro" formation → handoff to "hero"
```

Mount `IntroGate` in `layout.tsx` beside `EmberFieldMount`, z-overlay.

**State machine (module, not React render storm):**

`idle → armed → assembling → exiting → gone | skipped`

React only mirrors `visible` boolean for mounting the cover.

### 5.5 Handoff contract with hero

1. SSR still renders hero text (SEO + LCP).
2. While intro visible: hero text stays visually covered; CSS animations **do not start** until `data-intro="done"` on `html` (or class `intro-done`).
3. On exit start: set `intro-done`, hero keyframes run, nav opacity 0→1 in 200ms.
4. Organism: `intro` formation progress 1.0 crossfades targets into existing `hero` portrait samples (no pool destroy).

### 5.6 Analytics (optional)

One event: `intro_completed` with `{ durationMs, skippedReason }`. No PII.

---

## 6. Acceptance criteria

### Must

- [ ] Skip on reduced motion, deep links, session replay, WebGL fail, and sub-400ms ready+minShow collapse
- [ ] Hard timeout releases overlay by 2500ms always
- [ ] Overlay removed from DOM after exit
- [ ] Scroll unlock + Lenis resume + focus moved to content
- [ ] No second Pixi application
- [ ] Only design tokens; no new accent hues
- [ ] Escape and optional Skip work
- [ ] Lighthouse mobile: LCP still < 2.5s target from main PRD; INP < 200ms
- [ ] e2e: first load can assert cover appears then disappears; second load in same context skips; `#contact` deep link never traps

### Must not

- [ ] No spinner
- [ ] No forced multi-second hold on warm cache
- [ ] No `window` scroll listeners
- [ ] No em-dash copy
- [ ] No blocking of skip-to-content forever (skip-to-content remains reachable or intro auto-clears)

---

## 7. Build phases (only after owner locks concept)

### L0 — Gate skeleton (no craft) — **done**

`IntroGate` + solid cover + readiness + timeout + session skip + a11y. Hero CSS gated on `intro-done`. e2e skip/timeout paths.

### L1 — C1 assemble — **done** (superseded by tackle)

Canvas-2d ember cluster (`IntroCluster`): idle → strike → impact → spread. Same ember ramp as the organism. Not a second Pixi app.

### L2 — Mobile / reduced path — **done**

Mobile shares the tackle story (fewer particles). Cover exit is `translateY(-100%)` slide-up. Reduced-motion / deep-link skip hardened.

### L3 — Polish

Overlap timing with hero CSS, Skip control, analytics, Lighthouse pass, screenshot loop (desktop + Pixel 7).

---

## 8. Owner decisions (locked)

1. **Primary concept:** C1 Ember Birth
2. **Mark:** abstract ember cluster
3. **Mobile:** same tackle story (no wipe)
4. **Skip control:** visible `Skip` + `Escape`
5. **Persistence:** every full reload (no session-once)

---

## 9. Research spine (why these numbers)

| Source | Takeaway applied here |
|---|---|
| Monotonomo, *2026 Motion Budget* | Cap first-viewport motion; purpose-gated animation; CSS over JS when possible; reduced-motion required |
| Hon Tran, award portfolio playbook | Slow loaders disguised as intros lose usability score; fundamentals before gimmick |
| Splash / preloader production patterns | Two-layer cover + content; min show + real ready; remove from a11y tree; skip if <200–400ms |
| Codrops cinematic preloaders (2026) | Treat wait as opening credits; seamless zoom/handoff into first page; shorten mobile transitions |
| Mathijs Hanenkamp case study | One timeline: loader, cover lift, hero settle overlapped |
| Animate + find-animation-opportunities skills | Frequency = rare → delight allowed; still needs named purpose; transform/opacity only |
| Existing PRD / Ember organism | Single Pixi canvas; disperse/assemble vocabulary; hero already has CSS entrance |

---

## 10. One-line verdict

**Ship an every-reload Ember Birth cover (center idle → striker tackle → spread → slide-up curtain) that waits on real readiness, Skip/Escape to bail, and opens into the hero — or ship nothing under reduced-motion / deep links.**
