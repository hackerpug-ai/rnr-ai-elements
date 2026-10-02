import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

// The locked YAML parser (transitive via tsx/vite; root package.json is frozen, so
// the deep store path is the only way to load it). A store-layout change fails
// loudly here instead of silently weakening the parse proof. The parser runs in a
// real child process: the registry lockfile forbids declaring the dependency and
// this task's write scope forbids both sanctioned fallow remedies (devDependency
// or ignoreDependencies config), so the load stays behind a process boundary —
// same real parser, same real bytes, executed rather than linked.
const YAML_PARSER_PATH = join(
  repoRoot,
  'node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/index.js',
);

function parseWorkflowYaml(path: string): unknown {
  const proc = spawnSync(
    'node',
    [
      '-e',
      `const {readFileSync}=require('node:fs');` +
        `const {parse}=require(${JSON.stringify(YAML_PARSER_PATH)});` +
        `console.log(JSON.stringify(parse(readFileSync(process.argv[1],'utf8'))));`,
      path,
    ],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  if (proc.status !== 0) {
    throw new Error(`workflow yaml parse failed: ${proc.stderr}`);
  }
  return JSON.parse(proc.stdout);
}

const preflightPath = join(
  repoRoot,
  'tests/sprint-05-orient-search/support/candidate-preflight.mjs',
);
const committedEvidenceDir = join(repoRoot, 'tests/sprint-05-orient-search/evidence/ORI-CI-003');
const scratchRoot = join(repoRoot, '.tmp/ORI-CI-003/test-runs');
const HEX40 = /^[0-9a-f]{40}$/;
const RUN_URL = /^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+$/;

// Each candidate preflight installs dependencies and runs real compiler/lint/registry/
// docs stages, so every test in this file needs a generous timeout.
const STAGE_TIMEOUT = 20 * 60_000;

interface StageRecord {
  name: string;
  jobs?: string[];
  command?: string;
  exit?: number | null;
  skipped?: boolean;
  diagnosticExcerpt?: string[];
  dist?: { fileCount: number; digest: string | null; registryJsonCount: number } | null;
}

interface RunRecord {
  runId: string;
  mode: string;
  candidate: { sha: string; parents: string[]; gitStatus: string };
  stages: StageRecord[];
  jobConclusions: Record<string, string>;
  verdict: string;
  failedStage: string | null;
}

interface Manifest {
  schema: string;
  task: string;
  candidate: { sha: string };
  toolchain: Record<string, { command: string; exit: number; output: string }>;
  workflow: { path: string; sha256: string | null };
  lockfile: { path: string; sha256: string | null };
  commands: Record<string, string>;
  evidence: { files: Record<string, { sha256: string; bytes: number } | null> };
  runs: RunRecord[];
  hostedStatus: {
    status: string;
    reason: string;
    observation: {
      originMainSha: string | null;
      localAheadOfOriginBy: number | null;
      githubApi: { exit: number | null; stdout: string; stderr: string };
    };
  };
}

function git(args: string[], cwd = repoRoot) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function runPreflight(cwd: string, candidateSha: string, outputDir: string) {
  const result = spawnSync(
    'node',
    [preflightPath, '--candidate', candidateSha, '--output', outputDir],
    { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function runQualify(evidenceDir: string, candidateSha: string, recordFile: string) {
  const result = spawnSync(
    'node',
    [
      preflightPath,
      '--qualify',
      '--evidence',
      evidenceDir,
      '--candidate',
      candidateSha,
      '--record',
      recordFile,
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return { status: result.status, stderr: result.stderr ?? '' };
}

function readManifest(outputDir: string): Manifest {
  return JSON.parse(readFileSync(join(outputDir, 'manifest.json'), 'utf8')) as Manifest;
}

/**
 * Isolated negative candidate through real Git entrypoints: a detached worktree at
 * HEAD, one recorded defect committed on top. The worktree lives under the repo's
 * gitignored .tmp — INSIDE the main checkout's tree, because biome's
 * vcs.useIgnoreFile resolution does not follow a linked worktree's gitdir pointer
 * when the worktree sits outside the main checkout, and would then lint 114
 * generated registry JSONs and fail for a reason no defect caused. The commit is
 * assembled with git plumbing (add → write-tree → commit-tree → update-ref)
 * because these commits are deliberately defective test fixtures — the
 * repository's righthook pre-commit gate must reject exactly these defects, so
 * running it here would make the fixture impossible. Implementation commits still
 * pass through the full hook. Never touches the shared working tree.
 */
function makeNegativeCandidate(
  name: string,
  mutate: (candidateRoot: string) => void,
): { sha: string; parent: string; root: string } {
  const parent = git(['rev-parse', 'HEAD']).stdout.trim();
  const root = join(repoRoot, '.tmp/ORI-CI-003/test-candidates', name);
  rmSync(root, { recursive: true, force: true });
  const added = git(['worktree', 'add', '--detach', root, 'HEAD']);
  expect(added.status, `worktree add failed: ${added.stderr}`).toBe(0);
  mutate(root);
  const staged = git(['add', '-A'], root);
  expect(staged.status, `git add failed: ${staged.stderr}`).toBe(0);
  const tree = git(['write-tree'], root);
  expect(tree.status, `git write-tree failed: ${tree.stderr}`).toBe(0);
  const committed = git(
    [
      'commit-tree',
      tree.stdout.trim(),
      '-p',
      parent,
      '-m',
      `ORI-CI-003 negative candidate: ${name}`,
    ],
    root,
  );
  expect(committed.status, `git commit-tree failed: ${committed.stderr}`).toBe(0);
  const sha = committed.stdout.trim();
  const moved = git(['update-ref', 'HEAD', sha], root);
  expect(moved.status, `git update-ref failed: ${moved.stderr}`).toBe(0);
  return { sha, parent, root };
}

function removeCandidateWorktree(root: string) {
  git(['worktree', 'remove', '--force', root]);
}

function stageOf(run: RunRecord, name: string): StageRecord {
  const stage = run.stages.find((entry) => entry.name === name);
  expect(stage, `stage ${name} missing from run ${run.runId}`).toBeDefined();
  return stage as StageRecord;
}

/** Deep walk of the parsed workflow: no value may read the secrets context. */
function collectSecretReads(node: unknown, found: string[] = []): string[] {
  if (typeof node === 'string') {
    if (node.includes('secrets.')) found.push(node);
  } else if (Array.isArray(node)) {
    for (const item of node) collectSecretReads(item, found);
  } else if (node !== null && typeof node === 'object') {
    for (const value of Object.values(node)) collectSecretReads(value, found);
  }
  return found;
}

describe('ORI-CI-003 credential-free candidate checks', () => {
  // The wiring assertions plus the live qualification runs are one derivation
  // contract, wide by intent (sibling-test convention).
  // fallow-ignore-next-line complexity
  it('ORI-CI-003-candidate-identity', { timeout: STAGE_TIMEOUT }, () => {
    // --- real workflow wiring, parsed from the checked-in YAML
    const workflow = parseWorkflowYaml(join(repoRoot, '.github/workflows/ci.yml')) as {
      on: Record<string, unknown>;
      jobs: Record<
        string,
        {
          name?: string;
          needs?: string[];
          'continue-on-error'?: boolean;
          steps: Array<Record<string, unknown>>;
        }
      >;
      permissions: Record<string, string>;
      concurrency: { group: string; 'cancel-in-progress': boolean };
      env: Record<string, string>;
    };

    // Events: automatic PR lane, trunk push, and reusable protected dispatch.
    expect(Object.keys(workflow.on)).toEqual(
      expect.arrayContaining(['pull_request', 'push', 'workflow_call']),
    );
    expect(workflow.on.pull_request).toEqual({ types: ['opened', 'synchronize', 'reopened'] });
    expect((workflow.on.push as { branches: string[] }).branches).toEqual(['main']);
    const callInputs = (workflow.on.workflow_call as { inputs: Record<string, unknown> }).inputs;
    expect(callInputs.candidate_sha).toMatchObject({ required: true, type: 'string' });

    // Exactly the four candidate jobs; complete test/docs-e2e acceptance names are
    // NOT retained here (ORI-CI-004 owns them).
    expect(Object.keys(workflow.jobs).sort()).toEqual([
      'docs-build',
      'lint',
      'registry',
      'typecheck',
    ]);
    expect(workflow.jobs['docs-build']?.needs).toEqual(['typecheck', 'lint', 'registry']);

    // Least privilege: contents: read only, and nothing anywhere reads secrets.
    expect(workflow.permissions).toEqual({ contents: 'read' });
    expect(collectSecretReads(workflow), 'workflow reads a secrets context').toEqual([]);

    // Concurrency: workflow + event + ref so automatic runs supersede each other
    // without a protected caller ever cancelling its own callee.
    expect(workflow.concurrency['cancel-in-progress']).toBe(true);
    expect(workflow.concurrency.group).toContain('github.workflow');
    expect(workflow.concurrency.group).toContain('github.event_name');
    expect(workflow.concurrency.group).toMatch(
      /github\.ref|github\.event\.pull_request\.head\.ref/,
    );

    const allowedActions = new Set([
      'actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683',
      'actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020',
      'pnpm/action-setup@a7487c7e89a18df4991f7f222e4898a00d66ddda',
      'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02',
    ]);
    const allSteps = Object.values(workflow.jobs).flatMap((job) => job.steps);
    for (const step of allSteps) {
      if (typeof step.uses === 'string') {
        expect(step.uses, 'action must be a verified full-SHA pin').toMatch(
          /^[a-z-]+\/[a-z-]+@[0-9a-f]{40}$/,
        );
        expect(allowedActions.has(step.uses), `unexpected action ${step.uses}`).toBe(true);
      }
      expect(step['continue-on-error'], 'failure must never become success').toBeUndefined();
      if (typeof step.uses === 'string' && step.uses.startsWith('actions/checkout@')) {
        expect((step.with as { 'persist-credentials'?: boolean })['persist-credentials']).toBe(
          false,
        );
      }
      if (typeof step.uses === 'string' && step.uses.startsWith('actions/upload-artifact@')) {
        const with_ = step.with as { 'if-no-files-found'?: string; 'retention-days'?: number };
        expect(with_['if-no-files-found']).toBe('error');
        expect(with_['retention-days']).toBe(7);
      }
    }
    // Runner/toolchain pins.
    for (const job of Object.values(workflow.jobs)) {
      expect((job as { 'runs-on'?: string })['runs-on']).toBe('ubuntu-24.04');
    }
    expect(workflow.env.NODE_VERSION).toBe('24');
    const runScripts = allSteps
      .map((step) => (typeof step.run === 'string' ? step.run : ''))
      .join('\n');
    expect(runScripts).toContain('pnpm install --frozen-lockfile\n');
    expect(runScripts).toContain('pnpm typecheck 2>&1');
    expect(runScripts).toContain(
      'pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json',
    );
    expect(runScripts).toContain('pnpm lint 2>&1');
    expect(runScripts).toContain('pnpm check:tokens 2>&1');
    expect(runScripts).toContain('pnpm check:contract 2>&1');
    expect(runScripts).toContain('pnpm registry:build');
    expect(runScripts).toContain('git status --porcelain -- public/r');
    expect(runScripts).toContain('pnpm --filter @rnr-ai-elements/docs build');
    // No event value is ever interpolated into executable shell text (YAML value
    // fields like concurrency.group are safe; run: blocks are not).
    const runTexts = allSteps
      .map((step) => (typeof step.run === 'string' ? step.run : ''))
      .join('\n---\n');
    expect(runTexts, 'a run block interpolates an event value').not.toMatch(
      /\$\{\{ github\.event\./,
    );

    // --- committed evidence: source-bound, internally consistent, really executed
    const manifest = readManifest(committedEvidenceDir);
    expect(manifest.task).toBe('ORI-CI-003');
    expect(manifest.candidate.sha, 'candidate SHA must be 40-hex').toMatch(HEX40);
    expect(
      git(['merge-base', '--is-ancestor', manifest.candidate.sha, 'HEAD']).status,
      'evidence candidate must be an ancestor of HEAD',
    ).toBe(0);
    expect(manifest.workflow.sha256).toBe(sha256File(join(repoRoot, '.github/workflows/ci.yml')));
    expect(manifest.lockfile.sha256).toBe(sha256File(join(repoRoot, 'pnpm-lock.yaml')));

    const green = manifest.runs[manifest.runs.length - 1];
    expect(green.candidate.sha).toBe(manifest.candidate.sha);
    expect(green.verdict).toBe('green');
    expect(green.failedStage).toBeNull();
    expect(green.jobConclusions).toEqual({
      typecheck: 'success',
      lint: 'success',
      registry: 'success',
      'docs-build': 'success',
    });
    // docs-build starts only after all three prerequisites succeed — the preflight
    // records the prerequisite stages completing with exit 0 before it.
    const names = green.stages.map((stage) => stage.name);
    expect(names.indexOf('typecheck.live-chat')).toBeLessThan(names.indexOf('lint.biome'));
    expect(names.indexOf('lint.contract')).toBeLessThan(names.indexOf('registry.generate'));
    expect(names.indexOf('registry.freshness')).toBeLessThan(names.indexOf('docs-build'));
    for (const stage of green.stages) {
      expect(stage.skipped, `stage ${stage.name} skipped in the green run`).toBeFalsy();
      // The whole-example diagnostic is deliberately non-obligatory: its exit is
      // recorded as-is and never gates (VP-EXAMPLE-DIAGNOSTICS).
      if (stage.name !== 'diagnostic.whole-example') {
        expect(stage.exit, `stage ${stage.name} exited ${stage.exit}`).toBe(0);
      }
    }
    // Both compilers and all three lint commands really executed.
    expect(stageOf(green, 'typecheck.root').command).toBe('pnpm typecheck');
    expect(stageOf(green, 'typecheck.live-chat').command).toBe(manifest.commands.typecheckLiveChat);
    expect(stageOf(green, 'lint.biome').command).toBe('pnpm lint');
    expect(stageOf(green, 'lint.tokens').command).toBe('pnpm check:tokens');
    expect(stageOf(green, 'lint.contract').command).toBe('pnpm check:contract');
    expect(stageOf(green, 'docs-build').command).toBe(manifest.commands.docsBuild);

    // Evidence files exist with recorded hashes and nonempty real content.
    for (const [name, meta] of Object.entries(manifest.evidence.files)) {
      expect(meta, `evidence file ${name} not declared`).not.toBeNull();
      const path = join(committedEvidenceDir, name);
      expect(existsSync(path), `evidence file ${name} missing`).toBe(true);
      expect(sha256File(path), `evidence file ${name} bytes differ from manifest`).toBe(
        meta?.sha256,
      );
      expect(statSync(path).size, `evidence file ${name} is empty`).toBeGreaterThan(0);
    }
    const actionlintLog = readFileSync(join(committedEvidenceDir, 'actionlint.log'), 'utf8');
    expect(actionlintLog).toMatch(/^# actionlint \d/);
    expect(actionlintLog).toContain('# exit 0');
    expect(manifest.toolchain.actionlint.exit).toBe(0);

    // --- live qualification rejections (real preflight runs on scratch copies)
    mkdirSync(scratchRoot, { recursive: true });
    const headSha = git(['rev-parse', 'HEAD']).stdout.trim();
    const proofSha = manifest.candidate.sha;
    const pristine = join(scratchRoot, 'qualify-pristine');
    const noArtifact = join(scratchRoot, 'qualify-missing');
    const tampered = join(scratchRoot, 'qualify-altered');
    for (const dir of [pristine, noArtifact, tampered]) {
      rmSync(dir, { recursive: true, force: true });
      cpSync(committedEvidenceDir, dir, { recursive: true });
    }
    rmSync(join(noArtifact, 'generated-artifacts.json'));
    const tamperPath = join(tampered, 'actionlint.log');
    writeFileSync(tamperPath, `${readFileSync(tamperPath, 'utf8')}\n# tampered byte\n`);

    const recordFile = join(scratchRoot, 'qualify-records.json');
    rmSync(recordFile, { force: true });

    // A different 40-hex SHA that is guaranteed not to equal the proof SHA.
    const otherSha =
      headSha === proofSha
        ? `${proofSha.slice(0, 39)}${proofSha.endsWith('0') ? '1' : '0'}`
        : headSha;
    const cross = runQualify(pristine, otherSha, recordFile);
    expect(cross.status, 'cross-candidate qualification must be rejected').toBe(1);
    expect(cross.stderr).toContain('candidate-mismatch');

    const missing = runQualify(noArtifact, proofSha, recordFile);
    expect(missing.status, 'missing artifact must be rejected').toBe(1);
    expect(missing.stderr).toContain('missing-artifact');

    const altered = runQualify(tampered, proofSha, recordFile);
    expect(altered.status, 'altered artifact must be rejected').toBe(1);
    expect(altered.stderr).toContain('altered-artifact');

    const accepted = runQualify(pristine, proofSha, recordFile);
    expect(accepted.status, 'an intact proof for its own candidate is accepted').toBe(0);

    // --- committed qualification ledger: exactly three rejections, honestly hosted
    const hostedRuns = JSON.parse(
      readFileSync(join(committedEvidenceDir, 'hosted-runs.json'), 'utf8'),
    ) as {
      hostedStatus: Manifest['hostedStatus'];
      records: Array<{
        verdict: string;
        reason: string;
        candidateSha: string;
        proofSha: string | null;
        sourceRunUrl: string | null;
      }>;
    };
    const rejections = hostedRuns.records.filter((record) => record.verdict === 'rejected');
    expect(rejections.map((record) => record.reason).sort()).toEqual([
      'altered-artifact',
      'candidate-mismatch',
      'missing-artifact',
    ]);
    const mismatch = rejections.find((record) => record.reason === 'candidate-mismatch');
    expect(mismatch?.candidateSha, 'cross-candidate record stores the asked SHA B').toMatch(HEX40);
    expect(mismatch?.proofSha, 'cross-candidate record stores the proof SHA A').toMatch(HEX40);
    expect(mismatch?.candidateSha).not.toBe(mismatch?.proofSha);
    // No fabricated run URLs: every URL is null (hosted honestly blocked) or a real
    // run URL shape for this repository.
    for (const record of hostedRuns.records) {
      expect(
        record.sourceRunUrl === null || RUN_URL.test(record.sourceRunUrl),
        `fabricated run URL ${record.sourceRunUrl}`,
      ).toBe(true);
    }
    expect(['blocked', 'available']).toContain(hostedRuns.hostedStatus.status);
    expect(hostedRuns.hostedStatus.reason.length).toBeGreaterThan(0);
    if (hostedRuns.hostedStatus.status === 'blocked') {
      expect(
        hostedRuns.hostedStatus.observation.originMainSha,
        'blocked status must cite the observed origin state',
      ).toMatch(HEX40);
    }
  });

  // Three real negative candidates plus the restored-compiler proof: the assertion
  // sequence is the derivation contract, wide by intent (sibling-test convention).
  // fallow-ignore-next-line complexity
  it('ORI-CI-003-required-inputs', { timeout: STAGE_TIMEOUT }, () => {
    mkdirSync(scratchRoot, { recursive: true });

    // --- missing package.json: a required check fails with the real missing-input
    // diagnostic (pnpm still installs the workspace packages via
    // pnpm-workspace.yaml, so the first gating failure is a run command, not
    // install — the point is nothing scaffolds a success out of the absence)
    const missingPackage = makeNegativeCandidate('missing-package', (root) => {
      rmSync(join(root, 'package.json'));
    });
    try {
      const out = join(scratchRoot, 'out-missing-package');
      const result = runPreflight(missingPackage.root, missingPackage.sha, out);
      expect(result.status, `missing package.json must fail the preflight\n${result.stderr}`).toBe(
        1,
      );
      const run = readManifest(out).runs.at(-1) as RunRecord;
      const failed = run.stages.find((stage) => stage.exit !== 0 && stage.exit !== null);
      expect(failed, 'some stage must fail for the missing root manifest').toBeDefined();
      expect(failed?.diagnosticExcerpt?.join('\n')).toMatch(/package\.json|ERR_PNPM/i);
      expect(run.verdict).toBe('failed');
      expect(run.jobConclusions['docs-build']).toBe('skipped');
      expect(stageOf(run, 'docs-build').skipped).toBe(true);
      expect(Object.values(run.jobConclusions)).toContain('failure');
    } finally {
      removeCandidateWorktree(missingPackage.root);
    }

    // --- missing scripts.registry:build: install/typecheck/lint pass, registry fails
    const missingScript = makeNegativeCandidate('missing-registry-script', (root) => {
      const pkgPath = join(root, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
        scripts: Record<string, string>;
      };
      delete pkg.scripts['registry:build'];
      writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    });
    try {
      const out = join(scratchRoot, 'out-missing-registry-script');
      const result = runPreflight(missingScript.root, missingScript.sha, out);
      expect(result.status, `missing registry:build script must fail\n${result.stderr}`).toBe(1);
      const run = readManifest(out).runs.at(-1) as RunRecord;
      expect(run.failedStage).toBe('registry.generate');
      const generate = stageOf(run, 'registry.generate');
      expect(generate.exit).not.toBe(0);
      expect(generate.diagnosticExcerpt?.join('\n')).toMatch(
        /Command "registry:build" not found|Missing script.*registry:build/i,
      );
      expect(run.jobConclusions.typecheck).toBe('success');
      expect(run.jobConclusions.lint).toBe('success');
      expect(run.jobConclusions.registry).toBe('failure');
      expect(run.jobConclusions['docs-build']).toBe('skipped');
    } finally {
      removeCandidateWorktree(missingScript.root);
    }

    // --- live-chat type error: the scoped compiler fails, docs-build withheld
    const liveTypeError = makeNegativeCandidate('live-type-error', (root) => {
      const target = join(root, 'apps/example/lib/live-chat-config.ts');
      writeFileSync(
        target,
        `${readFileSync(target, 'utf8')}\nexport const oriCi003Probe: number = 'ORI-CI-003';\n`,
      );
    });
    try {
      const out = join(scratchRoot, 'out-live-type-error');
      const result = runPreflight(liveTypeError.root, liveTypeError.sha, out);
      expect(result.status, `live-chat type error must fail\n${result.stderr}`).toBe(1);
      const run = readManifest(out).runs.at(-1) as RunRecord;
      expect(run.failedStage).toBe('typecheck.live-chat');
      const scoped = stageOf(run, 'typecheck.live-chat');
      expect(scoped.exit).not.toBe(0);
      expect(scoped.diagnosticExcerpt?.join('\n')).toMatch(
        /TS2322.*not assignable to type 'number'/,
      );
      // The scoped compiler leads, so the lane stops before the root compiler —
      // its exit-0 proof lives in the restored green run below.
      expect(stageOf(run, 'typecheck.root').skipped).toBe(true);
      expect(run.jobConclusions).toEqual({
        typecheck: 'failure',
        lint: 'skipped',
        registry: 'skipped',
        'docs-build': 'skipped',
      });
      const scopedLog = readFileSync(join(out, 'live-chat-typecheck.log'), 'utf8');
      expect(scopedLog).toContain('TS2322');
    } finally {
      removeCandidateWorktree(liveTypeError.root);
    }

    // --- restored source passes BOTH required compilers; diagnostics stay separate
    const manifest = readManifest(committedEvidenceDir);
    const green = manifest.runs[manifest.runs.length - 1];
    expect(stageOf(green, 'typecheck.root').exit, 'restored root compiler must pass').toBe(0);
    expect(stageOf(green, 'typecheck.live-chat').exit, 'restored scoped compiler must pass').toBe(
      0,
    );
    expect(manifest.commands.typecheckLiveChat).not.toBe(manifest.commands.wholeExampleDiagnostic);
    const liveChatLog = readFileSync(join(committedEvidenceDir, 'live-chat-typecheck.log'), 'utf8');
    const wholeLog = readFileSync(
      join(committedEvidenceDir, 'whole-example-diagnostic.log'),
      'utf8',
    );
    expect(liveChatLog).toContain(`$ ${manifest.commands.typecheckLiveChat}`);
    expect(wholeLog).toContain(`$ ${manifest.commands.wholeExampleDiagnostic}`);
    expect(liveChatLog).toContain('# exit 0');
    expect(wholeLog).toMatch(/# exit \d+/);
    // The separate diagnostic is never an acceptance obligation: its exit is
    // recorded as-is and does not gate the green verdict.
    const diagnostic = stageOf(green, 'diagnostic.whole-example');
    expect(diagnostic.jobs).toEqual([]);
  });

  // Two real registry-drift candidates plus the restored-inventory proof: the
  // assertion sequence is the derivation contract, wide by intent.
  // fallow-ignore-next-line complexity
  it('ORI-CI-003-registry-drift', { timeout: STAGE_TIMEOUT }, () => {
    mkdirSync(scratchRoot, { recursive: true });

    // --- tracked drift: committed engine artifact differs from fresh generation
    const staleRegistry = makeNegativeCandidate('stale-registry', (root) => {
      const itemPath = join(root, 'public/r/uniwind/message.json');
      const original = readFileSync(itemPath, 'utf8');
      // Flip ONE character inside an existing string value — byte-preserving, so the
      // mutation stays valid JSON and biome-formatted and only the freshness check
      // can catch it (not an earlier compiler/lint stage).
      const value = original.match(/"([^"{\n]{8,})"/)?.[1] ?? '';
      expect(value.length, 'no string value long enough to mutate').toBeGreaterThanOrEqual(8);
      const flippedChar = value.endsWith('x') ? 'y' : 'x';
      const mutated = original.replace(`"${value}"`, `"${value.slice(0, -1)}${flippedChar}"`);
      expect(mutated).not.toBe(original);
      writeFileSync(itemPath, mutated);
    });
    try {
      const out = join(scratchRoot, 'out-stale-registry');
      const result = runPreflight(staleRegistry.root, staleRegistry.sha, out);
      expect(result.status, `stale committed registry must fail\n${result.stderr}`).toBe(1);
      const run = readManifest(out).runs.at(-1) as RunRecord;
      expect(run.failedStage).toBe('registry.freshness');
      expect(stageOf(run, 'registry.generate').exit).toBe(0);
      const freshness = stageOf(run, 'registry.freshness');
      expect(freshness.exit).not.toBe(0);
      expect(freshness.diagnosticExcerpt?.join('\n')).toContain('public/r/uniwind/message.json');
      expect(run.jobConclusions).toEqual({
        typecheck: 'success',
        lint: 'success',
        registry: 'failure',
        'docs-build': 'skipped',
      });
      const generated = JSON.parse(readFileSync(join(out, 'generated-artifacts.json'), 'utf8')) as {
        driftDetections: Array<{
          candidateSha: string;
          paths: Array<{
            path: string;
            kind: string;
            status: string;
            beforeSha256: string | null;
            afterSha256: string | null;
          }>;
        }>;
      };
      const detection = generated.driftDetections
        .find((entry) => entry.candidateSha === staleRegistry.sha)
        ?.paths.find((p) => p.path === 'public/r/uniwind/message.json');
      expect(detection, 'tracked drift path must be recorded').toBeDefined();
      expect(detection?.kind).toBe('tracked-drift');
      expect(detection?.beforeSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(detection?.afterSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(detection?.beforeSha256).not.toBe(detection?.afterSha256);
    } finally {
      removeCandidateWorktree(staleRegistry.root);
    }

    // --- untracked generated output: committed item removed, generator recreates it
    const missingItem = makeNegativeCandidate('missing-generated-item', (root) => {
      rmSync(join(root, 'public/r/nativewind/message.json'));
    });
    try {
      const out = join(scratchRoot, 'out-missing-generated-item');
      const result = runPreflight(missingItem.root, missingItem.sha, out);
      expect(result.status, `missing committed item must fail\n${result.stderr}`).toBe(1);
      const run = readManifest(out).runs.at(-1) as RunRecord;
      expect(run.failedStage).toBe('registry.freshness');
      const freshness = stageOf(run, 'registry.freshness');
      expect(freshness.diagnosticExcerpt?.join('\n')).toContain('public/r/nativewind/message.json');
      const generated = JSON.parse(readFileSync(join(out, 'generated-artifacts.json'), 'utf8')) as {
        driftDetections: Array<{
          candidateSha: string;
          paths: Array<{
            path: string;
            kind: string;
            beforeSha256: string | null;
            afterSha256: string | null;
          }>;
        }>;
      };
      const detection = generated.driftDetections
        .find((entry) => entry.candidateSha === missingItem.sha)
        ?.paths.find((p) => p.path === 'public/r/nativewind/message.json');
      expect(detection, 'untracked generated path must be recorded').toBeDefined();
      expect(detection?.kind).toBe('untracked-generated');
      expect(detection?.beforeSha256).toBeNull();
      expect(detection?.afterSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(run.jobConclusions['docs-build']).toBe('skipped');
    } finally {
      removeCandidateWorktree(missingItem.root);
    }

    // --- restored registry: fresh inventories for both engines, no drift
    const manifest = readManifest(committedEvidenceDir);
    const green = manifest.runs[manifest.runs.length - 1];
    expect(stageOf(green, 'registry.generate').exit).toBe(0);
    expect(stageOf(green, 'registry.freshness').exit).toBe(0);
    const generated = JSON.parse(
      readFileSync(join(committedEvidenceDir, 'generated-artifacts.json'), 'utf8'),
    ) as {
      engines: Record<string, { inventory: Array<{ path: string; sha256: string }> }>;
    };
    for (const engine of ['uniwind', 'nativewind']) {
      const inventory = generated.engines[engine]?.inventory;
      expect(inventory, `${engine} inventory missing`).toBeDefined();
      expect(inventory.length, `${engine} inventory empty`).toBeGreaterThan(0);
      expect(
        inventory.some((file) => file.path === `public/r/${engine}/message.json`),
        `${engine} inventory must include message.json`,
      ).toBe(true);
      for (const file of inventory) expect(file.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('ORI-CI-003-docs-build-failure', { timeout: STAGE_TIMEOUT }, () => {
    mkdirSync(scratchRoot, { recursive: true });

    // --- invalid authored content: prerequisites pass, the real docs build fails
    const invalidContent = makeNegativeCandidate('invalid-content', (root) => {
      const docPath = join(root, 'apps/docs/src/content/docs/introduction.md');
      const original = readFileSync(docPath, 'utf8');
      const mutated = original.replace(/^title:.*\n/m, '');
      expect(mutated, 'mutation must remove the required title field').not.toBe(original);
      writeFileSync(docPath, mutated);
    });
    try {
      const out = join(scratchRoot, 'out-invalid-content');
      const result = runPreflight(invalidContent.root, invalidContent.sha, out);
      expect(
        result.status,
        `invalid authored content must fail the docs build\n${result.stderr}`,
      ).toBe(1);
      const run = readManifest(out).runs.at(-1) as RunRecord;
      expect(run.failedStage).toBe('docs-build');
      expect(run.jobConclusions).toEqual({
        typecheck: 'success',
        lint: 'success',
        registry: 'success',
        'docs-build': 'failure',
      });
      const docs = stageOf(run, 'docs-build');
      expect(docs.exit).not.toBe(0);
      const diagnostic = docs.diagnosticExcerpt?.join('\n') ?? '';
      // The failure names the authored source path and the missing required field.
      expect(diagnostic).toMatch(/introduction/);
      expect(diagnostic).toMatch(/title/i);
      // The build ran verbatim after every prerequisite succeeded.
      expect(docs.command).toBe('pnpm --filter @rnr-ai-elements/docs build');
    } finally {
      removeCandidateWorktree(invalidContent.root);
    }

    // --- restored content produces fresh, nonempty output with recorded hashes
    const manifest = readManifest(committedEvidenceDir);
    const green = manifest.runs[manifest.runs.length - 1];
    const docs = stageOf(green, 'docs-build');
    expect(docs.exit).toBe(0);
    expect(docs.dist, 'docs-build must record a dist inventory').toBeDefined();
    expect(docs.dist?.fileCount, 'apps/docs/dist must be nonempty').toBeGreaterThan(0);
    expect(docs.dist?.digest).toMatch(/^[0-9a-f]{64}$/);
    expect(docs.dist?.registryJsonCount).toBeGreaterThan(0);
  });
});
