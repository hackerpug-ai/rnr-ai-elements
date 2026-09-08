import { statusColor, type StatusTone } from '@/lib/status';

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
