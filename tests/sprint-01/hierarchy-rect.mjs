#!/usr/bin/env node
/**
 * TASK-F8 — extract one element's bounds from a `maestro hierarchy` dump, scaled
 * from the hierarchy's point space into the golden capture's pixel space.
 *
 * Maestro hierarchy emits JSON nodes with `attributes.bounds` in "[x1,y1][x2,y2]"
 * corner form, in POINTS. Screenshots are in PIXELS (device scale factor), so the
 * rect is scaled by capture_width / screen_width where the screen size is the
 * largest extent found in the dump.
 *
 * Usage: node hierarchy-rect.mjs <hierarchy.json> <resource-id> <capture.png>
 * Prints "x,y,width,height" (capture pixels) on success; exits 1 when the id is
 * absent or the dump is unusable (the caller falls back to full-capture sampling).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';

const [hierarchyPath, id, capturePath] = process.argv.slice(2);
if (!hierarchyPath || !id || !capturePath) {
  console.error('usage: hierarchy-rect.mjs <hierarchy.json> <resource-id> <capture.png>');
  process.exit(2);
}

function captureWidthPng(path) {
  const work = mkdtempSync(join(tmpdir(), 'f8-hier-'));
  const bmp = join(work, 'c.bmp');
  try {
    execFileSync('sips', ['-s', 'format', 'bmp', resolvePath(path), '--out', bmp], {
      stdio: 'pipe',
    });
    const buf = readFileSync(bmp);
    return buf.readInt32LE(18); // BMP DIB header width
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

let tree;
try {
  const raw = readFileSync(hierarchyPath, 'utf8');
  // maestro prints a "None: " banner line before the JSON
  tree = JSON.parse(raw.slice(raw.indexOf('{')));
} catch (err) {
  console.error(`unusable hierarchy dump: ${err.message}`);
  process.exit(1);
}

let screenW = 0;
let found = null;
(function walk(node) {
  const a = node?.attributes;
  if (!a) return;
  const m = /^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/.exec(a.bounds ?? '');
  if (m) {
    const [, x1, y1, x2, y2] = m.map(Number);
    if (x2 > screenW) screenW = x2;
    if (a['resource-id'] === id && !found) found = { x1, y1, x2, y2 };
  }
  for (const c of node.children ?? []) walk(c);
})(tree);

if (!found || screenW === 0) {
  console.error(`resource-id "${id}" not found in hierarchy`);
  process.exit(1);
}

const scale = captureWidthPng(capturePath) / screenW;
const rect = {
  x: Math.round(found.x1 * scale),
  y: Math.round(found.y1 * scale),
  width: Math.round((found.x2 - found.x1) * scale),
  height: Math.round((found.y2 - found.y1) * scale),
};
console.log(`${rect.x},${rect.y},${rect.width},${rect.height}`);
