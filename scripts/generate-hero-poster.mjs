/**
 * Generates the hero poster: a halftone-dot rendering of the profile photo
 * (PRD 5.1). The Pixi canvas reproduces this exact look live; the poster is
 * the LCP element and the reduced-motion / no-WebGL fallback.
 *
 * Usage: node scripts/generate-hero-poster.mjs
 * Output: public/images/hero-poster.png (transparent bg, 2x for retina)
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "../public/images/profile.jpeg");
const OUT = path.join(__dirname, "../public/images/hero-poster.png");

// Grid resolution: matches HeroCanvas sampling (GRID_COLS in HeroCanvas.tsx).
const COLS = 88;
const CELL = 14; // output px per cell (2x of the 7px display cell)

// Palette (PRD 3.1): dots interpolate ink-tertiary -> accent by brightness.
const FROM = { r: 0x63, g: 0x63, b: 0x6b }; // --color-ink-tertiary
const TO = { r: 0xe8, g: 0x76, b: 0x3a }; // --color-accent

const meta = await sharp(SRC).metadata();

// Crop to the subject (head, raised arm, torso against the valley).
// Fractions of the source image, tuned by eye against profile.jpeg.
const crop = {
  left: Math.round(meta.width * 0.52),
  top: Math.round(meta.height * 0.42),
  width: Math.round(meta.width * 0.48),
  height: Math.round(meta.height * 0.52),
};
const rows = Math.round((COLS * crop.height) / crop.width);

// Luminance is inverted: the subject wears dark clothes against a bright
// valley, so inverting makes the figure the glowing dot mass on the dark page.
const { data } = await sharp(SRC)
  .extract(crop)
  .resize(COLS, rows, { fit: "fill" })
  .grayscale()
  .normalise()
  .negate()
  .gamma(2.0)
  .raw()
  .toBuffer({ resolveWithObject: true });

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

let circles = "";
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < COLS; x++) {
    const v = data[y * COLS + x] / 255;
    if (v < 0.30) continue; // drop faint cells so the figure stays crisp
    const r = ((v * 0.85 + 0.15) * CELL) / 2 - 0.5;
    const fill = `rgb(${lerp(FROM.r, TO.r, v)},${lerp(FROM.g, TO.g, v)},${lerp(
      FROM.b,
      TO.b,
      v
    )})`;
    circles += `<circle cx="${x * CELL + CELL / 2}" cy="${
      y * CELL + CELL / 2
    }" r="${r.toFixed(1)}" fill="${fill}" fill-opacity="${(
      v * 0.75 +
      0.25
    ).toFixed(2)}"/>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
  COLS * CELL
}" height="${rows * CELL}">${circles}</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);

console.log(
  `hero-poster.png written: ${COLS * CELL}x${rows * CELL} (${COLS}x${rows} grid)`
);
