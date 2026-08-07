"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.37, 0, 0.63, 1] as const;

const PULSE_RINGS = [
  { opacity: [0.5, 0, 0.5] as const, scale: ["scale(0.65)", "scale(1.25)", "scale(0.65)"] as const, delay: 0 },
  { opacity: [0.4, 0, 0.4] as const, scale: ["scale(0.75)", "scale(1.35)", "scale(0.75)"] as const, delay: 0.4 },
  { opacity: [0.3, 0, 0.3] as const, scale: ["scale(0.85)", "scale(1.45)", "scale(0.85)"] as const, delay: 0.8 },
];

/**
 * Abstract phone-frame credential wallet: status hint, overlapping card stack,
 * large NFC pulse zone, bottom action pill. Idle Motion only.
 */
export default function TruWalletVisual() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="relative flex h-full flex-col bg-page px-4 pb-4 pt-3">
      {/* Status-bar hint */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="h-1 w-6 rounded-full bg-line-strong" />
        <div className="h-1 w-8 rounded-full bg-line" />
        <div className="flex gap-0.5">
          <div className="h-1 w-2 rounded-full bg-line-strong" />
          <div className="h-1 w-1.5 rounded-full bg-line" />
        </div>
      </div>

      <div className="mb-5 space-y-2 px-1">
        <div className="h-2 w-16 rounded-full bg-line-strong" />
        <div className="h-1.5 w-28 rounded-full bg-line" />
      </div>

      {/* Overlapping credential stack */}
      <div className="relative mx-auto w-full max-w-[196px] shrink-0" style={{ height: 132 }}>
        <div
          className="absolute inset-x-0 top-0 h-[108px] rounded-xl border border-line bg-elevated opacity-40"
          style={{ transform: "translate(10px, 0) rotate(3deg)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[108px] rounded-xl border border-line bg-subtle opacity-65"
          style={{ transform: "translate(5px, 8px) rotate(1.5deg)" }}
        />
        <motion.div
          className="absolute inset-x-0 top-0 h-[108px] rounded-xl border border-line-strong bg-elevated p-3.5"
          style={{ transform: "translateY(16px)" }}
          animate={
            reduce
              ? undefined
              : { transform: ["translateY(16px)", "translateY(13px)", "translateY(16px)"] }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: EASE }}
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="space-y-1.5 pt-0.5">
              <div className="h-1.5 w-14 rounded-full bg-line-strong" />
              <div className="h-1 w-10 rounded-full bg-line" />
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/40 bg-accent-glow">
              <div className="h-3 w-3 rounded-sm bg-accent/80" />
            </div>
          </div>
          <div className="space-y-1.5 pt-4">
            <div className="h-1.5 w-3/4 rounded-full bg-line-strong" />
            <div className="h-1.5 w-1/2 rounded-full bg-line" />
          </div>
          <div className="mt-3 flex gap-1">
            <div className="h-1 w-5 rounded-full bg-line" />
            <div className="h-1 w-5 rounded-full bg-line" />
            <div className="h-1 w-7 rounded-full bg-line" />
          </div>
        </motion.div>
      </div>

      {/* NFC pulse zone (64px) */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          {!reduce &&
            PULSE_RINGS.map((ring, i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full border border-accent/40"
                animate={{ opacity: [...ring.opacity], transform: [...ring.scale] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: EASE, delay: ring.delay }}
              />
            ))}
          {reduce && (
            <>
              <span className="absolute inset-0 rounded-full border border-accent/30" />
              <span className="absolute inset-2 rounded-full border border-accent/20" />
            </>
          )}
          <span className="absolute inset-[18%] rounded-full border border-accent/50" />
          <span className="h-3.5 w-3.5 rounded-full bg-accent/75" />
        </div>
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" className="mt-3 text-ink-tertiary">
          <circle cx="14" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M7 22c1.5-4 4-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path
            d="M14 7.5V5M10 9l-1.5-1.5M18 9l1.5-1.5"
            stroke="var(--color-accent-soft)"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Bottom action pill */}
      <div className="mt-1 flex justify-center">
        <div className="flex h-10 w-full max-w-[196px] items-center justify-center gap-2 rounded-full border border-line bg-elevated">
          <div className="h-2 w-2 rounded-full bg-accent/70" />
          <div className="h-1.5 w-16 rounded-full bg-line-strong" />
        </div>
      </div>
    </div>
  );
}
