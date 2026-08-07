/**
 * Year digit particle templates for the Experience organism motif.
 * Unit xy pairs match a fixed aspect canvas (SAMPLE_W × SAMPLE_H). The DOM
 * year slot uses the same aspect so mapping getBoundingClientRect() → points
 * lines up with the glyph.
 */

export const YEAR_SAMPLE_W = 520;
export const YEAR_SAMPLE_H = 240;
/** Keep in sync with ExperienceRail year slot `aspect-[…]`. */
export const YEAR_ASPECT = YEAR_SAMPLE_W / YEAR_SAMPLE_H;

const LUM_THRESHOLD = 0.2;
const MAX_POINTS = 620;

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
  const size = Math.floor(h * 0.78);
  ctx.font = `800 ${size}px "JetBrains Mono", ui-monospace, monospace`;
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      "-0.06em";
  } catch {
    /* ignore */
  }

  // Crisp glyph only — no shadowBlur (that sampled as a soft double halo).
  ctx.fillText(year, w / 2, h / 2 + 2);

  const { data } = ctx.getImageData(0, 0, w, h);
  const pts: number[] = [];

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const lum = lumAt(data, x, y, w, h);
      if (lum < LUM_THRESHOLD) continue;
      const edge =
        lumAt(data, x - 1, y, w, h) < LUM_THRESHOLD ||
        lumAt(data, x + 1, y, w, h) < LUM_THRESHOLD ||
        lumAt(data, x, y - 1, w, h) < LUM_THRESHOLD ||
        lumAt(data, x, y + 1, w, h) < LUM_THRESHOLD;
      // Keep every edge sample; checker the fill so strokes read solid.
      if (!edge && ((x + y) & 1) !== 0) continue;
      pts.push(x / (w - 1), y / (h - 1));
    }
  }

  if (pts.length === 0) return new Float32Array(0);

  let out: Float32Array;
  if (pts.length / 2 > MAX_POINTS) {
    const step = pts.length / 2 / MAX_POINTS;
    out = new Float32Array(MAX_POINTS * 2);
    for (let i = 0; i < MAX_POINTS; i++) {
      const src = Math.floor(i * step) * 2;
      out[i * 2] = pts[src];
      out[i * 2 + 1] = pts[src + 1];
    }
  } else {
    out = new Float32Array(pts);
  }

  cache.set(year, out);
  return out;
}
