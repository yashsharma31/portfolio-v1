"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.37, 0, 0.63, 1] as const;

const LAYERS = [0.7, 0.55, 0.85, 0.4];
const HANDLES: [number, number][] = [
  [28, 110],
  [60, 20],
  [120, 70],
  [180, 120],
  [212, 40],
];

/**
 * Abstract browser-frame canvas editor: toolbar glyphs, bezier artboard with
 * handle dots, layers panel. Echoes the hero illustration's editor motifs.
 */
export default function GlueCanvasVisual() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="flex h-full bg-page">
      {/* Left toolbar */}
      <div className="flex w-9 shrink-0 flex-col items-center gap-2.5 border-r border-line bg-elevated py-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={
              i === 2
                ? "flex h-5 w-5 items-center justify-center rounded border border-accent/50 bg-accent-glow"
                : "flex h-5 w-5 items-center justify-center rounded border border-line"
            }
          >
            {i === 0 && <span className="h-2 w-2 rounded-sm border border-ink-tertiary" />}
            {i === 1 && <span className="h-px w-2.5 bg-ink-tertiary" />}
            {i === 2 && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 8C3 2 7 2 9 8" stroke="var(--color-accent)" strokeWidth="1.2" />
              </svg>
            )}
            {i === 3 && <span className="h-2 w-2 rounded-full border border-ink-tertiary" />}
            {i === 4 && <span className="h-2 w-2 bg-ink-tertiary/50" />}
          </div>
        ))}
      </div>

      {/* Center artboard */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-subtle">
        <div className="absolute inset-4 rounded border border-line bg-page/40" />
        <svg
          viewBox="0 0 240 140"
          className="relative h-[70%] w-[85%]"
          fill="none"
        >
          <line x1="0" y1="70" x2="240" y2="70" stroke="var(--color-line)" strokeWidth="1" />
          <line x1="120" y1="0" x2="120" y2="140" stroke="var(--color-line)" strokeWidth="1" />
          <path
            d="M28 110 C 60 20, 100 20, 120 70 S 180 120, 212 40"
            stroke="var(--color-accent)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <line x1="28" y1="110" x2="60" y2="20" stroke="var(--color-line-strong)" strokeWidth="1" />
          <line x1="212" y1="40" x2="180" y2="120" stroke="var(--color-line-strong)" strokeWidth="1" />
          {HANDLES.map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={i === 2 ? 4 : 3}
              fill={i === 2 ? "var(--color-accent)" : "var(--color-elevated)"}
              stroke="var(--color-accent-soft)"
              strokeWidth="1.25"
              initial={false}
              animate={
                reduce ? undefined : { transform: ["translateY(0px)", "translateY(-2px)", "translateY(0px)"] }
              }
              transition={{
                duration: 2.6 + i * 0.15,
                repeat: Infinity,
                ease: EASE,
                delay: i * 0.12,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Right layers panel */}
      <div className="flex w-[28%] shrink-0 flex-col border-l border-line bg-elevated">
        <div className="border-b border-line px-2.5 py-2">
          <div className="h-1.5 w-10 rounded-full bg-line-strong" />
        </div>
        <div className="flex flex-col gap-0.5 p-1.5">
          {LAYERS.map((w, i) => (
            <div
              key={i}
              className={
                i === 1
                  ? "flex items-center gap-2 rounded bg-subtle px-2 py-1.5"
                  : "flex items-center gap-2 rounded px-2 py-1.5"
              }
            >
              <span
                className={
                  i === 1
                    ? "h-2.5 w-2.5 rounded-sm bg-accent/70"
                    : "h-2.5 w-2.5 rounded-sm border border-line-strong"
                }
              />
              <span
                className="h-1.5 rounded-full bg-line-strong"
                style={{ width: `${w * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
