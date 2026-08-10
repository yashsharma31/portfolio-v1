"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SHIPPING_SINCE } from "@/data/experience";
import { GITHUB_CONTRIBUTION_USERS } from "@/utils/constants";
import {
  fetchMergedContributions,
  type ContributionDay,
} from "@/utils/githubContributions";
import {
  activeDayCount,
  currentStreak,
  lastNWeeks,
  lastYears,
  peakYear,
  sumYears,
  type YearTotal,
} from "@/utils/githubStats";
import ContributionRibbon from "@/components/proof/ContributionRibbon";
import YearChart from "@/components/proof/YearChart";
import { cn } from "@/utils/cn";

/**
 * GitHub proof panel under the hero.
 * Merged personal + work calendars: 52-week ribbon, year bars, mono metrics.
 */

const WEEKS = 52;
const YEAR_SPAN = 4;

type Stats = {
  years: YearTotal[];
  streak: number;
  weeks: ContributionDay[][];
  fourYearTotal: number;
  daysActive: number;
  peak: YearTotal | null;
};

function useCountUp(target: number, play: boolean, ms = 800) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const safeTarget = Number.isFinite(target) ? target : 0;

  useEffect(() => {
    if (!play) return;
    if (reduce || safeTarget === 0) {
      setDisplay(safeTarget);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(safeTarget * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, safeTarget, reduce, ms]);

  return display;
}

function Metric({
  target,
  label,
  play,
  emphasize = false,
  delayMs = 0,
}: {
  target: number;
  label: string;
  play: boolean;
  emphasize?: boolean;
  delayMs?: number;
}) {
  const [ready, setReady] = useState(delayMs === 0);
  useEffect(() => {
    if (!play || delayMs === 0) {
      setReady(play);
      return;
    }
    const id = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(id);
  }, [play, delayMs]);

  const n = useCountUp(target, ready);
  return (
    <div
      className={cn(
        "min-w-0 transition-opacity duration-500 ease-[var(--ease-out)]",
        ready ? "opacity-100" : "opacity-0"
      )}
    >
      <p
        className={cn(
          "font-mono tabular tracking-tight",
          emphasize
            ? "text-3xl text-ink md:text-4xl"
            : "text-2xl text-ink md:text-3xl"
        )}
      >
        {n.toLocaleString("en-US")}
      </p>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
        {label}
      </p>
      {emphasize ? (
        <span
          aria-hidden
          className="mt-3 block h-px w-8 bg-accent"
          style={{
            transform: ready ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 600ms var(--ease-out)",
          }}
        />
      ) : null}
    </div>
  );
}

const LEVEL_SWATCHES = [
  "var(--color-subtle)",
  "color-mix(in srgb, var(--color-accent) 28%, var(--color-subtle))",
  "color-mix(in srgb, var(--color-accent) 52%, var(--color-subtle))",
  "color-mix(in srgb, var(--color-accent) 78%, var(--color-subtle))",
  "var(--color-accent)",
] as const;

export default function ProofBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const data = await fetchMergedContributions(
          GITHUB_CONTRIBUTION_USERS,
          ac.signal
        );
        if (ac.signal.aborted) return;
        const endYear = new Date().getFullYear();
        const years = lastYears(
          data.total ?? {},
          endYear,
          YEAR_SPAN,
          SHIPPING_SINCE.getFullYear()
        );
        const weeks = lastNWeeks(data.contributions, WEEKS);
        setStats({
          years,
          streak: currentStreak(data.contributions),
          weeks,
          fourYearTotal: sumYears(years),
          daysActive: activeDayCount(weeks),
          peak: peakYear(years),
        });
      } catch {
        if (!ac.signal.aborted) setFailed(true);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const shippingYear = SHIPPING_SINCE.getFullYear();

  return (
    <section
      ref={ref}
      aria-label="GitHub activity"
      data-proof-bar
      className="border-t border-line"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-8 md:py-12">
        {!failed && stats ? (
          <div className="flex flex-col gap-10">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-elevated/60 px-4 py-5 md:px-6 md:py-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-accent)_20%,var(--color-accent)_80%,transparent)] opacity-70"
              />
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
                    Last 52 weeks
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink-secondary">
                    Merged across personal + work
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5"
                  aria-label="Contribution intensity legend"
                >
                  <span className="font-mono text-[10px] text-ink-tertiary">
                    Less
                  </span>
                  {LEVEL_SWATCHES.map((fill, i) => (
                    <span
                      key={fill}
                      className="size-2.5 rounded-[2px]"
                      style={{ background: fill }}
                      title={`Level ${i}`}
                    />
                  ))}
                  <span className="font-mono text-[10px] text-ink-tertiary">
                    More
                  </span>
                </div>
              </div>
              <ContributionRibbon weeks={stats.weeks} />
            </div>

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div
                data-proof-stats
                className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-5 lg:grid-cols-2"
              >
                <Metric
                  target={stats.fourYearTotal}
                  label="4-year total"
                  play={inView}
                  emphasize
                  delayMs={0}
                />
                <Metric
                  target={stats.streak}
                  label="day streak"
                  play={inView}
                  delayMs={80}
                />
                <Metric
                  target={stats.daysActive}
                  label="active days"
                  play={inView}
                  delayMs={140}
                />
                <div
                  className={cn(
                    "min-w-0 transition-opacity duration-500 ease-[var(--ease-out)]",
                    inView ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: inView ? "200ms" : "0ms" }}
                >
                  <p className="font-mono text-2xl tabular tracking-tight text-ink md:text-3xl">
                    {shippingYear}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
                    shipping since
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="mb-5 flex items-baseline justify-between gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
                    Contributions by year
                  </p>
                  {stats.peak ? (
                    <p className="font-mono text-[11px] text-ink-tertiary">
                      Peak{" "}
                      <span className="text-accent-soft">{stats.peak.year}</span>
                    </p>
                  ) : null}
                </div>
                <YearChart
                  years={stats.years}
                  play={inView}
                  peakYear={stats.peak?.year}
                />
              </div>
            </div>
          </div>
        ) : (
          <p data-proof-stats className="font-mono text-xs text-ink-tertiary">
            shipping since {shippingYear}
          </p>
        )}
      </div>
    </section>
  );
}
