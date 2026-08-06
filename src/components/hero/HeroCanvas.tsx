"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Graphics,
  Particle,
  ParticleContainer,
} from "pixi.js";

/**
 * Hero particle canvas (PRD 5.1). Renders the same halftone figure as the
 * static poster (scripts/generate-hero-poster.mjs) as a live particle field:
 * idle breathing, pointer repulsion with spring return, scroll scatter.
 *
 * Engineering constraints handled here: DPR cap at 2, ticker paused when
 * offscreen or tab hidden, full destroy on unmount, WebGL failure = silent
 * no-op (the poster stays visible underneath).
 */

// Sampling params: MUST match scripts/generate-hero-poster.mjs.
const GRID_COLS = 88;
const CROP = { left: 0.52, top: 0.42, width: 0.48, height: 0.52 };
const GAMMA = 2.0;
const THRESHOLD = 0.3;
const TINT_FROM = { r: 0x63, g: 0x63, b: 0x6b }; // ink-tertiary
const TINT_TO = { r: 0xe8, g: 0x76, b: 0x3a }; // accent

const REPEL_RADIUS = 120;

type P = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  scatter: number;
  particle: Particle;
};

async function samplePhoto(cols: number) {
  const img = new Image();
  img.src = "/images/profile.jpeg";
  await img.decode();

  const sx = img.naturalWidth * CROP.left;
  const sy = img.naturalHeight * CROP.top;
  const sw = img.naturalWidth * CROP.width;
  const sh = img.naturalHeight * CROP.height;
  const rows = Math.round((cols * sh) / sw);

  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  // Luminance, normalized then inverted (dark subject -> bright dots).
  const lum = new Float32Array(cols * rows);
  let min = 1;
  let max = 0;
  for (let i = 0; i < lum.length; i++) {
    const v =
      (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) /
      255;
    lum[i] = v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = Math.max(max - min, 0.001);
  for (let i = 0; i < lum.length; i++) {
    lum[i] = Math.pow(1 - (lum[i] - min) / range, GAMMA);
  }
  return { lum, rows };
}

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export default function HeroCanvas({ onReady }: { onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let app: Application | null = null;
    let destroyed = false;
    let observer: IntersectionObserver | null = null;
    const aborts: Array<() => void> = [];

    async function build() {
      const rect = host!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const lowTier =
        typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4;
      const cols = lowTier ? GRID_COLS / 2 : GRID_COLS;

      const [{ lum, rows }, a] = await Promise.all([
        samplePhoto(cols),
        (async () => {
          const application = new Application();
          await application.init({
            backgroundAlpha: 0,
            antialias: true,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            autoDensity: true,
            preference: "webgl",
            width: rect.width,
            height: rect.height,
          });
          return application;
        })(),
      ]);
      if (destroyed) {
        a.destroy(true, { children: true, texture: true });
        return;
      }
      app = a;
      host!.appendChild(a.canvas);
      a.canvas.style.position = "absolute";
      a.canvas.style.inset = "0";

      // Fit the figure into the host, anchored bottom-right.
      const figureAspect = cols / rows;
      let fh = rect.height;
      let fw = fh * figureAspect;
      if (fw > rect.width) {
        fw = rect.width;
        fh = fw / figureAspect;
      }
      const ox = rect.width - fw;
      const oy = rect.height - fh;
      const cell = fw / cols;

      const gfx = new Graphics().circle(0, 0, 8).fill(0xffffff);
      const texture = a.renderer.generateTexture(gfx);
      gfx.destroy();

      const pc = new ParticleContainer({
        dynamicProperties: { position: true },
      });
      a.stage.addChild(pc);

      const parts: P[] = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const v = lum[gy * cols + gx];
          if (v < THRESHOLD) continue;
          const hx = ox + gx * cell + cell / 2;
          const hy = oy + gy * cell + cell / 2;
          const tint =
            (lerpChannel(TINT_FROM.r, TINT_TO.r, v) << 16) +
            (lerpChannel(TINT_FROM.g, TINT_TO.g, v) << 8) +
            lerpChannel(TINT_FROM.b, TINT_TO.b, v);
          const radius = ((v * 0.85 + 0.15) * cell) / 2;
          const particle = new Particle({
            texture,
            x: hx,
            y: hy,
            tint,
            alpha: v * 0.75 + 0.25,
            scaleX: radius / 8,
            scaleY: radius / 8,
            anchorX: 0.5,
            anchorY: 0.5,
          });
          pc.addParticle(particle);
          parts.push({
            hx,
            hy,
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            scatter: 80 + Math.random() * 260,
            particle,
          });
        }
      }

      // Pointer state in canvas coordinates. Tracked on the hero section so
      // text hover also stirs the field.
      let px = -9999;
      let py = -9999;
      const heroEl = host!.closest("section") ?? host!;
      const onMove = (e: PointerEvent) => {
        const r = host!.getBoundingClientRect();
        px = e.clientX - r.left;
        py = e.clientY - r.top;
      };
      const onLeave = () => {
        px = -9999;
        py = -9999;
      };
      heroEl.addEventListener("pointermove", onMove, { passive: true });
      heroEl.addEventListener("pointerleave", onLeave, { passive: true });
      aborts.push(() => {
        heroEl.removeEventListener("pointermove", onMove);
        heroEl.removeEventListener("pointerleave", onLeave);
      });

      let t = 0;
      const r2 = REPEL_RADIUS * REPEL_RADIUS;
      a.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaTime, 3);
        t += dt * 0.016;

        // Scroll scatter: 0 at top, 1 once the hero is 70% scrolled away.
        const sp = Math.min(
          Math.max(window.scrollY / (window.innerHeight * 0.7), 0),
          1
        );
        host!.style.opacity = String(1 - sp * 0.9);

        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          // Breathing target + scroll scatter along +y
          const tx = p.hx + Math.sin(t * 0.7 + p.phase) * 1.6;
          const ty =
            p.hy + Math.cos(t * 0.55 + p.phase * 1.3) * 1.6 + sp * p.scatter;

          // Spring toward target
          p.vx += (tx - p.x) * 0.045 * dt;
          p.vy += (ty - p.y) * 0.045 * dt;

          // Pointer repulsion
          const dx = p.x - px;
          const dy = p.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = ((1 - d / REPEL_RADIUS) * 5.5 * dt) / d;
            p.vx += dx * f;
            p.vy += dy * f;
          }

          // Friction, integrate
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.particle.x = p.x;
          p.particle.y = p.y;
        }
        pc.update();
      });

      // Pause offscreen and when the tab is hidden.
      observer = new IntersectionObserver(([entry]) => {
        if (!app) return;
        if (entry.isIntersecting && !document.hidden) app.ticker.start();
        else app.ticker.stop();
      });
      observer.observe(host!);
      const onVis = () => {
        if (!app) return;
        if (document.hidden) app.ticker.stop();
        else app.ticker.start();
      };
      document.addEventListener("visibilitychange", onVis);
      aborts.push(() => document.removeEventListener("visibilitychange", onVis));

      onReadyRef.current?.();
    }

    build().catch(() => {
      // WebGL/context failure: leave the poster visible, nothing to clean.
    });

    return () => {
      destroyed = true;
      observer?.disconnect();
      aborts.forEach((fn) => fn());
      app?.destroy(true, { children: true, texture: true });
      app = null;
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="absolute inset-0" data-hero-canvas />;
}
