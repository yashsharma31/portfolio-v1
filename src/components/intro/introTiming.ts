/** Shared intro choreography timings (PRD-loading-screen C1 tackle). */

export const INTRO = {
  /** Center cluster idle breath */
  idle: 400,
  /** Striker rises from below and hits the cluster */
  strike: 550,
  /** Freeze so the hit reads */
  impact: 80,
  /** Radial explode across the viewport */
  spread: 700,
  /** Cover slide up to open the portfolio */
  exit: 850,
  hardTimeout: 4500,
  /** Hero CSS starts at slide start (under the moving cover). */
  heroOverlap: 0,
} as const;

export const INTRO_CRAFT_MS =
  INTRO.idle + INTRO.strike + INTRO.impact + INTRO.spread;
