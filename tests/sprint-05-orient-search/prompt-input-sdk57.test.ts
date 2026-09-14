/**
 * ORI-RN-000 — the published PromptInput import graph must be compatible with the
 * REAL Expo 57 image-picker types.
 *
 * The mapper (packages/registry/src/components/ai/prompt-input.logic.ts) is embedded
 * in BOTH shipped engine artifacts and imported by the published prompt-input module
 * even when the tutorial exposes no attachment controls — so a parameter type that
 * requires metadata the SDK permits omitting breaks the clean consumer's compilation.
 *
 * Tiering (task file, REQUIREMENT-CONTRACT v1):
 *  - AC-1..AC-3 are INTEGRATION proofs: the real expo-image-picker 57.x package
 *    resolved from the workspace install, the real workspace-pinned TypeScript 6.0.x
 *    compiler as a subprocess, the real registry artifacts, and the real freshness
 *    CLI. No reconstructed interface, no ambient declaration, no cast, no suppression.
 *  - AC-4 is a UNIT proof over the pure production export (dependency-free value
 *    transformation), with a scratch-only removed-fallback mutation as its
 *    sensitivity negative control — the control demonstrates the oracle would catch
 *    a removed fallback; it is NOT the original defect (the original defect is the
 *    type incompatibility, RED in AC-1..AC-3).
 */
import { expect, it } from 'vitest';
import { imageAssetToAttachment } from '../../packages/registry/src/components/ai/prompt-input.logic.ts';
import {
  compileMapperSource,
  compileProduction,
  freshnessRealCheck,
  mutationSensitivityCheck,
  readEmittedMapper,
  resolveSdk,
  resolveTsc,
  staleRejectionCheck,
} from './support/verify-prompt-input-sdk57.ts';

/** Optionality incompatibilities surface as these codes; module-resolution failures must not. */
const RESOLUTION_FAILURE = /TS2307|TS2304/;

it('ORI-RN-000-AC-1-real-sdk: production mapper accepts the real Expo 57 ImagePickerAsset', {
  timeout: 120_000,
}, () => {
  const sdk = resolveSdk(); // throws unless the installed SDK is 57.x with optional metadata fields
  const tsc = resolveTsc(); // throws unless the compiler is the pinned TypeScript 6.0.x
  const result = compileProduction();
  expect(
    result.output,
    `the SDK module must actually resolve (real package, not a reconstructed interface):\n${result.output}`,
  ).not.toMatch(RESOLUTION_FAILURE);
  expect(
    result.exit,
    `${tsc.version} compiling the PRODUCTION mapper over ${sdk.dir}:\n${result.output}`,
  ).toBe(0);
});

it('ORI-RN-000-AC-2-nativewind-artifact: emitted nativewind mapper matches source and compiles', {
  timeout: 120_000,
}, () => {
  const emitted = readEmittedMapper('nativewind'); // throws on missing entry or 0-byte content
  expect(
    emitted.byteMatchesSource,
    'the emitted mapper is byte-identical to production source',
  ).toBe(true);
  const result = compileMapperSource(emitted.content);
  expect(result.output, `the SDK module must actually resolve:\n${result.output}`).not.toMatch(
    RESOLUTION_FAILURE,
  );
  expect(result.exit, `compiling the EMITTED nativewind mapper:\n${result.output}`).toBe(0);
});

it('ORI-RN-000-AC-3-uniwind-artifact: emitted uniwind mapper matches source, compiles, freshness rejects stale output', {
  timeout: 240_000,
}, () => {
  const emitted = readEmittedMapper('uniwind');
  expect(
    emitted.byteMatchesSource,
    'the emitted mapper is byte-identical to production source',
  ).toBe(true);
  const result = compileMapperSource(emitted.content);
  expect(result.output, `the SDK module must actually resolve:\n${result.output}`).not.toMatch(
    RESOLUTION_FAILURE,
  );
  expect(result.exit, `compiling the EMITTED uniwind mapper:\n${result.output}`).toBe(0);

  // The freshness gate must reject a stale mapper — proven in an isolated scratch
  // copy so the repo tree is never left in a half-mutated state.
  const stale = staleRejectionCheck();
  expect(stale.exit, `freshness CLI over an isolated stale copy:\n${stale.output}`).toBe(1);
  expect(stale.output).toMatch(/FAIL \[stale\] public\/r\/uniwind\/prompt-input\.json/);

  // And the same real CLI must pass over the actual repo tree.
  const fresh = freshnessRealCheck();
  expect(fresh.exit, `real freshness check over the repo tree:\n${fresh.output}`).toBe(0);
});

it('ORI-RN-000-AC-4-mapping-preserved: full, omitted, and null metadata keep the existing mapping and fallbacks', {
  timeout: 120_000,
}, () => {
  const full = imageAssetToAttachment({
    uri: 'file://photo.png',
    fileName: 'photo.png',
    mimeType: 'image/png',
    fileSize: 2048,
  });
  expect(full).toEqual({
    id: expect.any(String),
    filename: 'photo.png',
    mediaType: 'image/png',
    url: 'file://photo.png',
    size: 2048,
  });

  const omitted = imageAssetToAttachment({ uri: 'file://photo.png' });
  expect(omitted.filename).toBe('Image');
  expect(omitted.mediaType).toBe('');
  expect(omitted.url).toBe('file://photo.png');
  expect(omitted.size).toBeUndefined();

  const nulls = imageAssetToAttachment({
    uri: 'file://photo.png',
    fileName: null,
    mimeType: null,
    fileSize: null,
  });
  expect(nulls.filename).toBe('Image');
  expect(nulls.mediaType).toBe('');
  expect(nulls.size).toBeUndefined();

  for (const record of [full, omitted, nulls]) {
    expect(record.id.startsWith('pi-'), `generated identity is a pi- id, got ${record.id}`).toBe(
      true,
    );
    expect(record.id.length).toBeGreaterThan('pi-'.length);
  }
  expect(omitted.id === full.id, 'two picks never share an identity').toBe(false);

  // Sensitivity negative control: a scratch-only copy with the nullish filename
  // fallback removed must BREAK this invariant (exit 1). Exit 0 would mean the
  // oracle above cannot detect a removed fallback and the control failed.
  const sens = mutationSensitivityCheck();
  expect(sens.exit, `removed-fallback mutation must break the invariant:\n${sens.output}`).toBe(1);
  expect(sens.output).toMatch(/mutation detected by the AC-4 oracle/);
});
