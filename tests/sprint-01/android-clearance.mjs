#!/usr/bin/env node
/**
 * TASK-F8 AC-4 — measure the gap between the composer's send button and the top of
 * the Android system navigation bar, from the golden capture + device facts.
 *
 * Method (recorded so the number is auditable):
 *   1. the send button is the dark cluster (bg-primary, near-black in light mode)
 *      in the composer's bottom-right region; its lowest dark pixel row is the
 *      button's bottom edge. The search window excludes the bottom-centre gesture
 *      pill (x < 55% of width) so the system's own hint cannot count as the button.
 *   2. the navigation bar top = capture_height - navbar_height_px (passed in from
 *      `adb settings get global navigation_bar_height`, with a 48dp fallback the
 *      caller resolves and labels).
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

// search window: bottom-right of the screen, above the gesture pill's x band
const x0 = Math.trunc(width * 0.55);
const x1 = Math.trunc(width * 0.98);
const y0 = Math.trunc(height * 0.7);
const y1 = Math.trunc(height * 0.99);

let buttonBottom = -1;
let buttonTop = -1;
let buttonLeft = -1;
let buttonRight = -1;
let darkPixels = 0;
for (let y = y0; y < y1; y += 1) {
  for (let x = x0; x < x1; x += 1) {
    const [r, g, b] = pixel(x, y);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum < 0.35) {
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
  console.error('no dark send-button pixels found in the composer region');
  process.exit(1);
}

const navbarTop = height - navbarPx;
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
