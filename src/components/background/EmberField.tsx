"use client";

import { useEffect, useRef, useState } from "react";
import {
  Application,
  Graphics,
  Particle,
  ParticleContainer,
  Texture,
} from "pixi.js";
import { journeyScrub } from "@/components/ai/scrub";
import {
  AI_LINE_COLOR,
  AI_STAGE_N,
  aiPoolCap,
  buildFormations,
  plotMetaFromFormation,
  stageFromProgress,
  type AiFormations,
} from "./aiFormations";
import { burstControl } from "./burstControl";
import { sampleYearDigits } from "./digitFormations";
import { fieldControl } from "./fieldControl";
import { organismState } from "./organismState";
import { startSceneController } from "./sceneController";

/**
 * Ember Organism engine (B1–B3). Fixed full-viewport Pixi canvas.
 * Mobile: rising-ember drift. Desktop lg+: hybrid swarm + section formations
 * + hero portrait dissolve + AI journey formations (retired JourneyCanvas).
 * Between motifs: disperse (nearly invisible full-viewport dust).
 * Alpha lerps toward fieldControl.target (defaults to 1).
 */

const EMBER_RAMP = [0xc85f2e, 0xe8763a, 0xf09a6b, 0xffe8d6, 0xffffff] as const;
const EMBER_CDF = [0.25, 0.6, 0.85, 0.95, 1] as const;
/** Year digits: cream + white only (orange reads as noise at this scale). */
const YEAR_TINTS = [0xffe8d6, 0xffffff, 0xffffff, 0xffffff] as const;

const REF_W = 1440;
const REF_H = 900;
const DRIFT_REF = 140;
const DRIFT_MIN = 50;
const CHOREO_REF = 700;
const CHOREO_MIN = 350;
const CHOREO_MAX = 800;
const HERO_POOL_MAX = 2500;
const HERO_GRID_COLS = 128;
const HERO_LUM_THRESHOLD = 0.095;
const HERO_REPEL_RADIUS = 110;
const DPR_CAP = 1.5;
const MAX_SPEED_MULT = 3;
const SCROLL_REF = 900;
const SCROLL_SMOOTH = 0.14;

const PROOF_CELL = 10;
const PROOF_GAP = 3;
const PROOF_ROWS = 7;

const DISPERSE_ALPHA_MIN = 0.02;
const DISPERSE_ALPHA_SPAN = 0.05; // → 0.02–0.07
const DISPERSE_ALPHA_CAP = 0.08;
const DORMANT_ALPHA_CAP = 0.04;

const BURST_DURATION = 1.05;
const BURST_COUNT = 160;
const BURST_RADIUS = 220;

type Role = "core" | "halo";

type ArtSample = {
  gx: number;
  gy: number;
  tint: number;
  baseAlpha: number;
  lum: number;
};

type Ember = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  homeX: number;
  homeY: number;
  homeAlpha: number;
  baseX: number;
  size: number;
  baseAlpha: number;
  targetAlpha: number;
  tint: number;
  stagger: number;
  role: Role;
  rise: number;
  wanderAmp: number;
  wanderFreq: number;
  phase: number;
  twinklePhase: number;
  twinkleSpeed: number;
  /** Hero art grid cell; -1 = motif-only surplus. */
  artGx: number;
  artGy: number;
  heroTint: number;
  heroBaseAlpha: number;
  heroLum: number;
  scatterX: number;
  scatterY: number;
  hasArt: boolean;
  particle: Particle;
};

function pickTint() {
  const r = Math.random();
  for (let i = 0; i < EMBER_CDF.length; i++) {
    if (r < EMBER_CDF[i]) return EMBER_RAMP[i];
  }
  return EMBER_RAMP[0];
}

function hash01(i: number, salt = 1) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function prefersReduce() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isDesktop() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
  );
}

function driftCount(w: number, h: number) {
  const area = Math.max(w, 1) * Math.max(h, 1);
  const n = Math.round(DRIFT_REF * (area / (REF_W * REF_H)));
  return Math.max(DRIFT_MIN, n);
}

/** Adaptive choreo pool: ~700 at 1440×900, floor 350, cap 800. */
function choreoCount(w: number, h: number) {
  const area = Math.max(w, 1) * Math.max(h, 1);
  const n = Math.round(CHOREO_REF * (area / (REF_W * REF_H)));
  return Math.max(CHOREO_MIN, Math.min(CHOREO_MAX, n));
}

async function sampleArt(cols: number): Promise<{
  samples: ArtSample[];
  aspect: number;
  cols: number;
} | null> {
  try {
    const img = new Image();
    img.src = "/images/hero-art.png";
    await img.decode();
    const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
    const aspect = img.naturalWidth / img.naturalHeight;

    const c = document.createElement("canvas");
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, cols, rows);
    const { data } = ctx.getImageData(0, 0, cols, rows);

    const samples: ArtSample[] = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const i = (gy * cols + gx) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        if (lum < HERO_LUM_THRESHOLD) continue;
        samples.push({
          gx,
          gy,
          tint: (r << 16) + (g << 8) + b,
          baseAlpha: Math.min(lum * 2.2 + 0.3, 1),
          lum,
        });
      }
    }

    // Cap density: keep spatial coverage, thin evenly if over budget.
    if (samples.length > HERO_POOL_MAX) {
      const step = samples.length / HERO_POOL_MAX;
      const thinned: ArtSample[] = [];
      for (let i = 0; i < HERO_POOL_MAX; i++) {
        thinned.push(samples[Math.floor(i * step)]);
      }
      return { samples: thinned, aspect, cols };
    }

    return { samples, aspect, cols };
  } catch {
    return null;
  }
}

type HeroLayout = {
  left: number;
  top: number;
  ox: number;
  oy: number;
  cell: number;
  artImg: HTMLElement | null;
};

/** Contain-fit + object-right mapping into viewport space (matches HeroVisual). */
function measureHeroLayout(aspect: number, cols: number): HeroLayout | null {
  const artImg = document.querySelector<HTMLElement>("img[data-hero-art]");
  const host = artImg?.parentElement;
  if (!host) return null;
  const rect = host.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;

  let fw = rect.width;
  let fh = fw / aspect;
  if (fh > rect.height) {
    fh = rect.height;
    fw = fh * aspect;
  }
  const ox = rect.width - fw;
  const oy = (rect.height - fh) / 2;
  const cell = fw / Math.max(cols, 1);

  return {
    left: rect.left,
    top: rect.top,
    ox,
    oy,
    cell,
    artImg,
  };
}

function assignHomes(embers: Ember[], n: number, w: number, h: number) {
  for (let i = 0; i < n; i++) {
    const e = embers[i];
    e.homeX = hash01(i, 12) * w;
    e.homeY = hash01(i, 13) * h;
    e.homeAlpha = DISPERSE_ALPHA_MIN + hash01(i, 14) * DISPERSE_ALPHA_SPAN;
  }
}

function driftedHome(e: Ember, i: number, time: number) {
  const amp = 2 + hash01(i, 15) * 4; // a few px
  return {
    x: e.homeX + Math.sin(time * 0.11 + e.phase) * amp,
    y: e.homeY + Math.cos(time * 0.08 + e.phase * 1.3) * amp,
  };
}

function seedDrift(e: Ember, w: number, h: number, y?: number) {
  const size = 1 + Math.random() * 1.5;
  e.x = Math.random() * w;
  e.baseX = e.x;
  e.y = y ?? Math.random() * h;
  e.tx = e.x;
  e.ty = e.y;
  e.homeX = e.x;
  e.homeY = e.y;
  e.size = size;
  e.baseAlpha = 0.08 + Math.random() * 0.22;
  e.homeAlpha = e.baseAlpha;
  e.targetAlpha = e.baseAlpha;
  e.rise = 6 + Math.random() * 14;
  e.wanderAmp = 4 + Math.random() * 10;
  e.wanderFreq = 0.15 + Math.random() * 0.35;
  e.phase = Math.random() * Math.PI * 2;
  e.twinklePhase = Math.random() * Math.PI * 2;
  e.twinkleSpeed = 0.6 + Math.random() * 1.4;
  e.tint = pickTint();
  e.hasArt = false;
  e.artGx = -1;
  e.artGy = -1;
  const p = e.particle;
  p.x = e.x;
  p.y = e.y;
  p.tint = e.tint;
  p.alpha = e.baseAlpha;
  p.scaleX = size;
  p.scaleY = size;
}

function seedChoreo(e: Ember, i: number, n: number, w: number, h: number) {
  const coreN = Math.floor(n * 0.6);
  e.role = i < coreN ? "core" : "halo";
  e.stagger = hash01(i, 41);
  e.tint = pickTint();
  e.phase = hash01(i, 6) * Math.PI * 2;
  e.twinklePhase = hash01(i, 7) * Math.PI * 2;
  e.twinkleSpeed = 0.5 + hash01(i, 8) * 1.2;
  e.rise = 0;
  e.wanderAmp = 0;
  e.wanderFreq = 0;
  e.baseX = 0;
  e.hasArt = false;
  e.artGx = -1;
  e.artGy = -1;
  e.heroTint = e.tint;
  e.heroBaseAlpha = 0;
  e.heroLum = 0;
  e.scatterX = 0;
  e.scatterY = 0;
  // Stable disperse home across the full viewport.
  e.homeX = hash01(i, 12) * w;
  e.homeY = hash01(i, 13) * h;
  e.homeAlpha = DISPERSE_ALPHA_MIN + hash01(i, 14) * DISPERSE_ALPHA_SPAN;
  e.size = 1 + hash01(i, 16) * 0.8;
  e.baseAlpha = e.homeAlpha;
  e.targetAlpha = e.homeAlpha;
  e.x = e.homeX;
  e.y = e.homeY;
  e.tx = e.homeX;
  e.ty = e.homeY;
  const p = e.particle;
  p.x = e.x;
  p.y = e.y;
  p.tint = e.tint;
  p.alpha = e.homeAlpha;
  p.scaleX = e.size;
  p.scaleY = e.size;
}

function bindHeroSample(e: Ember, sample: ArtSample) {
  e.hasArt = true;
  e.artGx = sample.gx;
  e.artGy = sample.gy;
  e.heroTint = sample.tint;
  e.heroBaseAlpha = sample.baseAlpha;
  e.heroLum = sample.lum;
  e.scatterY = 120 + Math.random() * 380;
  e.scatterX = (Math.random() - 0.5) * 160;
}

/** Nearly invisible full-viewport dust — idle between motif scenes. */
function applyDisperseTargets(
  embers: Ember[],
  n: number,
  _w: number,
  _h: number,
  time: number,
  alphaScale = 1
) {
  for (let i = 0; i < n; i++) {
    const e = embers[i];
    const d = driftedHome(e, i, time);
    e.tx = d.x;
    e.ty = d.y;
    e.size = 1 + hash01(i, 16) * 0.8;
    e.targetAlpha = e.homeAlpha * alphaScale;
  }
}

/**
 * After a formation write to tx/ty/targetAlpha, lerp from drifted
 * disperse homes by blend (progress). Enter = assemble, exit = dissolve.
 */
function blendFormationWithDisperse(
  embers: Ember[],
  n: number,
  time: number,
  blend: number
) {
  const b = Math.max(0, Math.min(1, blend));
  for (let i = 0; i < n; i++) {
    const e = embers[i];
    const d = driftedHome(e, i, time);
    const formX = e.tx;
    const formY = e.ty;
    const formAlpha = e.targetAlpha;
    e.tx = d.x + (formX - d.x) * b;
    e.ty = d.y + (formY - d.y) * b;
    e.targetAlpha = e.homeAlpha + (formAlpha - e.homeAlpha) * b;
  }
}

function applyHeroTargets(
  embers: Ember[],
  poolN: number,
  heroN: number,
  aspect: number,
  cols: number,
  progress: number,
  time: number,
  pointer: { x: number; y: number }
): boolean {
  const layout = measureHeroLayout(aspect, cols);
  if (!layout) {
    for (let i = 0; i < poolN; i++) embers[i].targetAlpha = 0;
    return false;
  }

  const p = Math.max(0, Math.min(1, progress));
  const fadeIn = Math.min(p * 4.5, 1); // crossfade over first ~22% of p
  const vis = fadeIn * (1 - p * 0.95);

  if (layout.artImg) {
    layout.artImg.style.opacity = String(1 - fadeIn);
  }

  const cell = layout.cell;
  const r2 = HERO_REPEL_RADIUS * HERO_REPEL_RADIUS;
  const px = pointer.x;
  const py = pointer.y;

  for (let i = 0; i < poolN; i++) {
    const e = embers[i];
    if (i >= heroN || !e.hasArt) {
      e.targetAlpha = 0;
      continue;
    }

    // Texture.WHITE is 1×1 — scale equals former HeroCanvas radius in px.
    const radius = (Math.min(e.heroLum * 0.7 + 0.5, 1) * cell) / 2;
    const artX = layout.left + layout.ox + e.artGx * cell + cell / 2;
    const artY = layout.top + layout.oy + e.artGy * cell + cell / 2;
    const drift = Math.sin(time * 0.7 + e.phase) * 1.4;
    let tx = artX + drift + p * e.scatterX;
    let ty =
      artY +
      Math.cos(time * 0.55 + e.phase * 1.3) * 1.4 -
      p * e.scatterY;

    const dx = tx - px;
    const dy = ty - py;
    const d2 = dx * dx + dy * dy;
    if (d2 < r2 && d2 > 0.01) {
      const d = Math.sqrt(d2);
      const f = (1 - d / HERO_REPEL_RADIUS) * 22;
      tx += (dx / d) * f;
      ty += (dy / d) * f;
    }

    e.tx = tx;
    e.ty = ty;
    e.size = Math.max(0.5, radius);
    e.targetAlpha = e.heroBaseAlpha * vis;
  }
  return true;
}

function applyProofTargets(embers: Ember[], n: number): boolean {
  const ribbon = document.querySelector("[data-proof-ribbon]");
  if (!ribbon) return false;
  const rect = ribbon.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return false;

  // Echo lattice: same rhythm as the ribbon, but padded and slightly larger
  // so particles sit in the gutters around the opaque SVG cells (z under content).
  const padX = 28;
  const padY = 22;
  const left = rect.left - padX;
  const top = rect.top - padY;
  const width = rect.width + padX * 2;
  const height = rect.height + padY * 2;

  const stride = PROOF_CELL + PROOF_GAP + 2;
  const cols = Math.max(1, Math.round((width + PROOF_GAP) / stride));
  const rows = PROOF_ROWS + 2;
  const cells = cols * rows;

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    if (i >= cells) {
      e.tx = left + width * 0.5;
      e.ty = top + height * 0.5;
      e.targetAlpha = 0;
      continue;
    }
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    e.tx = left + col * stride + stride * 0.5;
    e.ty = top + row * (height / rows) + height / rows / 2;
    // Outer ring brighter (visible around the SVG); inner cells dimmer.
    const edge =
      row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
    e.size = edge ? 2.4 + hash01(i, 32) * 1.2 : 1.6 + hash01(i, 33) * 0.8;
    e.targetAlpha = edge
      ? 0.34 + hash01(i, 30) * 0.08
      : 0.16 + hash01(i, 31) * 0.1;
  }
  return true;
}

/** Last active year — used to snap particles when the glyph changes. */
let lastExperienceYear = "";

/**
 * Experience motif: thin left rail + bright right-side year digits.
 * Returns `railN` so the ticker can disperse-blend only the rail — year
 * particles stay locked to the glyph (otherwise the blend washes them out).
 */
function applyExperienceTargets(
  embers: Ember[],
  n: number
): { railN: number } {
  const rail = document.querySelector("[data-experience-rail]");
  if (!rail) {
    for (let i = 0; i < n; i++) {
      embers[i].targetAlpha = 0.04;
    }
    return { railN: 0 };
  }
  const rect = rail.getBoundingClientRect();
  const x = rect.left + 10;
  const vh = window.innerHeight;
  const y0 = Math.max(rect.top, 0);
  const y1 = Math.min(rect.bottom, vh);
  const span = Math.max(1, y1 - y0);

  const accent = document.querySelector("[data-experience-accent]");
  let accentTop = 0;
  let accentBot = 0;
  let hasAccent = false;
  if (accent) {
    const ar = accent.getBoundingClientRect();
    if (ar.height > 2) {
      hasAccent = true;
      accentTop = ar.top;
      accentBot = ar.bottom;
    }
  }

  // Active year slot only (inactive entries omit the attribute).
  const yearEl = document.querySelector<HTMLElement>(
    "[data-experience-entry][data-active] [data-experience-year]"
  );
  const year = yearEl?.getAttribute("data-experience-year")?.trim() ?? "";
  const yearPts = year ? sampleYearDigits(year) : new Float32Array(0);
  const yearPointN = yearPts.length / 2;
  let yearRect: DOMRect | null = null;
  if (yearEl && yearPointN > 0) {
    const yr = yearEl.getBoundingClientRect();
    // Slot uses the same aspect as the sampler canvas — map 1:1.
    if (yr.width > 16 && yr.height > 16) yearRect = yr;
  }

  const yearChanged = year !== lastExperienceYear;
  lastExperienceYear = year;

  // Lean rail; majority of pool → year glyph.
  const railBudget = Math.min(n, Math.max(28, Math.floor(n * 0.12)));
  const denseN = hasAccent ? Math.min(Math.floor(railBudget * 0.45), 20) : 0;
  const lineN = railBudget - denseN;
  const yearBudget = yearRect
    ? Math.min(n - railBudget, yearPointN, Math.floor(n * 0.88))
    : 0;

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    if (hasAccent && i < denseN) {
      const t = i / Math.max(1, denseN - 1);
      e.tx = x + (hash01(i, 41) - 0.5) * 6;
      e.ty = accentTop + t * Math.max(1, accentBot - accentTop);
      e.size = 2.0 + hash01(i, 45) * 1.0;
      e.targetAlpha = 0.28 + hash01(i, 42) * 0.08;
    } else if (i < denseN + lineN) {
      const t = (i - denseN) / Math.max(1, lineN - 1);
      e.tx = x + (hash01(i, 43) - 0.5) * 3.5;
      e.ty = y0 + t * span;
      e.size = 1.5 + hash01(i, 46) * 0.7;
      e.targetAlpha = 0.14 + hash01(i, 44) * 0.06;
    } else if (yearRect && i < denseN + lineN + yearBudget) {
      const yi = i - denseN - lineN;
      // Even subsample across the full glyph (never modulo — that ghosts digits).
      const pi =
        yearBudget >= yearPointN
          ? yi
          : Math.min(
              yearPointN - 1,
              Math.floor((yi + 0.5) * (yearPointN / yearBudget))
            );
      const u = yearPts[pi * 2];
      const v = yearPts[pi * 2 + 1];
      e.tx = yearRect.left + u * yearRect.width;
      e.ty = yearRect.top + v * yearRect.height;
      // Texture.WHITE is 1×1 — scale is px. Slight overlap closes stroke gaps.
      e.size = 3.6 + hash01(i, 49) * 1.6;
      e.targetAlpha = 1;
      e.tint = YEAR_TINTS[Math.floor(hash01(i, 51) * YEAR_TINTS.length)];
      // Snap on year change; otherwise lock hard so digits don't smear while lerping.
      if (yearChanged) {
        e.x = e.tx;
        e.y = e.ty;
        e.baseAlpha = e.targetAlpha;
      } else {
        e.x = e.tx;
        e.y = e.ty;
      }
    } else {
      // Silence leftovers from the previous year so they don't ghost.
      e.tx = x;
      e.ty = y0 + span * 0.5;
      e.targetAlpha = 0;
      if (yearChanged) {
        e.baseAlpha = 0;
      }
    }
  }

  return { railN: denseN + lineN };
}

function applyContactTargets(embers: Ember[], n: number) {
  const cta =
    document.querySelector('[data-organism-anchor="contact-cta"]') ??
    document.querySelector("#contact button[type=submit]") ??
    document.querySelector("#contact");
  const rect = cta?.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width * 0.5 : window.innerWidth * 0.5;
  const cy = rect ? rect.top + rect.height * 0.5 : window.innerHeight * 0.55;
  const radius = 105;
  // Ring uses a subset so it reads as a circle, not a filled disc.
  const ringN = Math.min(n, 160);

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    if (i < ringN) {
      const a = (i / ringN) * Math.PI * 2;
      const jr = (hash01(i, 50) - 0.5) * 8;
      e.tx = cx + Math.cos(a) * (radius + jr);
      e.ty = cy + Math.sin(a) * (radius + jr);
      e.size =
        e.role === "core" ? 2.2 + hash01(i, 54) * 1.1 : 1.5 + hash01(i, 55) * 0.8;
      e.targetAlpha =
        e.role === "core"
          ? 0.34 + hash01(i, 51) * 0.08
          : 0.14 + hash01(i, 52) * 0.06;
    } else {
      const a = hash01(i, 53) * Math.PI * 2;
      e.tx = cx + Math.cos(a) * (radius + 28);
      e.ty = cy + Math.sin(a) * (radius + 28);
      e.targetAlpha = 0;
    }
  }
}

/** Soft perimeter frame around the lab bento — denser at corners, slight jitter. */
function applyLabTargets(embers: Ember[], n: number, time: number): boolean {
  const grid =
    document.querySelector("[data-lab-grid]") ?? document.querySelector("#lab");
  if (!grid) return false;
  const rect = grid.getBoundingClientRect();
  if (rect.width < 24 || rect.height < 24) return false;

  const inset = 12;
  const left = rect.left + inset;
  const top = rect.top + inset;
  const right = rect.right - inset;
  const bottom = rect.bottom - inset;
  const w = Math.max(1, right - left);
  const h = Math.max(1, bottom - top);
  const peri = 2 * (w + h);

  // Corners get ~2× weight via a corner-boost remapping.
  const frameN = Math.min(n, 140);

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    if (i >= frameN) {
      e.tx = left + w * 0.5;
      e.ty = top + h * 0.5;
      e.targetAlpha = 0;
      continue;
    }

    // Bias samples toward corners: fold u through a power curve near 0/0.25/0.5/0.75.
    let u = (i + hash01(i, 60) * 0.4) / frameN;
    const corner = Math.min(
      u % 0.25,
      0.25 - (u % 0.25)
    );
    const cornerBoost = 1 - corner / 0.125; // 1 at corner, 0 at edge mid
    u = (u + (hash01(i, 61) - 0.5) * 0.02 * cornerBoost + 1) % 1;

    let px: number;
    let py: number;
    const d = u * peri;
    if (d < w) {
      px = left + d;
      py = top;
    } else if (d < w + h) {
      px = right;
      py = top + (d - w);
    } else if (d < w + h + w) {
      px = right - (d - w - h);
      py = bottom;
    } else {
      px = left;
      py = bottom - (d - w - h - w);
    }

    const jx = (hash01(i, 62) - 0.5) * (5 + cornerBoost * 4);
    const jy = (hash01(i, 63) - 0.5) * (5 + cornerBoost * 4);
    const idle =
      Math.sin(time * 0.9 + e.phase) * 1.2 * (0.4 + cornerBoost * 0.6);
    e.tx = px + jx + idle;
    e.ty = py + jy + Math.cos(time * 0.7 + e.phase * 1.2) * 1.1;
    e.size =
      cornerBoost > 0.55
        ? 2.1 + hash01(i, 64) * 1.0
        : 1.4 + hash01(i, 65) * 0.7;
    e.targetAlpha = 0.15 + hash01(i, 66) * 0.12 + cornerBoost * 0.05;
  }
  return true;
}

/** Sparse editorial text-lines under the writing heading / over the rows. */
function applyWritingTargets(embers: Ember[], n: number): boolean {
  const section = document.querySelector("#blog");
  if (!section) return false;
  const sRect = section.getBoundingClientRect();
  if (sRect.width < 24 || sRect.height < 24) return false;

  const rows =
    document.querySelector("[data-writing]") ??
    document.querySelector("[data-writing-rows]");
  const rRect = rows?.getBoundingClientRect();

  // Prefer the rows block; fall back to mid-right of the section.
  const box = rRect && rRect.height > 8 ? rRect : sRect;
  const lineCount = 4;
  const lineW = Math.min(box.width * 0.62, 420);
  // Sit toward the right/center of the content column.
  const x0 = box.left + box.width * 0.28;
  const y0 =
    rRect && rRect.height > 8
      ? rRect.top + 18
      : sRect.top + Math.min(120, sRect.height * 0.22);
  const rowGap = rRect && rRect.height > 8
    ? Math.min(52, Math.max(28, (rRect.height - 36) / (lineCount - 1)))
    : 36;

  const perRow = Math.floor(Math.min(n, 100) / lineCount);
  const used = perRow * lineCount;

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    if (i >= used || perRow < 1) {
      e.tx = x0 + lineW * 0.5;
      e.ty = y0 + rowGap * 1.5;
      e.targetAlpha = 0;
      continue;
    }
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    // Vary line length like AI journey text-skeleton rows.
    const rowLen = 0.58 + hash01(row, 70) * 0.38;
    const u = perRow <= 1 ? 0.5 : col / (perRow - 1);
    e.tx = x0 + u * lineW * rowLen + (hash01(i, 71) - 0.5) * 2;
    e.ty = y0 + row * rowGap + (hash01(i, 72) - 0.5) * 1.5;
    e.size = 1.3 + hash01(i, 73) * 0.6;
    e.targetAlpha =
      0.18 + hash01(i, 74) * 0.1 + (row === 0 ? 0.02 : 0);
  }
  return true;
}

/** Loose elliptical halo around the about portrait — peeks in margins. */
function applyAboutTargets(embers: Ember[], n: number, time: number): boolean {
  const img =
    document.querySelector<HTMLElement>("img[data-about-portrait]") ??
    document.querySelector<HTMLElement>("#about img");
  const host = img?.parentElement ?? img;
  if (!host) return false;
  const rect = host.getBoundingClientRect();
  if (rect.width < 24 || rect.height < 24) return false;

  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  // Slightly larger than the portrait so the ring peeks in margins.
  const rx = rect.width * 0.56;
  const ry = rect.height * 0.54;
  const ringN = Math.min(n, 150);

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    if (i >= ringN) {
      e.tx = cx;
      e.ty = cy;
      e.targetAlpha = 0;
      continue;
    }
    const a = (i / ringN) * Math.PI * 2 + hash01(i, 80) * 0.08;
    const radial = 1 + (hash01(i, 81) - 0.45) * 0.12;
    const breath = 1 + Math.sin(time * 0.55 + e.phase) * 0.018;
    e.tx = cx + Math.cos(a) * rx * radial * breath;
    e.ty = cy + Math.sin(a) * ry * radial * breath;
    e.size = 1.6 + hash01(i, 82) * 1.0;
    e.targetAlpha = 0.2 + hash01(i, 83) * 0.14;
  }
  return true;
}

/**
 * One-shot contact success burst: impulsively push a subset outward from CTA,
 * then ease back. Applied after formation targets so it overlays any scene.
 */
function applyContactBurst(
  embers: Ember[],
  n: number,
  dt: number
) {
  if (!burstControl.active) return;

  burstControl.t += dt;
  const t = burstControl.t;
  if (t >= BURST_DURATION) {
    burstControl.active = false;
    return;
  }

  const cta =
    document.querySelector('[data-organism-anchor="contact-cta"]') ??
    document.querySelector("#contact button[type=submit]") ??
    document.querySelector("#contact");
  const rect = cta?.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width * 0.5 : window.innerWidth * 0.5;
  const cy = rect ? rect.top + rect.height * 0.5 : window.innerHeight * 0.55;

  // Ease out then settle: peak push ~35% through, fade impulse by end.
  const u = t / BURST_DURATION;
  const impulse =
    u < 0.35
      ? smoothPulse(u / 0.35)
      : Math.max(0, 1 - (u - 0.35) / 0.65);
  const count = Math.min(n, BURST_COUNT);

  for (let i = 0; i < count; i++) {
    const e = embers[i];
    const a = hash01(i, 90) * Math.PI * 2;
    const dist = (0.35 + hash01(i, 91) * 0.65) * BURST_RADIUS * impulse;
    e.tx = cx + Math.cos(a) * dist;
    e.ty = cy + Math.sin(a) * dist;
    e.size = 2.0 + hash01(i, 92) * 1.4;
    e.targetAlpha = Math.min(
      0.55,
      (0.28 + hash01(i, 93) * 0.22) * (0.35 + impulse * 0.65)
    );
  }
}

function smoothPulse(t: number) {
  const x = Math.max(0, Math.min(1, t));
  // ease-out rise
  return 1 - (1 - x) * (1 - x);
}

/** Silence hero-only surplus outside hero (keep motif pool density). */
function silenceSurplus(embers: Ember[], from: number, to: number) {
  for (let i = from; i < to; i++) {
    embers[i].targetAlpha = 0;
  }
}

/** Steer pool toward AI journey formations (scrubbed by journeyScrub.progress). */
function applyAiTargets(
  embers: Ember[],
  n: number,
  forms: AiFormations,
  stage: number,
  local: number,
  w: number
) {
  const { sets: formations, ambient } = forms;
  const form = formations[stage];
  const next = formations[Math.min(AI_STAGE_N - 1, stage + 1)];
  const regionL = w * 0.42;
  const regionW = w * 0.52;

  for (let i = 0; i < n; i++) {
    const e = embers[i];
    const appear = Math.max(
      0,
      Math.min(1, (local - e.stagger * 0.22) / 0.78)
    );
    const edgeBlend =
      stage < AI_STAGE_N - 1 && local > 0.82
        ? ((local - 0.82) / 0.18) * (1 - e.stagger * 0.35)
        : 0;

    let x0 = form.xy[i * 2];
    let y0 = form.xy[i * 2 + 1];

    // Stage 0: assemble from ambient scatter into autocomplete.
    if (stage === 0) {
      const assemble = Math.max(
        0,
        Math.min(1, (local - e.stagger * 0.15) / 0.7)
      );
      x0 = ambient[i * 2] + (form.xy[i * 2] - ambient[i * 2]) * assemble;
      y0 =
        ambient[i * 2 + 1] +
        (form.xy[i * 2 + 1] - ambient[i * 2 + 1]) * assemble;
    }

    const x1 = next.xy[i * 2];
    const y1 = next.xy[i * 2 + 1];
    e.tx = x0 + (x1 - x0) * edgeBlend;
    e.ty = y0 + (y1 - y0) * edgeBlend;
    e.size = 1.2 + hash01(i, 40) * 2.4;

    let a = form.alpha[i];
    if (stage === 0) {
      const assemble = Math.max(
        0,
        Math.min(1, (local - e.stagger * 0.15) / 0.7)
      );
      const ambientA = 0.08 + hash01(i, 42) * 0.1;
      const tokenN = Math.min(48, Math.floor(n * 0.35));
      if (i < tokenN) {
        const cols = 16;
        const col = i % cols;
        const reveal = local * cols;
        const formed =
          col < reveal
            ? col < cols * 0.5
              ? 0.9
              : 0.35 + Math.sin(local * 12 + col) * 0.05
            : ambientA;
        a = ambientA + (formed - ambientA) * Math.max(assemble, 0.15);
      } else {
        a = ambientA + (form.alpha[i] - ambientA) * (0.6 + appear * 0.4);
      }
    } else if (stage === 1) {
      const u = (form.xy[i * 2] - regionL) / Math.max(1, regionW);
      const pulse = 1 - Math.min(1, Math.abs(u - local) * 3.2);
      a = form.alpha[i] * (0.45 + pulse * 0.55);
    } else if (stage === 3) {
      a = form.alpha[i] * (0.85 + appear * 0.15);
    } else if (stage === 4) {
      a = form.alpha[i] * (0.55 + (1 - local) * 0.25);
    }
    e.targetAlpha = a;
  }
}

function drawAiLines(
  lineGfx: Graphics,
  forms: AiFormations,
  stage: number,
  local: number,
  w: number
) {
  lineGfx.clear();
  const formations = forms.sets;
  const regionL = w * 0.42;
  const regionW = w * 0.52;

  if (stage === 1) {
    const lines = formations[1].lines;
    const pulseX = regionL + regionW * local;
    for (let i = 0; i < lines.length; i += 4) {
      const mx = (lines[i] + lines[i + 2]) * 0.5;
      const dist = Math.abs(mx - pulseX) / (regionW * 0.2);
      const a = Math.max(0.04, 0.18 * (1 - Math.min(1, dist)));
      lineGfx.moveTo(lines[i], lines[i + 1]);
      lineGfx.lineTo(lines[i + 2], lines[i + 3]);
      lineGfx.stroke({ width: 1, color: AI_LINE_COLOR, alpha: a });
    }
  } else if (stage === 2) {
    const { ox, oy, plotW, plotH } = plotMetaFromFormation(formations[2]);
    const badY0 = oy + plotH * 0.35;
    const badY1 = oy + plotH * 0.55;
    const goodY0 = oy + plotH;
    const goodY1 = oy;
    const y0 = badY0 + (goodY0 - badY0) * local;
    const y1 = badY1 + (goodY1 - badY1) * local;
    lineGfx.moveTo(ox, oy + plotH);
    lineGfx.lineTo(ox + plotW, oy + plotH);
    lineGfx.moveTo(ox, oy + plotH);
    lineGfx.lineTo(ox, oy);
    lineGfx.stroke({ width: 1, color: AI_LINE_COLOR, alpha: 0.12 });
    lineGfx.moveTo(ox, y0);
    lineGfx.lineTo(ox + plotW, y1);
    lineGfx.stroke({ width: 1.5, color: 0xe8763a, alpha: 0.75 });
  } else if (stage === 3) {
    const lines = formations[3].lines;
    for (let i = 0; i < lines.length; i += 4) {
      const head = (i / 4) % 5;
      const wave = 0.5 + 0.5 * Math.sin(local * Math.PI * 2 + head * 1.2);
      const a = 0.06 + wave * 0.22;
      lineGfx.moveTo(lines[i], lines[i + 1]);
      lineGfx.lineTo(lines[i + 2], lines[i + 3]);
      lineGfx.stroke({ width: 1, color: 0xe8763a, alpha: a });
    }
  }
}

export default function EmberField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [reduce] = useState(prefersReduce);

  useEffect(() => {
    if (reduce) return;
    const host = hostRef.current;
    if (!host) return;

    let app: Application | null = null;
    let destroyed = false;
    const aborts: Array<() => void> = [];
    let stopController: (() => void) | null = null;
    let artImg: HTMLElement | null = null;

    async function build() {
      const desktop = isDesktop();
      organismState.mode = desktop ? "choreo" : "drift";

      const application = new Application();
      try {
        await application.init({
          backgroundAlpha: 0,
          antialias: false,
          resolution: Math.min(window.devicePixelRatio || 1, DPR_CAP),
          autoDensity: true,
          preference: "webgl",
          resizeTo: window,
        });
      } catch {
        return;
      }
      if (destroyed) {
        application.destroy(true, { children: true });
        return;
      }
      app = application;
      host!.appendChild(application.canvas);
      application.canvas.style.position = "absolute";
      application.canvas.style.inset = "0";
      application.canvas.style.width = "100%";
      application.canvas.style.height = "100%";

      const texture = Texture.WHITE;
      const pc = new ParticleContainer({
        dynamicProperties: {
          position: true,
          color: true,
          vertex: true,
        },
      });
      application.stage.addChild(pc);

      const lineGfx = new Graphics();
      application.stage.addChild(lineGfx);

      const scroll = { vel: 0, lastY: window.scrollY };
      let time = 0;
      let fieldAlpha = 1;
      let w = application.screen.width;
      let h = application.screen.height;
      let homeW = w;
      let homeH = h;

      const motifN = desktop ? choreoCount(w, h) : driftCount(w, h);
      let heroN = 0;
      let heroAspect = 1;
      let heroCols = HERO_GRID_COLS;
      let art: Awaited<ReturnType<typeof sampleArt>> = null;
      let aiN = 0;
      let aiForms: AiFormations | null = null;
      let aiFormW = 0;
      let aiFormH = 0;
      let aiRisePhase = 0;

      if (desktop) {
        const lowTier =
          typeof navigator !== "undefined" &&
          navigator.hardwareConcurrency <= 4;
        heroCols = lowTier ? HERO_GRID_COLS / 2 : HERO_GRID_COLS;
        art = await sampleArt(heroCols);
        if (destroyed) {
          application.destroy(true, { children: true });
          return;
        }
        if (art) {
          heroN = art.samples.length;
          heroAspect = art.aspect;
          heroCols = art.cols;
        }
      }

      // Elevate for AI (~1200) like hero elevates; motifs stay ~800 when not in ai/hero.
      const aiCap = desktop ? aiPoolCap() : 0;
      const poolN = desktop ? Math.max(motifN, heroN, aiCap) : motifN;
      aiN = desktop ? Math.min(poolN, aiCap) : 0;
      if (desktop && aiN > 0) {
        aiForms = buildFormations(w, h, aiN);
        aiFormW = w;
        aiFormH = h;
      }
      const embers: Ember[] = [];

      for (let i = 0; i < poolN; i++) {
        const particle = new Particle({
          texture,
          x: 0,
          y: 0,
          tint: EMBER_RAMP[0],
          alpha: 0,
          scaleX: 1,
          scaleY: 1,
          anchorX: 0.5,
          anchorY: 0.5,
        });
        pc.addParticle(particle);
        const e: Ember = {
          x: 0,
          y: 0,
          tx: 0,
          ty: 0,
          homeX: 0,
          homeY: 0,
          homeAlpha: DISPERSE_ALPHA_MIN,
          baseX: 0,
          size: 1,
          baseAlpha: 0.1,
          targetAlpha: 0.1,
          tint: EMBER_RAMP[0],
          stagger: 0,
          role: "core",
          rise: 10,
          wanderAmp: 6,
          wanderFreq: 0.25,
          phase: 0,
          twinklePhase: 0,
          twinkleSpeed: 1,
          artGx: -1,
          artGy: -1,
          heroTint: EMBER_RAMP[0],
          heroBaseAlpha: 0,
          heroLum: 0,
          scatterX: 0,
          scatterY: 0,
          hasArt: false,
          particle,
        };
        if (desktop) {
          seedChoreo(e, i, poolN, w, h);
          if (art && i < art.samples.length) {
            bindHeroSample(e, art.samples[i]);
          }
        } else {
          seedDrift(e, w, h);
        }
        embers.push(e);
      }

      // Seed hero particles at art viewport positions so first dissolve is smooth.
      if (desktop && art && heroN > 0) {
        const layout = measureHeroLayout(heroAspect, heroCols);
        if (layout) {
          artImg = layout.artImg;
          for (let i = 0; i < heroN; i++) {
            const e = embers[i];
            if (!e.hasArt) continue;
            const ax =
              layout.left +
              layout.ox +
              e.artGx * layout.cell +
              layout.cell / 2;
            const ay =
              layout.top +
              layout.oy +
              e.artGy * layout.cell +
              layout.cell / 2;
            const radius =
              (Math.min(e.heroLum * 0.7 + 0.5, 1) * layout.cell) / 2;
            e.x = ax;
            e.y = ay;
            e.tx = ax;
            e.ty = ay;
            e.size = Math.max(0.5, radius);
            e.baseAlpha = 0;
            e.targetAlpha = 0;
            e.particle.x = ax;
            e.particle.y = ay;
            e.particle.tint = e.heroTint;
            e.particle.alpha = 0;
            e.particle.scaleX = e.size;
            e.particle.scaleY = e.size;
          }
        }
      }

      const pointer = { x: -9999, y: -9999 };
      if (desktop) {
        const heroEl =
          (document.querySelector("#top") as HTMLElement | null) ??
          document.documentElement;
        const onMove = (ev: Event) => {
          const e = ev as PointerEvent;
          pointer.x = e.clientX;
          pointer.y = e.clientY;
        };
        const onLeave = () => {
          pointer.x = -9999;
          pointer.y = -9999;
        };
        heroEl.addEventListener("pointermove", onMove, { passive: true });
        heroEl.addEventListener("pointerleave", onLeave, { passive: true });
        aborts.push(() => {
          heroEl.removeEventListener("pointermove", onMove);
          heroEl.removeEventListener("pointerleave", onLeave);
        });

        stopController = startSceneController();
      }

      application.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaMS, 50) / 1000;
        time += dt;

        w = application.screen.width;
        h = application.screen.height;

        fieldAlpha += (fieldControl.target - fieldAlpha) * 0.08;
        application.stage.alpha = fieldAlpha;
        organismState.alpha = fieldAlpha;

        const y = window.scrollY;
        const rawVel = (y - scroll.lastY) / Math.max(dt, 0.001);
        scroll.lastY = y;
        scroll.vel += (rawVel - scroll.vel) * SCROLL_SMOOTH;

        if (!desktop) {
          const boost = Math.min(
            MAX_SPEED_MULT,
            Math.max(-0.35, 1 + scroll.vel / SCROLL_REF)
          );
          for (let i = 0; i < poolN; i++) {
            const e = embers[i];
            e.y -= e.rise * boost * dt;
            e.x =
              e.baseX +
              Math.sin(time * e.wanderFreq + e.phase) * e.wanderAmp;
            if (e.y < -e.size) {
              seedDrift(e, w, h, h + e.size + Math.random() * 40);
            } else if (e.y > h + e.size * 2 && boost < 0) {
              seedDrift(e, w, h, -e.size - Math.random() * 40);
            }
            const twinkle =
              0.72 +
              0.28 * Math.sin(time * e.twinkleSpeed + e.twinklePhase);
            const p = e.particle;
            p.x = e.x;
            p.y = e.y;
            p.alpha = Math.min(0.3, Math.max(0.04, e.baseAlpha * twinkle));
          }
          pc.update();
          return;
        }

        // Recompute disperse homes when viewport size changes meaningfully.
        if (Math.abs(w - homeW) > 2 || Math.abs(h - homeH) > 2) {
          assignHomes(embers, poolN, w, h);
          homeW = w;
          homeH = h;
          if (aiN > 0) {
            aiForms = buildFormations(w, h, aiN);
            aiFormW = w;
            aiFormH = h;
          }
        }

        // --- choreography ---
        const scene = organismState.scene;
        const progress = organismState.progress;
        const activeN =
          scene === "hero" ? poolN : scene === "ai" ? aiN : motifN;

        let aiStage = 0;
        let aiLocal = 0;

        if (scene === "hero") {
          lineGfx.clear();
          applyHeroTargets(
            embers,
            poolN,
            heroN,
            heroAspect,
            heroCols,
            progress,
            time,
            pointer
          );
        } else if (scene === "ai" && aiForms && aiN > 0) {
          if (Math.abs(w - aiFormW) > 2 || Math.abs(h - aiFormH) > 2) {
            aiForms = buildFormations(w, h, aiN);
            aiFormW = w;
            aiFormH = h;
          }
          aiRisePhase += dt;
          const scrub = stageFromProgress(journeyScrub.progress);
          aiStage = scrub.index;
          aiLocal = scrub.local;
          applyAiTargets(embers, aiN, aiForms, aiStage, aiLocal, w);
          blendFormationWithDisperse(embers, aiN, time, progress);
          silenceSurplus(embers, aiN, poolN);
          drawAiLines(lineGfx, aiForms, aiStage, aiLocal, w);
        } else if (scene === "proof") {
          lineGfx.clear();
          const ok = applyProofTargets(embers, motifN);
          if (!ok) applyDisperseTargets(embers, motifN, w, h, time);
          else blendFormationWithDisperse(embers, motifN, time, progress);
          silenceSurplus(embers, motifN, poolN);
        } else if (scene === "experience") {
          lineGfx.clear();
          // Year digits stay fully formed; only the rail softens with disperse.
          const { railN } = applyExperienceTargets(embers, motifN);
          if (railN > 0) {
            blendFormationWithDisperse(embers, railN, time, progress);
          }
          silenceSurplus(embers, motifN, poolN);
        } else if (scene === "lab") {
          lineGfx.clear();
          const ok = applyLabTargets(embers, motifN, time);
          if (!ok) applyDisperseTargets(embers, motifN, w, h, time);
          else blendFormationWithDisperse(embers, motifN, time, progress);
          silenceSurplus(embers, motifN, poolN);
        } else if (scene === "writing") {
          lineGfx.clear();
          const ok = applyWritingTargets(embers, motifN);
          if (!ok) applyDisperseTargets(embers, motifN, w, h, time);
          else blendFormationWithDisperse(embers, motifN, time, progress);
          silenceSurplus(embers, motifN, poolN);
        } else if (scene === "about") {
          lineGfx.clear();
          const ok = applyAboutTargets(embers, motifN, time);
          if (!ok) applyDisperseTargets(embers, motifN, w, h, time);
          else blendFormationWithDisperse(embers, motifN, time, progress);
          silenceSurplus(embers, motifN, poolN);
        } else if (scene === "contact") {
          lineGfx.clear();
          applyContactTargets(embers, motifN);
          blendFormationWithDisperse(embers, motifN, time, progress);
          silenceSurplus(embers, motifN, poolN);
        } else if (scene === "dormant") {
          lineGfx.clear();
          // Work: stay dispersed, even quieter than idle.
          applyDisperseTargets(embers, motifN, w, h, time, 0.55);
          silenceSurplus(embers, motifN, poolN);
        } else {
          lineGfx.clear();
          applyDisperseTargets(embers, motifN, w, h, time);
          silenceSurplus(embers, motifN, poolN);
        }

        // One-shot contact success burst overlays any scene (session-once).
        const bursting = burstControl.active;
        applyContactBurst(embers, motifN, dt);

        const integrateN = activeN;
        for (let i = 0; i < poolN; i++) {
          const e = embers[i];
          const rate = 3.5 + e.stagger * 6;
          const k = 1 - Math.exp(-dt * rate);
          e.x += (e.tx - e.x) * k;
          e.y += (e.ty - e.y) * k;

          const twinkle =
            scene === "hero" || scene === "ai" || scene === "experience"
              ? 1
              : 0.85 +
                0.15 * Math.sin(time * e.twinkleSpeed + e.twinklePhase);
          let a = e.targetAlpha * twinkle;
          if (bursting && i < BURST_COUNT) a = Math.min(0.55, a);
          else if (scene === "hero" || scene === "ai") a = Math.min(1, a);
          else if (scene === "experience") a = Math.min(1, a);
          else if (scene === "disperse") a = Math.min(DISPERSE_ALPHA_CAP, a);
          else if (scene === "dormant") a = Math.min(DORMANT_ALPHA_CAP, a);
          else a = Math.min(0.35, a);

          // Surplus outside hero/ai still lerps alpha toward 0.
          if (i >= integrateN && scene !== "hero" && !(bursting && i < BURST_COUNT)) {
            a = 0;
          }

          e.baseAlpha += (a - e.baseAlpha) * Math.min(1, k * 1.2);
          const p = e.particle;
          p.x = e.x;
          // Stage 3 (burning tokens): ember rise echo on web particles.
          let yDraw = e.y;
          if (scene === "ai" && aiStage === 3 && i >= 24 && i < aiN) {
            yDraw -=
              Math.sin(aiRisePhase * 1.4 + e.stagger * 6) * 4 * aiLocal;
          }
          p.y = yDraw;
          p.alpha = e.baseAlpha;
          p.scaleX = e.size;
          p.scaleY = e.size;
          if (bursting && i < BURST_COUNT) {
            p.tint =
              EMBER_RAMP[
                Math.min(EMBER_RAMP.length - 1, Math.floor(hash01(i, 94) * 4))
              ];
          } else {
            p.tint = scene === "hero" && e.hasArt ? e.heroTint : e.tint;
          }
        }
        pc.update();
      });

      const onVis = () => {
        if (!app) return;
        if (document.hidden) app.ticker.stop();
        else {
          scroll.lastY = window.scrollY;
          scroll.vel = 0;
          app.ticker.start();
        }
      };
      document.addEventListener("visibilitychange", onVis);
      aborts.push(() =>
        document.removeEventListener("visibilitychange", onVis)
      );

      if (document.hidden) application.ticker.stop();
    }

    build().catch(() => {
      console.warn("[EmberField] WebGL unavailable");
    });

    return () => {
      destroyed = true;
      stopController?.();
      stopController = null;
      aborts.forEach((fn) => fn());
      if (artImg) artImg.style.opacity = "";
      else {
        const img = document.querySelector<HTMLElement>("img[data-hero-art]");
        if (img) img.style.opacity = "";
      }
      app?.destroy(true, { children: true });
      app = null;
      organismState.mode = "drift";
      organismState.scene = "disperse";
      organismState.progress = 0;
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-ember-field
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: "var(--z-canvas)" }}
    />
  );
}
