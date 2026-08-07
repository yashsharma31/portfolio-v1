/**
 * Duotone portrait for About (PRD 6.7).
 * Moody near-black with ember only in highlights / rim light.
 * Run: node scripts/duotone-portrait.mjs
 */
import sharp from "sharp";

const SRC = "public/images/profile.jpeg";
const OUT = "public/images/about-portrait.jpg";

const SHADOW = { r: 0x0e, g: 0x0d, b: 0x0c };
const ZINC_LO = { r: 0x1c, g: 0x1c, b: 0x20 };
const ZINC_MID = { r: 0x3c, g: 0x3c, b: 0x42 };
const WARM_ZINC = { r: 0x5a, g: 0x46, b: 0x3a };
const EMBER = { r: 0xe8, g: 0x76, b: 0x3a };
const PEAK = { r: 0xf0, g: 0xb4, b: 0x93 };

function lerp(a, b, t) {
  const u = Math.min(1, Math.max(0, t));
  return {
    r: a.r + (b.r - a.r) * u,
    g: a.g + (b.g - a.g) * u,
    b: a.b + (b.b - a.b) * u,
  };
}

/**
 * Near-black + dark zinc through most of the range.
 * Ember confined to the top ~10% of crushed luminance;
 * peak highlights approach #f0b493.
 */
function buildLut() {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let c;
    if (t < 0.35) {
      c = lerp(SHADOW, ZINC_LO, t / 0.35);
    } else if (t < 0.68) {
      c = lerp(ZINC_LO, ZINC_MID, (t - 0.35) / 0.33);
    } else if (t < 0.84) {
      c = lerp(ZINC_MID, WARM_ZINC, (t - 0.68) / 0.16);
    } else if (t < 0.95) {
      c = lerp(WARM_ZINC, EMBER, (t - 0.84) / 0.11);
    } else {
      c = lerp(EMBER, PEAK, (t - 0.95) / 0.05);
    }
    const j = i * 3;
    lut[j] = Math.round(c.r);
    lut[j + 1] = Math.round(c.g);
    lut[j + 2] = Math.round(c.b);
  }
  return lut;
}

const lut = buildLut();

const { data, info } = await sharp(SRC)
  .resize({ width: 1200, withoutEnlargement: true })
  .grayscale()
  .blur(0.85)
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.alloc(info.width * info.height * 3);
for (let i = 0, j = 0; i < data.length; i++, j += 3) {
  const crushed = Math.pow(data[i] / 255, 1.35);
  const idx = Math.min(255, Math.round(crushed * 255)) * 3;
  out[j] = lut[idx];
  out[j + 1] = lut[idx + 1];
  out[j + 2] = lut[idx + 2];
}

await sharp(out, {
  raw: { width: info.width, height: info.height, channels: 3 },
})
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${OUT}: ${meta.width}x${meta.height}`);
