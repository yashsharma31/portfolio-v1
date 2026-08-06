/**
 * Static SVG glyphs for the AI journey fallback timeline.
 * Palette only: accent #e8763a, soft #f09a6b, line rgba(255 255 255/0.08), tertiary #63636b.
 */

const ACCENT = "#e8763a";
const SOFT = "#f09a6b";
const LINE = "rgba(255,255,255,0.08)";
const TERT = "#63636b";

type GlyphProps = { className?: string };

/** 1) Token rectangles with ghosted trailing half. */
export function GlyphTokens({ className }: GlyphProps) {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <svg
      viewBox="0 0 120 28"
      className={className}
      aria-hidden
      fill="none"
    >
      {cells.map((i) => (
        <rect
          key={i}
          x={4 + i * 14}
          y={8}
          width={10}
          height={12}
          rx={1.5}
          fill={i < 4 ? ACCENT : SOFT}
          opacity={i < 4 ? 0.9 : 0.35}
        />
      ))}
    </svg>
  );
}

/** 2) Four-layer network lattice. */
export function GlyphNetwork({ className }: GlyphProps) {
  const layers = [
    [14, 8, 14, 20],
    [44, 4, 44, 14, 44, 24],
    [74, 4, 74, 14, 74, 24],
    [104, 8, 104, 20],
  ];
  const edges: [number, number, number, number][] = [];
  for (let L = 0; L < layers.length - 1; L++) {
    const a = layers[L];
    const b = layers[L + 1];
    for (let i = 0; i < a.length; i += 2) {
      for (let j = 0; j < b.length; j += 2) {
        edges.push([a[i], a[i + 1], b[j], b[j + 1]]);
      }
    }
  }
  return (
    <svg viewBox="0 0 120 28" className={className} aria-hidden fill="none">
      {edges.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={LINE}
          strokeWidth={0.75}
        />
      ))}
      {layers.flatMap((layer, li) =>
        Array.from({ length: layer.length / 2 }, (_, ni) => (
          <circle
            key={`${li}-${ni}`}
            cx={layer[ni * 2]}
            cy={layer[ni * 2 + 1]}
            r={2.2}
            fill={li === 0 || li === 3 ? ACCENT : SOFT}
            opacity={0.85}
          />
        ))
      )}
    </svg>
  );
}

/** 3) Scatter plot with fitted line. */
export function GlyphScatter({ className }: GlyphProps) {
  const pts = [
    [18, 22],
    [28, 18],
    [38, 19],
    [48, 14],
    [58, 15],
    [68, 11],
    [78, 10],
    [88, 8],
    [98, 7],
  ];
  return (
    <svg viewBox="0 0 120 28" className={className} aria-hidden fill="none">
      <line x1={12} y1={24} x2={108} y2={24} stroke={LINE} strokeWidth={1} />
      <line x1={12} y1={24} x2={12} y2={4} stroke={LINE} strokeWidth={1} />
      <line
        x1={16}
        y1={22}
        x2={102}
        y2={6}
        stroke={ACCENT}
        strokeWidth={1.25}
        opacity={0.85}
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.8} fill={SOFT} opacity={0.8} />
      ))}
    </svg>
  );
}

/** 4) Two token rows with an attention web. */
export function GlyphAttention({ className }: GlyphProps) {
  const top = [20, 40, 60, 80, 100];
  const bot = [20, 40, 60, 80, 100];
  const links: [number, number][] = [
    [0, 0],
    [0, 2],
    [1, 1],
    [1, 3],
    [2, 0],
    [2, 2],
    [2, 4],
    [3, 1],
    [3, 3],
    [4, 2],
    [4, 4],
  ];
  return (
    <svg viewBox="0 0 120 28" className={className} aria-hidden fill="none">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={top[a]}
          y1={7}
          x2={bot[b]}
          y2={21}
          stroke={ACCENT}
          strokeWidth={0.7}
          opacity={0.25 + (i % 3) * 0.15}
        />
      ))}
      {top.map((x, i) => (
        <rect
          key={`t${i}`}
          x={x - 5}
          y={3}
          width={10}
          height={8}
          rx={1.5}
          fill={SOFT}
          opacity={0.85}
        />
      ))}
      {bot.map((x, i) => (
        <rect
          key={`b${i}`}
          x={x - 5}
          y={17}
          width={10}
          height={8}
          rx={1.5}
          fill={ACCENT}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

/** 5) Calm horizontal text-skeleton rows. */
export function GlyphTextRows({ className }: GlyphProps) {
  const rows = [
    { y: 5, w: 96 },
    { y: 11, w: 78 },
    { y: 17, w: 88 },
    { y: 23, w: 64 },
  ];
  return (
    <svg viewBox="0 0 120 28" className={className} aria-hidden fill="none">
      {rows.map((r, i) => (
        <rect
          key={i}
          x={12}
          y={r.y}
          width={r.w}
          height={3}
          rx={1}
          fill={i === 0 ? SOFT : TERT}
          opacity={i === 0 ? 0.55 : 0.45}
        />
      ))}
    </svg>
  );
}

export const STAGE_GLYPHS = [
  GlyphTokens,
  GlyphNetwork,
  GlyphScatter,
  GlyphAttention,
  GlyphTextRows,
] as const;
