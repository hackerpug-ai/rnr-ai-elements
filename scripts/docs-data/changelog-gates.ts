/**
 * Changelog build gates (GBC-007) — three fail-closed checks over the
 * `changelog` collection so CAP-LLMS-01 release data can never drift from the
 * real git tags, ordering, or required body sections:
 *
 *   1. Tag sync: `git tag --list 'v*'` (the trusted outside source, never the
 *      collection) maps one-to-one onto entry versions — a tag without an
 *      entry, an entry without a tag, and a duplicate version each fail.
 *   2. Ordering: a newer release may never be dated BEFORE an older one — the
 *      compareReleaseDesc rendering (date DESC, semver DESC tiebreak) always
 *      puts the latest release on top. Equal dates are legal.
 *   3. Body sections: every entry body holds exactly one `## Added`, `## Changed`
 *      and `## Fixed`, in that order, each holding at least one list item or a
 *      line reading exactly `none`. HTML comments (GBC-005's commit-range
 *      citations) are ignored.
 *
 * - assertChangelogSync and assertChangelogBody are PURE (inputs in, violations
 *   out, no git/filesystem access) so the vitest drill injects literal tag sets.
 * - zod (changelogSchema) owns field presence and shape; this module owns
 *   tag-sync, ordering and body sections only.
 * - Every violation renders as '[docs-data] changelog: item "<x>" <detail>'
 *   (the gates.ts renderer shape); throwOnViolations is the throwing wrapper
 *   prebuild calls — never a warning. Gates never write output bytes.
 * - git is spawned via arg-array (execFileSync), never a shell string.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  type ChangelogEntryData,
  changelogSchema,
  compareSemverDesc,
} from '../../apps/docs/src/lib/changelog-schema';

/** The changelog entry directory, relative to the repo root. */
export const CHANGELOG_DIR = 'apps/docs/src/content/changelog';

/** One failed check. `item` is the offending tag/version/entry (quoted when rendered). */
export type ChangelogViolation = { item: string; detail: string };

/** The pinned violation renderer — matches the gates.ts '[docs-data] <gate>:' shape. */
export function formatChangelogViolation(v: ChangelogViolation): string {
  return `[docs-data] changelog: item "${v.item}" ${v.detail}`;
}

/** Aggregate of every violation from a gate pass — one throw, all items listed. */
class ChangelogGateError extends Error {
  readonly violations: ChangelogViolation[];

  constructor(violations: ChangelogViolation[]) {
    super(violations.map(formatChangelogViolation).join('\n'));
    this.name = 'ChangelogGateError';
    this.violations = violations;
  }
}

/** The throwing wrapper prebuild calls: violations throw, never warn. */
export function throwOnViolations(violations: ChangelogViolation[]): void {
  if (violations.length > 0) throw new ChangelogGateError(violations);
}

/**
 * Tag-sync + ordering over ALREADY-VALIDATED entries (pure). The tag set is
 * the trusted outside source — never derived from the entries. Ordering: walk
 * versions semver-DESC; each release's date must be >= the next-older
 * release's date, else the rendered order (date DESC, semver DESC) would put
 * an older release above a newer one.
 */
export function assertChangelogSync(
  entries: ChangelogEntryData[],
  tags: string[],
): ChangelogViolation[] {
  const violations: ChangelogViolation[] = [];
  const tagVersions = tags.filter((t) => t.startsWith('v')).map((t) => t.slice(1));
  const versions = entries.map((e) => e.version);

  for (const tag of tagVersions) {
    if (!versions.includes(tag)) {
      violations.push({ item: `v${tag}`, detail: 'tag without a changelog entry' });
    }
  }
  for (const version of versions) {
    if (!tagVersions.includes(version)) {
      violations.push({ item: version, detail: 'changelog entry without a v* tag' });
    }
  }
  for (const version of new Set(versions.filter((v, i) => versions.indexOf(v) !== i))) {
    violations.push({ item: version, detail: 'duplicate changelog entry version' });
  }

  const byVersionDesc = [...entries].sort((a, b) => compareSemverDesc(a.version, b.version));
  for (let i = 1; i < byVersionDesc.length; i++) {
    const newer = byVersionDesc[i - 1];
    const older = byVersionDesc[i];
    if (newer.date.getTime() < older.date.getTime()) {
      violations.push({
        item: `${newer.version} > ${older.version}`,
        detail:
          'older release dated after newer release — entries out of reverse-chronological order (date DESC, semver DESC tiebreak)',
      });
    }
  }
  return violations;
}

const REQUIRED_SECTIONS = ['Added', 'Changed', 'Fixed'] as const;

/** The entry body: everything after the `---` frontmatter fence. */
function changelogBody(raw: string): string {
  const match = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(raw);
  return match ? raw.slice(match[0].length) : raw;
}

/** Required-heading line positions per section, in body order. */
function sectionPositions(lines: string[]): Map<string, number[]> {
  const positions = new Map<string, number[]>();
  for (const section of REQUIRED_SECTIONS) positions.set(section, []);
  for (let i = 0; i < lines.length; i++) {
    const match = /^## (.+)$/.exec(lines[i].trim());
    if (match && (REQUIRED_SECTIONS as readonly string[]).includes(match[1])) {
      positions.get(match[1])?.push(i);
    }
  }
  return positions;
}

/** Exactly one occurrence of each required heading. */
function checkSectionCounts(
  version: string,
  positions: Map<string, number[]>,
): ChangelogViolation[] {
  const violations: ChangelogViolation[] = [];
  for (const section of REQUIRED_SECTIONS) {
    const found = positions.get(section) ?? [];
    if (found.length === 0) {
      violations.push({ item: version, detail: `missing ## ${section}` });
    } else if (found.length > 1) {
      violations.push({ item: version, detail: `## ${section} duplicated` });
    }
  }
  return violations;
}

/** First occurrences must appear in Added, Changed, Fixed order. */
function checkSectionOrder(
  version: string,
  positions: Map<string, number[]>,
): ChangelogViolation[] {
  const firsts = REQUIRED_SECTIONS.map((s) => positions.get(s)?.[0] ?? -1);
  if (firsts.some((p) => p < 0)) return []; // a missing heading is already reported
  const sorted = [...firsts].sort((a, b) => a - b);
  if (sorted.every((p, i) => p === firsts[i])) return [];
  return [
    {
      item: version,
      detail: 'headings out of order — need ## Added, then ## Changed, then ## Fixed',
    },
  ];
}

/** Non-empty trimmed lines of one section (up to the next level-2 heading). */
function sectionContent(lines: string[], headingLine: number): string[] {
  let end = lines.length;
  for (let i = headingLine + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  return lines
    .slice(headingLine + 1, end)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Each single-occurrence section holds >=1 list item or a bare `none` line. */
function checkSectionContent(
  version: string,
  lines: string[],
  positions: Map<string, number[]>,
): ChangelogViolation[] {
  const violations: ChangelogViolation[] = [];
  for (const section of REQUIRED_SECTIONS) {
    const found = positions.get(section) ?? [];
    if (found.length !== 1) continue; // missing/duplicated already reported
    const content = sectionContent(lines, found[0]);
    const hasItem = content.some((l) => /^\s*(?:[-*]|\d+\.)\s+/.test(l));
    const hasNone = content.includes('none');
    if (!hasItem && !hasNone) {
      violations.push({
        item: version,
        detail: `## ${section} empty — needs a list item or a line reading exactly 'none'`,
      });
    }
  }
  return violations;
}

/**
 * Body-section check (pure): exactly one `## Added`, `## Changed` and
 * `## Fixed`, in that order, each holding >=1 list item or a line reading
 * exactly `none`. HTML comments are ignored. Every miss names the version and
 * the heading at fault.
 */
export function assertChangelogBody(version: string, body: string): ChangelogViolation[] {
  const lines = body.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
  const positions = sectionPositions(lines);
  return [
    ...checkSectionCounts(version, positions),
    ...checkSectionOrder(version, positions),
    ...checkSectionContent(version, lines, positions),
  ];
}

/**
 * Strict flat `key: scalar` frontmatter reader (TR-03's fence holds only
 * version and date; no YAML dependency resolves from scripts/ under the
 * isolated pnpm linker). Any other line shape — a nested YAML line, an
 * unknown key, a duplicate key, a bare `key:` — throws naming the file.
 */
export function readChangelogFrontmatter(
  raw: string,
  file: string,
): { version: string; date: string } {
  const fail = (detail: string): Error =>
    new Error(`[docs-data] changelog: item "${file}" ${detail}`);
  const fence = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!fence) throw fail('has no `---` frontmatter fence');
  const out: Record<string, string> = {};
  for (const line of fence[1].split(/\r?\n/)) {
    if (line.trim() === '') continue;
    const match = /^([A-Za-z][\w-]*): (.+)$/.exec(line);
    if (!match) {
      throw fail(
        `has a non-flat frontmatter line "${line.trim()}" — only flat \`key: value\` is read`,
      );
    }
    const key = match[1];
    if (key !== 'version' && key !== 'date') {
      throw fail(`has unknown frontmatter key "${key}" — only version and date are read`);
    }
    if (key in out) throw fail(`has duplicate frontmatter key "${key}"`);
    out[key] = match[2].replace(/^['"]|['"]$/g, '');
  }
  if (!('version' in out)) throw fail('is missing frontmatter `version`');
  if (!('date' in out)) throw fail('is missing frontmatter `date`');
  return { version: out.version, date: out.date };
}

/**
 * Reader + changelogSchema in one step, so the gate and the astro build
 * normalize dates the same way. Throws naming the file and field on any
 * presence or shape miss.
 */
function parseChangelogFrontmatter(raw: string, file: string): ChangelogEntryData {
  const fields = readChangelogFrontmatter(raw, file);
  const result = changelogSchema.safeParse(fields);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `field "${i.path.join('.')}" ${i.message}`)
      .join('; ');
    throw new Error(`[docs-data] changelog: item "${file}" invalid frontmatter (${issues})`);
  }
  return result.data;
}

/** The real release tags from the repo root — arg-array spawn, never a shell string. */
function listVersionTags(root: string): string[] {
  return execFileSync('git', ['tag', '--list', 'v*'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Filename-sorted changelog entries, each frontmatter-validated and body-gated. */
function loadChangelogEntries(dir: string): {
  entries: ChangelogEntryData[];
  violations: ChangelogViolation[];
} {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  const entries: ChangelogEntryData[] = [];
  const violations: ChangelogViolation[] = [];
  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf8');
    const entry = parseChangelogFrontmatter(raw, file);
    entries.push(entry);
    violations.push(...assertChangelogBody(entry.version, changelogBody(raw)));
  }
  return { entries, violations };
}

/**
 * Run all three changelog gates against the real tree; print the success line
 * (computed counts, never hardcoded) only after tag-sync, ordering and
 * body-section gates all pass. Any violation throws one ChangelogGateError.
 */
export function runChangelogGates(dir: string, root: string): void {
  const tags = listVersionTags(root);
  const { entries, violations } = loadChangelogEntries(dir);
  violations.push(...assertChangelogSync(entries, tags));
  throwOnViolations(violations);
  console.log(
    `[docs-data] changelog: ${tags.length} tags, ${entries.length} entries — one-to-one, reverse-chronological`,
  );
}

// CLI: gate the real tree. Violations go to stderr, exit 1; success line on stdout.
function main(): void {
  const root = join(import.meta.dirname, '../..');
  try {
    runChangelogGates(join(root, CHANGELOG_DIR), root);
  } catch (err) {
    if (err instanceof ChangelogGateError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
