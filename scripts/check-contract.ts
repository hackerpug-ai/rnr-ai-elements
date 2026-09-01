/**
 * Runs the styling contract's own `checks` block against the registry source.
 *
 * The contract at design/research/styling/rnr-dual-engine-registry.md is the single
 * source of truth: this script parses the fenced ```json block out of it and executes
 * every forbiddenPatterns / mustInclude entry. Editing the contract changes the gate.
 * There is no second copy of the rules to drift.
 */
import { existsSync, globSync, readFileSync } from 'node:fs';

const CONTRACT = 'design/research/styling/rnr-dual-engine-registry.md';

type Check = {
  id: string;
  mode?: string;
  glob: string[];
  exclude?: string[];
  regex: string;
  rationale?: string;
  description?: string;
};

function loadChecks(): { forbiddenPatterns: Check[]; mustInclude: Check[] } {
  if (!existsSync(CONTRACT)) {
    console.error(`FAIL: styling contract not found at ${CONTRACT}`);
    process.exit(2);
  }
  const md = readFileSync(CONTRACT, 'utf8');
  const blocks = [...md.matchAll(/```json\s*\n([\s\S]*?)\n```/g)].map((m) => m[1]);
  for (const b of blocks.reverse()) {
    try {
      const parsed = JSON.parse(b);
      if (parsed.forbiddenPatterns) return parsed;
    } catch {
      /* try the next block */
    }
  }
  console.error('FAIL: no parseable checks block in the contract');
  process.exit(2);
}

/** node:fs globSync returns paths as strings unless withFileTypes is set. */
function expand(pattern: string): string[] {
  return globSync(pattern).map((entry) => String(entry));
}

function files(globs: string[], exclude: string[] = []): string[] {
  const out = new Set<string>();
  for (const g of globs) for (const f of expand(g)) out.add(f);
  for (const g of exclude) for (const f of expand(g)) out.delete(f);
  return [...out];
}

const { forbiddenPatterns, mustInclude } = loadChecks();
let failures = 0;

for (const c of forbiddenPatterns) {
  const re = new RegExp(c.regex, 'g');
  for (const f of files(c.glob, c.exclude)) {
    if (c.mode === 'path') {
      console.error(`FAIL [${c.id}] ${f}\n       ${c.rationale ?? ''}`);
      failures++;
      continue;
    }
    const src = readFileSync(f, 'utf8');
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      re.lastIndex = 0;
      if (re.test(line)) {
        console.error(
          `FAIL [${c.id}] ${f}:${i + 1}\n       ${line.trim().slice(0, 120)}\n       ${c.rationale ?? ''}`,
        );
        failures++;
      }
    });
  }
}

for (const c of mustInclude) {
  const re = new RegExp(c.regex);
  for (const f of files(c.glob, c.exclude)) {
    if (!re.test(readFileSync(f, 'utf8'))) {
      console.error(
        `FAIL [${c.id}] ${f} is missing a required pattern\n       ${c.description ?? ''}`,
      );
      failures++;
    }
  }
}

const scanned = files(['packages/registry/src/**/*.{ts,tsx}']).length;
if (failures > 0) {
  console.error(`\n${failures} contract violation(s) across ${scanned} registry source file(s).`);
  process.exit(1);
}
console.log(
  `contract OK — ${forbiddenPatterns.length} forbidden + ${mustInclude.length} required checks, ${scanned} registry source file(s) scanned.`,
);
