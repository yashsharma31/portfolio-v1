import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { organismState, type OrganismScene } from "./organismState";

gsap.registerPlugin(ScrollTrigger);

type Anchor = {
  el: Element;
  scene: OrganismScene;
};

function qs(sel: string): Element | null {
  return document.querySelector(sel);
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/** True if the element's vertical extent overlaps the middle 40% of the viewport. */
function occupiesCenterBand(rect: DOMRect, vh: number): boolean {
  const bandTop = vh * 0.3;
  const bandBot = vh * 0.7;
  return rect.bottom > bandTop && rect.top < bandBot;
}

/**
 * How strongly a section owns the viewport middle band.
 * Uses visible overlap (not section-center distance) so tall sections
 * like Experience still win while their top is on screen.
 */
function visibilityScore(rect: DOMRect, vh: number): number {
  const bandTop = vh * 0.22;
  const bandBot = vh * 0.78;
  const bandH = bandBot - bandTop;
  const overlapTop = Math.max(rect.top, bandTop);
  const overlapBot = Math.min(rect.bottom, bandBot);
  const overlap = Math.max(0, overlapBot - overlapTop);
  return smoothstep(overlap / bandH);
}

/** Hero dissolve progress — matches retired HeroCanvas curve. */
function heroDissolveP(vh: number): number {
  return Math.min(Math.max(window.scrollY / (vh * 0.65), 0), 1);
}

function gatherAnchors(): {
  ai: Element | null;
  work: Element | null;
  top: Element | null;
  motifs: Anchor[];
} {
  const ai = qs("#ai") ?? qs("[data-ai-pinned]");
  const work =
    qs("#work") ??
    qs("#projects") ??
    qs('[aria-label="Selected work"]');
  const top = qs("#top");

  const motifs: Anchor[] = [];
  const proof = qs("[data-proof-bar]") ?? qs("[data-proof-ribbon]");
  if (proof) motifs.push({ el: proof, scene: "proof" });

  const lab = qs("[data-lab-grid]") ?? qs("#lab");
  if (lab) motifs.push({ el: lab, scene: "lab" });

  // Prefer the section (tall) so Experience keeps ownership while reading entries;
  // rail alone scores low when only its top edge is in the band.
  const experience = qs("#experience") ?? qs("[data-experience-rail]");
  if (experience) motifs.push({ el: experience, scene: "experience" });

  const writing = qs("[data-writing]") ?? qs("#blog");
  if (writing) motifs.push({ el: writing, scene: "writing" });

  const about =
    qs("img[data-about-portrait]")?.closest("#about") ?? qs("#about");
  if (about) motifs.push({ el: about, scene: "about" });

  // Score the section (large), not the CTA — formation still targets the button.
  const contact = qs("#contact");
  if (contact) motifs.push({ el: contact, scene: "contact" });

  return { ai, work, top, motifs };
}

function recompute() {
  const vh = window.innerHeight;
  const { ai, work, top, motifs } = gatherAnchors();

  if (ai) {
    const r = ai.getBoundingClientRect();
    const score = visibilityScore(r, vh);
    if (occupiesCenterBand(r, vh) && score > 0.35) {
      // Formations scrub from journeyScrub.progress (GSAP → EmberField ticker).
      organismState.scene = "ai";
      organismState.progress = score;
      return;
    }
  }

  if (work) {
    const r = work.getBoundingClientRect();
    const score = visibilityScore(r, vh);
    // Work is tall+pinned; require solid band ownership so Proof above it can win.
    if (occupiesCenterBand(r, vh) && score > 0.55 && r.top < vh * 0.35) {
      organismState.scene = "dormant";
      organismState.progress = score;
      return;
    }
  }

  // Hero owns while dissolve is incomplete — proof must not steal the top.
  const dissolveP = heroDissolveP(vh);
  if (dissolveP < 1) {
    const topScore = top
      ? visibilityScore(top.getBoundingClientRect(), vh)
      : 0;
    if (window.scrollY < vh * 0.65 || topScore > 0.2) {
      organismState.scene = "hero";
      organismState.progress = dissolveP;
      return;
    }
  }

  let best: OrganismScene = "disperse";
  let bestScore = 0;

  for (let i = 0; i < motifs.length; i++) {
    const { el, scene } = motifs[i];
    const r = el.getBoundingClientRect();
    if (r.height < 1 && r.width < 1) continue;
    const score = visibilityScore(r, vh);
    if (score > bestScore) {
      bestScore = score;
      best = scene;
    }
  }

  if (bestScore < 0.22) {
    organismState.scene = "disperse";
    organismState.progress = 1;
    return;
  }

  organismState.scene = best;
  organismState.progress = bestScore;
}

/**
 * Desktop choreography driver. Writes organismState from scroll/resize.
 * Call once from EmberField on lg+; returns cleanup.
 */
export function startSceneController(): () => void {
  recompute();

  const onScroll = () => recompute();
  const onResize = () => recompute();
  const onRefresh = () => recompute();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  ScrollTrigger.addEventListener("refresh", onRefresh);

  // Lenis may drive scroll without native events; poll every other frame.
  let frames = 0;
  let raf = 0;
  const tick = () => {
    frames++;
    if (frames % 2 === 0) recompute();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
  };
}
