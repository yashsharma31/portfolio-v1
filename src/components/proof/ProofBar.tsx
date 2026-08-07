"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SHIPPING_SINCE } from "@/data/experience";

/**
 * GitHub proof bar (PRD 5.4 / 6.2). Full-width hairline strip under the hero:
 * 52-week ember contribution ribbon + three mono stats that count up once.
 * On API failure the ribbon hides and only "shipping since 2022" remains.
 */

const API = "https://github-contributions-api.jogruber.de/v4/yashsharma31";
const WEEKS = 52;
const CELL = 10;
const GAP = 3;

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

type Stats = {
  yearTotal: number;
  streak: number;
  weeks: Day[][];
};

const LEVEL_FILL = [
  "var(--color-subtle)",
  "color-mix(in srgb, var(--color-accent) 28%, var(--color-subtle))",
  "color-mix(in srgb, var(--color-accent) 52%, var(--color-subtle))",
  "color-mix(in srgb, var(--color-accent) 78%, var(--color-subtle))",
  "var(--color-accent)",
] as const;

function currentStreak(days: Day[]): number {
  const today = new Date().toISOString().slice(0, 10);
  // API returns year blocks newest→oldest; sort ascending for a walk.
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : 1));
  let streak = 0;
  let sawToday = false;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (d.date > today) continue;
    if (d.date === today) {
      sawToday = true;
      if (d.count > 0) streak++;
      continue; // empty today does not break the streak
    }
    if (!sawToday && streak === 0) {
      // No today entry in the feed; treat as empty today.
      sawToday = true;
    }
    if (d.count > 0) streak++;
    else break;
  }
  return streak;
}

function lastNWeeks(days: Day[], n: number): Day[][] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n * 7);
  const recent = [...days]
    .filter((d) => new Date(d.date + "T00:00:00") >= cutoff)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  if (recent.length === 0) return [];
  const first = new Date(recent[0].date + "T00:00:00");
  const pad = first.getDay(); // 0 = Sun
  const padded: (Day | null)[] = [
    ...Array.from({ length: pad }, () => null),
    ...recent,
  ];
  const weeks: Day[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const slice = padded.slice(i, i + 7).filter((d): d is Day => d !== null);
    if (slice.length) weeks.push(slice);
  }
  return weeks.slice(-n);
}

function useCountUp(target: number, active: boolean, ms = 600) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduce || target === 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, reduce, ms]);

  return value;
}

function Count({
  target,
  active,
}: {
  target: number;
  active: boolean;
}) {
  const n = useCountUp(target, active);
  return (
    <span className="tabular">{n.toLocaleString("en-US")}</span>
  );
}

export default function ProofBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          total: Record<string, number>;
          contributions: Day[];
        };
        if (!data.contributions?.length) throw new Error("empty");
        const year = String(new Date().getFullYear());
        if (cancelled) return;
        setStats({
          yearTotal: data.total?.[year] ?? 0,
          streak: currentStreak(data.contributions),
          weeks: lastNWeeks(data.contributions, WEEKS),
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
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
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const shippingYear = SHIPPING_SINCE.getFullYear();
  const ribbonW =
    (stats?.weeks.length ?? 0) * (CELL + GAP) - GAP;
  const ribbonH = 7 * (CELL + GAP) - GAP;

  return (
    <section
      ref={ref}
      aria-label="GitHub activity"
      data-proof-bar
      className="border-t border-line"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
        {!failed && stats && (
          <svg
            data-proof-ribbon
            width={ribbonW}
            height={ribbonH}
            viewBox={`0 0 ${ribbonW} ${ribbonH}`}
            className="max-w-full shrink-0 overflow-visible"
            aria-hidden
          >
            {stats.weeks.map((week, wi) =>
              week.map((day) => {
                const dow = new Date(day.date + "T00:00:00").getDay();
                return (
                  <rect
                    key={day.date}
                    x={wi * (CELL + GAP)}
                    y={dow * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    fill={LEVEL_FILL[day.level]}
                  >
                    <title>
                      {day.count} on {day.date}
                    </title>
                  </rect>
                );
              })
            )}
          </svg>
        )}

        <p
          data-proof-stats
          className="tabular font-mono text-xs leading-relaxed text-ink-tertiary md:text-right"
        >
          {!failed && stats ? (
            <>
              <Count target={stats.yearTotal} active={inView} /> contributions
              this year
              <span aria-hidden> · </span>
              <Count target={stats.streak} active={inView} /> day streak
              <span aria-hidden> · </span>
              shipping since {shippingYear}
            </>
          ) : (
            <>shipping since {shippingYear}</>
          )}
        </p>
      </div>
    </section>
  );
}
