/**
 * GBC-007 — changelog content collection + schema + build gates.
 *
 * Unit drill over the pure gate functions with literal inputs (UNIT_TEST_JUSTIFIED
 * per the task contract: assertChangelogSync takes entries and tags as arguments,
 * the body-section check takes a markdown body, the flat frontmatter reader takes
 * text, changelogSchema parses literal objects, and content.config.ts is one
 * static read — no git, no network, no build). The real-tree proof (real git
 * tags, real prebuild, real stdout line) is AC-1 on FLOW-DOCS-06, proven when
 * GBC-008 closes.
 *
 * Five named selectors (one per UNIT AC), each RED-first:
 *   - GBC-007-tag-without-entry   (AC-2) extra v* tag fails naming the tag
 *   - GBC-007-entry-without-tag   (AC-3) orphan entry + duplicate version fail
 *   - GBC-007-reverse-chronological (AC-4) older-newer date inversion fails;
 *                                          equal dates are legal, semver DESC breaks ties
 *   - GBC-007-body-sections       (AC-5) exactly one Added/Changed/Fixed, in
 *                                          order, each non-empty or `none`
 *   - GBC-007-frontmatter-shape   (AC-6) flat reader + changelogSchema shape
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { changelogSchema, compareReleaseDesc } from '../../apps/docs/src/lib/changelog-schema';
import {
  assertChangelogBody,
  assertChangelogSync,
  formatChangelogViolation,
  readChangelogFrontmatter,
  throwOnViolations,
} from '../../scripts/docs-data/changelog-gates';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Literal schema-shaped entry: date coerced exactly as changelogSchema emits it. */
function entry(version: string, date: string): { version: string; date: Date } {
  return { version, date: new Date(date) };
}

/** The healthy-tree literals shared by the sync drills (real tags + GBC-005 entries). */
const HEALTHY_ENTRIES = [
  entry('0.1.0', '2026-09-07'),
  entry('0.2.0', '2026-09-08'),
  entry('0.2.1', '2026-09-08'),
];
const HEALTHY_TAGS = ['v0.1.0', 'v0.2.0', 'v0.2.1'];

test('GBC-007-tag-without-entry', () => {
  const violations = assertChangelogSync(HEALTHY_ENTRIES, [...HEALTHY_TAGS, 'v0.2.2']);

  expect(violations).toHaveLength(1);
  expect(violations[0].item).toBe('v0.2.2');
  expect(violations[0].detail).toMatch(/tag without a changelog entry/);

  const line = formatChangelogViolation(violations[0]);
  expect(line.startsWith('[docs-data] changelog:')).toBe(true);
  expect(line).toContain('v0.2.2');

  // The wrapper prebuild calls throws — never a warning.
  expect(() => throwOnViolations(violations)).toThrow(/v0\.2\.2/);
});

test('GBC-007-entry-without-tag', () => {
  // Case 1: an entry with no v* tag.
  const orphaned = assertChangelogSync(
    [...HEALTHY_ENTRIES, entry('0.3.0', '2026-09-09')],
    HEALTHY_TAGS,
  );
  expect(orphaned).toHaveLength(1);
  expect(orphaned[0].item).toBe('0.3.0');
  expect(orphaned[0].detail).toMatch(/changelog entry without a v\* tag/);
  expect(() => throwOnViolations(orphaned)).toThrow(/0\.3\.0/);

  // Case 2: two entries claiming 0.2.1 against one tag.
  const duplicated = assertChangelogSync(
    [...HEALTHY_ENTRIES, entry('0.2.1', '2026-09-08')],
    HEALTHY_TAGS,
  );
  expect(duplicated).toHaveLength(1);
  expect(duplicated[0].item).toBe('0.2.1');
  expect(duplicated[0].detail).toMatch(/duplicate/);
  expect(() => throwOnViolations(duplicated)).toThrow(/0\.2\.1/);
});

test('GBC-007-reverse-chronological', () => {
  // Swapped: the OLDER 0.2.0 is dated AFTER the newer 0.2.1 — exactly one
  // violation naming both.
  const swapped = [
    entry('0.1.0', '2026-09-07'),
    entry('0.2.0', '2026-09-09'),
    entry('0.2.1', '2026-09-08'),
  ];
  const violations = assertChangelogSync(swapped, HEALTHY_TAGS);
  expect(violations).toHaveLength(1);
  expect(violations[0].item).toMatch(/0\.2\.0/);
  expect(violations[0].item).toMatch(/0\.2\.1/);
  expect(violations[0].detail).toMatch(/order/);
  expect(() => throwOnViolations(violations)).toThrow(/order/);

  // Tie: equal dates are LEGAL; 0 violations on the healthy literals.
  expect(assertChangelogSync(HEALTHY_ENTRIES, HEALTHY_TAGS)).toHaveLength(0);

  // The exported comparator orders 0.2.1 above 0.2.0 (semver DESC breaks the tie).
  const sorted = [...HEALTHY_ENTRIES].sort(compareReleaseDesc);
  expect(sorted.map((e) => e.version)).toEqual(['0.2.1', '0.2.0', '0.1.0']);
});

test('GBC-007-body-sections', () => {
  // Healthy: comment ignored, `none` accepted, one heading each, in order.
  const healthy = [
    '<!-- Deriving commit range: git log v0.2.0..v0.2.1 -->',
    '',
    '## Added',
    '',
    'none',
    '',
    '## Changed',
    '',
    '- one change',
    '',
    '## Fixed',
    '',
    '- one fix',
  ].join('\n');
  expect(assertChangelogBody('0.2.1', healthy)).toHaveLength(0);

  // Broken 1: `## Fixed` removed.
  const missingFixed = ['## Added', '', 'none', '', '## Changed', '', '- one change'].join('\n');
  const missing = assertChangelogBody('0.2.1', missingFixed);
  expect(missing).toHaveLength(1);
  expect(missing[0].item).toBe('0.2.1');
  expect(missing[0].detail).toMatch(/missing ## Fixed/);
  expect(formatChangelogViolation(missing[0]).startsWith('[docs-data] changelog:')).toBe(true);
  expect(() => throwOnViolations(missing)).toThrow(/## Fixed/);

  // Broken 2: `## Added` twice.
  const duplicatedAdded = [
    '## Added',
    '',
    'none',
    '',
    '## Added',
    '',
    '- another addition',
    '',
    '## Changed',
    '',
    '- one change',
    '',
    '## Fixed',
    '',
    '- one fix',
  ].join('\n');
  const duplicated = assertChangelogBody('0.2.1', duplicatedAdded);
  expect(duplicated).toHaveLength(1);
  expect(duplicated[0].detail).toMatch(/## Added duplicated/);
  expect(() => throwOnViolations(duplicated)).toThrow(/## Added/);

  // Broken 3: `## Changed` with no list item and no `none`.
  const emptyChanged = [
    '## Added',
    '',
    'none',
    '',
    '## Changed',
    '',
    'Some prose but no list item.',
    '',
    '## Fixed',
    '',
    '- one fix',
  ].join('\n');
  const empty = assertChangelogBody('0.2.1', emptyChanged);
  expect(empty).toHaveLength(1);
  expect(empty[0].detail).toMatch(/## Changed/);
  expect(() => throwOnViolations(empty)).toThrow(/## Changed/);

  // Broken 4: `## Fixed` placed before `## Changed`.
  const outOfOrder = [
    '## Added',
    '',
    'none',
    '',
    '## Fixed',
    '',
    '- one fix',
    '',
    '## Changed',
    '',
    '- one change',
  ].join('\n');
  const ordered = assertChangelogBody('0.2.1', outOfOrder);
  expect(ordered).toHaveLength(1);
  expect(ordered[0].detail).toMatch(/order/);
  expect(() => throwOnViolations(ordered)).toThrow(/order/);
});

test('GBC-007-frontmatter-shape', () => {
  // The flat reader turns `key: scalar` lines into those two values...
  const unquoted = readChangelogFrontmatter(
    '---\nversion: 0.2.1\ndate: 2026-09-08\n---\n\nReleased 2026-09-08.\n',
    '0.2.1.md',
  );
  expect(unquoted).toEqual({ version: '0.2.1', date: '2026-09-08' });

  // ...including the quoted form GBC-005 actually authors.
  const quoted = readChangelogFrontmatter(
    "---\nversion: '0.2.1'\ndate: '2026-09-08'\n---\n\nbody\n",
    '0.2.1.md',
  );
  expect(quoted).toEqual({ version: '0.2.1', date: '2026-09-08' });

  // Any other line shape fails naming the file — here a nested YAML line.
  expect(() =>
    readChangelogFrontmatter('---\nversion: 0.2.1\nmeta:\n  nested: true\n---\n', '0.2.1.md'),
  ).toThrow(/0\.2\.1\.md/);

  // changelogSchema accepts BOTH the JS Date an unquoted YAML date yields and
  // the quoted string, each printing the UTC calendar day.
  const fromString = changelogSchema.safeParse({ version: '0.2.1', date: '2026-09-08' });
  expect(fromString.success).toBe(true);
  if (!fromString.success) throw new Error('unreachable');
  expect(fromString.data.date.toISOString().slice(0, 10)).toBe('2026-09-08');

  const fromDate = changelogSchema.safeParse({ version: '0.2.1', date: new Date('2026-09-08') });
  expect(fromDate.success).toBe(true);
  if (!fromDate.success) throw new Error('unreachable');
  expect(fromDate.data.date.toISOString().slice(0, 10)).toBe('2026-09-08');

  // Missing date fails at path `date`.
  const missingDate = changelogSchema.safeParse({ version: '0.2.1' });
  expect(missingDate.success).toBe(false);
  if (missingDate.success) throw new Error('unreachable');
  expect(missingDate.error.issues.some((i) => i.path.includes('date'))).toBe(true);

  // Malformed date fails at path `date`.
  const notADate = changelogSchema.safeParse({ version: '0.2.1', date: 'not-a-date' });
  expect(notADate.success).toBe(false);
  if (notADate.success) throw new Error('unreachable');
  expect(notADate.error.issues.some((i) => i.path.includes('date'))).toBe(true);

  // Non-semver version fails at path `version`.
  const scriptVersion = changelogSchema.safeParse({
    version: '<script>alert(1)</script>',
    date: '2026-09-08',
  });
  expect(scriptVersion.success).toBe(false);
  if (scriptVersion.success) throw new Error('unreachable');
  expect(scriptVersion.error.issues.some((i) => i.path.includes('version'))).toBe(true);

  // TC-1: content.config.ts registers the changelog collection on
  // ./src/content/changelog with changelogSchema (static read).
  const config = readFileSync(join(ROOT, 'apps/docs/src/content.config.ts'), 'utf8');
  expect(config).toContain("base: './src/content/changelog'");
  expect(config).toContain('changelogSchema');
  expect(config).toMatch(/export const collections = \{[^}]*changelog[^}]*\}/);
});
