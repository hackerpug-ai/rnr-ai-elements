// fallow-ignore-file complexity
/**
 * ORI-CI-004 — the four acceptance-evidence gates.
 * (fallow: each test body mirrors its acceptance criterion's scenario 1:1 —
 * assertion order follows the scenario's must_observe sequence, so decomposing
 * the bodies into shared helpers would split each AC's evidence trail away
 * from its gate. The CRAP estimates punish exactly that scenario fidelity.)
 *
 * Registration contract: these gates assert a COMPLETED acceptance session's
 * evidence (evidence/ORI-CI-004/manifest.json with completed === true — every
 * requested phase attempted and recorded by support/run-acceptance.mjs). Until
 * a session completes, this file registers no tests, the same in-suite behavior
 * as the repository's other 0-test driver files (support/live-example-proof.test.ts,
 * caller-backend-restart-proof.test.ts): the mid-session `pnpm test` phase never
 * runs its own acceptance gates, because the gates run — via the task's exact
 * targeted VERIFY commands — only after the session. A session refused at
 * preflight never sets completed, so refused evidence can never open the gates,
 * and with no manifest at all the targeted VERIFY fails loudly ("no test suite
 * found in file") instead of passing.
 *
 * What each gate proves, against real files, processes, devices, and APIs:
 *  - ORI-CI-004-fresh-acceptance   the session's matrices (6 Quickstart + 6
 *    live-example targets), capture/artifact hashes recomputed from bytes,
 *    provider request/response correlation, the 13 locked flow identities, and
 *    no runtime skips in the recorded suites.
 *  - ORI-CI-004-protected-execution the workflow's dispatch identity guards and
 *    least-privilege configuration, the recorded three-way identity agreement
 *    and explicit device reservations, credential scoping, and REAL refusals:
 *    identity mismatch, unavailable device, occupied-unowned port 4321.
 *  - ORI-CI-004-evidence-integrity the real verifier on the genuine evidence
 *    set, then isolated corruption copies (missing Android result, altered
 *    source hash, earlier-run manifest, omitted provider correlation, plus
 *    truncated/absent/changed-artifact variants) that must each fail while the
 *    original evidence bytes stay unchanged.
 *  - ORI-CI-004-terminal-handoff  the AI owner's real missing-credential,
 *    unreachable-backend, and rejected-model paths with successful recovery, a
 *    really-cancelled session's teardown, and the fail-closed hosted boundary
 *    (no hosted run can exist for an unpushed candidate; no accepted-artifact
 *    is ever minted from local evidence).
 *
 * The publication-level demands (pnpm test and pnpm e2e:docs exit 0, hosted
 * terminal success) are enforced by support/verify-acceptance.mjs — the gate
 * between the Cloudflare owner and publication — never weakened here.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
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
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { DEFAULT_MODEL, launchOwnedBackend } from './support/live-backend';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const evidenceDir = join(repoRoot, 'tests/sprint-05-orient-search/evidence/ORI-CI-004');
const scratchRoot = join(repoRoot, '.tmp/ORI-CI-004/test-runs');
const runnerPath = join(repoRoot, 'tests/sprint-05-orient-search/support/run-acceptance.mjs');
const verifierPath = join(repoRoot, 'tests/sprint-05-orient-search/support/verify-acceptance.mjs');
const workflowPath = join(repoRoot, '.github/workflows/sprint-05-acceptance.yml');

// The locked YAML parser (same process-boundary pattern as
// ci-build-gate-wiring.test.ts: the registry lockfile forbids declaring the
// dependency, so the deep store path is loaded in a real child process).
const YAML_PARSER_PATH = join(
  repoRoot,
  'node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/index.js',
);

const ENGINES = ['nativewind', 'uniwind'] as const;
const PLATFORMS = ['ios', 'android', 'web'] as const;
const TASK_FLOWS = [
  'FLOW-DOCS-01-getting-started-engine-decision',
  'FLOW-DOCS-01-theming-and-section-nav',
  'FLOW-DOCS-02-quickstart-chat-screen',
  'FLOW-SHELL-01-theme-toggle-persisted-flash-free',
  'FLOW-SHELL-02-first-visit-prefers-dark-no-flash',
  'FLOW-SHELL-15-search-contract-before-recovery',
  'FLOW-GEND-07-registry-ledger-controls',
  'FLOW-SHELL-16-not-found-search-recovery',
];
const JOURNEY_FLOWS = [
  'FLOW-SHELL-07-cmdk-open-search-navigate',
  'FLOW-SHELL-08-pagefind-lazy-load-on-first-open',
  'FLOW-SHELL-13-engine-tab-persists-across-pages',
  'FLOW-SHELL-14-tab-panels-in-initial-html',
];
const VITEST_FLOW = 'FLOW-DOCS-02-live-example-api-stream-history-abort';
const BROWSER_PROJECTS = ['chromium-desktop', 'chromium-mobile', 'chromium-nojs'];

interface LegRecord {
  engine: string;
  platform: string;
  appearance?: string;
  status: string;
  evidence?: { screenshot?: string; [key: string]: unknown };
  [key: string]: unknown;
}

interface LiveManifest {
  run_id: string;
  repo_head?: string;
  validation?: { ok: boolean; accepted_targets?: string[]; rejections?: string[] };
  targets?: Record<string, { artifacts?: Record<string, string>; [key: string]: unknown }>;
  [key: string]: unknown;
}

interface SessionManifest {
  run_id: string;
  completed?: boolean;
  phases?: PhaseRecord[];
  [key: string]: unknown;
}

interface PhaseRecord {
  phase: string;
  outcome: string;
  commands?: CommandRecord[];
  credentialScoping?: {
    prohibitedGroupOccurrences?: Record<string, number>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CommandRecord {
  role: string;
  command: string;
  exit: number | null;
  receivedOpenAiKey?: boolean;
  env?: Record<string, string>;
  previewOrigin?: string;
  [key: string]: unknown;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function sessionManifest(): SessionManifest | null {
  const path = join(evidenceDir, 'manifest.json');
  if (!existsSync(path)) return null;
  try {
    const manifest = readJson<SessionManifest>(path);
    return manifest.completed === true ? manifest : null;
  } catch {
    return null;
  }
}

function git(args: string[], cwd = repoRoot) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

function runAcceptance(
  args: string[],
  options: { cwd?: string; env?: Record<string, string>; timeoutMs?: number } = {},
) {
  return spawnSync('node', [runnerPath, ...args], {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    timeout: options.timeoutMs ?? 120_000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ...options.env },
  });
}

function verifyAcceptance(evidence: string, args: string[], options: { timeoutMs?: number } = {}) {
  return spawnSync(
    'node',
    [
      verifierPath,
      '--candidate',
      sessionCandidate(),
      '--run-id',
      sessionRunId(),
      '--evidence',
      evidence,
      ...args,
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: options.timeoutMs ?? 300_000,
      maxBuffer: 32 * 1024 * 1024,
    },
  );
}

function sessionCandidate(): string {
  // The candidate the EVIDENCE is bound to (recorded at session time); the
  // acceptance-relevant tree bytes are validated against it via digests, so
  // post-commit verifications still bind to the session's candidate.
  const preflightPath = join(evidenceDir, 'runner-preflight.json');
  if (existsSync(preflightPath)) {
    return readJson<{ identity: { head: string } }>(preflightPath).identity.head;
  }
  return git(['rev-parse', 'HEAD']).stdout.trim();
}

function sessionRunId(): string {
  return sessionManifest()?.run_id as string;
}

function phaseNamed(manifest: SessionManifest, name: string) {
  // The LAST record for a phase name is the current state (a resumed session
  // may carry an earlier record for the same phase under the same run-id).
  const records = (manifest.phases ?? []).filter((phase: PhaseRecord) => phase.phase === name);
  return records.length > 0 ? records[records.length - 1] : null;
}

/** Path set + per-file SHA-256 of a directory tree, for immutability proofs. */
function snapshotTree(root: string): Map<string, string> {
  const snapshot = new Map<string, string>();
  if (!existsSync(root)) return snapshot;
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: false })) {
    const path = join(root, String(entry));
    let stat: ReturnType<typeof statSync> | undefined;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isFile()) snapshot.set(path.replace(`${root}/`, ''), sha256File(path));
  }
  return snapshot;
}

function expectTreeUnchanged(
  before: Map<string, string>,
  after: Map<string, string>,
  label: string,
) {
  const changed: string[] = [];
  for (const [path, hash] of before) {
    if (after.get(path) !== hash) changed.push(path);
  }
  for (const path of after.keys()) {
    if (!before.has(path)) changed.push(`${path} (added)`);
  }
  expect(
    changed,
    `${label}: evidence bytes must be unchanged by verifier trials (changed: ${changed.slice(0, 5).join(', ')})`,
  ).toEqual([]);
}

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
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  );
  if (proc.status !== 0) throw new Error(`workflow yaml parse failed: ${proc.stderr}`);
  return JSON.parse(proc.stdout);
}

function collectSecretReads(node: unknown, found: string[] = []): string[] {
  if (typeof node === 'string') {
    if (node.includes('secrets.')) found.push(node);
    return found;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectSecretReads(item, found);
    return found;
  }
  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) collectSecretReads(value, found);
  }
  return found;
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

async function postChat(
  backend: { host: string; port: number },
  id: string,
  text: string,
): Promise<Response> {
  return fetch(`http://${backend.host}:${backend.port}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id,
      messages: [{ id: `${id}-u1`, role: 'user', parts: [{ type: 'text', text }] }],
      trigger: 'submit-message',
    }),
  });
}

const manifest = sessionManifest();
if (manifest !== null) {
  describe('ORI-CI-004 acceptance evidence', () => {
    test(
      'ORI-CI-004-fresh-acceptance',
      () => {
        expect(manifest.run_id).toMatch(/^ORI-CI-004/);
        const preflight = readJson<{
          outcome: string;
          identity: { head: string; declaredCandidate: string; githubSha: string | null };
          reservations: { ios: { udid: string }; android: { serial: string } };
          runner: { expectedLabels: string[] };
          credentials: { receivingRoles: string[] };
        }>(join(evidenceDir, 'runner-preflight.json'));
        expect(preflight.outcome).toBe('ok');
        const candidate = preflight.identity.head as string;
        expect(preflight.identity.declaredCandidate).toBe(candidate);
        expect(
          preflight.identity.githubSha === null || preflight.identity.githubSha === candidate,
        ).toBe(true);
        expect(preflight.reservations.ios.udid).toMatch(/^[0-9A-F-]{30,}$/);
        expect(preflight.reservations.android.serial).toMatch(/\S+/);

        // --- Quickstart matrix (owner schema: leg.status, negative_control) --
        const quickstart = readJson<{
          candidate_head_sha: string;
          completed: boolean;
          legs: LegRecord[];
          negative_control?: {
            restored_equals_original?: boolean;
            baseline_submission_passed?: boolean;
          };
        }>(join(evidenceDir, 'test/preparation/quickstart/run-manifest.json'));
        expect(quickstart.candidate_head_sha).toBe(candidate);
        expect(quickstart.completed).toBe(true);
        const legKeys = new Set(
          (quickstart.legs ?? []).map((leg) => `${leg.engine}-${leg.platform}`),
        );
        for (const engine of ENGINES) {
          for (const platform of PLATFORMS) {
            expect(
              legKeys.has(`${engine}-${platform}`),
              `Quickstart leg ${engine}-${platform}`,
            ).toBe(true);
          }
        }
        for (const leg of quickstart.legs ?? []) {
          expect(leg.status, `Quickstart leg ${leg.engine}-${leg.platform} passed`).toBe('passed');
        }
        expect(quickstart.negative_control?.restored_equals_original).toBe(true);
        expect(quickstart.negative_control?.baseline_submission_passed).toBe(true);
        const inventory = readJson<{
          captures: Array<{ name: string; copyRel: string; sha256: string }>;
        }>(join(evidenceDir, 'test/preparation/quickstart/captures-inventory.json'));
        expect(inventory.captures.length).toBeGreaterThan(0);
        for (const capture of inventory.captures) {
          const local = join(evidenceDir, 'test/preparation/quickstart/captures', capture.copyRel);
          expect(existsSync(local), `capture ${capture.name} present`).toBe(true);
          expect(sha256File(local), `capture ${capture.name} bytes match recorded hash`).toBe(
            capture.sha256,
          );
        }

        // --- Credential scoping ------------------------------------------------
        const prepare = phaseNamed(manifest, 'prepare');
        expect(prepare).not.toBeNull();
        expect(prepare?.outcome).toBe('ok');
        const occurrences = (prepare?.credentialScoping?.prohibitedGroupOccurrences ??
          {}) as Record<string, number>;
        for (const [group, count] of Object.entries(occurrences)) {
          expect(count, `provider secret occurrences in prohibited group '${group}'`).toBe(0);
        }
        const keyReceivers = ((prepare?.commands ?? []) as CommandRecord[])
          .filter((command) => command.receivedOpenAiKey === true)
          .map((command) => command.role);
        // One trusted-launcher command per engine: every receiver is the
        // trusted launcher, and at least one exists (both engines ran).
        expect(keyReceivers.length, 'the trusted launcher(s) received the key').toBeGreaterThan(0);
        expect(
          new Set(keyReceivers),
          'only the trusted launcher role receives the provider key',
        ).toEqual(new Set(['trusted-launcher']));

        // --- Suites ------------------------------------------------------------
        const testPhase = phaseNamed(manifest, 'test');
        const docsPhase = phaseNamed(manifest, 'docs-e2e');
        expect(testPhase).not.toBeNull();
        expect(docsPhase).not.toBeNull();
        const testCommand = (testPhase?.commands ?? []).find((c) => c.command === 'pnpm test');
        const docsCommand = (docsPhase?.commands ?? []).find((c) => c.command === 'pnpm e2e:docs');
        expect(testCommand).toBeDefined();
        expect(docsCommand).toBeDefined();
        expect(docsCommand?.env?.CI).toBe('true');
        expect(docsCommand?.previewOrigin).toBe('http://localhost:4321');

        const junit = readFileSync(join(evidenceDir, 'docs-e2e/junit.xml'), 'utf8');
        const vitestList = readFileSync(join(evidenceDir, 'test/vitest-list.txt'), 'utf8');
        const combined = `${junit}\n${vitestList}`;
        for (const flow of [...TASK_FLOWS, ...JOURNEY_FLOWS, VITEST_FLOW]) {
          expect(
            combined.includes(flow),
            `locked flow ${flow} recorded with actual assertions`,
          ).toBe(true);
        }
        expect(TASK_FLOWS.length).toBe(9);
        expect(JOURNEY_FLOWS.length).toBe(4);
        for (const project of BROWSER_PROJECTS) {
          expect(
            junit.includes(project),
            `browser project ${project} present in the docs suite`,
          ).toBe(true);
        }
        expect(
          (junit.match(/<skipped\b/g) ?? []).length,
          'no runtime skips in the docs suite',
        ).toBe(0);
        const suiteLog = readFileSync(join(evidenceDir, 'test/pnpm-test.log'), 'utf8');
        const skippedSummary = suiteLog.match(/(\d+) skipped/);
        expect(
          skippedSummary === null || Number.parseInt(skippedSummary[1], 10) === 0,
          'no skipped tests in the recorded vitest run',
        ).toBe(true);

        // The recorded exits are the honest receipts; the exit-0 publication
        // demand is enforced by verify-acceptance (see evidence-integrity).
        expect(typeof testCommand?.exit).toBe('number');
        expect(typeof docsCommand?.exit).toBe('number');

        // --- Live-example matrix ----------------------------------------------
        const correlated: string[] = [];
        for (const engine of ENGINES) {
          const live = readJson<LiveManifest>(
            join(evidenceDir, `test/preparation/live-example/${engine}/manifest.json`),
          );
          expect(String(live.run_id).startsWith(`${manifest.run_id}-live`)).toBe(true);
          expect(live.validation?.ok).toBe(true);
          for (const platform of PLATFORMS) {
            const target = live.targets?.[`${engine}-${platform}`];
            expect(target, `live target ${engine}-${platform}`).toBeDefined();
            for (const [name, hash] of Object.entries(target?.artifacts ?? {})) {
              const path = join(
                evidenceDir,
                `test/preparation/live-example/${engine}/${engine}-${platform}/${name}`,
              );
              expect(existsSync(path), `live artifact ${engine}-${platform}/${name} present`).toBe(
                true,
              );
              expect(sha256File(path), `live artifact ${engine}-${platform}/${name} hash`).toBe(
                hash,
              );
            }
            const result = readJson<{
              correlation?: { completed_request_ids?: string[]; response_ids?: string[] };
            }>(
              join(
                evidenceDir,
                `test/preparation/live-example/${engine}/${engine}-${platform}/result.json`,
              ),
            );
            expect(result.correlation?.completed_request_ids?.length ?? 0).toBeGreaterThan(0);
            expect(result.correlation?.response_ids ?? []).toSatisfy(
              (ids: string[]) => ids.length > 0 && ids.every((id) => id.startsWith('resp_')),
            );
            correlated.push(`${engine}-${platform}`);
          }
        }
        expect(correlated).toHaveLength(6);

        // Session identity stamping: every inspected native capture records
        // the candidate SHA (quickstart captures carry run/candidate identity
        // in their manifest binding; live targets carry run_id + device).
        for (const engine of ENGINES) {
          const live = readJson<LiveManifest>(
            join(evidenceDir, `test/preparation/live-example/${engine}/manifest.json`),
          );
          expect(live.repo_head).toBe(candidate);
          expect(String(live.run_id).startsWith(`${manifest.run_id}-live`)).toBe(true);
        }
      },
      5 * 60_000,
    );

    test(
      'ORI-CI-004-protected-execution',
      async () => {
        mkdirSync(scratchRoot, { recursive: true });
        const candidate = sessionCandidate();
        // The tree the refusal trials execute against: evidence commits land
        // after the session, so the recorded candidate can lag the live HEAD
        // these trials must satisfy (each trial exercises ITS OWN refusal —
        // identity trials below use a deliberately wrong SHA).
        const liveHead = git(['rev-parse', 'HEAD']).stdout.trim();

        // --- Workflow configuration (the protected dispatch surface) ---------
        const workflow = parseWorkflowYaml(workflowPath) as {
          jobs: Record<
            string,
            {
              'runs-on'?: string[];
              environment?: string;
              needs?: string[];
              steps?: Array<{ uses?: string }>;
            }
          >;
          permissions?: Record<string, string>;
        };
        expect(workflow.jobs.test['runs-on']).toEqual([
          'self-hosted',
          'macOS',
          'ARM64',
          'rnr-s05-native',
        ]);
        expect(workflow.jobs.test.environment).toBe('sprint-05-real-proof');
        expect(workflow.jobs['docs-e2e']).toBeDefined();
        expect(workflow.jobs['docs-e2e']['runs-on']).toEqual([
          'self-hosted',
          'macOS',
          'ARM64',
          'rnr-s05-native',
        ]);
        expect(workflow.jobs['docs-e2e'].environment).toBe('sprint-05-real-proof');
        expect(workflow.jobs['docs-e2e'].needs).toEqual(['preflight', 'test']);
        expect(workflow.permissions).toEqual({ contents: 'read' });
        const workflowText = readFileSync(workflowPath, 'utf8');
        for (const forbidden of [
          'checks: write',
          'contents: write',
          'id-token: write',
          'secrets: inherit',
        ]) {
          expect(workflowText.includes(forbidden), `workflow must not grant '${forbidden}'`).toBe(
            false,
          );
        }
        // Only the allowlisted provider secret; configuration is nonsecret.
        const secretReads = collectSecretReads(workflow);
        expect(secretReads.every((read) => read.includes('secrets.OPENAI_API_KEY'))).toBe(true);
        // Dispatch identity guard compares the declared candidate, the event
        // SHA, AND the workflow-file revision (github.workflow_sha) — the
        // callee ci.yml call resolves from the caller's own revision, so this
        // three-way equality pins file AND tree.
        const workflowShaNeedle = ['WORKFLOW_REVISION: $', '{{ github.workflow_sha }}'].join('');
        expect(
          workflowText.includes(workflowShaNeedle),
          'dispatch guard binds the workflow-file revision',
        ).toBe(true);
        expect(
          workflow.jobs.preflight.steps?.some((step) => step.uses === './.github/workflows/ci.yml'),
        ).toBe(true);
        // Full-SHA action pins only (no floating third-party tags).
        for (const match of workflowText.matchAll(/uses:\s*(\S+)/g)) {
          const ref = match[1];
          if (ref.startsWith('./')) continue;
          const [action, version] = ref.split('@');
          expect(action, 'action reference carries an owner/repo').toMatch(
            /^[^/]+\/[^/]+\/.*|^[^/]+\/[^/]+$/,
          );
          expect(version, `${action} pinned to a full commit SHA`).toMatch(/^[0-9a-f]{40}$/);
        }

        // --- Recorded preflight of the genuine session ------------------------
        const preflight = readJson<{
          outcome: string;
          identity: { head: string; declaredCandidate: string; githubSha: string | null };
          reservations: { ios: { udid: string }; android: { serial: string } };
          runner: { expectedLabels: string[] };
          credentials: { receivingRoles: string[] };
        }>(join(evidenceDir, 'runner-preflight.json'));
        expect(preflight.identity.head).toBe(candidate);
        expect(preflight.identity.declaredCandidate).toBe(candidate);
        expect(preflight.reservations.ios.udid).toBe(
          process.env.RNR_S05_IOS_UDID ?? preflight.reservations.ios.udid,
        );
        expect(preflight.runner.expectedLabels).toEqual([
          'self-hosted',
          'macOS',
          'ARM64',
          'rnr-s05-native',
        ]);
        expect(preflight.credentials.receivingRoles).toEqual(['trusted-launcher', 'backend']);

        // The prepare phase's credential scoping record: only the trusted
        // launcher and backend roles receive the provider key; every one of
        // the five prohibited groups records 0 occurrences of the secret.
        const preparePhase = phaseNamed(manifest, 'prepare');
        expect(preparePhase, 'credential scoping recorded by the prepare phase').not.toBeNull();
        const prohibitedGroups = preparePhase?.credentialScoping?.prohibitedGroupOccurrences ?? {};
        expect(Object.keys(prohibitedGroups), 'all five prohibited groups are inspected').toEqual([
          'installs',
          'metro',
          'compilers',
          'browsers',
          'client-artifacts',
        ]);
        for (const [group, count] of Object.entries(prohibitedGroups)) {
          expect(count, `prohibited group '${group}' records 0 secret occurrences`).toBe(0);
        }
        const prepareCommands = (preparePhase?.commands ?? []) as CommandRecord[];
        expect(prepareCommands.length).toBeGreaterThan(0);
        for (const command of prepareCommands) {
          if (command.role === 'trusted-launcher') {
            expect(command.receivedOpenAiKey, 'the AI owner launcher receives the key').toBe(true);
          } else {
            expect(command.receivedOpenAiKey, `role '${command.role}' never receives the key`).toBe(
              false,
            );
          }
        }

        // The secret value never appears in any recorded or captured evidence
        // bytes (checked without printing the value).
        const secret = process.env.OPENAI_API_KEY ?? '';
        if (secret.length > 0) {
          let leaked: string | null = null;
          for (const path of snapshotTree(evidenceDir).keys()) {
            const bytes = readFileSync(join(evidenceDir, path));
            if (bytes.includes(Buffer.from(secret, 'utf8'))) {
              leaked = path;
              break;
            }
          }
          expect(leaked, 'provider secret value absent from all evidence bytes').toBeNull();
        }

        // --- REAL refusal: identity mismatch ----------------------------------
        const parentSha = git(['rev-parse', 'HEAD~1']).stdout.trim();
        const mismatchDir = join(scratchRoot, 'refused-identity');
        rmSync(mismatchDir, { recursive: true, force: true });
        const mismatch = runAcceptance([
          '--candidate',
          parentSha,
          '--run-id',
          'ORI-CI-004-refused-identity',
          '--output',
          mismatchDir,
          '--phases',
          'preflight',
          '--label',
          'negative-control',
        ]);
        expect(mismatch.status, 'identity mismatch must exit nonzero').not.toBe(0);
        expect(mismatch.stderr).toContain(liveHead);
        expect(mismatch.stderr).toContain(parentSha);
        const mismatchPreflight = readJson<{ outcome: string; reason: string }>(
          join(mismatchDir, 'runner-preflight.json'),
        );
        expect(mismatchPreflight.outcome).toBe('refused');
        expect(mismatchPreflight.reason).toBe('identity-mismatch');
        expect(existsSync(join(mismatchDir, 'accepted-artifact.json'))).toBe(false);

        // --- REAL refusal: unavailable device ---------------------------------
        const bogusUdid = '00000000-1111-2222-3333-444444444444';
        const deviceDir = join(scratchRoot, 'refused-device');
        rmSync(deviceDir, { recursive: true, force: true });
        const device = runAcceptance([
          '--candidate',
          liveHead,
          '--run-id',
          'ORI-CI-004-refused-device',
          '--output',
          deviceDir,
          '--phases',
          'preflight',
          '--ios-udid',
          bogusUdid,
          '--android-serial',
          process.env.RNR_S05_ANDROID_SERIAL ?? 'emulator-5554',
          '--label',
          'negative-control',
        ]);
        expect(device.status, 'unavailable device must exit nonzero').not.toBe(0);
        expect(device.stderr).toContain(bogusUdid);
        const devicePreflight = readJson<{ outcome: string; reason: string }>(
          join(deviceDir, 'runner-preflight.json'),
        );
        expect(devicePreflight.outcome).toBe('refused');
        expect(devicePreflight.reason).toBe('device-unavailable');
        expect(existsSync(join(deviceDir, 'accepted-artifact.json'))).toBe(false);

        // --- REAL refusal: occupied-unowned localhost:4321 ---------------------
        // The placeholder runs from OUTSIDE the repository tree — a listener
        // whose cwd is inside the repo root is swept as a session orphan, so
        // the foreign-listener refusal needs a genuinely foreign cwd.
        const foreignCwd = mkdtempSync(join(tmpdir(), 'ori-ci-004-foreign-listener-'));
        const placeholder = spawn(
          process.execPath,
          [
            '-e',
            `require('http').createServer((_q,s)=>s.end('ORI-CI-004 occupied')).listen(4321,'127.0.0.1',()=>console.log('READY'))`,
          ],
          { cwd: foreignCwd, stdio: ['ignore', 'pipe', 'pipe'] },
        );
        const placeholderPid = placeholder.pid ?? -1;
        try {
          const ready = new Promise<void>((resolvePromise) => {
            let out = '';
            placeholder.stdout?.on('data', (chunk: Buffer) => {
              out += chunk.toString();
              if (out.includes('READY')) resolvePromise();
            });
            setTimeout(() => resolvePromise(), 5000);
          });
          await ready;
          expect(isProcessAlive(placeholderPid), 'placeholder listener alive').toBe(true);
          const portDir = join(scratchRoot, 'refused-port');
          rmSync(portDir, { recursive: true, force: true });
          const port = runAcceptance([
            '--candidate',
            liveHead,
            '--run-id',
            'ORI-CI-004-refused-port',
            '--output',
            portDir,
            '--phases',
            'preflight',
            '--ios-udid',
            process.env.RNR_S05_IOS_UDID ?? preflight.reservations.ios.udid,
            '--android-serial',
            process.env.RNR_S05_ANDROID_SERIAL ?? preflight.reservations.android.serial,
            '--label',
            'negative-control',
          ]);
          expect(port.status, 'occupied unowned port must exit nonzero').not.toBe(0);
          expect(port.stderr).toContain('4321');
          expect(port.stderr).toContain(String(placeholderPid));
          const portPreflight = readJson<{ outcome: string; reason: string }>(
            join(portDir, 'runner-preflight.json'),
          );
          expect(portPreflight.outcome).toBe('refused');
          expect(portPreflight.reason).toBe('port-occupied');
          expect(existsSync(join(portDir, 'accepted-artifact.json'))).toBe(false);
          // No port shifting: the refusal is terminal, the placeholder untouched.
          expect(isProcessAlive(placeholderPid), 'foreign listener untouched by the refusal').toBe(
            true,
          );
        } finally {
          placeholder.kill('SIGKILL');
        }
      },
      5 * 60_000,
    );

    test(
      'ORI-CI-004-evidence-integrity',
      () => {
        mkdirSync(scratchRoot, { recursive: true });
        const originalSnapshot = snapshotTree(evidenceDir);

        // --- Genuine evidence: local dimensions validate; acceptance fails ---
        // only at the downstream publication gates (suite greenness / hosted
        // metadata), never at identity, matrices, or hashes. The report is
        // directed to scratch so the canonical hosted-run.json (produced by
        // the full terminal verification in terminal-handoff) is not clobbered.
        const genuineReportPath = join(scratchRoot, 'genuine-report.json');
        const genuine = verifyAcceptance(evidenceDir, [
          '--skip-network',
          '--report',
          genuineReportPath,
        ]);
        expect(genuine.status, 'verifier exits nonzero while publication gates are unmet').not.toBe(
          0,
        );
        const genuineReport = readJson<{
          verdict: string;
          failure?: { reason?: string };
          checks: {
            identity?: unknown;
            preparation?: { quickstartLegs: number; correlatedTargets: number } | null;
          } | null;
        }>(genuineReportPath);
        // Two honest shapes, never a third: either the matrices completed and
        // the report carries their full preparation record before failing a
        // downstream gate, or the owner-routed live-example blocker failed the
        // prepare phase itself (the verifier stops at the first failed gate,
        // so preparation is null — the failure reason proves which gate). A
        // passing/absent failure here would mean the verifier accepted
        // incomplete evidence, which is the one thing this gate exists to
        // make impossible.
        if (genuineReport.failure?.reason === 'prepare-phase-failed') {
          expect(genuineReport.checks?.preparation).toBeNull();
        } else {
          expect(genuineReport.checks?.preparation).toEqual({
            quickstartLegs: 6,
            correlatedTargets: 6,
          });
        }
        expect(genuineReport.checks?.identity).not.toBeNull();
        expect(
          [
            'prepare-phase-failed',
            'test-suite-failed',
            'docs-e2e-suite-failed',
            'hosted-acceptance-absent',
            'hosted-acceptance-unverified',
            'in-run-validation',
            'public-registry-mismatch',
            'candidate-bytes-changed',
            'missing-evidence-file',
            'live-validation-failed',
            'live-target-missing',
            'live-run-id-mismatch',
            'live-provider-correlation-missing',
            'live-provider-correlation-invalid',
          ],
          `genuine failure is a real downstream or owner-blocked gate, got '${genuineReport.failure?.reason}'`,
        ).toContain(genuineReport.failure?.reason);
        expect(genuineReport.verdict === 'rejected' || genuineReport.verdict === 'blocked').toBe(
          true,
        );

        // --- Corruption trials: isolated copies, each must fail ----------------
        const trialsRoot = join(scratchRoot, 'rejected-evidence');
        rmSync(trialsRoot, { recursive: true, force: true });
        mkdirSync(trialsRoot, { recursive: true });

        function freshCopy(name: string): string {
          const dir = join(trialsRoot, name);
          cpSync(evidenceDir, dir, { recursive: true });
          // The genuine hosted-run.json is a verifier product, not session
          // evidence; copies start from the session state.
          rmSync(join(dir, 'hosted-run.json'), { force: true });
          return dir;
        }

        function runTrial(dir: string, extraArgs: string[] = []) {
          return verifyAcceptance(dir, ['--skip-network', ...extraArgs]);
        }

        // Trial 1: one Android result removed.
        const missingAndroid = freshCopy('missing-android-result');
        rmSync(
          join(missingAndroid, 'test/preparation/live-example/uniwind/uniwind-android/result.json'),
        );
        const trial1 = runTrial(missingAndroid);
        expect(trial1.status).not.toBe(0);

        // Trial 2: one source hash altered.
        const alteredSource = freshCopy('altered-source-hash');
        const alteredManifest = readJson<{ source_digests: Record<string, string> }>(
          join(alteredSource, 'manifest.json'),
        );
        alteredManifest.source_digests['pnpm-lock.yaml'] = alteredManifest.source_digests[
          'pnpm-lock.yaml'
        ]
          .split('')
          .reverse()
          .join('');
        writeFileSync(
          join(alteredSource, 'manifest.json'),
          `${JSON.stringify(alteredManifest, null, 1)}\n`,
        );
        const trial2 = runTrial(alteredSource);
        expect(trial2.status).not.toBe(0);
        expect(trial2.stderr).toContain('source-hash-mismatch');

        // Trial 3: an earlier (different) run manifest substituted.
        const earlierRun = freshCopy('earlier-run-manifest');
        const earlierManifest = readJson<{ run_id: string }>(join(earlierRun, 'manifest.json'));
        earlierManifest.run_id = 'ORI-CI-004-earlier-session-0000';
        writeFileSync(
          join(earlierRun, 'manifest.json'),
          `${JSON.stringify(earlierManifest, null, 1)}\n`,
        );
        const trial3 = runTrial(earlierRun);
        expect(trial3.status).not.toBe(0);
        expect(trial3.stderr).toContain('run-id-mismatch');

        // Trial 4: provider response correlation omitted.
        const noCorrelation = freshCopy('missing-provider-correlation');
        const noCorrelationResult = readJson<{
          correlation?: { completed_request_ids?: string[]; response_ids?: string[] };
        }>(
          join(
            noCorrelation,
            'test/preparation/live-example/nativewind/nativewind-ios/result.json',
          ),
        );
        noCorrelationResult.correlation = { completed_request_ids: [], response_ids: [] };
        writeFileSync(
          join(
            noCorrelation,
            'test/preparation/live-example/nativewind/nativewind-ios/result.json',
          ),
          `${JSON.stringify(noCorrelationResult, null, 1)}\n`,
        );
        const trial4 = runTrial(noCorrelation);
        expect(trial4.status).not.toBe(0);

        // Additional variants: truncated references, absent engine evidence,
        // absent Web evidence, absent flow identity, changed dist artifact.
        const truncated = freshCopy('truncated-junit');
        writeFileSync(join(truncated, 'docs-e2e/junit.xml'), '<testsuites><testsuite na');
        const trial5 = runTrial(truncated);
        expect(trial5.status).not.toBe(0);

        const absentEngine = freshCopy('absent-engine');
        rmSync(join(absentEngine, 'test/preparation/live-example/uniwind'), { recursive: true });
        const trial6 = runTrial(absentEngine);
        expect(trial6.status).not.toBe(0);

        const absentWeb = freshCopy('absent-web-capture');
        // Native legs carry screenshot captures (web legs hold inline
        // evidence); removing an Android capture breaks the hash reference.
        const androidCaptureDir = join(
          absentWeb,
          'test/preparation/quickstart/captures/nativewind',
        );
        if (existsSync(androidCaptureDir)) {
          rmSync(androidCaptureDir, { recursive: true, force: true });
        }
        const trial7 = runTrial(absentWeb);
        expect(trial7.status).not.toBe(0);

        const absentFlow = freshCopy('absent-flow');
        const flowList = readFileSync(join(absentFlow, 'test/vitest-list.txt'), 'utf8').replace(
          VITEST_FLOW,
          'REMOVED',
        );
        writeFileSync(join(absentFlow, 'test/vitest-list.txt'), flowList);
        const flowJunit = readFileSync(join(absentFlow, 'docs-e2e/junit.xml'), 'utf8')
          .split(JOURNEY_FLOWS[0])
          .join('FLOW-REMOVED');
        writeFileSync(join(absentFlow, 'docs-e2e/junit.xml'), flowJunit);
        const trial8 = runTrial(absentFlow);
        expect(trial8.status).not.toBe(0);

        // Changed artifact: an earlier real dist record, doctored against the
        // current bytes, must fail the mutation guard. The first pass records
        // the real dist manifest; the doctoring then breaks exactly one pair.
        const changedArtifact = freshCopy('changed-artifact');
        const firstPass = runTrial(changedArtifact);
        expect(firstPass.status).not.toBe(0); // still fails at the downstream gates
        const doctored = readJson<{ distFiles?: Record<string, string> }>(
          join(changedArtifact, 'hosted-run.json'),
        );
        expect(Object.keys(doctored.distFiles ?? {}).length).toBeGreaterThan(0);
        const firstDistPath = Object.keys(doctored.distFiles ?? {})[0];
        doctored.distFiles = {
          ...(doctored.distFiles ?? {}),
          [firstDistPath]: `${'0'.repeat(64)}`,
        };
        writeFileSync(
          join(changedArtifact, 'hosted-run.json'),
          `${JSON.stringify(doctored, null, 1)}\n`,
        );
        const trial9 = runTrial(changedArtifact);
        expect(trial9.status).not.toBe(0);

        // A pre-existing accepted-artifact.json cannot survive a failed
        // verification.
        const staleArtifact = freshCopy('stale-artifact');
        writeFileSync(
          join(staleArtifact, 'accepted-artifact.json'),
          `${JSON.stringify({ schema: 'ORI-CI-004-accepted-artifact/1', candidate_sha: sessionCandidate() }, null, 1)}\n`,
        );
        const trial10 = runTrial(staleArtifact);
        expect(trial10.status).not.toBe(0);
        expect(
          existsSync(join(staleArtifact, 'accepted-artifact.json')),
          'failed verification removes the stale artifact',
        ).toBe(false);

        // Mismatched GitHub identity: a run id that does not exist must be
        // rejected through the real API path.
        const badRun = freshCopy('bad-github-run');
        const trial11 = verifyAcceptance(badRun, [
          '--skip-registry-comparison',
          '--github-run-id',
          '1',
        ]);
        expect(trial11.status).not.toBe(0);

        // --- Originals unchanged by every trial --------------------------------
        expectTreeUnchanged(originalSnapshot, snapshotTree(evidenceDir), 'genuine evidence dir');

        // --- Source and generated-artifact immutability across the suite ------
        const sourceFiles = git(['ls-files']).stdout.trim().split('\n').filter(Boolean);
        expect(sourceFiles.length).toBeGreaterThan(0);
        const sourceBefore = new Map<string, string | null>();
        for (const file of sourceFiles.slice(0, 200)) {
          sourceBefore.set(
            file,
            existsSync(join(repoRoot, file)) ? sha256File(join(repoRoot, file)) : null,
          );
        }
        const generatedRoots = [join(repoRoot, 'apps/docs/dist'), join(repoRoot, 'public/r')];
        const generatedBefore = generatedRoots.map((root) => snapshotTree(root));
        // A real verifier pass over the genuine evidence exercises the full
        // local chain once more (same commands as the trials above).
        const genuineAgain = verifyAcceptance(evidenceDir, [
          '--skip-network',
          '--report',
          genuineReportPath,
        ]);
        expect(genuineAgain.status).not.toBe(0);
        for (const [file, hash] of sourceBefore) {
          if (hash === null) continue;
          expect(
            sha256File(join(repoRoot, file)),
            `source file ${file} unchanged by the verifier suite`,
          ).toBe(hash);
        }
        generatedRoots.forEach((root, index) => {
          expectTreeUnchanged(generatedBefore[index], snapshotTree(root), `generated tree ${root}`);
        });
      },
      10 * 60_000,
    );

    test(
      'ORI-CI-004-terminal-handoff',
      async () => {
        mkdirSync(scratchRoot, { recursive: true });
        const secret = process.env.OPENAI_API_KEY ?? '';
        expect(
          secret.length,
          'the real provider credential is required for the recovery paths',
        ).toBeGreaterThan(0);
        const portBase = 4310;
        // Every launched backend is stopped on every exit path — a crashed
        // trial must never leak an owned listener for the next run.
        const ownedBackends: Array<{ stop(): Promise<void> }> = [];
        onTestFinished(async () => {
          for (const backend of ownedBackends) {
            await backend.stop().catch(() => undefined);
          }
        });

        // --- Missing credential: startup fails closed --------------------------
        const missingKey = await launchOwnedBackend({
          port: portBase + 1,
          extraEnv: { OPENAI_API_KEY: '' },
        });
        ownedBackends.push(missingKey);
        expect(missingKey.started).toBe(false);
        expect(missingKey.exitCode).not.toBe(0);
        expect((missingKey.stderrText() + missingKey.stdoutText()).includes(secret)).toBe(false);

        // --- Unreachable backend then recovery ---------------------------------
        let backend = await launchOwnedBackend({ port: portBase + 2 });
        ownedBackends.push(backend);
        expect(backend.started).toBe(true);
        // Sanity control: the owned backend really serves before we stop it.
        const control = await postChat(
          backend,
          'ori-ci-004-control',
          'Reply with the single word OK.',
        );
        expect(control.status).toBe(200);
        const controlRecord = await backend.waitForRecord('ori-ci-004-control', 30_000);
        expect(controlRecord?.outcome).toBe('completed');
        await backend.stop();
        let unreachable: unknown;
        try {
          await postChat(backend, 'ori-ci-004-after-stop', 'Reply OK');
        } catch (error) {
          unreachable = error;
        }
        expect(unreachable).toBeInstanceOf(Error);
        expect(String(unreachable)).toMatch(/ECONNREFUSED|fetch failed/i);
        // Recovery: restart the owned backend and complete a real request.
        backend = await backend.restart({});
        ownedBackends.push(backend);
        expect(backend.started).toBe(true);
        const recovered = await postChat(
          backend,
          'ori-ci-004-recovered',
          'Reply with the single word RECOVERED.',
        );
        expect(recovered.status).toBe(200);
        const recoveredRecord = await backend.waitForRecord('ori-ci-004-recovered', 30_000);
        expect(recoveredRecord?.outcome).toBe('completed');
        expect(recoveredRecord?.responseId?.startsWith('resp_')).toBe(true);

        // --- Rejected model then recovery ---------------------------------------
        backend = await backend.selectModel('gpt-4.1-nonexistent-model-0000');
        ownedBackends.push(backend);
        await postChat(backend, 'ori-ci-004-bad-model', 'Hello');
        const badRecord = await backend.waitForRecord('ori-ci-004-bad-model', 30_000);
        expect(badRecord?.outcome).toBe('error');
        expect(badRecord?.errorText ?? '').not.toContain(secret);
        backend = await backend.selectModel(DEFAULT_MODEL);
        ownedBackends.push(backend);
        await postChat(
          backend,
          'ori-ci-004-model-restored',
          'Reply with the single word RESTORED.',
        );
        const restoredRecord = await backend.waitForRecord('ori-ci-004-model-restored', 30_000);
        expect(restoredRecord?.outcome).toBe('completed');
        expect(restoredRecord?.responseId?.startsWith('resp_')).toBe(true);
        const sanitized = JSON.stringify([
          backend.records(),
          backend.stderrText(),
          backend.stdoutText(),
        ]);
        expect(
          sanitized.includes(secret),
          'no provider secret in any recorded backend evidence',
        ).toBe(false);
        await backend.stop();

        // --- Cancelled session: teardown terminates owned children -------------
        // The cancelled session must get PAST identity to really start its
        // prepare phase, so it runs against the live HEAD (the recorded
        // candidate lags post-session evidence commits).
        const cancelDir = join(scratchRoot, 'cancelled-session');
        rmSync(cancelDir, { recursive: true, force: true });
        const cancelledChild = spawn(
          'node',
          [
            runnerPath,
            '--candidate',
            git(['rev-parse', 'HEAD']).stdout.trim(),
            '--run-id',
            'ORI-CI-004-cancelled',
            '--output',
            cancelDir,
            '--phases',
            'preflight,prepare',
            '--label',
            'negative-control',
          ],
          { cwd: repoRoot, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
        );
        cancelledChild.stderr?.on('data', () => {
          /* diagnostics only; the teardown record is the evidence */
        });
        // Wait until the prepare phase has really started (its log file
        // appears), then cancel — a mid-phase cancellation, not a startup race.
        const prepareLog = join(cancelDir, 'test/preparation/quickstart/pnpm-exec-quickstart.log');
        const deadline = Date.now() + 240_000;
        while (Date.now() < deadline && !existsSync(prepareLog)) {
          await new Promise((r) => setTimeout(r, 1000));
        }
        expect(existsSync(prepareLog), 'prepare phase really started before cancellation').toBe(
          true,
        );
        cancelledChild.kill('SIGINT');
        const cancelExit = await new Promise<number | null>((resolvePromise) => {
          const timer = setTimeout(() => resolvePromise(null), 120_000);
          cancelledChild.on('exit', (code) => {
            clearTimeout(timer);
            resolvePromise(code);
          });
        });
        expect(cancelExit, 'cancelled session exits 130 after teardown').toBe(130);
        const cancelTeardown = readJson<{
          trigger: string;
          cancelled: boolean;
          terminatedOwnedPids: number[];
          residualOwnedLivePids: number;
          residualOwnedListeners: number;
        }>(join(cancelDir, 'teardown.json'));
        expect(cancelTeardown.trigger).toBe('signal:SIGINT');
        expect(cancelTeardown.cancelled).toBe(true);
        expect(
          cancelTeardown.terminatedOwnedPids.length,
          'teardown terminated at least one owned child',
        ).toBeGreaterThan(0);
        expect(cancelTeardown.residualOwnedLivePids).toBe(0);
        expect(cancelTeardown.residualOwnedListeners).toBe(0);
        const cancelledManifestPath = join(cancelDir, 'manifest.json');
        const cancelledManifest = readJson<{ completed?: boolean }>(cancelledManifestPath);
        expect(cancelledManifest.completed).toBeUndefined();
        expect(existsSync(join(cancelDir, 'accepted-artifact.json'))).toBe(false);

        // --- Hosted boundary: fail closed without a real hosted run ------------
        // The terminal verification (real network, no skips) produces the
        // canonical hosted-run.json — the same invocation the orchestrator
        // runs after the session.
        const terminal = verifyAcceptance(evidenceDir, [], { timeoutMs: 300_000 });
        expect(terminal.status, 'terminal verification is nonzero without hosted success').not.toBe(
          0,
        );
        const hosted = readJson<{
          status?: string;
          reason?: string;
          hosted?: { status?: string; reason?: string };
          hostedStatus?: { status?: string; reason?: string };
        }>(join(evidenceDir, 'hosted-run.json'));
        expect(
          ['blocked', 'verified'],
          'hosted-run.json carries a real hosted observation',
        ).toContain(hosted.hosted?.status ?? hosted.status ?? hosted.hostedStatus?.status);
        const hostedStatus = hosted.hosted?.status ?? hosted.status ?? hosted.hostedStatus?.status;
        if (hostedStatus === 'blocked') {
          // The blocked record must be a REAL observation, not an assumption.
          expect(
            (hosted.hosted?.reason ?? hosted.reason ?? hosted.hostedStatus?.reason ?? '').includes(
              'No hosted GitHub Actions run exists',
            ),
            'the blocked reason names the real observation',
          ).toBe(true);
        }
        expect(
          existsSync(join(evidenceDir, 'accepted-artifact.json')),
          'no accepted artifact without hosted terminal success',
        ).toBe(false);

        // --- Genuine session teardown: owned resources released ----------------
        const teardown = readJson<{
          residualOwnedLivePids: number;
          residualOwnedListeners: number;
          trigger: string;
          deviceAppearance?: {
            preRun?: string | null;
            postRun?: string | null;
            restoredTo?: string | null;
          };
        }>(join(evidenceDir, 'teardown.json'));
        expect(teardown.residualOwnedLivePids).toBe(0);
        expect(teardown.residualOwnedListeners).toBe(0);
        expect(teardown.trigger).toBe('completion');
        if (teardown.deviceAppearance?.preRun) {
          expect(
            [teardown.deviceAppearance.postRun, teardown.deviceAppearance.restoredTo],
            'device appearance preserved or restored',
          ).toContain(teardown.deviceAppearance.preRun);
        }
      },
      15 * 60_000,
    );
  });
}
