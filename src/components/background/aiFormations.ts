import { AI_STAGE_COUNT } from "@/data/ai-journey";

/**
 * AI journey formation geometry (retired JourneyCanvas → organism scene "ai").
 * Pure TS — EmberField rebuilds on resize and steers the shared pool.
 */

export const AI_STAGE_N = AI_STAGE_COUNT;
export const AI_POOL_FULL = 1200;
export const AI_LINE_COLOR = 0xffffff;

export type FormationSet = {
  /** length = count * 2, interleaved x,y */
  xy: Float32Array;
  /** optional connection segments as flat [x1,y1,x2,y2,...] */
  lines: Float32Array;
  /** per-particle alpha multipliers length = count */
  alpha: Float32Array;
};

export type AiFormations = {
  sets: FormationSet[];
  ambient: Float32Array;
};

export function aiPoolCap() {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4) {
    return Math.floor(AI_POOL_FULL / 2);
  }
  return AI_POOL_FULL;
}

function hash01(i: number, salt = 1) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function stageFromProgress(progress: number) {
  const t = Math.max(0, Math.min(1, progress)) * AI_STAGE_N;
  const index = Math.min(AI_STAGE_N - 1, Math.floor(t));
  const local = Math.min(1, t - index);
  return { index, local, t };
}

/** Plot meta packed into stage-2 lines: [ox, oy+plotH, ox+plotW, oy, plotW, plotH, ox, oy] */
export function plotMetaFromFormation(form: FormationSet) {
  return {
    ox: form.lines[6],
    oy: form.lines[7],
    plotW: form.lines[4],
    plotH: form.lines[5],
  };
}

/** Precompute five formation target sets for the current canvas size.
 *  Formations sit in the right ~55% so they clear the left text scrim. */
export function buildFormations(
  w: number,
  h: number,
  count: number
): AiFormations {
  // Formation center: right of the text column (~65% of viewport).
  const cx = w * 0.65;
  const cy = h * 0.5;
  const regionL = w * 0.42;
  const regionR = w * 0.94;
  const regionW = regionR - regionL;
  const sets: FormationSet[] = [];

  const ambient = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    ambient[i * 2] = hash01(i, 1) * w;
    ambient[i * 2 + 1] = hash01(i, 2) * h;
  }

  // --- 1 Autocomplete: dim scatter + token rects L→R, trailing half ghosted ---
  {
    const xy = new Float32Array(count * 2);
    const alpha = new Float32Array(count);
    const lines = new Float32Array(0);
    const tokenN = Math.min(48, Math.floor(count * 0.35));
    const cols = 16;
    const rows = Math.ceil(tokenN / cols);
    const tw = Math.min(regionW * 0.85, 420);
    const th = rows * 14;
    const x0 = cx - tw * 0.5;
    const y0 = cy - th * 0.5;
    for (let i = 0; i < count; i++) {
      if (i < tokenN) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellW = tw / cols;
        xy[i * 2] = x0 + col * cellW + cellW * 0.5 + (hash01(i, 2) - 0.5) * 3;
        xy[i * 2 + 1] =
          y0 + row * 14 + 7 + (hash01(i, 3) - 0.5) * 2;
        alpha[i] = col < cols * 0.5 ? 0.9 : 0.4;
      } else {
        // Soft field around the formation region (not under the left scrim).
        xy[i * 2] = regionL + hash01(i, 4) * regionW;
        xy[i * 2 + 1] = hash01(i, 5) * h;
        alpha[i] = 0.12 + hash01(i, 6) * 0.12;
      }
    }
    sets.push({ xy, lines, alpha });
  }

  // --- 2 Fundamentals: 4-layer network lattice ---
  {
    const xy = new Float32Array(count * 2);
    const alpha = new Float32Array(count);
    const layerCounts = [8, 14, 14, 6];
    const layerNodes: { x: number; y: number }[][] = [];
    const xPad = regionW * 0.06;
    const usableW = regionW - xPad * 2;
    let nodeIdx = 0;
    for (let L = 0; L < 4; L++) {
      const n = layerCounts[L];
      const x = regionL + xPad + (usableW * L) / 3;
      const nodes: { x: number; y: number }[] = [];
      for (let j = 0; j < n; j++) {
        const y = h * 0.14 + (h * 0.72 * (j + 0.5)) / n;
        nodes.push({ x, y });
        if (nodeIdx < count) {
          xy[nodeIdx * 2] = x;
          xy[nodeIdx * 2 + 1] = y;
          alpha[nodeIdx] = 0.85;
          nodeIdx++;
        }
      }
      layerNodes.push(nodes);
    }
    // Remaining particles sit near random edges as soft glow of the lattice
    for (let i = nodeIdx; i < count; i++) {
      const L = Math.floor(hash01(i, 7) * 4);
      const nodes = layerNodes[L];
      const host = nodes[Math.floor(hash01(i, 8) * nodes.length)];
      xy[i * 2] = host.x + (hash01(i, 9) - 0.5) * 28;
      xy[i * 2 + 1] = host.y + (hash01(i, 10) - 0.5) * 28;
      alpha[i] = 0.15 + hash01(i, 11) * 0.2;
    }
    // Edges between adjacent layers
    const seg: number[] = [];
    for (let L = 0; L < 3; L++) {
      const a = layerNodes[L];
      const b = layerNodes[L + 1];
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          // sparse: keep ~35% of edges
          if (hash01(i * 17 + j * 31 + L * 9, 12) > 0.35) continue;
          seg.push(a[i].x, a[i].y, b[j].x, b[j].y);
        }
      }
    }
    sets.push({ xy, lines: new Float32Array(seg), alpha });
  }

  // --- 3 Small models: scatter + regression (line drawn dynamically) ---
  {
    const xy = new Float32Array(count * 2);
    const alpha = new Float32Array(count);
    const plotW = Math.min(regionW * 0.75, 480);
    const plotH = Math.min(h * 0.55, 320);
    const ox = cx - plotW * 0.5;
    const oy = cy - plotH * 0.5;
    const dataN = Math.min(180, Math.floor(count * 0.55));
    for (let i = 0; i < count; i++) {
      if (i < dataN) {
        const u = hash01(i, 13);
        const noise = (hash01(i, 14) - 0.5) * 0.22;
        const v = Math.min(1, Math.max(0, u * 0.85 + 0.08 + noise));
        xy[i * 2] = ox + u * plotW;
        xy[i * 2 + 1] = oy + (1 - v) * plotH;
        alpha[i] = 0.75;
      } else if (i < dataN + 24) {
        // axis ticks
        const tick = i - dataN;
        if (tick < 12) {
          xy[i * 2] = ox + (tick / 11) * plotW;
          xy[i * 2 + 1] = oy + plotH + 6;
        } else {
          xy[i * 2] = ox - 6;
          xy[i * 2 + 1] = oy + ((tick - 12) / 11) * plotH;
        }
        alpha[i] = 0.35;
      } else {
        xy[i * 2] = ox + hash01(i, 15) * plotW;
        xy[i * 2 + 1] = oy + hash01(i, 16) * plotH;
        alpha[i] = 0.08;
      }
    }
    // Placeholder line endpoints stored in lines; redrawn each frame with fit
    sets.push({
      xy,
      lines: new Float32Array([ox, oy + plotH, ox + plotW, oy, plotW, plotH, ox, oy]),
      alpha,
    });
  }

  // --- 4 Burning tokens: two rows + attention web ---
  {
    const xy = new Float32Array(count * 2);
    const alpha = new Float32Array(count);
    const topN = 12;
    const botN = 12;
    const rowW = Math.min(regionW * 0.8, 500);
    const x0 = cx - rowW * 0.5;
    const topY = cy - h * 0.16;
    const botY = cy + h * 0.16;
    const nodesTop: { x: number; y: number }[] = [];
    const nodesBot: { x: number; y: number }[] = [];
    let idx = 0;
    for (let i = 0; i < topN && idx < count; i++, idx++) {
      const x = x0 + ((i + 0.5) / topN) * rowW;
      nodesTop.push({ x, y: topY });
      xy[idx * 2] = x;
      xy[idx * 2 + 1] = topY;
      alpha[idx] = 0.95;
    }
    for (let i = 0; i < botN && idx < count; i++, idx++) {
      const x = x0 + ((i + 0.5) / botN) * rowW;
      nodesBot.push({ x, y: botY });
      xy[idx * 2] = x;
      xy[idx * 2 + 1] = botY;
      alpha[idx] = 0.95;
    }
    for (let i = idx; i < count; i++) {
      // soft field around the web
      const side = hash01(i, 17) > 0.5;
      const host = side
        ? nodesTop[Math.floor(hash01(i, 18) * topN)]
        : nodesBot[Math.floor(hash01(i, 19) * botN)];
      xy[i * 2] = host.x + (hash01(i, 20) - 0.5) * 40;
      xy[i * 2 + 1] =
        host.y + (hash01(i, 21) - 0.5) * 30 + (side ? -8 : 8);
      alpha[i] = 0.2 + hash01(i, 22) * 0.25;
    }
    const seg: number[] = [];
    for (let i = 0; i < topN; i++) {
      for (let j = 0; j < botN; j++) {
        if (hash01(i * 13 + j * 7, 23) > 0.45) continue;
        seg.push(
          nodesTop[i].x,
          nodesTop[i].y,
          nodesBot[j].x,
          nodesBot[j].y
        );
      }
    }
    sets.push({ xy, lines: new Float32Array(seg), alpha });
  }

  // --- 5 Sharing it: calm text-skeleton rows ---
  {
    const xy = new Float32Array(count * 2);
    const alpha = new Float32Array(count);
    const rows = 7;
    const rowW = Math.min(regionW * 0.75, 460);
    const x0 = cx - rowW * 0.5;
    const y0 = cy - rows * 16;
    const perRow = Math.floor(count / rows);
    for (let i = 0; i < count; i++) {
      const row = Math.min(rows - 1, Math.floor(i / perRow));
      const col = i % perRow;
      const rowLen = 0.55 + hash01(row, 24) * 0.4;
      const u = perRow <= 1 ? 0.5 : col / (perRow - 1);
      xy[i * 2] = x0 + u * rowW * rowLen;
      xy[i * 2 + 1] = y0 + row * 22 + (hash01(i, 25) - 0.5) * 2;
      alpha[i] = 0.25 + (row === 0 ? 0.2 : 0);
    }
    sets.push({ xy, lines: new Float32Array(0), alpha });
  }

  // Ensure we didn't under-fill (totalNodes edge case) - fill any leftover zeros in stage 2
  for (const set of sets) {
    for (let i = 0; i < count; i++) {
      if (set.xy[i * 2] === 0 && set.xy[i * 2 + 1] === 0 && set.alpha[i] === 0) {
        set.xy[i * 2] = regionL + hash01(i, 30) * regionW;
        set.xy[i * 2 + 1] = hash01(i, 31) * h;
        set.alpha[i] = 0.1;
      }
    }
  }

  return { sets, ambient };
}
