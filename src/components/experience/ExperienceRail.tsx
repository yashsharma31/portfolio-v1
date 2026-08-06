"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/motion/Reveal";
import { cn } from "@/utils/cn";
import { EXPERIENCE, type ExperienceEntry } from "@/data/experience";

/**
 * Experience rail (PRD 6.5).
 * 2px --line track runs the full timeline height. An ember accent segment
 * tracks the in-view entry via IntersectionObserver (no scroll listeners;
 * segment position is written as CSS vars, not React state per frame).
 */

function startYear(period: string): string {
  const match = period.match(/\/(\d{4})/);
  return match?.[1] ?? "";
}

function Entry({
  entry,
  index,
  active,
  onActive,
  setEntryRef,
}: {
  entry: ExperienceEntry;
  index: number;
  active: boolean;
  onActive: (i: number) => void;
  setEntryRef: (i: number, el: HTMLLIElement | null) => void;
}) {
  const ref = useRef<HTMLLIElement | null>(null);
  const year = startYear(entry.period);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) onActive(index);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index, onActive]);

  return (
    <li
      ref={(el) => {
        ref.current = el;
        setEntryRef(index, el);
      }}
      data-experience-entry
      data-active={active || undefined}
      className="relative scroll-mt-24 pb-14 last:pb-0 md:pb-20"
    >
      {/* Node dot on the rail */}
      <span
        aria-hidden
        className={cn(
          "absolute left-[3px] top-2 z-10 h-2 w-2 rounded-full border md:left-[7px]",
          "transition-[background-color,border-color] duration-200 ease-[var(--ease-out)]",
          active ? "border-accent bg-accent" : "border-line bg-subtle"
        )}
      />

      {/* Ghost year: mirrors Work chapters numeral treatment */}
      {year ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-[-0.2em] z-0 select-none font-mono text-[80px] leading-none tracking-tighter md:left-5 md:text-[140px] lg:text-[160px]"
          style={{ color: "rgb(255 255 255 / 0.055)" }}
        >
          {year}
        </span>
      ) : null}

      <Reveal
        delay={Math.min(index * 0.055, 0.22)}
        className="relative z-[1] pl-5 md:pl-7"
      >
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
            {entry.role}
            <span className="font-normal text-accent-soft">
              {" "}
              · {entry.company}
            </span>
          </h3>
          <span className="font-mono text-xs text-ink-tertiary">
            {entry.period}
            {entry.location ? ` · ${entry.location}` : ""}
          </span>
        </div>

        <ul className="mt-5 max-w-[65ch] space-y-2.5 text-[15px] leading-relaxed text-ink-secondary">
          {entry.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[0.65em] h-[3px] w-2 shrink-0 rounded-full bg-accent"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 border-t border-line pt-4 font-mono text-[11px] tracking-wide text-ink-tertiary">
          {entry.stack.join(" · ")}
        </p>
      </Reveal>
    </li>
  );
}

export default function ExperienceRail() {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const entryRefs = useRef<(HTMLLIElement | null)[]>([]);

  const syncSegment = useCallback((index: number) => {
    const rail = railRef.current;
    const list = listRef.current;
    const item = entryRefs.current[index];
    if (!rail || !list || !item) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const top = itemRect.top - listRect.top;
    const height = Math.max(itemRect.height * 0.35, 48);

    rail.style.setProperty("--seg-y", `${top}px`);
    rail.style.setProperty("--seg-h", `${height}px`);
  }, []);

  const onActive = useCallback(
    (i: number) => {
      setActive(i);
      syncSegment(i);
    },
    [syncSegment]
  );

  const setEntryRef = useCallback((i: number, el: HTMLLIElement | null) => {
    entryRefs.current[i] = el;
  }, []);

  useEffect(() => {
    syncSegment(active);
    const onResize = () => syncSegment(active);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, syncSegment]);

  return (
    <div
      ref={railRef}
      data-experience-rail
      className="relative mt-12 overflow-x-clip pl-0"
      style={
        {
          "--seg-y": "0px",
          "--seg-h": "48px",
        } as React.CSSProperties
      }
    >
      {/* Full-height 2px track */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[7px] top-0 w-[2px] bg-line md:left-[11px]"
      >
        <div
          data-experience-accent
          className="absolute left-0 top-0 w-full bg-accent transition-[transform,height] duration-500 ease-[var(--ease-out)]"
          style={{
            height: "var(--seg-h)",
            transform: "translate3d(0, var(--seg-y), 0)",
          }}
        />
      </div>

      <ul ref={listRef} className="relative">
        {EXPERIENCE.map((entry, i) => (
          <Entry
            key={`${entry.company}-${entry.period}`}
            entry={entry}
            index={i}
            active={active === i}
            onActive={onActive}
            setEntryRef={setEntryRef}
          />
        ))}
      </ul>
    </div>
  );
}
