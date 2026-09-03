/**
 * TestResults — pure logic. Zero react-native imports, so the Vitest tier owns it
 * (see the header of lib/reasoning-lifecycle.ts for why component files themselves
 * cannot load under Node).
 *
 * THE STATUS COMPRESSION, DECLARED. The web paints the four test outcomes with FOUR
 * escape-hatch hues (passed green-600, failed red-600, skipped yellow-600, running
 * blue-600). The port maps them onto the house StatusTone vocabulary exactly the way
 * terminal.logic's ANSI table does — passed→success, failed→error, skipped→denied
 * (yellow compresses onto orange, the sanctioned denied pole), running→running — and
 * leans on the rule that carries the whole design: color is never the sole channel
 * (WCAG 1.4.1). Every status also renders a DISTINCT icon and the count WORDS
 * ("2 failed"), so the compressed map loses no information.
 *
 * THE TWO DURATION FORMATS ARE UPSTREAM BYTES, NOT ONE SMART FUNCTION:
 *  - formatDuration (TestResultsDuration): < 1000ms → "500ms", at or above → "3.50s"
 *  - formatTestDuration (TestDuration): ALWAYS "42ms" — the web never seconds a
 *    per-test duration, and merging the two would invent behavior upstream lacks.
 *
 * The progress math guards total = 0 (a suite that has not started): the web renders
 * a NaN percent there; the port clamps to 0% and renders "0/0 tests passed" instead —
 * declared divergence, on the record.
 */

import { statusColor, type StatusTone } from '@/registry/{engine}/lib/status';

/** The four test outcomes — the data-schema contract's union, verbatim. */
export type TestStatusType = 'passed' | 'failed' | 'skipped' | 'running';

/** Every status, spelled out — exhaustiveness for the meta table. */
export const TEST_STATUS_KEYS = [
  'passed',
  'failed',
  'skipped',
  'running',
] as const satisfies readonly TestStatusType[];

/** Lucide icon NAME (kebab-case); the component resolves the component (tool precedent). */
export type TestStatusIconName = 'circle-check-big' | 'circle-x' | 'circle' | 'circle-dot';

export type TestStatusMeta = {
  tone: StatusTone;
  iconName: TestStatusIconName;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

/** status → tone + icon, one record, exhaustive by type. */
export const TEST_STATUS_META: Record<TestStatusType, TestStatusMeta> = {
  passed: { tone: 'success', iconName: 'circle-check-big', className: statusColor.success },
  failed: { tone: 'error', iconName: 'circle-x', className: statusColor.error },
  skipped: { tone: 'denied', iconName: 'circle', className: statusColor.denied },
  running: { tone: 'running', iconName: 'circle-dot', className: statusColor.running },
};

export function testStatusMeta(status: TestStatusType): TestStatusMeta {
  return TEST_STATUS_META[status];
}

/** The run summary the root takes — the upstream TestResultsSummary interface. */
export type TestSummary = {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration?: number;
};

/** TestResultsDuration's format: milliseconds under one second, seconds at/above. */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/** TestDuration's format: ALWAYS milliseconds, upstream bytes. */
export function formatTestDuration(ms: number): string {
  return `${ms}ms`;
}

/** The pass fraction as a whole-number percent; total 0 clamps to 0 (never NaN). */
export function passedPercent(summary: Pick<TestSummary, 'passed' | 'total'>): number {
  if (summary.total <= 0) return 0;
  return (summary.passed / summary.total) * 100;
}

/** TestResultsProgress's left label — "8/10 tests passed", upstream bytes. */
export function progressLabel(summary: Pick<TestSummary, 'passed' | 'total'>): string {
  return `${summary.passed}/${summary.total} tests passed`;
}

/** TestResultsProgress's right label — the percent, one decimal place dropped. */
export function progressPercentLabel(summary: Pick<TestSummary, 'passed' | 'total'>): string {
  return `${passedPercent(summary).toFixed(0)}%`;
}
