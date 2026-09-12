/**
 * SHELL-001 cycle-2 hardening proof (reviewer note 1).
 *
 * The helpers below are copied VERBATIM from tests/sprint-02-shell-hero/tokens.test.ts
 * (post-hardening). This script exercises declarationPattern against every form the
 * real build is known to emit plus the re-picked-value attacks the anchor must reject.
 * Run: ./node_modules/.bin/esbuild --loader=ts < this > out.mjs && node out.mjs
 */

/** Escape only the regex specials that occur in CSS values. */
function escapeValue(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/%]/g, '\\$&');
}

/** Percentage serialization equal to a 0.x-style decimal (0.97 -> 97), float-noise-safe. */
function percentForm(decimal: string): string {
  return (Number(decimal) * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

/** Decimal serialization equal to a percentage (10% -> 0?.1 covering 0.1 and .1). */
function decimalForm(percent: string): string {
  const value = Number(percent.replace(/%$/, '')) / 100;
  const trimmed = value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return trimmed.startsWith('0.') ? `0?${escapeValue(trimmed.slice(1))}` : escapeValue(trimmed);
}

function numberAlternatives(num: string): string {
  if (num === '1') {
    return '(?:1\\b|100%)(?![\\d.])';
  }
  if (/^0?\.\d+$/.test(num)) {
    return `(?:0?\\.${num.replace(/^0?\./, '')}|${escapeValue(percentForm(num))}%)(?![\\d.])`;
  }
  if (/^\d+(\.\d+)?%$/.test(num)) {
    return `(?:${escapeValue(num)}|${decimalForm(num)})(?![\\d.])`;
  }
  if (num === '0') {
    return '(?:0\\b|0%)(?![\\d.])';
  }
  return `${escapeValue(num)}(?![\\d.])`;
}

function cssValuePattern(value: string): string {
  const numberToken = /(\d+\.?\d*%?|\.\d+%?)/g;
  let pattern = '';
  let last = 0;
  for (const match of value.matchAll(numberToken)) {
    const index = match.index ?? 0;
    pattern += escapeValue(value.slice(last, index));
    pattern += numberAlternatives(match[0]);
    last = index + match[0].length;
  }
  pattern += escapeValue(value.slice(last));
  return pattern.replace(/ /g, '\\s*');
}

function declarationPattern(name: string, value: string): RegExp {
  return new RegExp(`(?<![\\w-])${name}\\s*:\\s*${cssValuePattern(value)}`);
}

// --- must MATCH: authored + minified serializations of the exact values ---
const mustMatch: Array<[string, string, string]> = [
  ['--border', 'oklch(1 0 0 / 10%)', '--border: oklch(1 0 0 / 10%);'],
  ['--border', 'oklch(1 0 0 / 10%)', '--border:oklch(100% 0 0/.1);'],
  ['--border', 'oklch(1 0 0 / 10%)', '--border:oklch(100% 0 0/0.1);'],
  ['--input', 'oklch(1 0 0 / 15%)', '--input:oklch(100% 0 0/.15);'],
  ['--background', 'oklch(0.145 0 0)', '--background:oklch(14.5% 0 0);'],
  ['--background', 'oklch(1 0 0)', '--background:oklch(100% 0 0);'],
  ['--muted-foreground', 'oklch(0.708 0 0)', '--muted-foreground:oklch(.708 0 0);'],
  ['--destructive', 'oklch(0.704 0.191 22.216)', '--destructive:oklch(70.4% .191 22.216);'],
  ['--ring', 'oklch(0.556 0 0)', '--ring: oklch(0.556 0 0);'],
];

// --- must REJECT: re-picked / rounded / prefix-attack values ---
const mustReject: Array<[string, string, string]> = [
  ['--border', 'oklch(1 0 0 / 10%)', '--border:oklch(100% 0 0/.15);'], // reviewer's .15 scenario
  ['--border', 'oklch(1 0 0 / 10%)', '--border:oklch(100% 0 0/.105);'],
  ['--background', 'oklch(0.145 0 0)', '--background:oklch(15% 0 0);'], // rounded
  ['--background', 'oklch(0.145 0 0)', '--background:oklch(14.55% 0 0);'], // percent prefix attack
  ['--background', 'oklch(0.145 0 0)', '--background:oklch(0.1450 0 0);'], // decimal prefix attack
  ['--background', 'oklch(1 0 0)', '--background:oklch(100.5% 0 0);'],
];

let failures = 0;
for (const [name, value, css] of mustMatch) {
  const ok = declarationPattern(name, value).test(css);
  console.log(`${ok ? 'PASS' : 'FAIL'} match   ${name} ${value}  <-  ${css}`);
  if (!ok) failures += 1;
}
for (const [name, value, css] of mustReject) {
  const rejected = !declarationPattern(name, value).test(css);
  console.log(`${rejected ? 'PASS' : 'FAIL'} reject  ${name} ${value}  <-  ${css}`);
  if (!rejected) failures += 1;
}
console.log(failures === 0 ? 'HARDENING-CHECK: all cases pass' : `HARDENING-CHECK: ${failures} failures`);
process.exitCode = failures === 0 ? 0 : 1;
