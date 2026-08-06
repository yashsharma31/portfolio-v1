/**
 * Produces public/images/hero-art.png from assets-src/hero-art-source.png:
 * removes the flat dark backdrop via border-seeded flood fill (protects dark
 * interior pixels like the shirt), feathers the alpha edge, resizes to 2048w.
 *
 * Run: node scripts/process-hero-art.mjs
 */
import sharp from "sharp";

const SRC = "assets-src/hero-art-source.png";
const OUT = "public/images/hero-art.png";
const TOLERANCE = 30; // max euclidean RGB distance from the seed bg color

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// Seed background color: average of the four 8x8 corner patches.
let sr = 0;
let sg = 0;
let sb = 0;
let n = 0;
for (const [cx, cy] of [
  [0, 0],
  [W - 8, 0],
  [0, H - 8],
  [W - 8, H - 8],
]) {
  for (let y = cy; y < cy + 8; y++) {
    for (let x = cx; x < cx + 8; x++) {
      const i = (y * W + x) * 4;
      sr += data[i];
      sg += data[i + 1];
      sb += data[i + 2];
      n++;
    }
  }
}
sr /= n;
sg /= n;
sb /= n;
console.log(`bg seed: rgb(${sr.toFixed(0)}, ${sg.toFixed(0)}, ${sb.toFixed(0)})`);

const tol2 = TOLERANCE * TOLERANCE;
const isBg = (i) => {
  const dr = data[i] - sr;
  const dg = data[i + 1] - sg;
  const db = data[i + 2] - sb;
  return dr * dr + dg * dg + db * db < tol2;
};

// Flood fill from every border pixel that matches the bg color.
const visited = new Uint8Array(W * H);
const queue = new Int32Array(W * H);
let head = 0;
let tail = 0;
const push = (x, y) => {
  const p = y * W + x;
  if (visited[p] || !isBg(p * 4)) return;
  visited[p] = 1;
  queue[tail++] = p;
};
for (let x = 0; x < W; x++) {
  push(x, 0);
  push(x, H - 1);
}
for (let y = 0; y < H; y++) {
  push(0, y);
  push(W - 1, y);
}
while (head < tail) {
  const p = queue[head++];
  const x = p % W;
  const y = (p / W) | 0;
  if (x > 0) push(x - 1, y);
  if (x < W - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < H - 1) push(x, y + 1);
}
console.log(`removed ${tail} of ${W * H} pixels (${((tail / (W * H)) * 100).toFixed(1)}%)`);

for (let p = 0; p < W * H; p++) {
  if (visited[p]) data[p * 4 + 3] = 0;
}

// Feather: blur only the alpha channel by rebuilding through sharp.
const alphaBlurred = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .extractChannel(3)
  .blur(1.2)
  .raw()
  .toBuffer();
for (let p = 0; p < W * H; p++) {
  // Never re-add alpha deep inside removed areas; only soften the boundary.
  data[p * 4 + 3] = visited[p]
    ? Math.min(alphaBlurred[p], 128)
    : Math.max(alphaBlurred[p], data[p * 4 + 3] === 0 ? 0 : 200);
}

await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .resize({ width: 2048 })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${OUT}: ${meta.width}x${meta.height}`);
