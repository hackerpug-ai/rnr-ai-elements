#!/usr/bin/env node
// fallow-ignore-file complexity
// ORI-CI-004 acceptance verifier — validates a complete acceptance evidence set
// against the exact candidate before the Cloudflare owner's publication
// sequence may run.
// (fallow: spawned CLI entry point, executed as a process by tests and the
// evidence-gate command. Its CRAP estimates punish the sequential validation
// chain — every check is a linear stage over the evidence contract, the same
// shape and rationale as candidate-preflight.mjs.)
//
//   node verify-acceptance.mjs --candidate <40-hex-sha> --run-id <id> --evidence <dir>
//     [--github-run-id <n>] [--github-run-attempt <n>] [--github-repository <owner/repo>]
//     [--workflow-sha <sha>] [--in-run-validation] [--report <file>]
//     [--skip-registry-comparison] [--skip-network]
//
// Validates, in order: session identity binding; preflight record; the fresh
// six-target Quickstart matrix (leg completion, negative control, capture
// hashes); the fresh six-target live-example matrix (target completion,
// artifact hashes, nonempty correlated provider request/response IDs); the
// credential scoping record; the pnpm test and pnpm e2e:docs phase records
// with the 13 locked flow identities across desktop/mobile/no-JavaScript; the
// candidate dist manifest; the public prerequisite registry comparison (real
// HTTPS reads against rnraielements.com); the teardown record; and — when
// hosted metadata is supplied — the actual GitHub run identity, attempt, and
// terminal job conclusions via the real API.
//
// accepted-artifact.json is minted ONLY when every check passes AND hosted
// terminal success is verified. Absent/incomplete hosted metadata leaves the
// verdict 'blocked' (never 'accepted') with NO accepted-artifact.json — an
// in-progress or local-only run can never satisfy hosted acceptance, and
// --in-run-validation additionally forbids minting outright.
//
// Exit codes: 0 = accepted; 1 = rejected or blocked (reasons recorded); 2 = usage.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(new URL(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_PATH, '../../../..');
const TASK = 'ORI-CI-004';
const HEX40 = /^[0-9a-f]{40}$/;
const PUBLIC_REGISTRY_ORIGIN = 'https://rnraielements.com';
const ENGINES = ['nativewind', 'uniwind'];
const PLATFORMS = ['ios', 'android', 'web'];
// The 13 locked flows: nine task flows and four journeys (SPRINT.md coverage
// table is the source; FLOW-DOCS-02-live-example-api is the one vitest-tier
// flow — it is validated from the recorded vitest identity list, the other
// twelve from the playwright junit).
const TASK_FLOWS = [
  'FLOW-DOCS-01-getting-started-engine-decision',
  'FLOW-DOCS-01-theming-and-section-nav',
  'FLOW-DOCS-02-quickstart-chat-screen',
  'FLOW-SHELL-01-theme-toggle-persisted-flash-free',
  'FLOW-SHELL-02-first-visit-prefers-dark-no-flash',
  'FLOW-SHELL-15-search-contract-before-recovery',
  'FLOW-GEND-07-registry-ledger-controls',
  'FLOW-SHELL-16-not-found-search-recovery',
  'FLOW-DOCS-02-live-example-api-stream-history-abort',
];
const JOURNEY_FLOWS = [
  'FLOW-SHELL-07-cmdk-open-search-navigate',
  'FLOW-SHELL-08-pagefind-lazy-load-on-first-open',
  'FLOW-SHELL-13-engine-tab-persists-across-pages',
  'FLOW-SHELL-14-tab-panels-in-initial-html',
];
const BROWSER_PROJECTS = ['chromium-desktop', 'chromium-mobile', 'chromium-nojs'];

function usage() {
  console.error(
    'usage: verify-acceptance.mjs --candidate <40-hex> --run-id <id> --evidence <dir>',
    '[--github-run-id <n>] [--github-run-attempt <n>] [--github-repository <owner/repo>]',
    '[--workflow-sha <sha>] [--in-run-validation] [--report <file>]',
    '[--skip-registry-comparison] [--skip-network]',
  );
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--in-run-validation' || flag === '--skip-registry-comparison' || flag === '--skip-network') {
      if (flag === '--in-run-validation') out.inRunValidation = true;
      if (flag === '--skip-registry-comparison') out.skipRegistryComparison = true;
      if (flag === '--skip-network') out.skipNetwork = true;
      i -= 1; // boolean flag consumes no value
      continue;
    }
    if (value === undefined) {
      usage();
      throw new Error(`missing value for ${flag}`);
    }
    // fallow-ignore-next-line code-duplication
    // The flag-to-field chain mirrors run-acceptance.mjs's parseArgs by design:
    // each CLI documents its own contract; a shared arg-parser module would
    // couple the session runner and the verifier for 8 trivial assignments.
    if (flag === '--candidate') out.candidate = value;
    else if (flag === '--run-id') out.runId = value;
    else if (flag === '--evidence') out.evidence = value;
    else if (flag === '--github-run-id') out.githubRunId = value;
    else if (flag === '--github-run-attempt') out.githubRunAttempt = value;
    else if (flag === '--github-repository') out.githubRepository = value;
    else if (flag === '--workflow-sha') out.workflowSha = value;
    else if (flag === '--report') out.report = value;
    else {
      usage();
      throw new Error(`unknown flag ${flag}`);
    }
  }
  return out;
}

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function sha256File(path) {
  return sha256Buffer(readFileSync(path));
}

function run(cwd, command, args, options = {}) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: options.timeoutMs ?? 120_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

class CheckError extends Error {
  constructor(reason, detail) {
    super(detail);
    this.reason = reason;
  }
}

function readJson(path) {
  if (!existsSync(path)) {
    throw new CheckError('missing-evidence-file', `missing evidence file: ${path}`);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new CheckError('corrupt-evidence-file', `unparseable ${path}: ${error.message}`);
  }
}

function requireTrue(condition, reason, detail) {
  if (!condition) throw new CheckError(reason, detail);
}

function listFilesRecursive(root) {
  const out = [];
  if (!existsSync(root)) return out;
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: false })) {
    const path = join(root, entry);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isFile()) out.push(path);
  }
  return out;
}

function validateIdentity(options, evidenceDir) {
  const manifest = readJson(join(evidenceDir, 'manifest.json'));
  requireTrue(
    manifest.run_id === options.runId,
    'run-id-mismatch',
    `evidence manifest run_id '${manifest.run_id}' != declared '${options.runId}'`,
  );
  requireTrue(
    Array.isArray(manifest.phases) && manifest.phases.length > 0,
    'empty-phases',
    'manifest records no phases — an empty session is never acceptance',
  );
  const preflight = readJson(join(evidenceDir, 'runner-preflight.json'));
  requireTrue(
    preflight.outcome === 'ok',
    'preflight-refused',
    `runner preflight outcome '${preflight.outcome}' (${preflight.reason ?? 'no reason'}) — a refused session is never acceptance`,
  );
  requireTrue(
    preflight.identity?.head === options.candidate,
    'candidate-mismatch',
    `evidence is bound to candidate ${preflight.identity?.head}; acceptance asked for ${options.candidate} — a run for another SHA is never acceptance for this one`,
  );
  if (options.workflowSha) {
    requireTrue(
      options.workflowSha === options.candidate,
      'workflow-revision-mismatch',
      `workflow revision ${options.workflowSha} != candidate ${options.candidate}`,
    );
  }
  // Source digests: every hash recorded by the session must still match the
  // candidate's bytes — altered source hashes mean the evidence describes a
  // different tree.
  const digests = manifest.source_digests ?? {};
  const digestEntries = Object.entries(digests);
  requireTrue(
    digestEntries.length > 0,
    'source-digests-empty',
    'manifest records no source digests — a 0-entry hash set is never verified',
  );
  for (const [path, expected] of digestEntries) {
    const absolute = join(REPO_ROOT, path);
    requireTrue(
      existsSync(absolute),
      'source-digest-missing-file',
      `manifest source digests reference ${path}, which is absent from the candidate`,
    );
    const observed = sha256File(absolute);
    requireTrue(
      observed === expected,
      'source-hash-mismatch',
      `source hash mismatch for ${path}: expected (recorded) ${expected}, observed ${observed}`,
    );
  }
  // Repo-side binding: the tree this verifier runs against must byte-match the
  // session's recorded tree. A git-SHA equality cannot hold for committed
  // evidence by construction (committing the evidence moves HEAD), so the
  // binding is the recorded source digest of every acceptance-relevant file
  // (validated below) — hosted acceptance additionally binds the GitHub run's
  // head_sha to the candidate.
  const head = run(REPO_ROOT, 'git', ['rev-parse', 'HEAD']).stdout.trim();
  const descended = run(REPO_ROOT, 'git', ['merge-base', '--is-ancestor', manifest.planning_source_sha ?? 'HEAD', head]);
  requireTrue(
    descended.status === 0,
    'candidate-lineage',
    `repository HEAD ${head} is not descended from the planning source recorded by the session`,
  );
  return { manifest, preflight, head };
}

function phaseNamed(manifest, name) {
  // The LAST record for a phase name is the current state: a continued or
  // interrupted-and-resumed session may carry an earlier failed record for
  // the same phase under the same run-id.
  const records = (manifest.phases ?? []).filter((phase) => phase.phase === name);
  return records.length > 0 ? records[records.length - 1] : null;
}

function validatePreparation(evidenceDir, options) {
  const prepare = phaseNamed(readJson(join(evidenceDir, 'manifest.json')), 'prepare');
  requireTrue(prepare !== null, 'missing-prepare-phase', 'no prepare phase recorded — no fresh owner proof');
  requireTrue(
    prepare.outcome === 'ok',
    'prepare-phase-failed',
    `prepare phase outcome '${prepare.outcome}'`,
  );

  // Quickstart: the owner manifest schema — legs with status 'passed' covering
  // all six engine/platform targets, a passed negative control, and capture
  // copies whose bytes hash to the recorded values.
  const quickstartDir = join(evidenceDir, 'test/preparation/quickstart');
  const quickstart = readJson(join(quickstartDir, 'run-manifest.json'));
  requireTrue(
    quickstart.completed === true,
    'quickstart-incomplete',
    `Quickstart manifest completed=${quickstart.completed} — an incomplete matrix is never acceptance`,
  );
  const legs = quickstart.legs ?? [];
  requireTrue(
    Array.isArray(legs) && legs.length > 0,
    'quickstart-empty',
    'Quickstart manifest records 0 legs — 0 target results is never acceptance',
  );
  const seen = new Map();
  for (const leg of legs) {
    requireTrue(
      leg.status === 'passed',
      'quickstart-leg-failed',
      `Quickstart leg ${leg.engine}-${leg.platform} status '${leg.status}'`,
    );
    seen.set(`${leg.engine}-${leg.platform}`, (seen.get(`${leg.engine}-${leg.platform}`) ?? 0) + 1);
  }
  for (const engine of ENGINES) {
    for (const platform of PLATFORMS) {
      requireTrue(
        seen.has(`${engine}-${platform}`),
        'quickstart-target-missing',
        `Quickstart matrix is missing ${engine}-${platform} (have: ${[...seen.keys()].sort().join(', ')})`,
      );
    }
  }
  requireTrue(
    quickstart.negative_control?.restored_equals_original === true &&
      quickstart.negative_control?.baseline_submission_passed === true,
    'quickstart-negative-control-missing',
    'Quickstart callback-disconnection negative control is absent or incomplete',
  );
  requireTrue(
    quickstart.candidate_head_sha === options.candidate,
    'quickstart-candidate-mismatch',
    `Quickstart manifest is bound to candidate ${quickstart.candidate_head_sha}, not ${options.candidate} — earlier invocation receipts cannot satisfy the final invocation`,
  );
  const inventory = readJson(join(quickstartDir, 'captures-inventory.json'));
  requireTrue(
    Array.isArray(inventory.captures) && inventory.captures.length > 0,
    'quickstart-captures-empty',
    'Quickstart capture inventory is empty — an empty file set is never runtime evidence',
  );
  for (const capture of inventory.captures) {
    const local = join(quickstartDir, 'captures', capture.copyRel);
    requireTrue(
      existsSync(local),
      'quickstart-capture-missing',
      `Quickstart capture ${capture.name} (${capture.leg}) referenced but absent: ${local}`,
    );
    const observed = sha256File(local);
    requireTrue(
      observed === capture.sha256,
      'quickstart-capture-hash-mismatch',
      `Quickstart capture ${capture.name} (${capture.leg}): SHA-256 ${observed} != recorded ${capture.sha256}`,
    );
  }

  // Live example: six targets, artifact hashes, provider correlation.
  let correlated = 0;
  for (const engine of ENGINES) {
    const engineDir = join(evidenceDir, `test/preparation/live-example/${engine}`);
    const live = readJson(join(engineDir, 'manifest.json'));
    requireTrue(
      typeof live.run_id === 'string' && live.run_id.startsWith(`${options.runId}-live`),
      'live-run-id-mismatch',
      `live-example ${engine} manifest run_id '${live.run_id}' is not this session's invocation (${options.runId}-live… — the owner driver may append the engine/phase) — earlier invocation receipts cannot satisfy the final invocation`,
    );
    requireTrue(
      live.validation?.ok === true,
      'live-validation-failed',
      `live-example ${engine} manifest validation is not ok: ${JSON.stringify(live.validation?.rejections ?? [])}`,
    );
    for (const platform of PLATFORMS) {
      const target = live.targets?.[`${engine}-${platform}`];
      requireTrue(
        target !== undefined,
        'live-target-missing',
        `live-example matrix is missing ${engine}-${platform}`,
      );
      for (const [name, hash] of Object.entries(target.artifacts ?? {})) {
        const path = join(engineDir, `${engine}-${platform}`, name);
        requireTrue(
          existsSync(path),
          'live-artifact-missing',
          `live-example ${engine}-${platform} artifact ${name} referenced but absent`,
        );
        const observed = sha256File(path);
        requireTrue(
          observed === hash,
          'live-artifact-hash-mismatch',
          `live-example ${engine}-${platform} artifact ${name}: SHA-256 ${observed} != recorded ${hash}`,
        );
      }
      const result = readJson(join(engineDir, `${engine}-${platform}`, 'result.json'));
      const requestIds = result.correlation?.completed_request_ids ?? [];
      const responseIds = result.correlation?.response_ids ?? [];
      requireTrue(
        requestIds.length > 0 && responseIds.length > 0,
        'live-provider-correlation-missing',
        `live-example ${engine}-${platform} has no correlated provider request/response IDs — a static transcript is not live proof`,
      );
      requireTrue(
        responseIds.every((id) => typeof id === 'string' && id.startsWith('resp_')),
        'live-provider-correlation-invalid',
        `live-example ${engine}-${platform} response IDs are not provider response IDs`,
      );
      correlated += 1;
    }
  }
  requireTrue(
    correlated === ENGINES.length * PLATFORMS.length,
    'live-correlation-incomplete',
    `only ${correlated}/${ENGINES.length * PLATFORMS.length} live targets carry provider correlation`,
  );

  // Credential scoping: no prohibited group may have carried the secret.
  const scoping = prepare.credentialScoping?.prohibitedGroupOccurrences ?? null;
  requireTrue(
    scoping !== null,
    'credential-scoping-missing',
    'prepare phase recorded no credential scoping report',
  );
  for (const [group, count] of Object.entries(scoping)) {
    requireTrue(
      count === 0,
      'credential-leak',
      `credential scoping: prohibited group '${group}' recorded ${count} occurrence(s) of the provider secret`,
    );
  }
  return { quickstartLegs: legs.length, correlatedTargets: correlated };
}

function validateSuites(evidenceDir) {
  const manifest = readJson(join(evidenceDir, 'manifest.json'));
  const test = phaseNamed(manifest, 'test');
  const docs = phaseNamed(manifest, 'docs-e2e');
  requireTrue(test !== null, 'missing-test-phase', 'no pnpm test phase recorded');
  requireTrue(docs !== null, 'missing-docs-e2e-phase', 'no pnpm e2e:docs phase recorded');
  const testCommand = (test.commands ?? []).find((command) => command.command === 'pnpm test');
  const docsCommand = (docs.commands ?? []).find((command) => command.command === 'pnpm e2e:docs');
  requireTrue(testCommand !== undefined, 'missing-test-command', 'pnpm test is not among the recorded commands');
  requireTrue(docsCommand !== undefined, 'missing-docs-command', 'pnpm e2e:docs is not among the recorded commands');
  requireTrue(
    testCommand.exit === 0,
    'test-suite-failed',
    `pnpm test exited ${testCommand.exit} — the complete suite must be green`,
  );

  // Flow identities: 12 flows from the junit, the vitest-tier flow from the
  // recorded vitest identity list.
  const junitPath = join(evidenceDir, 'docs-e2e/junit.xml');
  requireTrue(existsSync(junitPath), 'missing-junit', 'docs-e2e junit.xml was not captured');
  const junit = readFileSync(junitPath, 'utf8');
  const vitestListPath = join(evidenceDir, 'test/vitest-list.txt');
  requireTrue(
    existsSync(vitestListPath),
    'missing-vitest-identity',
    'test/vitest-list.txt was not captured',
  );
  const vitestList = readFileSync(vitestListPath, 'utf8');
  const combined = `${junit}\n${vitestList}`;
  const missingFlows = [...TASK_FLOWS, ...JOURNEY_FLOWS].filter((flow) => !combined.includes(flow));
  requireTrue(
    missingFlows.length === 0,
    'locked-flow-missing',
    `locked flow identities absent from the recorded suites: ${missingFlows.join(', ')}`,
  );
  const missingProjects = BROWSER_PROJECTS.filter((project) => !junit.includes(project));
  requireTrue(
    missingProjects.length === 0,
    'browser-project-missing',
    `browser projects absent from the docs-e2e junit: ${missingProjects.join(', ')}`,
  );
  return {
    testExit: testCommand.exit,
    docsExit: docsCommand.exit,
    junitFailures: (junit.match(/<failure\b/g) ?? []).length,
    flows: TASK_FLOWS.length + JOURNEY_FLOWS.length,
  };
}

function distManifest(options) {
  const distRoot = join(REPO_ROOT, 'apps/docs/dist');
  const files = listFilesRecursive(distRoot);
  requireTrue(
    files.length > 0,
    'empty-dist',
    'apps/docs/dist is empty — a 0-entry dist manifest is never verified',
  );
  const manifest = {};
  for (const file of files) {
    manifest[file.replace(`${REPO_ROOT}/`, '')] = sha256File(file);
  }
  return { fileCount: files.length, files: manifest };
}

async function comparePublicRegistry() {
  const registryDir = join(REPO_ROOT, 'public/r');
  const mismatches = [];
  const compared = [];
  for (const engine of ENGINES) {
    const engineDir = join(registryDir, engine);
    if (!existsSync(engineDir)) {
      throw new CheckError('candidate-registry-missing', `candidate registry tree missing: ${engineDir}`);
    }
    for (const entry of readdirSync(engineDir)) {
      if (!entry.endsWith('.json')) continue;
      const local = join(engineDir, entry);
      const localHash = sha256File(local);
      const url = `${PUBLIC_REGISTRY_ORIGIN}/r/${engine}/${entry}`;
      let response;
      try {
        response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      } catch (error) {
        throw new CheckError(
          'public-registry-unreachable',
          `public prerequisite registry read failed for ${url}: ${error.message}`,
        );
      }
      requireTrue(
        response.ok,
        'public-registry-error',
        `public prerequisite registry returned HTTP ${response.status} for ${url}`,
      );
      const body = Buffer.from(await response.arrayBuffer());
      const remoteHash = sha256Buffer(body);
      compared.push({ url, localHash, remoteHash });
      if (remoteHash !== localHash) {
        mismatches.push({ url, expected: localHash, observed: remoteHash });
      }
    }
  }
  requireTrue(
    compared.length > 0,
    'registry-comparison-empty',
    '0-entry registry comparison treated as verified — never allowed',
  );
  if (mismatches.length > 0) {
    const first = mismatches[0];
    throw new CheckError(
      'public-registry-mismatch',
      `candidate registry differs from the public prerequisite release in ${mismatches.length}/${compared.length} responses (first: ${first.url} expected ${first.expected} observed ${first.observed}); a mismatch stops acceptance and requires a separately reviewed registry-prerequisite release and fresh real proof`,
    );
  }
  return { compared: compared.length, mismatches: 0 };
}

function validateTeardown(evidenceDir) {
  const teardown = readJson(join(evidenceDir, 'teardown.json'));
  requireTrue(
    teardown.residualOwnedListeners === 0,
    'owned-listener-survived',
    `teardown records ${teardown.residualOwnedListeners} residual owned listener(s)`,
  );
  requireTrue(
    teardown.residualOwnedLivePids === 0,
    'owned-child-survived',
    `teardown records ${teardown.residualOwnedLivePids} residual owned live PID(s)`,
  );
  requireTrue(
    Array.isArray(teardown.terminatedOwnedPids) || Array.isArray(teardown.exitedOwnedPids),
    'teardown-unrecorded',
    'teardown records no owned child dispositions',
  );
  return {
    terminated: (teardown.terminatedOwnedPids ?? []).length,
    exited: (teardown.exitedOwnedPids ?? []).length,
    trigger: teardown.trigger,
  };
}

async function hostedMetadata(options, evidenceDir, summary) {
  const hostedRunPath = join(evidenceDir, 'hosted-run.json');
  const githubRunId = options.githubRunId ?? null;
  if (!githubRunId) {
    // Real observation: has ANY hosted run ever executed for this candidate?
    const originUrl = run(REPO_ROOT, 'git', ['remote', 'get-url', 'origin']).stdout.trim();
    const repoSlug = originUrl.match(/[:/]([^/:]+\/[^/.]+)\.git$/)?.[1] ?? null;
    let observation = null;
    if (repoSlug) {
      const api = run(
        REPO_ROOT,
        'gh',
        ['api', `/repos/${repoSlug}/actions/runs?head_sha=${options.candidate}`],
        { timeoutMs: 30_000 },
      );
      observation = {
        repoSlug,
        api: { exit: api.status, stdout: api.stdout?.slice(0, 4000) ?? '', stderr: api.stderr?.slice(0, 2000) ?? '' },
      };
    }
    const runCount = observation ? (Number.parseInt(observation.api.stdout.match(/"total_count":\s*(\d+)/)?.[1] ?? '0', 10) || 0) : null;
    return {
      status: 'blocked',
      reason:
        runCount === 0
          ? `No hosted GitHub Actions run exists for candidate ${options.candidate} (GitHub API observed ${runCount} run(s) for this head SHA). Hosted acceptance stays blocked until a real protected dispatch runs; local evidence can never populate hosted success.`
          : `Hosted acceptance was not verified for this invocation: no --github-run-id was supplied, so run identity, attempt, approvals and terminal job conclusions are unverified.`,
      observation,
      recordedAt: new Date().toISOString(),
    };
  }
  // Hosted validation against the real API.
  const repo = options.githubRepository ?? 'hackerpug-ai/rnr-ai-elements';
  const runResult = run(
    REPO_ROOT,
    'gh',
    ['api', `/repos/${repo}/actions/runs/${githubRunId}`],
    { timeoutMs: 30_000 },
  );
  requireTrue(
    runResult.status === 0,
    'github-api-unreachable',
    `GitHub run metadata API failed: ${runResult.stderr}`,
  );
  const runJson = JSON.parse(runResult.stdout);
  const attempt = options.githubRunAttempt ?? String(runJson.run_attempt);
  requireTrue(
    String(runJson.run_attempt) === attempt,
    'github-attempt-mismatch',
    `GitHub API reports run_attempt ${runJson.run_attempt}; acceptance declared attempt ${attempt} — a stale run attempt is never acceptance`,
  );
  requireTrue(
    runJson.head_sha === options.candidate,
    'github-candidate-mismatch',
    `GitHub run ${githubRunId} head_sha ${runJson.head_sha} != candidate ${options.candidate}`,
  );
  requireTrue(
    runJson.status === 'completed',
    'github-run-incomplete',
    `GitHub run ${githubRunId} status '${runJson.status}' — an in-progress run is never terminal success`,
  );
  requireTrue(
    runJson.conclusion === 'success',
    'github-run-failed',
    `GitHub run ${githubRunId} conclusion '${runJson.conclusion}' — cancelled or failed runs cannot leave accepted release evidence`,
  );
  const jobsResult = run(
    REPO_ROOT,
    'gh',
    ['api', `/repos/${repo}/actions/runs/${githubRunId}/attempts/${attempt}/jobs`],
    { timeoutMs: 30_000 },
  );
  requireTrue(
    jobsResult.status === 0,
    'github-jobs-unreachable',
    `GitHub jobs API failed: ${jobsResult.stderr}`,
  );
  const jobs = JSON.parse(jobsResult.stdout).jobs ?? [];
  const required = ['preflight', 'test', 'docs-e2e'];
  const conclusions = {};
  for (const job of jobs) {
    conclusions[job.name] = job.conclusion;
  }
  for (const name of required) {
    requireTrue(
      conclusions[name] === 'success',
      'github-job-failed',
      `required job '${name}' conclusion is '${conclusions[name] ?? 'absent'}' (all required jobs must be 'success')`,
    );
  }
  // Independent approval reference: the environment protection review.
  const approvalsResult = run(
    REPO_ROOT,
    'gh',
    ['api', `/repos/${repo}/actions/runs/${githubRunId}/approvals`],
    { timeoutMs: 30_000 },
  );
  const approvals =
    approvalsResult.status === 0
      ? JSON.parse(approvalsResult.stdout).map((approval) => ({
          user: approval.user?.login ?? null,
          state: approval.state ?? null,
        }))
      : [];
  requireTrue(
    approvals.length > 0,
    'github-approval-missing',
    '0 independent approval references — protected admission without recorded approval is never acceptance',
  );
  return {
    status: 'verified',
    runId: githubRunId,
    attempt,
    headSha: runJson.head_sha,
    workflowSha: options.workflowSha ?? null,
    conclusion: runJson.conclusion,
    jobConclusions: conclusions,
    approvals,
    recordedAt: new Date().toISOString(),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.candidate || !options.runId || !options.evidence) {
    usage();
    process.exit(2);
  }
  if (!HEX40.test(options.candidate)) {
    console.error(`--candidate '${options.candidate}' is not 40-hex`);
    process.exit(2);
  }
  const evidenceDir = resolve(REPO_ROOT, options.evidence);
  const reportPath = options.report ? resolve(REPO_ROOT, options.report) : join(evidenceDir, 'hosted-run.json');
  const checks = {};
  let hosted = null;
  let dist = null;
  let registry = null;
  let verdict = 'rejected';
  let failure = null;
  try {
    checks.identity = validateIdentity(options, evidenceDir);
    // The hosted observation is recorded independently of the local gates —
    // a failed local gate never erases the real hosted record (the
    // ORI-CI-003 hosted-runs.json pattern), and --skip-network skips it for
    // high-frequency local validation passes.
    if (!options.skipNetwork) {
      try {
        hosted = await hostedMetadata(options, evidenceDir);
      } catch (error) {
        if (error instanceof CheckError) {
          hosted = { status: 'unverified', reason: error.reason, detail: error.message, recordedAt: new Date().toISOString() };
        } else {
          throw error;
        }
      }
    }
    checks.preparation = validatePreparation(evidenceDir, options);
    checks.suites = validateSuites(evidenceDir);
    // docs-e2e exit 0 is part of the acceptance contract; record it here so
    // the blocked reason is explicit rather than a generic rejection.
    requireTrue(
      checks.suites.docsExit === 0,
      'docs-e2e-suite-failed',
      `pnpm e2e:docs exited ${checks.suites.docsExit} (${checks.suites.junitFailures} junit failures) — the complete browser lane must be green before publication handoff`,
    );
    checks.teardown = validateTeardown(evidenceDir);
    dist = distManifest(options);
    // Mutation guard: when an earlier verification of this same run already
    // recorded its dist manifest, the bytes must be unchanged — a changed
    // build requires fresh acceptance before publication.
    const previousReportPath = join(evidenceDir, 'hosted-run.json');
    let bytesChanged = null;
    if (existsSync(previousReportPath)) {
      try {
        const previous = JSON.parse(readFileSync(previousReportPath, 'utf8'));
        if (previous.distFiles && dist) {
          const differing = [];
          const paths = new Set([...Object.keys(previous.distFiles), ...Object.keys(dist.files)]);
          for (const path of paths) {
            if (previous.distFiles[path] !== dist.files[path]) {
              differing.push({ path, expected: previous.distFiles[path] ?? null, observed: dist.files[path] ?? null });
            }
          }
          bytesChanged = differing;
          requireTrue(
            differing.length === 0,
            'candidate-bytes-changed',
            `dist bytes changed since the previous verification of run ${options.runId}: ${differing.length} differing SHA-256 pair(s) (first: ${differing[0].path} expected ${differing[0].expected} observed ${differing[0].observed}); a changed build requires fresh acceptance`,
          );
        }
      } catch (error) {
        if (error instanceof CheckError) throw error;
        // unparseable earlier report is not itself a mutation signal
      }
    }
    if (!options.skipRegistryComparison && !options.skipNetwork) {
      registry = await comparePublicRegistry();
    } else {
      registry = { skipped: true, reason: 'flag-supplied' };
    }
    if (hosted !== null && hosted.status !== 'verified') {
      verdict = 'blocked';
      failure = { reason: 'hosted-acceptance-absent', detail: hosted.reason };
    } else if (hosted === null) {
      verdict = 'blocked';
      failure = {
        reason: 'hosted-acceptance-unverified',
        detail: 'hosted metadata was not verified in this pass (--skip-network); final acceptance requires the full terminal verification',
      };
    } else if (options.inRunValidation) {
      verdict = 'blocked';
      failure = {
        reason: 'in-run-validation',
        detail: 'in-run validation can never mint acceptance — run final verify-acceptance after the GitHub run reaches terminal status',
      };
    } else {
      verdict = 'accepted';
    }
  } catch (error) {
    if (error instanceof CheckError) {
      failure = { reason: error.reason, detail: error.message };
      verdict = failure.reason === 'docs-e2e-suite-failed' ? 'blocked' : 'rejected';
    } else {
      failure = { reason: 'unexpected-error', detail: error.stack ?? String(error) };
      verdict = 'rejected';
    }
  }

  const report = {
    schema: `${TASK}-verification/1`,
    task: TASK,
    candidate: options.candidate,
    run_id: options.runId,
    verdict,
    failure,
    checks: {
      identity: checks.identity
        ? { runIdBound: true, preflightOutcome: checks.identity.preflight.outcome }
        : null,
      preparation: checks.preparation ?? null,
      suites: checks.suites ?? null,
      teardown: checks.teardown ?? null,
      dist: dist ? { fileCount: dist.fileCount } : null,
      publicRegistry: registry,
    },
    distFiles: dist?.files ?? null,
    hosted,
    inRunValidation: Boolean(options.inRunValidation),
    recordedAt: new Date().toISOString(),
  };
  mkdirSync(resolve(reportPath, '..'), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 1)}\n`);

  const acceptedArtifactPath = join(evidenceDir, 'accepted-artifact.json');
  if (verdict === 'accepted' && !options.inRunValidation) {
    // Mint the immutable accepted identity for the Cloudflare owner.
    const evidenceFiles = {};
    for (const file of listFilesRecursive(evidenceDir)) {
      evidenceFiles[file.replace(`${evidenceDir}/`, '')] = sha256File(file);
    }
    const artifact = {
      schema: `${TASK}-accepted-artifact/1`,
      candidate_sha: options.candidate,
      run_id: options.runId,
      github: {
        runId: hosted.runId,
        attempt: hosted.attempt,
        workflowSha: hosted.workflowSha,
        approvals: hosted.approvals,
      },
      accepted_dist: dist.files,
      evidence_files: evidenceFiles,
      teardown: checks.teardown,
      mintedAt: new Date().toISOString(),
      note: 'verified acceptance identity for the Cloudflare owner; this mints no deployment',
    };
    writeFileSync(acceptedArtifactPath, `${JSON.stringify(artifact, null, 1)}\n`);
    console.error(`[ORI-CI-004] accepted: candidate ${options.candidate}, run ${options.runId}`);
    process.exit(0);
  }
  if (existsSync(acceptedArtifactPath)) {
    // A failed/blocked/cancelled session can never leave a valid accepted
    // release manifest: remove it so no valid artifact survives.
    console.error(
      `[ORI-CI-004] accepted-artifact.json exists while verdict is '${verdict}' — removing it`,
    );
    unlinkSync(acceptedArtifactPath);
    report.staleArtifactRemoved = true;
    writeFileSync(reportPath, `${JSON.stringify(report, null, 1)}\n`);
  }
  console.error(
    `[ORI-CI-004] ${verdict}: ${failure?.reason ?? 'no failure'} — ${failure?.detail ?? ''}`,
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(`[ORI-CI-004] unexpected verifier failure: ${error.stack ?? error.message}`);
  process.exit(2);
});
