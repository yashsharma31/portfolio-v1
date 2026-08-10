/**
 * Intro gate contract (PRD-loading-screen L0+).
 * Module singleton — never mirrored into React state for scroll/RAF.
 * Anchored on globalThis so HMR cannot split the singleton.
 *
 * Persistence: every full reload shows the intro (owner override).
 * Test-only bypass via sessionStorage key below — never set in product code.
 */

/** Playwright / QA only. Product code must not write this key. */
export const INTRO_TEST_BYPASS_KEY = "ember-intro-bypass";

export type IntroPhase =
  | "idle"
  | "armed"
  | "assembling"
  | "exiting"
  | "gone"
  | "skipped";

type IntroControl = {
  phase: IntroPhase;
  /** L1+: organism intro assemble progress 0→1 (unused in L0). */
  assemble: number;
};

const g = globalThis as typeof globalThis & {
  __emberIntroControl?: IntroControl;
};

export const introControl: IntroControl =
  g.__emberIntroControl ??
  (g.__emberIntroControl = { phase: "idle", assemble: 0 });

/** Test harness only — product never sets this. */
export function hasIntroTestBypass(): boolean {
  try {
    return sessionStorage.getItem(INTRO_TEST_BYPASS_KEY) === "1";
  } catch {
    return false;
  }
}

/** Deep links must never trap the visitor behind the cover. */
export function isDeepLinkHash(hash: string): boolean {
  if (!hash || hash === "#" || hash === "#top") return false;
  return hash.startsWith("#");
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setIntroAttr(value: "pending" | "exiting" | "done"): void {
  document.documentElement.setAttribute("data-intro", value);
}

export function pauseLenis(): void {
  const lenis = (window as Window & { __lenis?: { stop: () => void } }).__lenis;
  lenis?.stop();
}

export function resumeLenis(): void {
  const lenis = (window as Window & { __lenis?: { start: () => void } })
    .__lenis;
  lenis?.start();
}
