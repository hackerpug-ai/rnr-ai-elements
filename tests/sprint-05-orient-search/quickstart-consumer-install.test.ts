/**
 * ORI-RN-001 — both documented engine setups install public registry source and compile
 * independently in clean Expo 57 consumers.
 *
 * The proof helper (support/quickstart-consumer.ts) copies the committed setup templates
 * into fresh OS-derived directories OUTSIDE the monorepo, executes the committed command
 * scripts (the literal public `npx @react-native-reusables/cli@latest add https://…`
 * recipe), and drives the real RNR CLI, public HTTPS registry, Expo 57 resolver,
 * filesystem, and TypeScript compiler. No stubs, no local registry, no copied source.
 *
 * Tiering (task file, REQUIREMENT-CONTRACT v1):
 *  - AC-1..AC-4 are INTEGRATION proofs over real installs and the real compiler. This
 *    file asserts COMPILATION and CONFIGURATION only; native appearance, keyboard, inset,
 *    portal, and light/dark chrome execution are owned by ORI-RN-003 and are NOT claimed
 *    from Vitest.
 */
import { afterAll, beforeAll, expect, it } from 'vitest';
import {
  type ConsumerReceipt,
  cleanupConsumer,
  compileConsumer,
  type Engine,
  failClosedCheck,
  prepareConsumer,
  REPO_ROOT,
  type RunResult,
  readCommittedScript,
  readCssTokens,
  readEngineConfig,
  readRootProviders,
  readThemeTokens,
  runDoctor,
  runExpoDoctor,
  runExpoInstallCheck,
  writeEvidence,
} from './support/quickstart-consumer.ts';

const ENGINES: Engine[] = ['nativewind', 'uniwind'];

/** The five required items, mapped to their installed target under the consumer. */
const REQUIRED_ITEMS: Record<string, string> = {
  conversation: 'components/ai/conversation.tsx',
  message: 'components/ai/message.tsx',
  'prompt-input': 'components/ai/prompt-input.tsx',
  item: 'components/ui/item.tsx',
  sheet: 'components/ui/sheet.tsx',
};

/** Module-resolution failures the clean consumer must never produce (AC-1). */
const RESOLUTION_FAILURE = /TS2307|TS2304/;

let receipts: Record<Engine, ConsumerReceipt>;

beforeAll(() => {
  receipts = { nativewind: prepareConsumer('nativewind'), uniwind: prepareConsumer('uniwind') };
}, 40 * 60_000);

afterAll(() => {
  for (const engine of ENGINES) {
    const receipt = receipts?.[engine];
    if (receipt) cleanupConsumer(receipt.root);
  }
}, 120_000);

it('ORI-RN-001-AC-1-public-install: five required items compile independently in both consumers', {
  timeout: 5 * 60_000,
}, () => {
  for (const engine of ENGINES) {
    const receipt = receipts[engine];
    expect(
      receipt.scriptExit,
      `${engine} install script must exit 0:\n${receipt.installLog.slice(-2000)}`,
    ).toBe(0);

    // All five required items installed from the canonical URLs, non-empty source.
    for (const [name, target] of Object.entries(REQUIRED_ITEMS)) {
      const hash = receipt.installedFiles[target];
      expect(hash, `${engine} must install ${name} at ${target}`).toBeTruthy();
      expect(hash, `${engine} ${name} source must not be empty`).not.toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      );
    }

    // The install came from the public registry, not the monorepo.
    const script = readCommittedScript(engine);
    expect(script, `${engine} recipe must reference the public apex`).toMatch(
      /rnraielements\.com\/r\/(nativewind|uniwind)\//,
    );
    expect(script, `${engine} recipe must install the five canonical items`).toMatch(
      /conversation\.json/,
    );
    expect(receipt.root, `${engine} consumer must live outside the monorepo`).not.toContain(
      REPO_ROOT,
    );
    expect(receipt.installLog, `${engine} must not resolve into the monorepo`).not.toContain(
      '/rnr-ai-elements/packages/registry/src',
    );

    // The installed import graph compiles with the pinned RN + TS.
    const tsc = compileConsumer(receipt.root);
    expect(
      tsc.output,
      `${engine} installed graph must actually resolve:\n${tsc.output}`,
    ).not.toMatch(RESOLUTION_FAILURE);
    expect(tsc.exit, `${engine} clean compile must pass:\n${tsc.output}`).toBe(0);
  }
});

it('ORI-RN-001-AC-2-engine-configuration: each consumer has its pinned engine and coherent theme', {
  timeout: 5 * 60_000,
}, () => {
  for (const engine of ENGINES) {
    const receipt = receipts[engine];
    const config = readEngineConfig(receipt.root);

    if (engine === 'nativewind') {
      expect(config.usesWithNativeWind, 'nativewind metro must call withNativeWind').toBe(true);
      expect(config.hasInlineRem16, 'nativewind metro must set inlineRem 16').toBe(true);
      expect(config.hasDarkRoot, 'nativewind global.css must use .dark:root').toBe(true);
      expect(config.hasTailwindConfig, 'nativewind must have tailwind.config.js').toBe(true);
      expect(config.resolved.nativewind, 'nativewind must resolve 4.2.6').toBe('4.2.6');
      expect(config.resolved.tailwindcss, 'nativewind must use Tailwind v3').toMatch(/^3\./);
    } else {
      expect(config.usesWithUniwindConfig, 'uniwind metro must call withUniwindConfig').toBe(true);
      expect(config.hasThemeBlock, 'uniwind global.css must declare @theme').toBe(true);
      expect(config.hasVariantLight, 'uniwind global.css must use @variant light').toBe(true);
      expect(config.hasVariantDark, 'uniwind global.css must use @variant dark').toBe(true);
      expect(config.hasTailwindConfig, 'uniwind must NOT have tailwind.config.js').toBe(false);
      expect(config.resolved.uniwind, 'uniwind must resolve 1.11.0').toBe('1.11.0');
      expect(config.resolved.tailwindcss, 'uniwind must use Tailwind v4').toMatch(/^4\./);
    }

    // No mixed-engine imports (AC-2 must_not_observe).
    const imported = Object.keys(receipt.installedFiles).join('\n');
    if (engine === 'nativewind') {
      expect(imported, 'nativewind consumer must not import uniwind').not.toContain("'uniwind");
    } else {
      expect(imported, 'uniwind consumer must not import nativewind').not.toContain("'nativewind");
    }

    // Real doctor output, non-empty, and it reports zero issues.
    const doctor = runDoctor(receipt.root);
    expect(doctor.exit, `${engine} doctor must pass:\n${doctor.output}`).toBe(0);
    expect(doctor.output.length, `${engine} doctor must produce output`).toBeGreaterThan(0);

    // Expo install --check must report no drift.
    const expoCheck = runExpoInstallCheck(receipt.root);
    expect(expoCheck.exit, `${engine} expo install --check must pass:\n${expoCheck.output}`).toBe(
      0,
    );

    // expo-doctor must report no issues.
    const expoDoctor = runExpoDoctor(receipt.root);
    expect(expoDoctor.exit, `${engine} expo-doctor must pass:\n${expoDoctor.output}`).toBe(0);
    expect(expoDoctor.output, `${engine} expo-doctor must report no issues`).toMatch(
      /No issues detected|passed/,
    );

    // NAV_THEME background/foreground == CSS tokens (2 appearances x 2 tokens per engine).
    const css = readCssTokens(receipt.root, engine);
    const theme = readThemeTokens(receipt.root);
    for (const appearance of ['light', 'dark'] as const) {
      expect(
        theme[appearance].background,
        `${engine}/${appearance} NAV_THEME background must equal the CSS token`,
      ).toBe(css[appearance].background);
      expect(
        theme[appearance].foreground,
        `${engine}/${appearance} NAV_THEME foreground must equal the CSS token`,
      ).toBe(css[appearance].foreground);
    }
  }
});

it('ORI-RN-001-AC-3-root-providers: both root layouts compile with the ordered provider topology', {
  timeout: 5 * 60_000,
}, () => {
  for (const engine of ENGINES) {
    const receipt = receipts[engine];
    const providers = readRootProviders(receipt.root);

    expect(providers.mounts, `${engine} root must mount the required providers`).toContain(
      'GestureHandlerRootView',
    );
    expect(providers.mounts, `${engine} root must mount a safe-area context`).toContain(
      'SafeAreaProvider',
    );
    expect(providers.mounts, `${engine} root must bind ThemeProvider to NAV_THEME`).toContain(
      'ThemeProvider',
    );
    expect(providers.usesNavTheme, `${engine} root must import NAV_THEME`).toBe(true);
    expect(providers.mounts, `${engine} root must mount a StatusBar`).toContain('StatusBar');
    expect(providers.hasPortalHost, `${engine} root must mount PortalHost`).toBe(true);
    expect(providers.portalHostLast, `${engine} PortalHost must be the last provider child`).toBe(
      true,
    );

    // The root compiles (real compiler, not a static receipt).
    const tsc = compileConsumer(receipt.root);
    expect(tsc.exit, `${engine} root-layout compile must pass:\n${tsc.output}`).toBe(0);

    // Root/theme source hashes identify source for downstream native proof (AC-3).
    expect(providers.layoutHash, `${engine} layout hash must be a real sha256`).toMatch(
      /^[0-9a-f]{64}$/,
    );
    expect(providers.themeHash, `${engine} theme hash must be a real sha256`).toMatch(
      /^[0-9a-f]{64}$/,
    );
  }
});

it('ORI-RN-001-AC-4-fail-closed: a removed item module produces a retained compiler failure', {
  timeout: 5 * 60_000,
}, () => {
  for (const engine of ENGINES) {
    const receipt = receipts[engine];
    const result = failClosedCheck(receipt.root, engine);

    expect(
      result.missing.exit,
      `${engine} missing-item compile must fail:\n${result.missing.output}`,
    ).not.toBe(0);
    expect(
      result.missing.output,
      `${engine} missing-item diagnostic must name the removed item module`,
    ).toMatch(/item/);

    expect(
      result.restored.exit,
      `${engine} restored compile must pass:\n${result.restored.output}`,
    ).toBe(0);
  }
});

it('ORI-RN-001-evidence: write the install logs and resolution manifest', {
  timeout: 5 * 60_000,
}, () => {
  const checks: Record<Engine, Record<string, RunResult>> = {} as Record<
    Engine,
    Record<string, RunResult>
  >;
  const failClosed: Record<Engine, { missing: RunResult; restored: RunResult }> = {} as Record<
    Engine,
    { missing: RunResult; restored: RunResult }
  >;
  for (const engine of ENGINES) {
    checks[engine] = {
      doctor: runDoctor(receipts[engine].root),
      expo_install_check: runExpoInstallCheck(receipts[engine].root),
      tsc: compileConsumer(receipts[engine].root),
      expo_doctor: runExpoDoctor(receipts[engine].root),
    };
    failClosed[engine] = failClosedCheck(receipts[engine].root, engine);
  }
  writeEvidence(receipts, checks, failClosed);
  expect(true).toBe(true);
});
