import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * ORI-CONT-006 — the TR-12 docs contribution contract, proven over the real
 * candidate. Every assertion reads real bytes from disk (CONTRIBUTING.md, TR-12
 * content standards, apps/docs/package.json, packages/registry/registry.json);
 * every mutation control copies the actual file into owned OS-derived scratch
 * and re-runs the same checker over the copy; AC-2 executes the three
 * documented commands as real pnpm subprocesses against the current candidate
 * and binds the dist the link gate reads to the dist that build produced.
 */
const ROOT = process.cwd();
const CONTRIBUTING_PATH = join(ROOT, 'CONTRIBUTING.md');
const STANDARDS_PATH = join(
  ROOT,
  '.spec/prds/docs-site/11-technical-requirements/12-content-standards.md',
);
const DOCS_PKG_PATH = join(ROOT, 'apps/docs/package.json');
const REGISTRY_PATH = join(ROOT, 'packages/registry/registry.json');
const DIST_DIR = join(ROOT, 'apps/docs/dist');

/** The three fixed docs commands, in execution order (task contract / TR-12). */
const DOCS_COMMANDS = [
  'pnpm --filter @rnr-ai-elements/docs build',
  'pnpm --filter @rnr-ai-elements/docs check:snippets',
  'pnpm --filter @rnr-ai-elements/docs check:links',
] as const;

/** The four TR-12 docs-PR criteria phrases, sourced from the standards file. */
const TR12_CRITERIA_LINE =
  /Docs-PR criteria\*\* \(stated in CONTRIBUTING\): build green, link check green, snippet gate green, content-standards conformance/;

const CRITERIA_PHRASES = [
  'build green',
  'link check green',
  'snippet gate green',
  'content-standards conformance',
] as const;

function readContributing(): string {
  if (!existsSync(CONTRIBUTING_PATH)) {
    throw new Error(
      '[ORI-CONT-006] content failure: CONTRIBUTING.md is missing — the TR-12 docs contribution contract requires it',
    );
  }
  return readFileSync(CONTRIBUTING_PATH, 'utf8');
}

/** AC-1 checker: the four independent criteria, derived from TR-12 (never from the doc under test). */
function criteriaDiagnostics(content: string): string[] {
  const standards = readFileSync(STANDARDS_PATH, 'utf8');
  if (!TR12_CRITERIA_LINE.test(standards)) {
    return [
      `[ORI-CONT-006] TR-12 standards no longer state the four docs-PR criteria at ${STANDARDS_PATH}`,
    ];
  }
  const diagnostics: string[] = [];
  for (const phrase of CRITERIA_PHRASES) {
    if (!content.toLowerCase().includes(phrase)) {
      diagnostics.push(
        `[ORI-CONT-006] criterion missing from checklist: "${phrase}" (TR-12 docs-PR criteria)`,
      );
    }
  }
  return diagnostics;
}

/** AC-1 checker: the three exact commands. */
function commandDiagnostics(content: string): string[] {
  const diagnostics: string[] = [];
  for (const command of DOCS_COMMANDS) {
    if (!content.includes(command)) {
      const nearMiss = /check:snippets?(?![\w-])/.exec(content);
      diagnostics.push(
        `[ORI-CONT-006] documented command missing: "${command}"` +
          (nearMiss ? `; found mutated "${nearMiss[0]}" instead` : ''),
      );
    }
  }
  return diagnostics;
}

/** AC-3 checker: the behavior-to-description currency rule. */
function currencyDiagnostics(content: string): string[] {
  const markers: [string, string][] = [
    ['packages/registry/registry.json', 'names the registry file packages/registry/registry.json'],
    ['description', 'names the description field'],
    ['behavior', 'connects behavior changes to description updates'],
    ['reviewer', 'assigns accuracy judgment to the reviewer'],
    ['accura', 'requires the description to remain accurate'],
  ];
  const lower = content.toLowerCase();
  const diagnostics: string[] = [];
  for (const [marker, requirement] of markers) {
    if (!lower.includes(marker.toLowerCase())) {
      diagnostics.push(
        `[ORI-CONT-006] description-currency rule incomplete: ${requirement} (marker "${marker}" absent)`,
      );
    }
  }
  return diagnostics;
}

/** GitHub-style heading slug (the anchor algorithm the two fragment targets follow). */
function githubSlug(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** AC-4 checker: every local link and fragment resolves from disk. */
function linkDiagnostics(content: string): string[] {
  const diagnostics: string[] = [];
  const links = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  if (links.length === 0) {
    return [`[ORI-CONT-006] CONTRIBUTING.md contains no links to resolve`];
  }
  for (const match of links) {
    const target = match[2];
    if (/^https?:\/\//.test(target)) continue; // external targets are out of scope for local resolution
    const [path, fragment] = target.split('#');
    const abs = join(ROOT, path);
    if (!existsSync(abs)) {
      diagnostics.push(`[ORI-CONT-006] dangling local target: ${target}`);
      continue;
    }
    if (fragment) {
      const headings = [...readFileSync(abs, 'utf8').matchAll(/^##?\s+(.+)$/gm)].map((m) =>
        githubSlug(m[1]),
      );
      if (!headings.includes(fragment)) {
        diagnostics.push(
          `[ORI-CONT-006] fragment "#${fragment}" not a heading in ${path} (headings: ${headings.join(', ')})`,
        );
      }
    }
  }
  return diagnostics;
}

/** Write a real file copy into owned scratch and read it back from disk. */
function scratchCopy(dir: string, content: string, name: string): string {
  const path = join(dir, name);
  writeFileSync(path, content);
  return readFileSync(path, 'utf8');
}

function removeLinesMatching(content: string, pattern: RegExp): string {
  return content
    .split('\n')
    .filter((line) => !pattern.test(line))
    .join('\n');
}

/** Remove the description-currency section (its heading through end of file). */
function removeCurrencySection(content: string): string {
  const at = content.indexOf('## Keep registry descriptions current');
  return (at === -1 ? content : content.slice(0, at)).trimEnd();
}

// The FUSE-01 build lock, duplicated on purpose (no shared helper module may be
// created inside SCOPE.writeAllowed): serializes this lane's docs build against
// any other process building dist/ or public/r.
const lockDir = join(ROOT, 'node_modules/.cache/FUSE-01-docs-build.lock');
const LOCK_TIMEOUT_MS = 20 * 60_000;

function acquireBuildLock(): void {
  mkdirSync(join(ROOT, 'node_modules/.cache'), { recursive: true });
  const startedAt = Date.now();
  for (;;) {
    try {
      mkdirSync(lockDir);
      return;
    } catch {
      if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
        throw new Error(`timed out waiting for docs build lock at ${lockDir}`);
      }
      try {
        if (Date.now() - statSync(lockDir).mtimeMs > LOCK_TIMEOUT_MS) {
          rmSync(lockDir, { recursive: true, force: true });
        }
      } catch {
        // Lock vanished between mkdir and stat — retry the acquire.
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

/** Digest the built dist tree so a receipt can be bound to the exact artifacts a build produced. */
function distDigest(): string {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else
        files.push(
          `${abs.replace(DIST_DIR, '')}:${createHash('sha256').update(readFileSync(abs)).digest('hex')}`,
        );
    }
  };
  walk(DIST_DIR);
  files.sort();
  return createHash('sha256').update(files.join('\n')).digest('hex');
}

interface Receipt {
  command: string;
  cwd: string;
  exit: number | null;
  stdoutTail: string;
  stderrTail: string;
}

function runDocsCommand(filterArgs: string[]): Receipt {
  const proc = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', ...filterArgs], {
    encoding: 'utf8',
    cwd: ROOT,
    maxBuffer: 256 * 1024 * 1024,
  });
  return {
    command: `pnpm --filter @rnr-ai-elements/docs ${filterArgs.join(' ')}`,
    cwd: ROOT,
    exit: proc.status,
    stdoutTail: proc.stdout.slice(-2000),
    stderrTail: proc.stderr.slice(-2000),
  };
}

describe('ORI-CONT-006 contributing content', () => {
  it('ORI-CONT-006-four-criteria', () => {
    const source = readContributing();
    expect(source.trim().length, 'CONTRIBUTING.md must exist and be non-empty').toBeGreaterThan(0);

    // Case 1: the real checklist states all four independent criteria and all
    // three exact commands, checked against TR-12 and apps/docs/package.json.
    const pkg = JSON.parse(readFileSync(DOCS_PKG_PATH, 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
    };
    expect(pkg.name).toBe('@rnr-ai-elements/docs');
    for (const script of ['build', 'check:snippets', 'check:links']) {
      expect(pkg.scripts[script], `apps/docs/package.json must bind ${script}`).toBeTruthy();
    }
    expect(criteriaDiagnostics(source), 'criteria over the real file').toEqual([]);
    expect(commandDiagnostics(source), 'commands over the real file').toEqual([]);

    // Case 2: five mutated copies in owned scratch — one per removed criterion,
    // plus the check:snippet command mutation — each fails; the unchanged copy passes.
    const mutations: [string, string][] = [
      ['remove-build-criterion', removeLinesMatching(source, /build green/i)],
      ['remove-link-criterion', removeLinesMatching(source, /link check green/i)],
      ['remove-snippet-criterion', removeLinesMatching(source, /snippet gate green/i)],
      ['remove-standards-criterion', removeLinesMatching(source, /content-standards conformance/i)],
      ['mutate-check-snippet', source.replace(/check:snippets/g, 'check:snippet')],
    ];
    const dir = mkdtempSync(join(tmpdir(), 'ori-cont-006-criteria-'));
    try {
      const unchanged = scratchCopy(dir, source, 'CONTRIBUTING.md');
      expect(criteriaDiagnostics(unchanged), 'unchanged copy passes').toEqual([]);
      expect(commandDiagnostics(unchanged), 'unchanged copy passes').toEqual([]);

      for (const [label, mutated] of mutations) {
        const copy = scratchCopy(dir, mutated, `CONTRIBUTING.${label}.md`);
        const criteria = criteriaDiagnostics(copy);
        const commands = commandDiagnostics(copy);
        const combined = [...criteria, ...commands];
        expect(combined, `${label} must fail with a diagnostic`).not.toEqual([]);
        if (label === 'mutate-check-snippet') {
          expect(commands.join('\n'), `${label} names the mutated command`).toContain(
            'check:snippet',
          );
        } else {
          expect(
            criteria.length,
            `${label} fails with a criterion diagnostic naming the removed criterion`,
          ).toBe(1);
        }
        // The real source stays untouched by the mutation run.
        expect(readContributing()).toBe(source);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ORI-CONT-006-real-docs-checks', { timeout: 20 * 60_000 }, () => {
    // The documented commands must match the real script bindings before anything runs.
    const pkg = JSON.parse(readFileSync(DOCS_PKG_PATH, 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
    };
    expect(pkg.name).toBe('@rnr-ai-elements/docs');
    expect(pkg.scripts.build).toBeTruthy();
    expect(pkg.scripts['check:snippets']).toBeTruthy();
    expect(pkg.scripts['check:links']).toBeTruthy();

    const introduction = join(DIST_DIR, 'docs/introduction/index.html');
    const receipts: Receipt[] = [];

    // Build: start from no dist so the produced artifacts are provably this run's.
    acquireBuildLock();
    let build: Receipt;
    try {
      rmSync(DIST_DIR, { recursive: true, force: true });
      build = runDocsCommand(['build']);
    } finally {
      rmSync(lockDir, { recursive: true, force: true });
    }
    receipts.push(build);
    expect(build.exit, `build failed\n${build.stdoutTail}\n${build.stderrTail}`).toBe(0);
    expect(
      existsSync(introduction),
      'build must produce apps/docs/dist/docs/introduction/index.html',
    ).toBe(true);
    const digestAfterBuild = distDigest();

    // Snippet gate: real subprocess over the current candidate sources.
    const snippets = runDocsCommand(['check:snippets']);
    receipts.push(snippets);
    expect(
      snippets.exit,
      `check:snippets failed\n${snippets.stdoutTail}\n${snippets.stderrTail}`,
    ).toBe(0);
    expect(
      snippets.stdoutTail.includes('"errors": []'),
      'snippet receipt must end with an empty errors array',
    ).toBe(true);

    // Link gate: reads the dist produced by the build above (digest unchanged, same tree).
    const links = runDocsCommand(['check:links']);
    receipts.push(links);
    expect(links.exit, `check:links failed\n${links.stdoutTail}\n${links.stderrTail}`).toBe(0);
    expect(links.stdoutTail).toMatch(/link-check: \d+ html files, \d+ links .*0 error\(s\)/);
    expect(distDigest(), 'the link-checked dist is exactly the dist this build produced').toBe(
      digestAfterBuild,
    );

    // Three real subprocess receipts, exact commands, exit 0 — seeded capture for evidence.
    console.log(
      `[ORI-CONT-006] receipts ${JSON.stringify(
        receipts.map((r) => ({ command: r.command, cwd: r.cwd, exit: r.exit })),
      )} distDigest=${digestAfterBuild}`,
    );
    expect(receipts).toHaveLength(3);
    expect(receipts.map((r) => r.command)).toEqual([...DOCS_COMMANDS]);
    expect(receipts.every((r) => r.exit === 0)).toBe(true);
  });

  it('ORI-CONT-006-description-currency', () => {
    const source = readContributing();

    // Case 1: the real rule names the registry path and description field,
    // connects behavior changes to updates, and assigns accuracy to reviewers.
    expect(currencyDiagnostics(source), 'currency rule over the real file').toEqual([]);

    // The rule's registry link resolves and supplies real items with descriptions.
    const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
      items: { name: string; description: string }[];
    };
    const item = registry.items[0];
    expect(item?.name, 'a real registry item is captured').toBeTruthy();
    expect(item?.description?.length, `${item?.name} has a real description`).toBeGreaterThan(0);
    console.log(
      `[ORI-CONT-006] registry item captured: ${JSON.stringify({ name: item?.name, description: item?.description })}`,
    );
    const quotedRule = /If your PR changes the behavior of a registry item[\s\S]*?same PR\./.exec(
      source,
    );
    expect(quotedRule?.[0], 'the quoted contribution rule is captured').toBeTruthy();

    // Case 2: a copy without the currency rule fails; the original stays byte-identical.
    const preBytes = readFileSync(CONTRIBUTING_PATH);
    const dir = mkdtempSync(join(tmpdir(), 'ori-cont-006-currency-'));
    try {
      const copy = scratchCopy(dir, removeCurrencySection(source), 'CONTRIBUTING.md');
      const diagnostics = currencyDiagnostics(copy);
      expect(diagnostics, 'copy without the currency rule must fail').not.toEqual([]);
      expect(diagnostics.join('\n'), 'failure is a description-currency diagnostic').toContain(
        'description-currency rule incomplete',
      );
      expect(readFileSync(CONTRIBUTING_PATH)).toEqual(preBytes);
      expect(readContributing()).toBe(source);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ORI-CONT-006-standards-and-links', () => {
    const source = readContributing();

    // Every local link and fragment resolves from disk.
    expect(linkDiagnostics(source), 'all local targets resolve').toEqual([]);

    // The canonical targets and the two fragment anchors are present.
    for (const required of [
      'apps/docs/package.json',
      'packages/registry/registry.json',
      '.spec/prds/docs-site/11-technical-requirements/12-content-standards.md',
    ]) {
      expect(source, `CONTRIBUTING.md links ${required}`).toContain(`](${required}`);
    }
    const standards = readFileSync(STANDARDS_PATH, 'utf8');
    const headings = [...standards.matchAll(/^##?\s+(.+)$/gm)].map((m) => githubSlug(m[1]));
    expect(headings).toContain('terminology-lock-one-canonical-term-per-concept');
    expect(headings).toContain('page-templates-authored');
    expect(source).toContain('#terminology-lock-one-canonical-term-per-concept');
    expect(source).toContain('#page-templates-authored');

    // Canonical terms in the checklist prose: registry item and description.
    expect(source).toContain('registry item');
    expect(source).toContain('description');
  });
});
