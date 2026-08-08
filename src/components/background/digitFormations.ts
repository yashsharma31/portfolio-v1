/**
 * Year digit particle templates for the Experience organism motif.
 * Unit xy pairs match a fixed aspect canvas (SAMPLE_W × SAMPLE_H). The DOM
 * year slot uses the same aspect so mapping getBoundingClientRect() → points
 * lines up with the glyph.
 */

export const YEAR_SAMPLE_W = 720;
export const YEAR_SAMPLE_H = 320;
/** Keep in sync with ExperienceRail year slot aspect. */
export const YEAR_ASPECT = YEAR_SAMPLE_W / YEAR_SAMPLE_H;

const LUM_THRESHOLD = 0.12;
/** Dense enough to read as solid stipple, not sand. Match YEAR_POOL. */
const MAX_POINTS = 1600;
const GRID = 1.5;
/** Share of the capped pool reserved for silhouette vs interior fill. */
const EDGE_SHARE = 0.42;

const cache = new Map<string, Float32Array>();

function lumAt(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  if (x < 0 || y < 0 || x >= w || y >= h) return 0;
  return data[(y * w + x) * 4] / 255;
}

/** Resolve the live JetBrains Mono face (next/font CSS var) for canvas sampling. */
function monoFamily(): string {
  if (typeof document === "undefined") {
    return '"JetBrains Mono", ui-monospace, monospace';
  }
  const fromVar = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-jetbrains")
    .trim();
  if (fromVar) return `${fromVar}, "JetBrains Mono", ui-monospace, monospace`;
  return '"JetBrains Mono", ui-monospace, monospace';
}

/**
 * Returns interleaved [x,y,x,y,…] in unit space for `year` (e.g. "2026").
 * Empty results are not cached (font may still be loading).
 */
export function sampleYearDigits(year: string): Float32Array {
  if (!year) return new Float32Array(0);
  const hit = cache.get(year);
  if (hit) return hit;

  const w = YEAR_SAMPLE_W;
  const h = YEAR_SAMPLE_H;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(0);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = Math.floor(h * 0.88);
  ctx.font = `800 ${size}px ${monoFamily()}`;
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      "-0.08em";
  } catch {
    /* ignore */
  }

  // Crisp glyph only — no shadowBlur (that sampled as a soft double halo).
  ctx.fillText(year, w / 2, h / 2 + 2);

  const { data } = ctx.getImageData(0, 0, w, h);
  const edgePts: number[] = [];
  const fillPts: number[] = [];

  // Tight grid, tiny jitter — solid fill, crisp silhouette.
  for (let y = GRID; y < h - GRID; y += GRID) {
    for (let x = GRID; x < w - GRID; x += GRID) {
      const jx = (hash01(x * 0.37 + y * 1.9, 3) - 0.5) * GRID * 0.35;
      const jy = (hash01(x * 1.1 + y * 0.41, 7) - 0.5) * GRID * 0.35;
      const sx = Math.round(x + jx);
      const sy = Math.round(y + jy);
      const lum = lumAt(data, sx, sy, w, h);
      if (lum < LUM_THRESHOLD) continue;

      const edge =
        lumAt(data, sx - 1, sy, w, h) < LUM_THRESHOLD ||
        lumAt(data, sx + 1, sy, w, h) < LUM_THRESHOLD ||
        lumAt(data, sx, sy - 1, w, h) < LUM_THRESHOLD ||
        lumAt(data, sx, sy + 1, w, h) < LUM_THRESHOLD;

      if (edge) {
        edgePts.push(sx / (w - 1), sy / (h - 1));
      } else {
        // Keep nearly all fill — only drop ~10% for organic texture.
        if (hash01(sx + sy * 17, 11) > 0.9) continue;
        fillPts.push(sx / (w - 1), sy / (h - 1));
      }
    }
  }

  // Prefer edges first so silhouette survives when we cap point count.
  const edgeN = edgePts.length / 2;
  const fillN = fillPts.length / 2;
  if (edgeN + fillN === 0) return new Float32Array(0);

  const total = edgeN + fillN;
  let out: Float32Array;

  if (total <= MAX_POINTS) {
    out = new Float32Array(edgePts.length + fillPts.length);
    out.set(edgePts, 0);
    out.set(fillPts, edgePts.length);
  } else {
    // Always keep a solid interior — never collapse to edges-only.
    const edgeBudget = Math.min(edgeN, Math.floor(MAX_POINTS * EDGE_SHARE));
    const fillBudget = Math.min(fillN, MAX_POINTS - edgeBudget);
    out = new Float32Array((edgeBudget + fillBudget) * 2);
    const eStep = edgeN / Math.max(1, edgeBudget);
    for (let i = 0; i < edgeBudget; i++) {
      const src = Math.floor(i * eStep) * 2;
      out[i * 2] = edgePts[src];
      out[i * 2 + 1] = edgePts[src + 1];
    }
    const fStep = fillN / Math.max(1, fillBudget);
    for (let i = 0; i < fillBudget; i++) {
      const src = Math.floor(i * fStep) * 2;
      const o = (edgeBudget + i) * 2;
      out[o] = fillPts[src];
      out[o + 1] = fillPts[src + 1];
    }
  }

  cache.set(year, out);
  return out;
}

function hash01(n: number, salt: number) {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Drop cached glyphs (call after fonts settle so the first sample isn't a fallback). */
export function clearYearDigitCache() {
  cache.clear();
}

/** Warm cache once fonts are ready so the first Experience frame is dense. */
export async function warmYearDigits(years: string[]) {
  if (typeof document === "undefined") return;
  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ignore */
  }
  clearYearDigitCache();
  for (const y of years) {
    if (y) sampleYearDigits(y);
  }
}
