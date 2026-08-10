"use client";

import { useEffect, useRef } from "react";
import { INTRO } from "./introTiming";

/** Ember ramp — mirrors EmberField EMBER_RAMP. */
const RAMP = ["#c85f2e", "#e8763a", "#f09a6b", "#ffe8d6", "#ffffff"] as const;
const CDF = [0.22, 0.55, 0.8, 0.93, 1] as const;

type Particle = {
  /** Rest position in the center cluster */
  hx: number;
  hy: number;
  /** Radial spread target */
  sx: number;
  sy: number;
  r: number;
  color: string;
  baseAlpha: number;
  orbit: number;
  stagger: number;
  isStriker: boolean;
};

function pickColor(rand: number): string {
  for (let i = 0; i < CDF.length; i++) {
    if (rand < CDF[i]) return RAMP[i];
  }
  return RAMP[RAMP.length - 1];
}

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutStrong(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3.2);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function hash(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function particleCount(w: number): number {
  return w < 1024 ? 110 : 170;
}

function buildParticles(w: number, h: number): Particle[] {
  const cx = w * 0.5;
  const cy = h * 0.48;
  const clusterR = Math.min(w, h) * 0.11;
  const n = particleCount(w);
  const out: Particle[] = [];

  for (let i = 0; i < n; i++) {
    const a = hash(i, 1) * Math.PI * 2;
    const rad = Math.sqrt(hash(i, 2)) * clusterR;
    const hx = cx + Math.cos(a) * rad * (0.55 + hash(i, 3) * 0.9);
    const hy = cy + Math.sin(a) * rad * (0.7 + hash(i, 4) * 0.75);

    const spreadA = hash(i, 5) * Math.PI * 2;
    const spreadDist =
      Math.hypot(w, h) * (0.55 + hash(i, 6) * 0.55);
    const sx = cx + Math.cos(spreadA) * spreadDist;
    const sy = cy + Math.sin(spreadA) * spreadDist;

    out.push({
      hx,
      hy,
      sx,
      sy,
      r: 1.6 + hash(i, 7) * 3.4,
      color: pickColor(hash(i, 8)),
      baseAlpha: 0.55 + hash(i, 9) * 0.45,
      orbit: a,
      stagger: hash(i, 10) * 0.45,
      isStriker: false,
    });
  }

  // Striker: larger accent dot from below
  out.push({
    hx: cx,
    hy: cy,
    sx: cx,
    sy: -h * 0.2,
    r: 7.5,
    color: "#e8763a",
    baseAlpha: 1,
    orbit: -Math.PI / 2,
    stagger: 0,
    isStriker: true,
  });

  return out;
}

type Sample = { x: number; y: number; r: number; alpha: number };

function sampleParticle(
  p: Particle,
  elapsed: number,
  now: number,
  w: number,
  h: number,
  cx: number,
  cy: number
): Sample {
  const tIdle = INTRO.idle;
  const tStrike = tIdle + INTRO.strike;
  const tImpact = tStrike + INTRO.impact;
  const tSpread = tImpact + INTRO.spread;

  if (p.isStriker) {
    if (elapsed < tIdle) {
      // Parked below, mostly invisible until strike
      return { x: cx, y: h + 48, r: p.r, alpha: 0 };
    }
    if (elapsed < tStrike) {
      const raw = (elapsed - tIdle) / INTRO.strike;
      const local = easeOutExpo(raw);
      const y0 = h + 48;
      const y1 = cy;
      return {
        x: cx,
        y: y0 + (y1 - y0) * local,
        r: p.r * (0.85 + 0.2 * local),
        alpha: Math.min(1, local * 1.4),
      };
    }
    if (elapsed < tImpact) {
      // Flash at center
      const flash = 1 + 0.35 * (1 - (elapsed - tStrike) / INTRO.impact);
      return { x: cx, y: cy, r: p.r * flash, alpha: 1 };
    }
    // Dissolve into spread upward/out
    const raw = Math.min(1, (elapsed - tImpact) / INTRO.spread);
    const local = easeOutStrong(raw);
    return {
      x: cx + (p.sx - cx) * local * 0.35,
      y: cy + (p.sy - cy) * local,
      r: p.r * (1 - local * 0.7),
      alpha: p.baseAlpha * (1 - local),
    };
  }

  // Cluster particles
  if (elapsed < tIdle) {
    const breath = Math.sin(now * 0.0028 + p.orbit) * 1.1;
    const breathY = Math.cos(now * 0.0022 + p.orbit * 1.2) * 0.9;
    return {
      x: p.hx + breath,
      y: p.hy + breathY,
      r: p.r,
      alpha: p.baseAlpha,
    };
  }

  if (elapsed < tStrike) {
    // Brace: pull slightly toward center as striker approaches
    const raw = (elapsed - tIdle) / INTRO.strike;
    const brace = easeInOutCubic(raw) * 0.06;
    return {
      x: p.hx + (cx - p.hx) * brace,
      y: p.hy + (cy - p.hy) * brace,
      r: p.r * (1 - brace * 0.5),
      alpha: p.baseAlpha,
    };
  }

  if (elapsed < tImpact) {
    const flash = 1 + 0.25 * (1 - (elapsed - tStrike) / INTRO.impact);
    return {
      x: p.hx + (cx - p.hx) * 0.06,
      y: p.hy + (cy - p.hy) * 0.06,
      r: p.r * flash,
      alpha: Math.min(1, p.baseAlpha * flash),
    };
  }

  // Spread — ring outward with stagger
  const raw = Math.min(
    1,
    Math.max(0, (elapsed - tImpact) / INTRO.spread - p.stagger) /
      (1 - p.stagger * 0.85)
  );
  const local = easeOutStrong(raw);
  return {
    x: p.hx + (p.sx - p.hx) * local,
    y: p.hy + (p.sy - p.hy) * local,
    r: p.r * (1 - local * 0.25),
    alpha: p.baseAlpha * (1 - local * 0.35),
  };
}

type IntroClusterProps = {
  exiting: boolean;
};

/**
 * C1 Ember Birth — center idle → striker from below → tackle → radial spread.
 * Canvas rides inside the cover so the slide-up carries the particles away.
 */
export default function IntroCluster({ exiting }: IntroClusterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exitingRef = useRef(exiting);
  exitingRef.current = exiting;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = buildParticles(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.48;
      const elapsed = now - start;

      // Soft ember glow behind the cluster (fades as spread completes)
      const spreadStart = INTRO.idle + INTRO.strike + INTRO.impact;
      const glowFade =
        elapsed < spreadStart
          ? 1
          : Math.max(0, 1 - (elapsed - spreadStart) / INTRO.spread);
      if (glowFade > 0.02) {
        const g = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.min(w, h) * 0.28
        );
        g.addColorStop(0, `rgba(232, 118, 58, ${0.14 * glowFade})`);
        g.addColorStop(0.5, `rgba(232, 118, 58, ${0.05 * glowFade})`);
        g.addColorStop(1, "rgba(11, 11, 13, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Once exiting, freeze at full spread so particles ride the cover slide
      const drawElapsed = exitingRef.current
        ? INTRO.idle + INTRO.strike + INTRO.impact + INTRO.spread
        : elapsed;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const s = sampleParticle(p, drawElapsed, now, w, h, cx, cy);
        if (s.alpha < 0.02) continue;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = s.alpha;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-intro-cluster
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
