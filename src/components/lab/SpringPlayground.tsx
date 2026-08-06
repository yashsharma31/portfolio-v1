"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Lab demo 2 (PRD 5.3): a draggable ball with editable spring physics and a
 * live curve trace. Drag it, release, feel the configured spring pull it home.
 */

/** Numerically integrate a unit spring (x0=1, v0=0, mass=1) for the trace. */
function springSamples(stiffness: number, damping: number, n = 90, dt = 1 / 50) {
  let x = 1;
  let v = 0;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = -stiffness * x - damping * v;
    v += a * dt;
    x += v * dt;
    pts.push(x);
  }
  return pts;
}

export default function SpringPlayground() {
  const reduce = useReducedMotion();
  const [stiffness, setStiffness] = useState(220);
  const [damping, setDamping] = useState(14);

  const path = useMemo(() => {
    const pts = springSamples(stiffness, damping);
    const w = 200;
    const h = 64;
    return pts
      .map(
        (x, i) =>
          `${i === 0 ? "M" : "L"}${((i / (pts.length - 1)) * w).toFixed(1)},${(
            h / 2 -
            x * (h / 2 - 4)
          ).toFixed(1)}`
      )
      .join(" ");
  }, [stiffness, damping]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-[140px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-subtle">
        {/* Crosshair marks home */}
        <div aria-hidden className="absolute h-px w-6 bg-line-strong" />
        <div aria-hidden className="absolute h-6 w-px bg-line-strong" />
        <motion.div
          drag={!reduce}
          dragSnapToOrigin
          dragTransition={{
            bounceStiffness: stiffness,
            bounceDamping: damping,
          }}
          whileDrag={{ scale: 1.15 }}
          data-spring-ball
          className="relative h-12 w-12 cursor-grab touch-none rounded-full bg-accent active:cursor-grabbing"
          style={{
            boxShadow: "0 8px 32px var(--color-accent-glow)",
          }}
        />
      </div>
      <div className="mt-4 space-y-3">
        <svg
          viewBox="0 0 200 64"
          className="h-12 w-full"
          aria-hidden
          role="presentation"
        >
          <line x1="0" y1="32" x2="200" y2="32" stroke="var(--color-line)" />
          <path
            d={path}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          />
        </svg>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="tabular font-mono text-[11px] uppercase tracking-wider text-ink-tertiary">
              Stiffness {stiffness}
            </span>
            <input
              type="range"
              min={40}
              max={600}
              step={10}
              value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="mt-1.5 block w-full accent-accent"
            />
          </label>
          <label className="block">
            <span className="tabular font-mono text-[11px] uppercase tracking-wider text-ink-tertiary">
              Damping {damping}
            </span>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="mt-1.5 block w-full accent-accent"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
