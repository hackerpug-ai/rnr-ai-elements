/**
 * TASK-F7 AC-2 — the obligation record matches what the consumer app declares.
 *
 * Reads the TWO REAL FILES this task owns from disk (never fixtures): the palette
 * slice in apps/example/global.css and the OBLIGATION-TABLE-SPRINT-01 block in
 * design/style-parity-remediation.md. The table's entry set is diffed against the
 * theme file's entry set — both sides narrowed to the palette families (zinc|slate|
 * gray|green|orange|yellow|blue|red), so RNR's own role tokens (--color-chart-1 …
 * --color-chart-5 etc.) are not demanded as rows — and both sides must be non-empty
 * (>= 8) so an absent/unappended theme file exits 1 instead of passing on
 * nothing-versus-nothing. The three escalation subsections must each carry a command
 * a reviewer can re-run.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const CSS = join(ROOT, 'apps', 'example', 'global.css');
const RECORD = join(ROOT, 'design', 'style-parity-remediation.md');

const css = () => readFileSync(CSS, 'utf8');
const record = () => readFileSync(RECORD, 'utf8');

/** Palette-family tokens only — deliberately NOT --color-[a-z]+-[0-9]+ (that would
 *  match --color-chart-1 … --color-chart-5 and make the diff non-empty on a correct
 *  implementation). */
const FAMILY = /--color-(?:zinc|slate|gray|green|orange|yellow|blue|red)-\d+/g;
const unique = (t: string) => [...new Set(t.match(FAMILY) ?? [])].sort();

/** Content between the OBLIGATION-TABLE-SPRINT-01 delimiters, inclusive of the
 *  marker headings (the markers themselves carry no --color tokens). */
function tableBlock(): string {
  const m = record().match(
    /OBLIGATION-TABLE-SPRINT-01-START([\s\S]*?)OBLIGATION-TABLE-SPRINT-01-END/,
  );
  if (!m) return '';
  return m[1];
}

describe('TASK-F7 AC-2 — the record matches what the app declares', () => {
  test('AC-2 the obligation table matches the consumer theme', () => {
    // Non-empty anchors: an absent or unappended theme file (or an empty @theme)
    // makes the declared side empty and must fail here, not pass on two empty sets.
    const declared = unique(css());
    expect(declared.length).toBeGreaterThanOrEqual(8);
    const table = unique(tableBlock());
    expect(table.length).toBeGreaterThanOrEqual(8);

    // The load-bearing assertion: table rows == css declarations, palette families only.
    expect(table).toEqual(declared);

    // AC-2 must_observe: the record's FULL-SET subsection names the harness file and
    // marks its full set NOT declared in this app.
    const rec = record();
    expect(rec).toContain('FULL-SET');
    expect(rec).toContain('apps/harness/src/global.css');
    expect(rec).toContain('NOT declared in this app');

    // Each escalation must carry a re-runnable reproducing command — an
    // unreproducible finding is a rumor.
    expect(rec).toContain(
      "grep -c -- '--color-orange-500' apps/harness/src/global.css; grep -c 'dark:text-orange-500' packages/registry/src/lib/status.ts",
    );
    expect(rec).toContain('prints `0` then `2`');
    expect(rec).toContain(
      'grep -c class-safelist public/r/uniwind/file-tree.json public/r/uniwind/transcription.json',
    );
    expect(rec).toContain('prints `1` for each file');
    expect(rec).toContain(
      'node -e "const r=require(\'./packages/registry/registry.json\');console.log(r.items.length, r.items.filter(i=>i.cssVars&&Object.keys(i.cssVars).length).length)"',
    );
    expect(rec).toContain('prints `56 0`');

    // NO DISTRIBUTION DECISION: the record must not choose among registry cssVars /
    // a documented install prerequisite / converting the escape colors back to RNR
    // roles — that is sprint-03's call.
    expect(rec).toContain('Distribution decision — NOT made here');
    expect(rec).toMatch(/sprint-03's call/);
  });
});
