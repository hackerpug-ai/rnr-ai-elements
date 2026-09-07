#!/usr/bin/env node
/**
 * TASK-F8 AC-6 — measure the tool badge glyph's color from a golden capture.
 *
 * Pipeline: PNG capture -> BMP (macOS `sips`, no new dependencies) -> raw pixels ->
 * sRGB -> linear -> LMS -> OKLab -> OKLCH (Björn Ottosson's constants).
 *
 * Glyph, not pill: `tool-badge-completed` is a rounded pill whose background is
 * bg-secondary (chroma ~ 0). The measurement therefore never averages the element's
 * bounds — it segments the pixels that actually carry chroma (the check glyph's
 * green-600) inside the search region, reports their mean chroma/hue, and records the
 * exact sample rectangle + pixel count so the number is auditable against the capture.
 *
 * Usage:
 *   node oklch-badge.mjs <capture.png> [--rect x,y,width,height] [--json-out path]
 *     --rect  optional search region (e.g. the element bounds Maestro reports);
 *             omitted = whole capture. The sample rect is always INSIDE this region.
 *
 * Prints a JSON object on stdout. Exit 0 when a measurement was produced; exit 1 when
 * no pixel qualified (nothing chromatic in the region — e.g. the glyph rendered
 * colorless). Threshold enforcement lives in the caller script, not here.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';

const args = process.argv.slice(2);
const capture = args[0];
if (!capture) {
  console.error('usage: oklch-badge.mjs <capture.png> [--rect x,y,w,h] [--json-out path]');
  process.exit(2);
}
const rectArgIdx = args.indexOf('--rect');
const rect =
  rectArgIdx !== -1
    ? (() => {
        const [x, y, w, h] = args[rectArgIdx + 1].split(',').map(Number);
        if ([x, y, w, h].some((n) => !Number.isFinite(n))) {
          console.error(`bad --rect: ${args[rectArgIdx + 1]}`);
          process.exit(2);
        }
        return { x, y, width: w, height: h };
      })()
    : null;
const jsonOutIdx = args.indexOf('--json-out');
const jsonOut = jsonOutIdx !== -1 ? args[jsonOutIdx + 1] : null;

// --- decode: PNG -> BMP via sips, then parse the BMP by hand -------------------------
const work = mkdtempSync(join(tmpdir(), 'f8-oklch-'));
const bmp = join(work, 'capture.bmp');
try {
  execFileSync('sips', ['-s', 'format', 'bmp', resolvePath(capture), '--out', bmp], {
    stdio: 'pipe',
  });
} catch (err) {
  console.error(`sips PNG->BMP failed for ${capture}: ${err.message}`);
  process.exit(2);
}

const buf = readFileSync(bmp);
if (buf.toString('ascii', 0, 2) !== 'BM') {
  console.error('not a BMP after conversion');
  process.exit(2);
}
const pixelOffset = buf.readUInt32LE(10);
const dibSize = buf.readUInt32LE(14);
const width = buf.readInt32LE(18);
const rawHeight = buf.readInt32LE(22); // positive = bottom-up rows
const height = Math.abs(rawHeight);
const bpp = buf.readUInt16LE(28);
const bottomUp = rawHeight > 0;
if (bpp !== 24 && bpp !== 32) {
  console.error(`unsupported BMP bpp ${bpp} (dib ${dibSize})`);
  process.exit(2);
}
const bytesPP = bpp / 8;
const rowSize = Math.floor((bpp * width + 31) / 32) * 4;

// pixel(x, y) -> [r, g, b] floats in 0..1 sRGB, y=0 is the TOP row (screen space).
function pixel(x, y) {
  const row = bottomUp ? height - 1 - y : y;
  const o = pixelOffset + row * rowSize + x * bytesPP; // file is BGR(X)
  return [buf[o + 2] / 255, buf[o + 1] / 255, buf[o] / 255];
}

// --- sRGB -> OKLCH --------------------------------------------------------------------
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function oklch(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

// --- segment the glyph inside the search region ---------------------------------------
// The pill's bg-secondary is achromatic (C ~ 0.00x); the glyph's green-600 is
// oklch(0.627 0.194 149.2). Anything with chroma > 0.05 in the green hue band IS the
// glyph — text/avatar/surfaces on this screen are all neutral.
const CHROMA_GATE = 0.05;
const HUE_LO = 100;
const HUE_HI = 200;

const x0 = rect ? Math.max(0, Math.trunc(rect.x)) : 0;
const y0 = rect ? Math.max(0, Math.trunc(rect.y)) : 0;
const x1 = rect ? Math.min(width, Math.trunc(rect.x + rect.width)) : width;
const y1 = rect ? Math.min(height, Math.trunc(rect.y + rect.height)) : height;
if (x1 <= x0 || y1 <= y0) {
  console.error(`empty search region ${JSON.stringify(rect)} for ${width}x${height} capture`);
  process.exit(2);
}

let n = 0;
let sumC = 0;
let sumHx = 0; // hue averaged vectorially, never across the 0/360 seam
let sumHy = 0;
let sumR = 0;
let sumG = 0;
let sumB = 0;
let minX = Infinity;
let minY = Infinity;
let maxX = -1;
let maxY = -1;
for (let y = y0; y < y1; y += 1) {
  for (let x = x0; x < x1; x += 1) {
    const [r, g, b] = pixel(x, y);
    const { L, C, H } = oklch(r, g, b);
    if (C > CHROMA_GATE && H >= HUE_LO && H <= HUE_HI && L > 0.2) {
      n += 1;
      sumC += C;
      const rad = (H * Math.PI) / 180;
      sumHx += Math.cos(rad);
      sumHy += Math.sin(rad);
      sumR += r;
      sumG += g;
      sumB += b;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

rmSync(work, { recursive: true, force: true });

if (n === 0) {
  console.error(
    `no pixel with chroma > ${CHROMA_GATE} and hue in [${HUE_LO},${HUE_HI}] inside ` +
      `${JSON.stringify(rect ?? 'full capture')} — the glyph rendered colorless?`,
  );
  process.exit(1);
}

let hue = (Math.atan2(sumHy / n, sumHx / n) * 180) / Math.PI;
if (hue < 0) hue += 360;
const result = {
  capture: resolvePath(capture),
  capture_dimensions: { width, height },
  search_rect: rect,
  sample_rect: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
  pixels_sampled: n,
  mean_srgb: [
    Math.round((sumR / n) * 255),
    Math.round((sumG / n) * 255),
    Math.round((sumB / n) * 255),
  ],
  chroma: Number((sumC / n).toFixed(4)),
  hue: Number(hue.toFixed(2)),
};
if (jsonOut) writeFileSync(jsonOut, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
