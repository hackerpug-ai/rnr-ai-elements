import { describe, expect, it } from 'vitest';
import {
  filterRenderableSegments,
  formatSegmentTime,
  SEGMENT_STATE_CLASS,
  segmentState,
  type TranscriptionSegmentData,
} from '../packages/registry/src/components/ai/transcription.logic.ts';

/**
 * Pure logic only — the transcript's segment pipeline (see agent-status.test.ts's
 * header for why rendering itself cannot live in this tier). The segment type, the
 * three playback states and the state classes are the web original's, so their
 * outputs are byte-parity claims anchored to the KB's documented transcription
 * behavior — including the whitespace drop and the inclusive active range.
 */

const SEGMENTS: TranscriptionSegmentData[] = [
  { text: 'Hello', startSecond: 0, endSecond: 1.5 },
  { text: '   ', startSecond: 1.5, endSecond: 2 },
  { text: '', startSecond: 2, endSecond: 2.5 },
  { text: 'world', startSecond: 2.5, endSecond: 4 },
];

describe('filterRenderableSegments (the KB whitespace drop, byte-behavior)', () => {
  it('drops empty and whitespace segments — only "Hello"/"world" remain', () => {
    const kept = filterRenderableSegments(SEGMENTS);
    expect(kept.map((s) => s.text)).toEqual(['Hello', 'world']);
  });

  it('runs BEFORE indexing — the render-prop index counts what renders', () => {
    const kept = filterRenderableSegments(SEGMENTS);
    expect(kept[1]).toMatchObject({ text: 'world', startSecond: 2.5 });
  });

  it('keeps interior whitespace — "  hi  " is real text, not a drop', () => {
    expect(
      filterRenderableSegments([{ text: '  hi  ', startSecond: 0, endSecond: 1 }]),
    ).toHaveLength(1);
  });

  it('drops a malformed non-string text instead of throwing', () => {
    const malformed = [
      { text: 42, startSecond: 0, endSecond: 1 },
    ] as unknown as TranscriptionSegmentData[];
    expect(filterRenderableSegments(malformed)).toEqual([]);
  });

  it('an empty transcript filters to empty', () => {
    expect(filterRenderableSegments([])).toEqual([]);
  });
});

describe('segmentState (the three playback states, inclusive active range)', () => {
  const segment = { startSecond: 10, endSecond: 20 };

  it('is future strictly before startSecond', () => {
    expect(segmentState(segment, 9.9)).toBe('future');
  });

  it('is active AT startSecond — the range is inclusive at both ends (KB byte-behavior)', () => {
    expect(segmentState(segment, 10)).toBe('active');
    expect(segmentState(segment, 15)).toBe('active');
    expect(segmentState(segment, 20)).toBe('active');
  });

  it('is past strictly after endSecond', () => {
    expect(segmentState(segment, 20.1)).toBe('past');
  });

  it('defaults garbage currentTime to 0 — the web root\u2019s own default', () => {
    expect(segmentState({ startSecond: 0, endSecond: 5 }, Number.NaN)).toBe('active');
    expect(segmentState({ startSecond: 1, endSecond: 5 }, Number.NaN)).toBe('future');
  });

  it('a transcript at rest with a 0-start first segment shows it active', () => {
    expect(segmentState(SEGMENTS[0], 0)).toBe('active');
  });
});

describe('SEGMENT_STATE_CLASS (the web original\u2019s classes, byte-for-byte)', () => {
  it('active is text-primary', () => {
    expect(SEGMENT_STATE_CLASS.active).toBe('text-primary');
  });

  it('past is text-muted-foreground', () => {
    expect(SEGMENT_STATE_CLASS.past).toBe('text-muted-foreground');
  });

  it('future is text-muted-foreground/60', () => {
    expect(SEGMENT_STATE_CLASS.future).toBe('text-muted-foreground/60');
  });

  it('carries exactly the three upstream states', () => {
    expect(Object.keys(SEGMENT_STATE_CLASS).sort()).toEqual(['active', 'future', 'past']);
  });
});

describe('formatSegmentTime (the custom-children timestamp clock)', () => {
  it('renders m:ss — 0 → "0:00", 65 → "1:05"', () => {
    expect(formatSegmentTime(0)).toBe('0:00');
    expect(formatSegmentTime(65)).toBe('1:05');
  });

  it('floors fractional seconds — 1.9s is "0:01"', () => {
    expect(formatSegmentTime(1.9)).toBe('0:01');
  });

  it('crosses the hour — 3754s is "1:02:34"', () => {
    expect(formatSegmentTime(3754)).toBe('1:02:34');
  });

  it('garbage renders as 0:00, never NaN', () => {
    expect(formatSegmentTime(-3)).toBe('0:00');
    expect(formatSegmentTime(Number.NaN)).toBe('0:00');
  });
});

describe('TranscriptionSegmentData (the upstream shape, field for field)', () => {
  it('carries exactly text, startSecond and endSecond — no invented fields', () => {
    const segment: TranscriptionSegmentData = { text: 'hi', startSecond: 0, endSecond: 1 };
    expect(Object.keys(segment)).toEqual(['text', 'startSecond', 'endSecond']);
  });
});
