"use client";

import IntroCluster from "./IntroCluster";
import { INTRO } from "./introTiming";

type IntroCoverProps = {
  exiting: boolean;
  onSkip: () => void;
};

/**
 * Intro cover shell (PRD-loading-screen).
 * Same tackle story on all viewports. Exit = curtain slide up.
 */
export default function IntroCover({ exiting, onSkip }: IntroCoverProps) {
  return (
    <div
      data-intro-cover
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      className="fixed inset-0 bg-page"
      style={{
        zIndex: "var(--z-overlay)",
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        pointerEvents: exiting ? "none" : "auto",
        transitionProperty: "transform",
        transitionDuration: `${INTRO.exit}ms`,
        transitionTimingFunction: "var(--ease-in-out)",
        willChange: "transform",
      }}
    >
      <span className="sr-only">Starting</span>

      <div data-intro-stage className="absolute inset-0">
        <IntroCluster exiting={exiting} />
      </div>

      {!exiting && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute bottom-6 right-6 font-mono text-xs tracking-wide text-ink-tertiary transition-colors duration-200 hover:text-ink-secondary active:scale-[0.97]"
          style={{ zIndex: 1 }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
