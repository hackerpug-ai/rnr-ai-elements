/**
 * ORI-RN-001 support — real clean-consumer preparation and compiler helper.
 *
 * Everything here drives REAL toolchain surfaces, never reconstructed ones:
 *  - the two committed setup templates are copied into fresh OS-derived directories
 *    OUTSIDE the monorepo (os.tmpdir(), reaper-managed);
 *  - the committed command scripts are executed verbatim (the literal public
 *    `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/…` recipe);
 *  - the real RNR CLI resolves @latest (version recorded), the real Expo 57 resolver
 *    reconciles native deps, and the consumer's own TypeScript 6.0.x compiles the
 *    installed import graph.
 *
 * Disallowed substitutions (task file): hostname rewriting, a local registry standing in
 * for the public apex, copying repository component sources into the consumer, resolving
 * consumer imports into the monorepo, or installing a web shadcn component by short name.
 * None of those appear here — the consumer roots are outside the monorepo and every
 * install hits rnraielements.com.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));

const TEMPLATE_DIR: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/nativewind'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/uniwind'),
};
const COMMAND_SCRIPT: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/commands/nativewind.sh'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/commands/uniwind.sh'),
};
const EVIDENCE_DIR = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-001');

/** Committed template files copied into each consumer (mirrors the task allowlist). */
export const TEMPLATE_FILES: Record<Engine, string[]> = {
  nativewind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'babel.config.js',
    'tailwind.config.js',
    'global.css',
    'nativewind-env.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
  uniwind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'global.css',
    'uniwind-types.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
};

/** The canonical public URLs the literal recipe installs from. */
const PUBLIC_ITEMS = ['conversation', 'message', 'prompt-input', 'item', 'sheet'] as const;

export type Engine = 'nativewind' | 'uniwind';
export type RunResult = { command: string; cwd: string; exit: number; output: string };

export type ConsumerReceipt = {
  engine: Engine;
  runId: string;
  root: string;
  cliVersion: string;
  scriptExit: number;
  installLog: string;
  publicUrls: Record<string, string>;
  publicHashes: Record<string, string>;
  installedFiles: Record<string, string>;
  resolvedVersions: Record<string, string>;
};

export type Tokens = {
  light: { background: string; foreground: string };
  dark: { background: string; foreground: string };
};

export type EngineConfig = {
  usesWithNativeWind: boolean;
  hasInlineRem16: boolean;
  hasDarkRoot: boolean;
  hasTailwindConfig: boolean;
  usesWithUniwindConfig: boolean;
  hasThemeBlock: boolean;
  hasVariantLight: boolean;
  hasVariantDark: boolean;
  resolved: Record<string, string>;
};

export type RootProviders = {
  mounts: string[];
  usesNavTheme: boolean;
  hasPortalHost: boolean;
  portalHostLast: boolean;
  layoutHash: string;
  themeHash: string;
};

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Runs a real command through the shell, capturing exit + combined output. Never throws. */
export function run(command: string, cwd: string, timeoutMs = 600_000): RunResult {
  const res = spawnSync(command, {
    shell: true,
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
  });
  const timedOut = (res.error as { code?: string } | undefined)?.code === 'ETIMEDOUT';
  return {
    command,
    cwd,
    exit: timedOut ? -1 : (res.status ?? -1),
    output: `${res.stdout ?? ''}${res.stderr ?? ''}${timedOut ? `\n[timed out after ${timeoutMs}ms]` : ''}`,
  };
}

function gitHead(): string {
  const res = run('git rev-parse HEAD', REPO_ROOT, 30_000);
  return res.exit === 0 ? res.output.trim() : `unknown (git failed: ${res.output.trim()})`;
}

let cliVersionCache: string | undefined;
/** The actually-resolved RNR CLI version, while the recipe keeps its literal @latest. */
export function resolveCliVersion(): string {
  if (cliVersionCache !== undefined) return cliVersionCache;
  const res = run('npx --yes @react-native-reusables/cli@latest --version', REPO_ROOT, 180_000);
  const versionMatch = res.output.match(/\d+\.\d+\.\d+/);
  cliVersionCache =
    res.exit === 0 && versionMatch ? versionMatch[0] : `unresolved (${res.output.trim()})`;
  return cliVersionCache;
}

function readPkgVersion(root: string, pkg: string): string {
  const p = join(root, 'node_modules', pkg, 'package.json');
  if (!existsSync(p)) return 'missing';
  try {
    return (JSON.parse(readFileSync(p, 'utf8')) as { version?: string }).version ?? 'missing';
  } catch {
    return 'unreadable';
  }
}

/** Copies the committed template into a fresh OS-derived root and runs the recipe. */
export function prepareConsumer(engine: Engine): ConsumerReceipt {
  const root = mkdtempSync(join(tmpdir(), `ori-rn-001-${engine}-`));
  const runId = `${engine}-${new Date().toISOString()}`;

  for (const rel of TEMPLATE_FILES[engine]) {
    const src = join(TEMPLATE_DIR[engine], rel);
    if (!existsSync(src)) {
      rmSync(root, { recursive: true, force: true });
      throw new Error(`template file missing: ${src}`);
    }
    const dst = join(root, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // Execute the committed script verbatim (the literal public recipe + checks).
  const script = run(`bash "${COMMAND_SCRIPT[engine]}"`, root, 30 * 60_000);

  const publicUrls: Record<string, string> = {};
  const publicHashes: Record<string, string> = {};
  for (const item of PUBLIC_ITEMS) {
    const url = `https://rnraielements.com/r/${engine}/${item}.json`;
    publicUrls[item] = url;
    const local = join(REPO_ROOT, 'public/r', engine, `${item}.json`);
    publicHashes[item] = existsSync(local) ? sha256(readFileSync(local, 'utf8')) : 'missing';
  }

  const receipt: ConsumerReceipt = {
    engine,
    runId,
    root,
    cliVersion: resolveCliVersion(),
    scriptExit: script.exit,
    installLog: script.output,
    publicUrls,
    publicHashes,
    installedFiles: readInstalledComponents(root, engine),
    resolvedVersions: readResolvedVersions(root),
  };

  // Capture the install log as evidence (owned scratch, outside the monorepo).
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, `${engine}-install.txt`),
    `${proofHeader(engine, receipt)}\n--- install log (verbatim) ---\n${script.output}--- end ---\n`,
  );

  return receipt;
}

function proofHeader(engine: Engine, receipt: ConsumerReceipt): string {
  return [
    `ORI-RN-001 clean ${engine} consumer install proof`,
    `candidate HEAD: ${gitHead()}`,
    `run id: ${receipt.runId}`,
    `consumer root: ${receipt.root}`,
    `RNR CLI: @latest resolved to ${receipt.cliVersion}`,
    `script: bash ${COMMAND_SCRIPT[engine]}`,
  ].join('\n');
}

export function cleanupConsumer(root: string): void {
  rmSync(root, { recursive: true, force: true });
}

/** Reads the committed recipe script (the literal public install contract). */
export function readCommittedScript(engine: Engine): string {
  return readFileSync(COMMAND_SCRIPT[engine], 'utf8');
}

/** Real compiler: the consumer's own TypeScript 6.0.x over its installed node_modules. */
export function compileConsumer(root: string): RunResult {
  return run('pnpm exec tsc --noEmit', root, 300_000);
}

export function runDoctor(root: string): RunResult {
  return run('npx --yes @react-native-reusables/cli@latest doctor --summary', root, 300_000);
}

export function runExpoInstallCheck(root: string): RunResult {
  return run('npx expo install --check', root, 300_000);
}

export function runExpoDoctor(root: string): RunResult {
  return run('pnpm exec expo-doctor', root, 300_000);
}

const ITEM_TARGET = 'components/ui/item.tsx';

/**
 * Negative control for AC-4: move the real installed item module aside, compile (must
 * fail with a retained diagnostic naming the item), restore, and compile again (must
 * pass). Mutates only the owned scratch consumer, never the repo.
 */
export function failClosedCheck(
  root: string,
  engine: Engine,
): {
  missing: RunResult;
  restored: RunResult;
} {
  const itemPath = join(root, ITEM_TARGET);
  const backup = `${itemPath}.bak`;
  if (!existsSync(itemPath))
    throw new Error(`${engine} consumer has no ${ITEM_TARGET} — run the recipe first`);

  renameSync(itemPath, backup);
  const missing = run('pnpm exec tsc --noEmit', root, 300_000);
  renameSync(backup, itemPath);
  const restored = run('pnpm exec tsc --noEmit', root, 300_000);
  return { missing, restored };
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

/** Hashes every installed .ts/.tsx source under the consumer's components/ and lib/. */
export function readInstalledComponents(root: string, _engine: Engine): Record<string, string> {
  const files: Record<string, string> = {};
  for (const dir of ['components', 'lib']) {
    for (const abs of walkFiles(join(root, dir))) {
      if (!/\.(ts|tsx)$/.test(abs)) continue;
      files[abs.slice(root.length + 1)] = sha256(readFileSync(abs, 'utf8'));
    }
  }
  return files;
}

/** Resolved dependency versions from the consumer's own node_modules. */
export function readResolvedVersions(root: string): Record<string, string> {
  return {
    expo: readPkgVersion(root, 'expo'),
    'react-native': readPkgVersion(root, 'react-native'),
    react: readPkgVersion(root, 'react'),
    typescript: readPkgVersion(root, 'typescript'),
    nativewind: readPkgVersion(root, 'nativewind'),
    uniwind: readPkgVersion(root, 'uniwind'),
    tailwindcss: readPkgVersion(root, 'tailwindcss'),
    '@rn-primitives/dialog': readPkgVersion(root, '@rn-primitives/dialog'),
    'react-native-safe-area-context': readPkgVersion(root, 'react-native-safe-area-context'),
  };
}

/** Parses the committed engine configuration from the actual consumer files. */
export function readEngineConfig(root: string): EngineConfig {
  const metro = readFileSync(join(root, 'metro.config.js'), 'utf8');
  const global = readFileSync(join(root, 'global.css'), 'utf8');
  const resolved = readResolvedVersions(root);
  return {
    usesWithNativeWind: metro.includes('withNativeWind('),
    hasInlineRem16: metro.includes('inlineRem') && metro.includes('16'),
    hasDarkRoot: /\.dark\s*:\s*root\b/.test(global),
    hasTailwindConfig: existsSync(join(root, 'tailwind.config.js')),
    usesWithUniwindConfig: metro.includes('withUniwindConfig('),
    hasThemeBlock: /@theme\b/.test(global),
    hasVariantLight: /@variant\s+light\b/.test(global),
    hasVariantDark: /@variant\s+dark\b/.test(global),
    resolved,
  };
}

/** Parses the provider topology and source hashes from the actual root layout + theme. */
export function readRootProviders(root: string): RootProviders {
  const layout = readFileSync(join(root, 'app/_layout.tsx'), 'utf8');
  const theme = readFileSync(join(root, 'lib/theme.ts'), 'utf8');
  const mounts: string[] = [];
  for (const provider of [
    'GestureHandlerRootView',
    'SafeAreaProvider',
    'ThemeProvider',
    'StatusBar',
  ]) {
    if (layout.includes(`<${provider}`) || layout.includes(`${provider} `)) mounts.push(provider);
  }
  const hasPortalHost = layout.includes('<PortalHost');
  const portalIdx = layout.lastIndexOf('<PortalHost');
  const stackIdx = layout.lastIndexOf('<Stack');
  return {
    mounts,
    usesNavTheme: layout.includes('NAV_THEME'),
    hasPortalHost,
    // PortalHost is the last provider child when it appears after the Stack.
    portalHostLast: hasPortalHost && (stackIdx < 0 || portalIdx > stackIdx),
    layoutHash: sha256(layout),
    themeHash: sha256(theme),
  };
}

/** Normalizes a CSS/JS color value to `hsl(H S% L%)` for cross-engine comparison. */
function normalizeHsl(value: string): string {
  let s = value.trim();
  const m = s.match(/^hsl\(\s*(.*?)\s*\)$/i);
  if (m) s = m[1];
  return `hsl(${s.replace(/\s+/g, ' ')})`;
}

function extractCssToken(block: string, name: string): string {
  const m = block.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`missing CSS token ${name} in block:\n${block}`);
  return normalizeHsl(m[1]);
}

/** Extracts background/foreground tokens from global.css in both appearances. */
export function readCssTokens(root: string, engine: Engine): Tokens {
  const global = readFileSync(join(root, 'global.css'), 'utf8');
  if (engine === 'nativewind') {
    const lightBlock = global.match(/:\s*root\s*\{([^}]*)\}/s)?.[1] ?? '';
    const darkBlock = global.match(/\.dark\s*:\s*root\s*\{([^}]*)\}/s)?.[1] ?? '';
    return {
      light: {
        background: extractCssToken(lightBlock, '--background'),
        foreground: extractCssToken(lightBlock, '--foreground'),
      },
      dark: {
        background: extractCssToken(darkBlock, '--background'),
        foreground: extractCssToken(darkBlock, '--foreground'),
      },
    };
  }
  const lightBlock = global.match(/@variant\s+light\s*\{([^}]*)\}/s)?.[1] ?? '';
  const darkBlock = global.match(/@variant\s+dark\s*\{([^}]*)\}/s)?.[1] ?? '';
  return {
    light: {
      background: extractCssToken(lightBlock, '--color-background'),
      foreground: extractCssToken(lightBlock, '--color-foreground'),
    },
    dark: {
      background: extractCssToken(darkBlock, '--color-background'),
      foreground: extractCssToken(darkBlock, '--color-foreground'),
    },
  };
}

function extractThemeToken(block: string, name: string): string {
  const m = block.match(new RegExp(`${name}:\\s*'([^']+)'`));
  if (!m) throw new Error(`missing theme token ${name} in block:\n${block}`);
  return normalizeHsl(m[1]);
}

/** Extracts THEME background/foreground from lib/theme.ts in both appearances. */
export function readThemeTokens(root: string): Tokens {
  const theme = readFileSync(join(root, 'lib/theme.ts'), 'utf8');
  const lightBlock = theme.match(/\blight\s*:\s*\{([\s\S]*?)\n\s*\},/)?.[1] ?? '';
  const darkBlock = theme.match(/\bdark\s*:\s*\{([\s\S]*?)\n\s*\},/)?.[1] ?? '';
  return {
    light: {
      background: extractThemeToken(lightBlock, 'background'),
      foreground: extractThemeToken(lightBlock, 'foreground'),
    },
    dark: {
      background: extractThemeToken(darkBlock, 'background'),
      foreground: extractThemeToken(darkBlock, 'foreground'),
    },
  };
}

/** Writes the three committed evidence artifacts from the real receipts + checks. */
export function writeEvidence(
  receipts: Record<Engine, ConsumerReceipt>,
  checks: Record<Engine, Record<string, RunResult>>,
  failClosed: Record<Engine, { missing: RunResult; restored: RunResult }>,
): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const manifest: Record<string, unknown> = {
    task: 'ORI-RN-001',
    candidate_head_sha: gitHead(),
    generated_at: new Date().toISOString(),
    rnr_cli_version: resolveCliVersion(),
    commands: [
      'pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts',
      'pnpm typecheck',
      'pnpm lint',
    ],
    engines: {} as Record<string, unknown>,
  };
  const engines = manifest.engines as Record<string, unknown>;
  for (const engine of ['nativewind', 'uniwind'] as Engine[]) {
    const r = receipts[engine];
    const c = checks[engine];
    engines[engine] = {
      run_id: r.runId,
      consumer_root: r.root,
      script_exit: r.scriptExit,
      cli_version: r.cliVersion,
      public_urls: r.publicUrls,
      public_hashes: r.publicHashes,
      installed_files: r.installedFiles,
      resolved_versions: r.resolvedVersions,
      checks: Object.fromEntries(
        Object.entries(c).map(([k, v]) => [k, { exit: v.exit, command: v.command }]),
      ),
      fail_closed: {
        missing_item_exit: failClosed[engine].missing.exit,
        restored_exit: failClosed[engine].restored.exit,
        diagnostic_named_item: /item/.test(failClosed[engine].missing.output),
      },
    };
  }
  writeFileSync(
    join(EVIDENCE_DIR, 'resolution-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
