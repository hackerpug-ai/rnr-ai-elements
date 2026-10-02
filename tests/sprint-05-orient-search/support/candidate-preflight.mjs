#!/usr/bin/env node
// fallow-ignore-file unused-file
// fallow-ignore-file complexity
// ORI-CI-003 candidate preflight — the local twin of .github/workflows/ci.yml.
// (fallow: this file is a spawned CLI entry point — tests and the evidence-gate
// command execute it as a process, which the static import graph cannot see.
// Its CRAP estimates punish internal helpers the graph cannot reference; the
// pipeline is a linear stage sequence, max cyclomatic 11 after decomposition.)
//
// Execute mode (default):
//   node candidate-preflight.mjs --candidate <40-hex-sha> --output <dir>
//
//   Validates candidate identity (HEAD must equal --candidate), then runs the exact
//   workflow command surface for real: install, both compilers, all three lint
//   commands, fresh registry generation + tracked/untracked freshness, and the
//   verbatim docs build. Gating stages fail-stop like the workflow's `needs` graph
//   (docs-build is recorded 'skipped' when a prerequisite fails). The whole-example
//   diagnostic is captured separately and never gates. Evidence files, hashes and
//   run records land in --output. Exit 0 = green, 1 = a gating stage failed,
//   2 = identity/usage error.
//
// Qualify mode:
//   node candidate-preflight.mjs --qualify --evidence <dir> --candidate <sha> --record <file>
//
//   Validates an evidence directory against a candidate SHA: identity binding,
//   artifact existence, artifact hashes. Appends a verdict record to --record.
//   Exit 0 = accepted, 1 = rejected, 2 = usage error.
//
// No stage is ever mocked, skipped-as-green or replayed: every command recorded in
// the evidence ran in this process tree against this checkout.

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(new URL(import.meta.url));
const TASK = 'ORI-CI-003';
const PLANNING_SOURCE_SHA = '38034e972490945b684f5bd5a706bca0479dc659';
const EVIDENCE_FILE_NAMES = [
  'actionlint.log',
  'live-chat-typecheck.log',
  'whole-example-diagnostic.log',
  'generated-artifacts.json',
];
const HEX40 = /^[0-9a-f]{40}$/;
const VALUE_FLAGS = new Set(['--candidate', '--output', '--evidence', '--record']);
const BOOL_FLAGS = new Set(['--qualify', '--full-logs']);

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

function usage(exitCode) {
  console.error(
    [
      'usage:',
      '  candidate-preflight.mjs --candidate <40-hex-sha> --output <dir> [--full-logs]',
      '  candidate-preflight.mjs --qualify --evidence <dir> --candidate <40-hex-sha> --record <file>',
    ].join('\n'),
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const name = flag.slice(2);
    if (VALUE_FLAGS.has(flag)) {
      if (!argv[i + 1]) usage(2);
      args[name] = argv[(i += 1)];
    } else if (BOOL_FLAGS.has(flag)) {
      args[name] = true;
    } else {
      usage(2);
    }
  }
  return args;
}

function run(cwd, command, args) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    status: result.status,
    error: result.error ? String(result.error) : null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** Bounded, structured failure excerpt: the lines a human needs, never the whole log. */
function diagnosticExcerpt(stdout, stderr) {
  const combined = `${stdout}\n${stderr}`.split(/\r?\n/);
  const pattern =
    /error TS|error:|Error:|FAIL|Missing script|ERR_PNPM|ELIFECYCLE|InvalidContentEntryDataError|not assignable|Drift|stale|Required/i;
  const interesting = combined.filter((line) => pattern.test(line));
  const tail = combined.filter((line) => line.trim().length > 0).slice(-3);
  return [...new Set([...interesting, ...tail])]
    .map((line) => (line.length > 500 ? `${line.slice(0, 500)}…` : line))
    .slice(0, 40);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(path, value) {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 1)}\n`);
}

/** sha256 inventory of every JSON file under one engine's public/r tree. */
function listEngineFiles(dir, label) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { recursive: true })) {
    const name = String(entry);
    const abs = join(dir, name);
    if (name.endsWith('.json') && statSync(abs).isFile()) {
      files.push({
        path: `public/r/${label}/${name}`,
        sha256: sha256File(abs),
        bytes: statSync(abs).size,
      });
    }
  }
  files.sort((a, b) => (a.path < b.path ? -1 : 1));
  return files;
}

/** sha256 inventory of every JSON file under public/r/<engine>, before/after style. */
function registryInventory(repoRoot) {
  const engines = {};
  for (const engine of ['uniwind', 'nativewind']) {
    engines[engine] = { inventory: listEngineFiles(join(repoRoot, 'public/r', engine), engine) };
  }
  return engines;
}

function allInventoryEntries(inventory) {
  return [...inventory.uniwind.inventory, ...inventory.nativewind.inventory];
}

function distInventory(repoRoot) {
  const dist = join(repoRoot, 'apps/docs/dist');
  if (!existsSync(dist)) return { fileCount: 0, digest: null, registryJsonCount: 0 };
  const files = [];
  for (const entry of readdirSync(dist, { recursive: true })) {
    const name = String(entry);
    const abs = join(dist, name);
    if (statSync(abs, { throwIfNoEntry: false })?.isFile()) {
      files.push({ rel: name, sha256: sha256File(abs) });
    }
  }
  files.sort((a, b) => (a.rel < b.rel ? -1 : 1));
  return {
    fileCount: files.length,
    digest: createHash('sha256')
      .update(files.map((file) => `${file.sha256}  ${file.rel}`).join('\n'))
      .digest('hex'),
    registryJsonCount: files.filter((file) => /^r[\\/].*\.json$/.test(file.rel)).length,
  };
}

// ---------------------------------------------------------------------------
// hosted probe — observes real GitHub state, never invents it
// ---------------------------------------------------------------------------

function probeOrigin(root, candidateSha) {
  const observation = {};
  const originUrl = run(root, 'git', ['remote', 'get-url', 'origin']);
  observation.originUrl = originUrl.status === 0 ? originUrl.stdout.trim() : null;
  const match = observation.originUrl?.match(/github\.com[:/]([^/]+)\/([^/.#]+)/);
  observation.repoSlug = match ? `${match[1]}/${match[2]}` : null;
  const originMain = run(root, 'git', ['rev-parse', 'origin/main']);
  observation.originMainSha = originMain.status === 0 ? originMain.stdout.trim() : null;
  if (observation.originMainSha) {
    const ahead = run(root, 'git', ['rev-list', '--count', `origin/main..${candidateSha}`]);
    observation.localAheadOfOriginBy = ahead.status === 0 ? Number(ahead.stdout.trim()) : null;
  }
  return observation;
}

function probeGithubRuns(root, repoSlug, candidateSha) {
  if (!repoSlug) return { exit: null, stdout: '', stderr: 'origin slug unresolvable' };
  const api = run(root, 'gh', [
    'api',
    `repos/${repoSlug}/actions/runs?per_page=5&head_sha=${candidateSha}`,
    '--jq',
    '{total_count: .total_count, run_ids: [.workflow_runs[].id]}',
  ]);
  return {
    exit: api.status,
    stdout: api.stdout.trim().slice(0, 500),
    stderr: api.stderr.trim().slice(0, 500),
  };
}

function probeHosted(root, candidateSha) {
  const observation = {
    attemptedAt: new Date().toISOString(),
    ...probeOrigin(root, candidateSha),
  };
  observation.githubApi = probeGithubRuns(root, observation.repoSlug, candidateSha);
  let runCount = 0;
  try {
    runCount = JSON.parse(observation.githubApi.stdout || '{}').total_count ?? 0;
  } catch {
    runCount = 0;
  }
  const candidateUnpushed = (observation.localAheadOfOriginBy ?? 0) > 0;
  const apiFailed = observation.githubApi.exit !== 0;
  const blocked = runCount === 0 || apiFailed || candidateUnpushed;
  const reason = [
    `No hosted GitHub Actions run exists for candidate ${candidateSha}.`,
    observation.localAheadOfOriginBy
      ? `The candidate is ${observation.localAheadOfOriginBy} commits ahead of origin/main (${observation.originMainSha}); it has never been pushed, so no hosted run can exist.`
      : 'origin does not contain this candidate.',
    apiFailed
      ? `GitHub API probe failed (exit ${observation.githubApi.exit}): ${observation.githubApi.stderr || 'no output'}.`
      : `GitHub API observed ${runCount} run(s) for this head SHA.`,
    'Pushing local main (654+ commits) to origin and observing hosted runs is an orchestrator decision; the preflight records the absence instead of fabricating runs.',
  ].join(' ');
  return {
    status: blocked ? 'blocked' : 'available',
    reason,
    observedAt: observation.attemptedAt,
    observation,
  };
}

// ---------------------------------------------------------------------------
// execute mode
// ---------------------------------------------------------------------------

function collectToolchain(root) {
  const toolchain = {};
  for (const [label, command, argv] of [
    ['node', 'node', ['--version']],
    ['pnpm', 'pnpm', ['--version']],
    ['actionlint', 'actionlint', ['--version']],
  ]) {
    const r = run(root, command, argv);
    toolchain[label] = {
      command: `${command} ${argv.join(' ')}`,
      exit: r.status,
      output: (r.stdout || r.stderr).trim(),
    };
  }
  const rootTsc = run(root, 'pnpm', ['exec', 'tsc', '--version']);
  toolchain.tsc = {
    command: 'pnpm exec tsc --version',
    exit: rootTsc.status,
    output: (rootTsc.stdout || rootTsc.stderr).trim(),
  };
  return toolchain;
}

function verifyIdentity(root, candidateSha) {
  const head = run(root, 'git', ['rev-parse', 'HEAD']);
  const headSha = head.stdout.trim();
  if (head.status !== 0 || headSha !== candidateSha) {
    console.error(
      `candidate identity rejected: --candidate ${candidateSha} != checked-out HEAD ${headSha || '(rev-parse failed)'}`,
    );
    process.exit(2);
  }
  const parents = run(root, 'git', ['log', '-1', '--format=%P']);
  const gitStatus = run(root, 'git', ['status', '--porcelain']);
  return {
    sha: headSha,
    parents: parents.stdout.trim().split(/\s+/).filter(Boolean),
    gitStatus: gitStatus.stdout,
  };
}

/**
 * Records one skipped stage and propagates 'skipped' to its workflow jobs — never
 * overwriting a 'failure' already recorded by an earlier failing step of the same
 * job (GitHub semantics: a job whose step failed concludes 'failure', and later
 * jobs that needed it conclude 'skipped').
 */
function markSkipped(runRecord, name, jobs) {
  runRecord.stages.push({ name, jobs, command: null, exit: null, skipped: true });
  for (const job of jobs) {
    if (runRecord.jobConclusions[job] !== 'failure') runRecord.jobConclusions[job] = 'skipped';
  }
}

function writeStageLog(outputDir, runId, fullLogs, name, logFile, command, result) {
  const body = `$ ${command}\n# exit ${result.status}\n${result.stdout}\n${result.stderr}`;
  if (logFile) {
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, logFile), body);
  }
  if (fullLogs) {
    mkdirSync(join(outputDir, 'runs', runId), { recursive: true });
    writeFileSync(join(outputDir, 'runs', runId, `${name}.log`), body);
  }
}

/**
 * Runs the workflow's exact command surface in job order, fail-stop on gating
 * stages. Returns the registry drift observations the evidence writer needs.
 */
function runPipeline(root, outputDir, runRecord, fullLogs) {
  const runId = runRecord.runId;
  let gatingFailed = false;

  const stage = (name, jobs, argv, { gating = true, logFile = null } = {}) => {
    const command = argv.join(' ');
    if (gatingFailed && gating) {
      markSkipped(runRecord, name, jobs);
      return { status: null, skipped: true };
    }
    const started = Date.now();
    const result = run(root, argv[0], argv.slice(1));
    writeStageLog(outputDir, runId, fullLogs, name, logFile, command, result);
    const entry = {
      name,
      jobs,
      command,
      exit: result.status,
      error: result.error,
      durationMs: Date.now() - started,
      skipped: false,
    };
    if (result.status !== 0) entry.diagnosticExcerpt = diagnosticExcerpt(result.stdout, result.stderr);
    runRecord.stages.push(entry);
    if (result.status !== 0 && gating) {
      gatingFailed = true;
      runRecord.failedStage = name;
      for (const job of jobs) runRecord.jobConclusions[job] = 'failure';
    }
    return { status: result.status, skipped: false };
  };

  stage('actionlint', [], ['actionlint', '.github/workflows/ci.yml'], {
    logFile: 'actionlint.log',
  });
  stage('install', ['typecheck', 'lint', 'registry'], ['pnpm', 'install', '--frozen-lockfile']);
  if (runRecord.jobConclusions.typecheck === 'failure') {
    runRecord.jobConclusions['docs-build'] = 'skipped';
  }

  // Gitignored docs data the root typecheck graph imports (sprint-04's contract
  // test reads registry-items.json). Non-gating in this lane: the workflow's jobs
  // run in parallel, so a data-generation failure (e.g. prebuild's file-count guard
  // tripping on a defective registry tree) must not mask the registry freshness
  // gate — the lane continues and each defect still fails its owning stage. The
  // workflow's typecheck job runs the same commands as a gating step.
  stage('docs-data.gallery', [], ['pnpm', 'gallery:manifest'], { gating: false });
  stage(
    'docs-data.prebuild',
    [],
    ['pnpm', '--filter', '@rnr-ai-elements/docs', 'run', 'prebuild'],
    { gating: false },
  );

  // Scoped live-chat compiler first — it is the discriminator for the owned live
  // import graph, so its report leads when both compilers would fail.
  stage(
    'typecheck.live-chat',
    ['typecheck'],
    [
      'pnpm',
      '--dir',
      'apps/example',
      'exec',
      'tsc',
      '--noEmit',
      '-p',
      'tsconfig.live-chat.json',
    ],
    { logFile: 'live-chat-typecheck.log' },
  );
  stage('typecheck.root', ['typecheck'], ['pnpm', 'typecheck']);
  // Separate diagnostic — never an acceptance obligation, exit recorded as-is.
  stage('diagnostic.whole-example', [], ['pnpm', '--dir', 'apps/example', 'exec', 'tsc', '--noEmit'], {
    gating: false,
    logFile: 'whole-example-diagnostic.log',
  });

  stage('lint.biome', ['lint'], ['pnpm', 'lint']);
  stage('lint.tokens', ['lint'], ['pnpm', 'check:tokens']);
  stage('lint.contract', ['lint'], ['pnpm', 'check:contract']);

  const beforeInventory = registryInventory(root);
  stage('registry.generate', ['registry'], ['pnpm', 'registry:build']);
  const afterInventory = registryInventory(root);
  const driftOutput = run(root, 'git', ['status', '--porcelain', '--', 'public/r']).stdout;
  const registryStage = runRecord.stages.find((s) => s.name === 'registry.generate');
  if (registryStage?.skipped) {
    markSkipped(runRecord, 'registry.freshness', ['registry']);
    markSkipped(runRecord, 'docs-build', ['docs-build']);
    return { gatingFailed, beforeInventory, afterInventory, driftOutput };
  }
  const driftLines = driftOutput.split(/\r?\n/).filter(Boolean);
  const freshnessStage = {
    name: 'registry.freshness',
    jobs: ['registry'],
    command: 'git status --porcelain -- public/r',
    exit: driftLines.length === 0 ? 0 : 1,
    skipped: false,
  };
  if (freshnessStage.exit !== 0) {
    freshnessStage.diagnosticExcerpt = [
      'public/r is not fresh — tracked drift or untracked generated output after registry:build',
      ...driftLines,
    ];
    gatingFailed = true;
    runRecord.failedStage = 'registry.freshness';
    runRecord.jobConclusions.registry = 'failure';
  }
  runRecord.stages.push(freshnessStage);

  const docs = stage('docs-build', ['docs-build'], [
    'pnpm',
    '--filter',
    '@rnr-ai-elements/docs',
    'build',
  ]);
  if (docs.status === 0 && !docs.skipped) {
    const dist = distInventory(root);
    const docsStage = runRecord.stages.find((s) => s.name === 'docs-build');
    docsStage.dist = dist;
    if (dist.fileCount === 0) {
      gatingFailed = true;
      runRecord.failedStage = 'docs-build';
      runRecord.jobConclusions['docs-build'] = 'failure';
      docsStage.exit = 1;
      docsStage.diagnosticExcerpt = ['docs build produced an empty dist'];
    }
  }
  if (gatingFailed && runRecord.jobConclusions['docs-build'] === 'success') {
    runRecord.jobConclusions['docs-build'] = 'skipped';
  }
  return { gatingFailed, beforeInventory, afterInventory, driftOutput };
}

/** Persists drift paths with before/after hashes, accumulating across runs. */
function recordRegistryDrift(outputDir, runId, headSha, driftOutput, beforeInventory, afterInventory) {
  const driftPaths = driftOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2);
      const path = line.slice(3).trim();
      const before = allInventoryEntries(beforeInventory).find((file) => file.path === path);
      const after = allInventoryEntries(afterInventory).find((file) => file.path === path);
      return {
        path,
        status,
        kind: status.includes('?') ? 'untracked-generated' : 'tracked-drift',
        beforeSha256: before ? before.sha256 : null,
        afterSha256: after ? after.sha256 : null,
      };
    });
  const generatedPath = join(outputDir, 'generated-artifacts.json');
  const generated = readJson(generatedPath, {
    schema: `${TASK}-generated-artifacts/1`,
    driftDetections: [],
  });
  generated.driftDetections = [
    ...(Array.isArray(generated.driftDetections) ? generated.driftDetections : []),
    { runId, recordedAt: new Date().toISOString(), candidateSha: headSha, paths: driftPaths },
  ];
  writeJson(generatedPath, generated);
}

function writeExecuteEvidence(root, outputDir, runRecord, toolchain, hosted, afterInventory) {
  const workflowPath = join(root, '.github/workflows/ci.yml');
  const lockfilePath = join(root, 'pnpm-lock.yaml');
  const actionlintLogPath = join(outputDir, 'actionlint.log');
  if (existsSync(actionlintLogPath)) {
    writeFileSync(
      actionlintLogPath,
      `# actionlint ${toolchain.actionlint.output}\n${readFileSync(actionlintLogPath, 'utf8')}`,
    );
  }
  const manifestPath = join(outputDir, 'manifest.json');
  const manifest = readJson(manifestPath, {
    schema: `${TASK}-manifest/1`,
    task: TASK,
    planningSourceSha: PLANNING_SOURCE_SHA,
    generatedBy: 'tests/sprint-05-orient-search/support/candidate-preflight.mjs',
    runs: [],
  });
  manifest.candidate = runRecord.candidate;
  manifest.toolchain = toolchain;
  manifest.workflow = {
    path: '.github/workflows/ci.yml',
    sha256: existsSync(workflowPath) ? sha256File(workflowPath) : null,
  };
  manifest.lockfile = {
    path: 'pnpm-lock.yaml',
    sha256: existsSync(lockfilePath) ? sha256File(lockfilePath) : null,
  };
  manifest.commands = {
    install: 'pnpm install --frozen-lockfile',
    typecheckRoot: 'pnpm typecheck',
    typecheckLiveChat: 'pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json',
    wholeExampleDiagnostic: 'pnpm --dir apps/example exec tsc --noEmit',
    lint: 'pnpm lint',
    checkTokens: 'pnpm check:tokens',
    checkContract: 'pnpm check:contract',
    registryBuild: 'pnpm registry:build',
    registryFreshness: 'git status --porcelain -- public/r',
    docsBuild: 'pnpm --filter @rnr-ai-elements/docs build',
    actionlint: 'actionlint .github/workflows/ci.yml',
  };
  // The green run's engine inventories are written BEFORE hashing so a fresh
  // evidence directory declares every file on its first run.
  if (runRecord.verdict === 'green') {
    const generatedPath = join(outputDir, 'generated-artifacts.json');
    const generated = readJson(generatedPath, {
      schema: `${TASK}-generated-artifacts/1`,
      driftDetections: [],
    });
    generated.generatedAt = new Date().toISOString();
    generated.candidate = { sha: runRecord.candidate.sha };
    generated.engines = afterInventory;
    writeJson(generatedPath, generated);
  }

  manifest.evidence = {
    files: {},
    note: 'hashes cover the final bytes of every evidence file except manifest.json and hosted-runs.json (append-mutable records)',
  };
  for (const name of EVIDENCE_FILE_NAMES) {
    const path = join(outputDir, name);
    manifest.evidence.files[name] = existsSync(path)
      ? { sha256: sha256File(path), bytes: statSync(path).size }
      : null;
  }
  manifest.runs = [...(Array.isArray(manifest.runs) ? manifest.runs : []), runRecord];
  manifest.hostedStatus = hosted;
  writeJson(manifestPath, manifest);

  const hostedRunsPath = join(outputDir, 'hosted-runs.json');
  const hostedRuns = readJson(hostedRunsPath, {
    schema: `${TASK}-hosted-runs/1`,
    records: [],
  });
  hostedRuns.hostedStatus = hosted;
  writeJson(hostedRunsPath, hostedRuns);
}

function executeMode(args) {
  if (!args.candidate || !HEX40.test(args.candidate)) usage(2);
  if (!args.output) usage(2);
  const toplevel = run(process.cwd(), 'git', ['rev-parse', '--show-toplevel']);
  if (toplevel.status !== 0) {
    console.error('not a git worktree');
    process.exit(2);
  }
  const root = resolve(toplevel.stdout.trim());
  const outputDir = resolve(root, args.output);

  // Identity BEFORE any command executes — never run commands for another SHA.
  const candidate = verifyIdentity(root, args.candidate);
  const toolchain = collectToolchain(root);
  const runRecord = {
    runId: `run-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    recordedAt: new Date().toISOString(),
    mode: 'execute',
    invokedAs: ['node', SCRIPT_PATH, ...process.argv.slice(2)],
    candidate,
    stages: [],
    jobConclusions: {
      typecheck: 'success',
      lint: 'success',
      registry: 'success',
      'docs-build': 'success',
    },
    verdict: null,
    failedStage: null,
  };

  const { gatingFailed, beforeInventory, afterInventory, driftOutput } = runPipeline(
    root,
    outputDir,
    runRecord,
    Boolean(args.full_logs),
  );
  if (driftOutput.trim().length > 0) {
    recordRegistryDrift(outputDir, runRecord.runId, candidate.sha, driftOutput, beforeInventory, afterInventory);
  }
  runRecord.verdict = gatingFailed ? 'failed' : 'green';

  const hosted = probeHosted(root, candidate.sha);
  writeExecuteEvidence(root, outputDir, runRecord, toolchain, hosted, afterInventory);

  console.error(
    `${TASK} preflight ${runRecord.verdict}: candidate ${candidate.sha} failedStage=${runRecord.failedStage} jobs=${JSON.stringify(runRecord.jobConclusions)}`,
  );
  process.exit(gatingFailed ? 1 : 0);
}

// ---------------------------------------------------------------------------
// qualify mode
// ---------------------------------------------------------------------------

/** Evidence-internal artifact checks: presence and manifest-hash equality. */
function verifyEvidenceArtifacts(evidenceDir, files) {
  const missingNames = Object.keys(files).filter((name) => !existsSync(join(evidenceDir, name)));
  if (missingNames.length > 0) {
    return {
      verdict: 'rejected',
      reason: 'missing-artifact',
      detail: `declared evidence files absent from the proof directory: ${missingNames.join(', ')}`,
    };
  }
  const altered = [];
  for (const [name, meta] of Object.entries(files)) {
    if (meta?.sha256 && sha256File(join(evidenceDir, name)) !== meta.sha256) {
      altered.push(name);
    }
  }
  if (altered.length > 0) {
    return {
      verdict: 'rejected',
      reason: 'altered-artifact',
      detail: `evidence bytes differ from the manifest hashes: ${altered.join(', ')}`,
    };
  }
  return {
    verdict: 'accepted',
    reason: 'identity-and-artifact-integrity-passed',
    detail: 'candidate binding, artifact presence and artifact hashes all verified',
  };
}

function qualifyMode(args) {
  if (!args.evidence || !args.candidate || !args.record) usage(2);
  const evidenceDir = resolve(args.evidence);
  const recordPath = resolve(args.record);
  const manifestPath = join(evidenceDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`no manifest.json in ${evidenceDir}`);
    process.exit(2);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const proofSha = manifest?.candidate?.sha ?? null;
  const identityOk = HEX40.test(args.candidate) && Boolean(proofSha) && HEX40.test(proofSha);
  const record = {
    recordedAt: new Date().toISOString(),
    kind: 'qualification',
    candidateSha: args.candidate,
    proofSha,
    evidenceDir,
    sourceRunUrl: null,
    hostedStatus: manifest.hostedStatus?.status ?? null,
  };
  if (!identityOk || args.candidate !== proofSha) {
    Object.assign(record, {
      verdict: 'rejected',
      reason: 'candidate-mismatch',
      detail: `qualification asked for candidate ${args.candidate} but the proof is bound to ${proofSha}; a green run for another SHA is never acceptance for this one`,
    });
  } else {
    Object.assign(record, verifyEvidenceArtifacts(evidenceDir, manifest?.evidence?.files ?? {}));
  }

  const ledger = readJson(recordPath, { schema: `${TASK}-hosted-runs/1`, records: [] });
  ledger.records = [...(Array.isArray(ledger.records) ? ledger.records : []), record];
  writeJson(recordPath, ledger);
  console.error(`${record.verdict}: ${record.reason} — ${record.detail}`);
  process.exit(record.verdict === 'accepted' ? 0 : 1);
}

const args = parseArgs(process.argv.slice(2));
if (args.qualify) {
  qualifyMode(args);
} else {
  executeMode(args);
}
