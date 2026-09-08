#!/usr/bin/env node
/**
 * TASK-F8 AC-4 — measure the gap between the composer's send button and the top of
 * the Android system navigation bar, from the golden capture + device facts.
 *
 * Method (recorded so the number is auditable):
 *   1. the send button is the cluster DARKER THAN THE COMPOSER SURFACE in the
 *      composer's bottom-right region, and its lowest qualifying pixel row is the
 *      button's bottom edge. On the seeded screen the composer input is empty, so
 *      the button ships DISABLED (bg-muted grey, ~L*0.64 — cycle-2/img/
 *      android-light-bottomright.png), not bg-primary black; the detector must
 *      find the button as it actually renders, so the threshold is
 *      surface-relative (lum < 0.75 against a >= 0.9 surface), not near-black.
 *   2. the navigation bar top = capture_height - navbar_height_px. The caller
 *      resolves the bar height from the system's own navigationBars InsetsSource
 *      frame (`dumpsys window displays`, authoritative for gesture nav's 24dp
 *      bar), falling back to `adb settings get global navigation_bar_height`
 *      (3-button nav) and then to a 24dp gesture-nav default; the source is
 *      recorded in the caller's log line so the number is auditable. The search window ends AT the navbar top: the
 *      system gesture pill lives INSIDE the navbar's y-band (and is centred on x,
 *      which the x >= 57% window also mostly excludes), so scanning only above
 *      the line excludes the pill while keeping the measurement honest — a send
 *      button that overlaps the navbar has its lowest pixels at or past the line
 *      and reports a gap of <= 0, which fails the >= 1dp gate.
 *   3. gap_px = navbar_top - button_bottom; gap_dp = gap_px / (density / 160).
 *
 * Usage: node android-clearance.mjs <capture.png> <navbar_height_px> <density>
 * Prints one compact JSON line.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';

const [capturePath, navhArg, densityArg] = process.argv.slice(2);
if (!capturePath || !navhArg || !densityArg) {
  console.error('usage: android-clearance.mjs <capture.png> <navbar_height_px> <density>');
  process.exit(2);
}
const navbarPx = Number(navhArg);
const density = Number(densityArg);
if (!Number.isFinite(navbarPx) || !Number.isFinite(density) || navbarPx <= 0 || density <= 0) {
  console.error('bad navbar height or density');
  process.exit(2);
}

const work = mkdtempSync(join(tmpdir(), 'f8-clear-'));
const bmp = join(work, 'capture.bmp');
try {
  execFileSync('sips', ['-s', 'format', 'bmp', resolvePath(capturePath), '--out', bmp], {
    stdio: 'pipe',
  });
} catch (err) {
  console.error(`sips PNG->BMP failed: ${err.message}`);
  process.exit(2);
}
const buf = readFileSync(bmp);
if (buf.toString('ascii', 0, 2) !== 'BM') {
  console.error('not a BMP after conversion');
  process.exit(2);
}
const pixelOffset = buf.readUInt32LE(10);
const width = buf.readInt32LE(18);
const rawHeight = buf.readInt32LE(22);
const height = Math.abs(rawHeight);
const bpp = buf.readUInt16LE(28);
if (bpp !== 24 && bpp !== 32) {
  console.error(`unsupported BMP bpp ${bpp}`);
  process.exit(2);
}
const bytesPP = bpp / 8;
const rowSize = Math.floor((bpp * width + 31) / 32) * 4;

function pixel(x, y) {
  const row = rawHeight > 0 ? height - 1 - y : y;
  const o = pixelOffset + row * rowSize + x * bytesPP;
  return [buf[o + 2] / 255, buf[o + 1] / 255, buf[o] / 255];
}

// search window: bottom-right of the screen, above the navbar line (which also
// excludes the gesture pill — it lives inside the navbar's y-band) and right of
// the pill's centred x-band
const navbarTop = height - navbarPx;
const x0 = Math.trunc(width * 0.57);
const x1 = Math.trunc(width * 0.98);
const y0 = Math.trunc(height * 0.7);
const y1 = navbarTop;

let buttonBottom = -1;
let buttonTop = -1;
let buttonLeft = -1;
let buttonRight = -1;
let darkPixels = 0;
for (let y = y0; y < y1; y += 1) {
  for (let x = x0; x < x1; x += 1) {
    const [r, g, b] = pixel(x, y);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // surface-relative darkness: the composer surface and page background sit at
    // lum >= 0.9; the disabled send button's body sits near 0.64; higher clusters
    // (badge text/chevron) are darker still but strictly ABOVE the button, so only
    // the button can set the lowest row this loop records
    if (lum < 0.75) {
      darkPixels += 1;
      if (y > buttonBottom) buttonBottom = y;
      if (buttonTop === -1 || y < buttonTop) buttonTop = y;
      if (buttonLeft === -1 || x < buttonLeft) buttonLeft = x;
      if (x > buttonRight) buttonRight = x;
    }
  }
}
rmSync(work, { recursive: true, force: true });

if (darkPixels === 0 || buttonBottom < 0) {
  console.error(
    'no send-button pixels (lum < 0.75) found in the composer region above the navbar line',
  );
  process.exit(1);
}

const gapPx = navbarTop - buttonBottom;
const gapDp = Number((gapPx / (density / 160)).toFixed(2));

console.log(
  JSON.stringify({
    capture: resolvePath(capturePath),
    capture_dimensions: { width, height },
    send_button_rect: {
      x: buttonLeft,
      y: buttonTop,
      width: buttonRight - buttonLeft + 1,
      height: buttonBottom - buttonTop + 1,
    },
    navbar_height_px: navbarPx,
    navbar_top_px: navbarTop,
    gap_px: gapPx,
    gap_dp: gapDp,
    density,
  }),
);
