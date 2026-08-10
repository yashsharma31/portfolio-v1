"use client";

import { useReducedMotion } from "motion/react";
import type { YearTotal } from "@/utils/githubStats";
import { cn } from "@/utils/cn";

type Props = {
  years: YearTotal[];
  play: boolean;
  peakYear?: number;
};

export default function YearChart({ years, play, peakYear }: Props) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...years.map((y) => y.count));

  return (
    <div data-proof-year-chart className="flex flex-col gap-4" role="list">
      {years.map((y, i) => {
        const pct = Math.max(4, Math.round((y.count / max) * 100));
        const isPeak = y.year === peakYear;
        return (
          <div
            key={y.year}
            role="listitem"
            className="grid grid-cols-[3.5rem_1fr_4rem] items-center gap-3"
          >
            <span
              className={cn(
                "font-mono text-xs tabular",
                isPeak ? "text-accent-soft" : "text-ink-tertiary"
              )}
            >
              {y.year}
            </span>
            <div
              className="relative h-3 overflow-hidden rounded-xs bg-subtle"
              aria-hidden
            >
              <div
                className="h-full rounded-xs origin-left"
                style={{
                  width: play || reduce ? `${pct}%` : "0%",
                  background: isPeak
                    ? "var(--color-accent)"
                    : "color-mix(in srgb, var(--color-accent) 72%, var(--color-subtle))",
                  transition:
                    reduce || !play
                      ? undefined
                      : `width 800ms var(--ease-out) ${120 + i * 90}ms`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-right font-mono text-xs tabular",
                isPeak ? "text-ink" : "text-ink-secondary"
              )}
            >
              {y.count.toLocaleString("en-US")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
