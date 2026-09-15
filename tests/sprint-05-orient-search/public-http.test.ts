/**
 * ORI-DEP-001 — task-owned executable integration assertions.
 *
 * Run via `pnpm exec tsx` (NOT vitest): the task's own VERIFY commands drive this
 * file as a plain script, and it exits nonzero on any failed assertion.
 *
 * Phases (mutually exclusive; `bootstrap` can never select `completed-site`):
 *
 *   --phase bootstrap --check preparation --source <sha> --evidence <dir>
 *     Asserts the frozen preparation is real: build.json binds the release SHA to
 *     the accepted base and the reviewed ORI-RN-000 correction, records the actual
 *     ordered commands with exit code 0, and asset-manifest.json covers every dist
 *     asset with SHA-256 (including both conversation files). Then exercises the
 *     three refusal paths — source mismatch, changed byte, missing file — through
 *     the real scripts/docs-deploy/prepare.ts entrypoint against owned disposable
 *     copies, and merges the observations into build.json. Performs NO Cloudflare
 *     mutation.
 *
 *   --phase bootstrap --origin <url> --receipt <release.json>
 *     Post-deploy: fetches both literal conversation endpoints and the existing
 *     /components page through ordinary public HTTPS (no hostname rewrite, no
 *     certificate bypass), asserts schema/engine/byte identity against the release
 *     receipt, and writes public-http.json.
 *
 *   --phase completed-site --origin <url> --receipt <release.json>
 *     Owned by a later task (ORI-DEP-003). Present only so the phase namespace is
 *     explicit and can never be selected accidentally by the bootstrap set; it does
 *     NOT certify orientation, search, custom 404, Quickstart, or native/provider
 *     acceptance, and exits nonzero if invoked.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PREPARE_SCRIPT = join(REPO_ROOT, 'scripts', 'docs-deploy', 'prepare.ts');
const BASE_COMMIT = '38034e972490945b684f5bd5a706bca0479dc659';
const CORRECTION_COMMIT = '6a33565b42129bcba253864ea5e380283fc33f58';
const CONVERSATION = ['r/nativewind/conversation.json', 'r/uniwind/conversation.json'] as const;

interface Probe {
  name: string;
  command: string;
  exit_code: number;
  expected_nonzero: boolean;
  observed: string;
  passes: boolean;
}

let failures = 0;

function check(cond: boolean, message: string): void {
  if (cond) {
    console.log(`  PASS  ${message}`);
  } else {
    failures++;
    console.error(`  FAIL  ${message}`);
  }
}

function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function runPrepare(args: string[]): { exit: number; stdout: string; stderr: string } {
  const cmd = `pnpm exec tsx ${PREPARE_SCRIPT} ${args.join(' ')}`;
  const result = spawnSync(cmd, { shell: true, cwd: REPO_ROOT, encoding: 'utf8' });
  return {
    exit: result.status ?? -1,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
  };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** Copy dist + evidence into an owned disposable dir under .tmp/ORI-DEP-001. */
function disposableCopy(name: string, evidenceDir: string): { dist: string; evidence: string } {
  const base = join(REPO_ROOT, '.tmp', 'ORI-DEP-001', 'cycle-1', 'probes', name);
  rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  const dist = join(base, 'dist');
  const evidence = join(base, 'evidence');
  cpSync(join(REPO_ROOT, 'apps', 'docs', 'dist'), dist, { recursive: true });
  cpSync(evidenceDir, evidence, { recursive: true });
  return { dist, evidence };
}

function saveProbeOutput(name: string, out: { stdout: string; stderr: string }): void {
  const dir = join(REPO_ROOT, '.tmp', 'ORI-DEP-001', 'cycle-1', 'probes');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.stdout.txt`), out.stdout || '(empty)\n');
  writeFileSync(join(dir, `${name}.stderr.txt`), out.stderr || '(empty)\n');
}

// fallow-ignore-next-line complexity
function phaseBootstrapPreparation(source: string, evidenceDir: string): void {
  const buildPath = join(evidenceDir, 'build.json');
  const manifestPath = join(evidenceDir, 'asset-manifest.json');
  check(existsSync(buildPath), `build.json exists at ${buildPath}`);
  check(existsSync(manifestPath), `asset-manifest.json exists at ${manifestPath}`);
  if (!existsSync(buildPath) || !existsSync(manifestPath)) {
    console.error('[bootstrap] frozen evidence missing — run prepare.ts (fresh) first');
    process.exit(1);
  }

  const build = readJson<{
    release_sha: string;
    base_commit: string;
    correction_commit: string;
    commands?: { label: string; command: string; exit_code: number }[];
    refusal_probes?: Probe[];
  }>(buildPath);
  const manifest = readJson<{
    release_sha?: string;
    assets: Record<string, string>;
    lockfile_sha256?: string;
    config_sha256?: string;
    conversation_assets?: Record<string, string>;
  }>(manifestPath);

  // AC-2: source identity binding.
  check(build.release_sha === source, `build.json release_sha equals --source (${source})`);
  check(build.base_commit === BASE_COMMIT, `build.json binds base_commit ${BASE_COMMIT}`);
  check(
    build.correction_commit === CORRECTION_COMMIT,
    `build.json binds reviewed ORI-RN-000 correction ${CORRECTION_COMMIT}`,
  );

  // AC-2: ordered commands, exit 0.
  const commands = build.commands ?? [];
  check(commands.length > 0, 'build.json records a non-empty command list');
  const labels = commands.map((c) => c.label);
  const expectedOrder = ['registry:build', 'gallery:manifest', 'prebuild', 'astro build'];
  const idx = expectedOrder.map((l) => labels.indexOf(l));
  check(
    idx.every((i) => i >= 0) && idx.every((v, i, a) => i === 0 || a[i - 1] < v),
    `ordered build present and in order: ${expectedOrder.join(' -> ')}`,
  );
  const failed = commands.filter((c) => c.exit_code !== 0);
  check(failed.length === 0, 'every recorded command exited 0');

  // AC-3: manifest coverage.
  const assetKeys = Object.keys(manifest.assets ?? {});
  check(assetKeys.length > 0, 'asset-manifest.json has a non-empty asset inventory');
  const missingConv = CONVERSATION.filter((c) => !(c in (manifest.assets ?? {})));
  check(missingConv.length === 0, 'manifest includes both conversation files');
  check(
    typeof manifest.lockfile_sha256 === 'string' && manifest.lockfile_sha256.length === 64,
    'manifest records lockfile SHA-256',
  );
  check(
    typeof manifest.config_sha256 === 'string' && manifest.config_sha256.length === 64,
    'manifest records wrangler.jsonc SHA-256',
  );
  check(manifest.release_sha === source, 'manifest and build.json identify the same release SHA');

  // AC-3 case 1: re-verify the frozen build through the real entrypoint.
  const reverify = runPrepare([
    '--phase',
    'bootstrap',
    '--source',
    source,
    '--evidence',
    evidenceDir,
  ]);
  check(reverify.exit === 0, `re-verify of frozen build exits 0 (got ${reverify.exit})`);
  if (reverify.exit !== 0) {
    console.error(`  re-verify stderr:\n${reverify.stderr}`);
  }

  // Refusal probe 1 — source mismatch (AC-2 case 2).
  const sourceMismatch = runPrepare([
    '--phase',
    'bootstrap',
    '--source',
    BASE_COMMIT,
    '--evidence',
    evidenceDir,
  ]);
  saveProbeOutput('source-mismatch', {
    stdout: sourceMismatch.stdout,
    stderr: sourceMismatch.stderr,
  });
  const smObserved = `${sourceMismatch.stdout}\n${sourceMismatch.stderr}`;
  check(
    sourceMismatch.exit !== 0 && /source mismatch/.test(smObserved),
    `source-mismatch probe: nonzero exit + 'source mismatch' (exit ${sourceMismatch.exit})`,
  );

  // Refusal probe 2 — changed byte (AC-3 case 2).
  const changed = disposableCopy('changed-byte', evidenceDir);
  const changedFile = join(changed.dist, 'r', 'nativewind', 'conversation.json');
  const original = readFileSync(changedFile, 'utf8');
  const flipped =
    original.length > 0
      ? `${String.fromCharCode(original.charCodeAt(0) ^ 1)}${original.slice(1)}`
      : original;
  writeFileSync(changedFile, flipped);
  const changedByte = runPrepare([
    '--phase',
    'bootstrap',
    '--source',
    source,
    '--evidence',
    changed.evidence,
    '--dist',
    changed.dist,
  ]);
  saveProbeOutput('changed-byte', { stdout: changedByte.stdout, stderr: changedByte.stderr });
  const cbObserved = `${changedByte.stdout}\n${changedByte.stderr}`;
  check(
    changedByte.exit !== 0 &&
      /asset hash mismatch/.test(cbObserved) &&
      /r\/nativewind\/conversation\.json/.test(cbObserved),
    `changed-byte probe: nonzero exit + 'asset hash mismatch' naming conversation.json (exit ${changedByte.exit})`,
  );

  // Refusal probe 3 — missing file (AC-3 case 2).
  const missing = disposableCopy('missing-file', evidenceDir);
  rmSync(join(missing.dist, 'r', 'nativewind', 'conversation.json'), { force: true });
  const missingFile = runPrepare([
    '--phase',
    'bootstrap',
    '--source',
    source,
    '--evidence',
    missing.evidence,
    '--dist',
    missing.dist,
  ]);
  saveProbeOutput('missing-file', { stdout: missingFile.stdout, stderr: missingFile.stderr });
  const mfObserved = `${missingFile.stdout}\n${missingFile.stderr}`;
  check(
    missingFile.exit !== 0 &&
      /missing asset/.test(mfObserved) &&
      /r\/nativewind\/conversation\.json/.test(mfObserved),
    `missing-file probe: nonzero exit + 'missing asset' naming conversation.json (exit ${missingFile.exit})`,
  );

  // Merge refusal observations into build.json (never re-baseline the manifest).
  const probes: Probe[] = [
    {
      name: 'source_mismatch',
      command: `prepare.ts --source ${BASE_COMMIT}`,
      exit_code: sourceMismatch.exit,
      expected_nonzero: true,
      observed: smObserved.slice(-400),
      passes: sourceMismatch.exit !== 0 && /source mismatch/.test(smObserved),
    },
    {
      name: 'changed_byte',
      command:
        'prepare.ts --dist <disposable> after one-byte flip of r/nativewind/conversation.json',
      exit_code: changedByte.exit,
      expected_nonzero: true,
      observed: cbObserved.slice(-400),
      passes:
        changedByte.exit !== 0 &&
        /asset hash mismatch/.test(cbObserved) &&
        /r\/nativewind\/conversation\.json/.test(cbObserved),
    },
    {
      name: 'missing_file',
      command: 'prepare.ts --dist <disposable> after removal of r/nativewind/conversation.json',
      exit_code: missingFile.exit,
      expected_nonzero: true,
      observed: mfObserved.slice(-400),
      passes:
        missingFile.exit !== 0 &&
        /missing asset/.test(mfObserved) &&
        /r\/nativewind\/conversation\.json/.test(mfObserved),
    },
  ];
  build.refusal_probes = probes;
  writeJson(buildPath, build);
  console.log('[bootstrap] refusal observations merged into build.json');

  if (failures > 0) {
    console.error(`[bootstrap] preparation assertions: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log('[bootstrap] preparation assertions passed');
}

// fallow-ignore-next-line complexity
async function phaseBootstrapPublic(origin: string, receiptPath: string): Promise<void> {
  check(existsSync(receiptPath), `release receipt exists at ${receiptPath}`);
  if (!existsSync(receiptPath)) process.exit(1);
  const receipt = readJson<{
    release_sha?: string;
    worker_name?: string;
    domain?: string;
    initial_version_id?: string;
    deployment_id?: string;
    conversation_assets?: Record<string, string>;
  }>(receiptPath);
  const expected = receipt.conversation_assets ?? {};
  check(
    CONVERSATION.every((c) => typeof expected[c] === 'string'),
    'receipt carries expected hashes for both conversation endpoints',
  );

  const observations: Record<string, unknown> = {};

  const results = await fetchAllConversation(origin, expected, observations);
  for (const r of results) check(r.pass, r.message);

  const components = await fetchJsonPage(`${origin.replace(/\/$/, '')}/components`, observations);
  check(components.pass, components.message);

  // AC-4: receipt identities are non-empty and credible.
  check(
    typeof receipt.initial_version_id === 'string' && receipt.initial_version_id.length > 0,
    'receipt records a non-empty initial_version_id',
  );
  check(
    typeof receipt.deployment_id === 'string' && receipt.deployment_id.length > 0,
    'receipt records a non-empty deployment_id',
  );
  check(
    receipt.worker_name === 'rnr-ai-elements-docs',
    'receipt names worker rnr-ai-elements-docs',
  );
  check(receipt.domain === 'rnraielements.com', 'receipt names apex rnraielements.com');

  const outPath = join(dirname(receiptPath), 'public-http.json');
  writeJson(outPath, {
    task: 'ORI-DEP-001',
    phase: 'bootstrap',
    origin,
    generated_at: new Date().toISOString(),
    release_sha: receipt.release_sha ?? null,
    worker_name: receipt.worker_name ?? null,
    domain: receipt.domain ?? null,
    initial_version_id: receipt.initial_version_id ?? null,
    deployment_id: receipt.deployment_id ?? null,
    observations,
  });
  console.log(`[bootstrap] public-http observations written to ${outPath}`);

  if (failures > 0) {
    console.error(`[bootstrap] public assertions: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log('[bootstrap] public assertions passed');
}

// fallow-ignore-next-line complexity
async function fetchAllConversation(
  origin: string,
  expected: Record<string, string>,
  observations: Record<string, unknown>,
): Promise<{ pass: boolean; message: string }[]> {
  const out: { pass: boolean; message: string }[] = [];
  for (const rel of CONVERSATION) {
    const engine = rel.split('/')[1];
    const url = `${origin.replace(/\/$/, '')}/${rel}`;
    let pass = false;
    let message = `${url}: `;
    try {
      const resp = await fetch(url);
      const body = await resp.arrayBuffer();
      const bytes = Buffer.from(body);
      const text = bytes.toString('utf8');
      observations[rel] = {
        status: resp.status,
        content_type: resp.headers.get('content-type'),
        sha256: sha256(bytes),
      };
      if (resp.status !== 200) {
        message += `HTTP ${resp.status}`;
      } else if (!(resp.headers.get('content-type') ?? '').includes('application/json')) {
        message += `non-JSON content-type ${resp.headers.get('content-type')}`;
      } else {
        const parsed = JSON.parse(text) as {
          name?: string;
          files?: { content?: string }[];
          registryDependencies?: string[];
        };
        const hash = sha256(bytes);
        const engineOk =
          engine === 'nativewind'
            ? !JSON.stringify(parsed.registryDependencies ?? []).includes('/uniwind/')
            : !JSON.stringify(parsed.registryDependencies ?? []).includes('/nativewind/');
        const absHttps = (parsed.registryDependencies ?? []).every((d) => /^https:\/\//.test(d));
        const nonEmptyFiles =
          (parsed.files ?? []).length > 0 && (parsed.files?.[0]?.content ?? '').length > 0;
        const hashOk = expected[rel] !== undefined && hash === expected[rel];
        pass = parsed.name === 'conversation' && nonEmptyFiles && engineOk && absHttps && hashOk;
        message += `name=${parsed.name} files=${(parsed.files ?? []).length} engineOk=${engineOk} absHttps=${absHttps} hashOk=${hashOk}`;
      }
    } catch (err) {
      message += `fetch/parse error: ${err instanceof Error ? err.message : String(err)}`;
    }
    out.push({ pass, message });
  }
  return out;
}

async function fetchJsonPage(
  url: string,
  observations: Record<string, unknown>,
): Promise<{ pass: boolean; message: string }> {
  try {
    const resp = await fetch(url);
    const text = await resp.text();
    observations['/components'] = {
      status: resp.status,
      content_type: resp.headers.get('content-type'),
      bytes: text.length,
    };
    const pass =
      resp.status === 200 &&
      text.length > 0 &&
      (resp.headers.get('content-type') ?? '').includes('text/html');
    return {
      pass,
      message: `${url}: status=${resp.status} content_type=${resp.headers.get('content-type')} bytes=${text.length}`,
    };
  } catch (err) {
    return {
      pass: false,
      message: `${url}: fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function phaseCompletedSite(_origin: string, _receiptPath: string): never {
  console.error(
    '[completed-site] this phase is owned by ORI-DEP-003 and is not implemented by ORI-DEP-001; ' +
      'it must never be selected by the bootstrap set. Exiting nonzero.',
  );
  process.exit(2);
}

// fallow-ignore-next-line complexity
async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const phase = argv[argv.indexOf('--phase') + 1] ?? '';
  const check = argv.includes('--check') && argv[argv.indexOf('--check') + 1] === 'preparation';
  const source = argv[argv.indexOf('--source') + 1] ?? '';
  const evidence = argv[argv.indexOf('--evidence') + 1] ?? '';
  const origin = argv[argv.indexOf('--origin') + 1] ?? '';
  const receipt = argv[argv.indexOf('--receipt') + 1] ?? '';

  if (phase === 'bootstrap' && check) {
    if (!source || !evidence) {
      console.error('--check preparation requires --source and --evidence');
      process.exit(2);
    }
    phaseBootstrapPreparation(source, evidence);
    return;
  }
  if (phase === 'bootstrap') {
    if (!origin || !receipt) {
      console.error('--phase bootstrap --origin requires --origin and --receipt');
      process.exit(2);
    }
    await phaseBootstrapPublic(origin, receipt);
    return;
  }
  if (phase === 'completed-site') {
    phaseCompletedSite(origin, receipt);
    return;
  }
  console.error(`unknown phase '${phase}' (expected bootstrap or completed-site)`);
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
