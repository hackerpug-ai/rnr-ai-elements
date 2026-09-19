/**
 * ORI-RN-000 support — real-SDK compiler proofs for the PromptInput mapper.
 *
 * Everything here drives REAL toolchain surfaces, never reconstructed ones:
 *  - expo-image-picker resolves from the workspace's own Expo 57 install
 *    (apps/example/node_modules/expo-image-picker, lockfile-pinned ~57.0.16);
 *  - the compiler is the workspace-pinned TypeScript 6.0.x
 *    (packages/registry/node_modules/.bin/tsc);
 *  - the freshness proof runs the REAL scripts/check-registry-fresh.ts, once over
 *    the repo tree and once over an isolated scratch copy carrying a stale mapper;
 *  - the sensitivity control executes a scratch-only mutated copy of the production
 *    mapper through tsx (the repo's own runner) and must BREAK the AC-4 invariant.
 *
 * The consumer compiled in the sdk57 workspace is the Quickstart contract from the
 * task file: a function accepting the SDK's own ImagePickerAsset[] and returning
 * assets.map(imageAssetToAttachment) — no casts, no ambient declarations, no
 * suppression. If the mapper's parameter type requires metadata the SDK permits
 * omitting, this file's compile result carries the actual TS2345 diagnostics.
 *
 * CLI modes (evidence capture; the vitest tier imports the functions above):
 *   tsx verify-prompt-input-sdk57.ts --evidence-red    writes evidence/ORI-RN-000/real-sdk-red.txt
 *   tsx verify-prompt-input-sdk57.ts --evidence-green  writes evidence/ORI-RN-000/real-sdk-green.txt
 *   tsx verify-prompt-input-sdk57.ts --evidence-hashes writes evidence/ORI-RN-000/registry-hashes.json
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
export const PROD_MAPPER = join(
  REPO_ROOT,
  'packages/registry/src/components/ai/prompt-input.logic.ts',
);
/** The mapper's install-time target inside both engine artifacts. */
export const MAPPER_TARGET = 'components/ai/prompt-input.logic.ts';

const SCRATCH = join(REPO_ROOT, '.tmp/ORI-RN-000');
const SDK_WS = join(SCRATCH, 'sdk57-workspace');
const STALE_WS = join(SCRATCH, 'stale-check');
const MUT_WS = join(SCRATCH, 'mutation-check');
const EVIDENCE_DIR = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-000');

const SDK_DIR = join(REPO_ROOT, 'apps/example/node_modules/expo-image-picker');
const TSC_BIN = join(REPO_ROOT, 'packages/registry/node_modules/.bin/tsc');
const TSX_CLI = join(REPO_ROOT, 'node_modules/tsx/dist/cli.mjs');
const FRESH_SCRIPT = join(REPO_ROOT, 'scripts/check-registry-fresh.ts');

export type Engine = 'nativewind' | 'uniwind';
export type RunResult = { command: string; cwd: string; exit: number; output: string };

/** Runs a real command, capturing exit + combined output. Never throws on failure. */
export function run(command: string, args: string[], cwd: string): RunResult {
  const res = spawnSync(command, args, { cwd, encoding: 'utf8' });
  return {
    command: `${command} ${args.join(' ')}`,
    cwd,
    exit: res.status ?? -1,
    output: `${res.stdout ?? ''}${res.stderr ?? ''}`,
  };
}

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export type SdkInfo = {
  dir: string;
  version: string;
  /** The real .d.ts file declaring ImagePickerAsset. */
  declarationFile: string;
  /** The declaration block, for evidence binding. */
  assetDecl: string;
};

/**
 * Resolves the REAL installed Expo 57 expo-image-picker and grounds the fixture
 * premise on its actual declaration: uri required, the three metadata fields
 * optional. Throws when the package is missing, not 57.x, or its asset type no
 * longer permits omitting the metadata — a changed premise must fail loudly,
 * never be papered over.
 */
export function resolveSdk(): SdkInfo {
  const pkgPath = join(SDK_DIR, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`real expo-image-picker not installed at ${SDK_DIR} — run pnpm install first`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string; version?: string };
  if (pkg.name !== 'expo-image-picker' || !pkg.version?.startsWith('57.')) {
    throw new Error(
      `expected expo-image-picker 57.x at ${SDK_DIR}, found ${pkg.name}@${pkg.version}`,
    );
  }
  const buildDir = join(SDK_DIR, 'build');
  let declarationFile = '';
  let assetDecl = '';
  for (const entry of readdirSync(buildDir)) {
    if (!entry.endsWith('.d.ts')) continue;
    const text = readFileSync(join(buildDir, entry), 'utf8');
    const start = text.search(/export (?:type|interface) ImagePickerAsset\b/);
    if (start < 0) continue;
    declarationFile = join(buildDir, entry);
    assetDecl = text.slice(start, text.indexOf('\n}', start) + 2);
    break;
  }
  if (!assetDecl) {
    throw new Error(`no ImagePickerAsset declaration found under ${buildDir}`);
  }
  for (const field of ['fileName', 'mimeType', 'fileSize']) {
    if (!new RegExp(`${field}\\s*\\?:`).test(assetDecl)) {
      throw new Error(
        `real SDK ${pkg.version}: ${field} is not optional in ImagePickerAsset — ` +
          'the ORI-RN-000 fixture premise no longer holds; re-plan before touching the mapper',
      );
    }
  }
  return { dir: SDK_DIR, version: pkg.version, declarationFile, assetDecl };
}

export type TscInfo = { bin: string; version: string };

/** The workspace-pinned TypeScript 6.0.x compiler (packages/registry devDependency). */
export function resolveTsc(): TscInfo {
  if (!existsSync(TSC_BIN)) {
    throw new Error(`workspace typescript not installed at ${TSC_BIN} — run pnpm install first`);
  }
  const res = run(TSC_BIN, ['--version'], REPO_ROOT);
  if (res.exit !== 0) throw new Error(`tsc --version failed: ${res.output}`);
  if (!/Version 6\.0\./.test(res.output)) {
    throw new Error(`expected the pinned TypeScript 6.0.x, got: ${res.output.trim()}`);
  }
  return { bin: TSC_BIN, version: res.output.trim() };
}

/** The Quickstart consumer contract, compiled verbatim in the sdk57 workspace. */
const CONSUMER = `import type { ImagePickerAsset } from 'expo-image-picker';
import { imageAssetToAttachment } from './prompt-input.logic';

export function attachmentsFromPicker(assets: ImagePickerAsset[]) {
  return assets.map(imageAssetToAttachment);
}
`;

/** Materializes the scratch workspace: consumer + the given mapper + real-SDK tsconfig. */
function writeSdkWorkspace(mapperSource: string): string {
  rmSync(SDK_WS, { recursive: true, force: true });
  mkdirSync(SDK_WS, { recursive: true });
  writeFileSync(join(SDK_WS, 'consumer.ts'), CONSUMER);
  writeFileSync(join(SDK_WS, 'prompt-input.logic.ts'), mapperSource);
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2023'],
      module: 'Preserve',
      moduleResolution: 'bundler',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      // The REAL installed Expo 57 package — resolution, not declaration replacement.
      paths: { 'expo-image-picker': [SDK_DIR] },
    },
    include: ['consumer.ts', 'prompt-input.logic.ts'],
  };
  writeFileSync(join(SDK_WS, 'tsconfig.json'), `${JSON.stringify(tsconfig, null, 2)}\n`);
  return SDK_WS;
}

/** Compiles the PRODUCTION mapper source against the real SDK. */
export function compileProduction(): RunResult {
  return compileMapperSource(readFileSync(PROD_MAPPER, 'utf8'));
}

/** Compiles the given mapper source (production or emitted artifact content). */
export function compileMapperSource(mapperSource: string): RunResult {
  const ws = writeSdkWorkspace(mapperSource);
  const res = run(TSC_BIN, ['--noEmit', '--project', '.'], ws);
  return { ...res, output: `${res.output}(workspace: ${ws})\n` };
}

export type Emitted = {
  engine: Engine;
  jsonPath: string;
  content: string;
  sha256: string;
  sourceSha256: string;
  byteMatchesSource: boolean;
};

/**
 * Reads the mapper actually embedded in one engine's shipped prompt-input.json.
 * The logic module carries no {engine} aliases, so a fresh emission is
 * byte-identical to the production source — anything else is staleness.
 */
export function readEmittedMapper(engine: Engine): Emitted {
  const jsonPath = join(REPO_ROOT, 'public/r', engine, 'prompt-input.json');
  if (!existsSync(jsonPath)) {
    throw new Error(`shipped artifact missing: ${jsonPath} — run pnpm registry:build and commit`);
  }
  const item = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
    files?: Array<{ target?: string; content?: string }>;
  };
  const files = item.files ?? [];
  const entry = files.find((f) => f.target === MAPPER_TARGET);
  if (!entry) {
    throw new Error(
      `no ${MAPPER_TARGET} entry in ${jsonPath} — targets: ${files.map((f) => f.target).join(', ')}`,
    );
  }
  if (!entry.content || entry.content.length === 0) {
    throw new Error(`empty mapper content (0 bytes) at ${MAPPER_TARGET} in ${jsonPath}`);
  }
  const source = readFileSync(PROD_MAPPER, 'utf8');
  return {
    engine,
    jsonPath,
    content: entry.content,
    sha256: sha256(entry.content),
    sourceSha256: sha256(source),
    byteMatchesSource: entry.content === source,
  };
}

/**
 * Proves the REAL freshness CLI rejects a stale mapper, without touching the repo
 * tree: an isolated scratch root (symlinked sources, copied public/r, version-matched
 * package.json) whose uniwind prompt-input.json carries a reverted mapper. The gate
 * must exit 1 naming exactly that file.
 */
export function staleRejectionCheck(): RunResult {
  rmSync(STALE_WS, { recursive: true, force: true });
  mkdirSync(join(STALE_WS, 'packages/registry'), { recursive: true });
  mkdirSync(join(STALE_WS, 'public'), { recursive: true });
  symlinkSync(
    join(REPO_ROOT, 'packages/registry/src'),
    join(STALE_WS, 'packages/registry/src'),
    'dir',
  );
  cpSync(
    join(REPO_ROOT, 'packages/registry/registry.json'),
    join(STALE_WS, 'packages/registry/registry.json'),
  );
  cpSync(join(REPO_ROOT, 'public/r'), join(STALE_WS, 'public/r'), { recursive: true });
  const version = (
    JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { version: string }
  ).version;
  // check-registry-fresh compares the copied public/r against a fresh in-memory
  // build — self-deps are unversioned same-host after FIX-ORI-DEP-001-1, so it
  // no longer reads package.json for a {version} substitution.
  writeFileSync(
    join(STALE_WS, 'package.json'),
    `${JSON.stringify({ name: 'ori-rn-000-stale-check', private: true, version }, null, 2)}\n`,
  );

  const artifactPath = join(STALE_WS, 'public/r/uniwind/prompt-input.json');
  const staleItem = JSON.parse(readFileSync(artifactPath, 'utf8')) as {
    files: Array<{ target?: string; content?: string }>;
  };
  const mapper = staleItem.files.find((f) => f.target === MAPPER_TARGET);
  if (!mapper?.content)
    throw new Error(`stale-check copy has no mapper content at ${artifactPath}`);
  // Stale = the pre-correction required-field shape; if that reversion is a no-op,
  // force byte drift instead — either way the gate must reject the file.
  const reverted = mapper.content
    .replace('fileName?: string | null;', 'fileName: string | null;')
    .replace('mimeType?: string | null;', 'mimeType: string | null;')
    .replace('fileSize?: number | null;', 'fileSize: number | null;');
  mapper.content =
    reverted === mapper.content
      ? `${mapper.content}\n// stale-forced: freshness must reject any byte drift\n`
      : reverted;
  writeFileSync(artifactPath, `${JSON.stringify(staleItem, null, 2)}\n`);

  return run(process.execPath, [TSX_CLI, FRESH_SCRIPT], STALE_WS);
}

/** The real freshness gate over the actual repo tree — the same thing pnpm check:registry runs. */
export function freshnessRealCheck(): RunResult {
  return run(process.execPath, [TSX_CLI, FRESH_SCRIPT], REPO_ROOT);
}

/**
 * Negative control for AC-4 (sensitivity, NOT the original defect): a scratch-only
 * copy of the production mapper with the nullish filename fallback removed, executed
 * through tsx. The runner asserts the AC-4 invariant and exits 1 when the mutation
 * breaks it — exit 0 would mean the oracle is insensitive and the control failed.
 */
export function mutationSensitivityCheck(): RunResult {
  const prod = readFileSync(PROD_MAPPER, 'utf8');
  const needle = "asset.fileName ?? 'Image'";
  if (!prod.includes(needle)) {
    throw new Error(`production mapper no longer contains ${needle} — update the mutation control`);
  }
  rmSync(MUT_WS, { recursive: true, force: true });
  mkdirSync(MUT_WS, { recursive: true });
  writeFileSync(
    join(MUT_WS, 'prompt-input.logic.mutated.ts'),
    prod.replace(needle, "asset.fileName ?? ''"),
  );
  writeFileSync(
    join(MUT_WS, 'run.ts'),
    `import { imageAssetToAttachment } from './prompt-input.logic.mutated.ts';
const record = imageAssetToAttachment({ uri: 'file://photo.png' });
console.log(\`mutated filename for a nameless asset: \${JSON.stringify(record.filename)}\`);
if (record.filename === 'Image') {
  console.error('NOT DETECTED: the removed fallback still produced the Image name');
  process.exit(0);
}
console.log('mutation detected by the AC-4 oracle: filename !== "Image"');
process.exit(1);
`,
  );
  return run(process.execPath, [TSX_CLI, 'run.ts'], MUT_WS);
}

// ---- Evidence capture (CLI only; never runs when the vitest tier imports this module).

function gitHead(): string {
  const res = run('git', ['rev-parse', 'HEAD'], REPO_ROOT);
  return res.exit === 0 ? res.output.trim() : `unknown (git failed: ${res.output.trim()})`;
}

function proofHeader(kind: string): string {
  const sdk = resolveSdk();
  const tsc = resolveTsc();
  return [
    `ORI-RN-000 real-SDK compiler proof — ${kind}`,
    `candidate HEAD: ${gitHead()}`,
    `command: ${tsc.bin} --noEmit --project ${SDK_WS}`,
    `consumer: import type { ImagePickerAsset } from 'expo-image-picker'; assets.map(imageAssetToAttachment)`,
    `expo-image-picker: ${sdk.version} at ${sdk.dir} (declaration: ${sdk.declarationFile})`,
    `typescript: ${tsc.version} at ${tsc.bin}`,
    `production mapper: ${PROD_MAPPER} (sha256 ${sha256(readFileSync(PROD_MAPPER, 'utf8'))})`,
  ].join('\n');
}

function writeRefusingOverwrite(path: string, text: string): void {
  if (existsSync(path)) {
    console.error(`refusing to overwrite existing evidence: ${path}`);
    process.exit(2);
  }
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(path, text);
  console.log(`wrote ${path}`);
}

function evidenceRed(): void {
  const res = compileProduction();
  if (res.exit === 0) {
    console.error('RED capture requires a failing compile — the production mapper already passes.');
    process.exit(2);
  }
  writeRefusingOverwrite(
    join(EVIDENCE_DIR, 'real-sdk-red.txt'),
    `${proofHeader('RED, captured BEFORE the source correction')}\ncompiler exit: ${res.exit}\n--- compiler diagnostics (verbatim) ---\n${res.output}--- end ---\n`,
  );
}

function evidenceGreen(): void {
  const res = compileProduction();
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, 'real-sdk-green.txt'),
    `${proofHeader('GREEN, the same compiler proof AFTER the correction')}\ncompiler exit: ${res.exit}\n--- compiler diagnostics (verbatim) ---\n${res.output}--- end ---\n`,
  );
  console.log(`wrote ${join(EVIDENCE_DIR, 'real-sdk-green.txt')} (compile exit ${res.exit})`);
  if (res.exit !== 0) process.exit(res.exit);
}

function evidenceHashes(): void {
  const sdk = resolveSdk();
  const tsc = resolveTsc();
  const stale = staleRejectionCheck();
  const fresh = freshnessRealCheck();
  const sens = mutationSensitivityCheck();
  type ArtifactProof = {
    json: string;
    mapper_target: string;
    mapper_sha256: string;
    production_source_sha256: string;
    byte_matches_source: boolean;
    compile_exit: number;
  };
  const artifacts = (['nativewind', 'uniwind'] as const).map((engine): [Engine, ArtifactProof] => {
    const emitted = readEmittedMapper(engine);
    const compile = compileMapperSource(emitted.content);
    return [
      engine,
      {
        json: `public/r/${engine}/prompt-input.json`,
        mapper_target: MAPPER_TARGET,
        mapper_sha256: emitted.sha256,
        production_source_sha256: emitted.sourceSha256,
        byte_matches_source: emitted.byteMatchesSource,
        compile_exit: compile.exit,
      },
    ];
  });
  const payload = {
    task: 'ORI-RN-000',
    candidate_head_sha: gitHead(),
    commands: [
      'pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts',
      'pnpm registry:build',
      'pnpm check:registry',
      'pnpm typecheck',
      'pnpm lint',
    ],
    typescript: { bin: tsc.bin, version: tsc.version },
    expo_image_picker: {
      dir: sdk.dir,
      version: sdk.version,
      asset_declaration_file: sdk.declarationFile,
    },
    production_mapper: { path: PROD_MAPPER, sha256: sha256(readFileSync(PROD_MAPPER, 'utf8')) },
    artifacts: Object.fromEntries(artifacts),
    freshness: {
      stale_rejection: {
        command:
          'scripts/check-registry-fresh.ts over an isolated scratch copy with a reverted uniwind mapper',
        exit: stale.exit,
        rejected_prompt_input: /FAIL \[stale\] public\/r\/uniwind\/prompt-input\.json/.test(
          stale.output,
        ),
      },
      real_check: { command: 'pnpm check:registry', exit: fresh.exit },
    },
    mutation_sensitivity: {
      control: "scratch-only removal of the nullish filename fallback ('Image' -> '')",
      exit: sens.exit,
      detected: sens.exit === 1 && /mutation detected/.test(sens.output),
    },
  };
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, 'registry-hashes.json'),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  const ok =
    fresh.exit === 0 &&
    stale.exit === 1 &&
    sens.exit === 1 &&
    artifacts.every(([, a]) => a.compile_exit === 0);
  console.log(
    `wrote ${join(EVIDENCE_DIR, 'registry-hashes.json')} (${ok ? 'all proofs green' : 'PROOF FAILURE'})`,
  );
  if (!ok) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2];
  if (mode === '--evidence-red') evidenceRed();
  else if (mode === '--evidence-green') evidenceGreen();
  else if (mode === '--evidence-hashes') evidenceHashes();
  else {
    console.error(
      `unknown mode: ${mode ?? '(none)'} — use --evidence-red | --evidence-green | --evidence-hashes`,
    );
    process.exit(2);
  }
}
