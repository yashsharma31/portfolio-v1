"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lab demo 3 (PRD 5.3): a live IST clock whose digits scramble-settle on the
 * minute change. Vanilla intervals + WAAPI blur pulse; reduced motion swaps
 * text plainly. The only clock allowed on the page: it is a demo, not decor.
 */

const DIGITS = "0123456789";

function istNow() {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return fmt.format(new Date()); // "HH:MM:SS"
}

export default function ScrambleClock() {
  const [display, setDisplay] = useState("--:--:--");
  const elRef = useRef<HTMLSpanElement>(null);
  const lastMinuteRef = useRef<string>("");
  const scrambleRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function settle(target: string) {
      // ~420ms of scramble across 7 frames, settling left to right.
      let frame = 0;
      const total = 7;
      if (scrambleRef.current) clearInterval(scrambleRef.current);
      scrambleRef.current = window.setInterval(() => {
        frame++;
        const settled = Math.floor((frame / total) * target.length);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          if (target[i] === ":") out += ":";
          else if (i < settled) out += target[i];
          else out += DIGITS[Math.floor(Math.random() * 10)];
        }
        setDisplay(out);
        if (frame >= total) {
          clearInterval(scrambleRef.current!);
          scrambleRef.current = null;
          setDisplay(target);
        }
      }, 60);

      // WAAPI blur pulse alongside the scramble.
      elRef.current?.animate(
        [
          { filter: "blur(0px)", opacity: 1 },
          { filter: "blur(2px)", opacity: 0.7 },
          { filter: "blur(0px)", opacity: 1 },
        ],
        { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      );
    }

    function tick() {
      const now = istNow();
      const minute = now.slice(0, 5);
      if (!reduce && lastMinuteRef.current && minute !== lastMinuteRef.current) {
        lastMinuteRef.current = minute;
        settle(now);
        return;
      }
      lastMinuteRef.current = minute;
      // Seconds tick plainly; no animation for a once-a-second change.
      if (!scrambleRef.current) setDisplay(now);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      if (scrambleRef.current) clearInterval(scrambleRef.current);
    };
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <span
        ref={elRef}
        data-scramble-clock
        className="tabular font-mono text-4xl font-medium tracking-wider text-ink"
      >
        {display}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
        IST · Gurugram
      </span>
    </div>
  );
}
