"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.37, 0, 0.63, 1] as const;

const BARS = [0.45, 0.7, 0.55, 0.9, 0.35, 0.65, 0.8];
const ROWS = [0.72, 0.55, 0.88, 0.4, 0.62];

/**
 * Abstract browser-frame evaluation platform: table skeleton, grading bars,
 * GPA numeral, OCR panel with scan-line. Idle Motion only.
 */
export default function TruEnrollVisual() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="grid h-full grid-cols-12 gap-3 bg-page p-4 md:p-5">
      {/* Table + grading */}
      <div className="col-span-7 flex flex-col gap-3">
        <div className="flex-1 space-y-0 overflow-hidden rounded-lg border border-line bg-elevated">
          <div className="flex gap-3 border-b border-line px-3 py-2">
            <div className="h-1.5 w-8 rounded-full bg-line-strong" />
            <div className="h-1.5 w-12 rounded-full bg-line" />
            <div className="ml-auto h-1.5 w-6 rounded-full bg-line" />
          </div>
          {ROWS.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
            >
              <div className="h-1.5 rounded-full bg-line-strong" style={{ width: `${w * 40}%` }} />
              <div className="h-1.5 w-[18%] rounded-full bg-line" />
              <div className="ml-auto h-1.5 w-8 rounded-full bg-line" />
            </div>
          ))}
        </div>

        {/* Grading-scale bar chart */}
        <div className="flex h-16 items-end gap-1.5 rounded-lg border border-line bg-elevated px-3 py-2.5">
          {BARS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-accent/80"
              style={{ height: `${h * 100}%`, opacity: 0.45 + h * 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* GPA + OCR */}
      <div className="col-span-5 flex flex-col gap-3">
        <div className="flex flex-col items-start justify-center rounded-lg border border-line bg-elevated px-4 py-3">
          <div className="mb-1 h-1 w-6 rounded-full bg-line" />
          <span className="tabular font-mono text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            3.8
          </span>
          <div className="mt-2 h-0.5 w-10 rounded-full bg-accent/60" />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-lg border border-line bg-elevated">
          <div className="space-y-2 p-3">
            <div className="h-1.5 w-3/5 rounded-full bg-line-strong" />
            <div className="h-1.5 w-4/5 rounded-full bg-line" />
            <div className="h-1.5 w-2/5 rounded-full bg-line" />
            <div className="mt-3 h-12 rounded border border-dashed border-line-strong bg-subtle/60" />
            <div className="h-1.5 w-3/4 rounded-full bg-line" />
            <div className="h-1.5 w-1/2 rounded-full bg-line" />
          </div>
          {/* OCR scan-line (transform only; % is relative to this full-height wrapper) */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-full"
            animate={
              reduce
                ? undefined
                : {
                    transform: [
                      "translateY(-42%)",
                      "translateY(42%)",
                      "translateY(-42%)",
                    ],
                  }
            }
            transition={{ duration: 3.6, repeat: Infinity, ease: EASE }}
          >
            <div
              className="absolute top-1/2 h-px w-full bg-accent/70"
              style={{ boxShadow: "0 0 8px var(--color-accent-glow)" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
