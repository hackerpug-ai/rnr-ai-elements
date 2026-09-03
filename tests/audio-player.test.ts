import { describe, expect, it } from 'vitest';
import {
  clampVolume,
  formatPlaybackTime,
  playbackProgress,
  seekTarget,
} from '../packages/registry/src/components/ai/audio-player.logic.ts';

/**
 * Pure logic only — the transport arithmetic the component renders (see
 * agent-status.test.ts's header for why rendering itself cannot live in this tier).
 * The PRD verdict is native-substitute: the HTML audio element is replaced by the
 * CALLER'S audio module, and this file is the whole of what the registry owns of
 * playback math — so every clamp and format here is a byte-contract, tested.
 */

describe('formatPlaybackTime (the m:ss / h:mm:ss transport clock)', () => {
  it('renders zero as 0:00', () => {
    expect(formatPlaybackTime(0)).toBe('0:00');
  });

  it('pads seconds, not minutes — 5s is "0:05", never "00:05"', () => {
    expect(formatPlaybackTime(5_000)).toBe('0:05');
  });

  it('crosses the minute — 65s is "1:05"', () => {
    expect(formatPlaybackTime(65_000)).toBe('1:05');
  });

  it('double-digit minutes stay unpadded — 600s is "10:00"', () => {
    expect(formatPlaybackTime(600_000)).toBe('10:00');
  });

  it('crosses the hour into h:mm:ss — 3661s is "1:01:01"', () => {
    expect(formatPlaybackTime(3_661_000)).toBe('1:01:01');
  });

  it('floors sub-second remainders — 65.9s never rounds up', () => {
    expect(formatPlaybackTime(65_900)).toBe('1:05');
  });

  it('garbage renders as 0:00 — a missing duration is never NaN on screen', () => {
    expect(formatPlaybackTime(-1)).toBe('0:00');
    expect(formatPlaybackTime(Number.NaN)).toBe('0:00');
    expect(formatPlaybackTime(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});

describe('seekTarget (the ±seekOffset clamp, media-chrome behavior)', () => {
  it('moves by the offset from the current position', () => {
    expect(seekTarget(30_000, 10_000)).toBe(40_000);
    expect(seekTarget(30_000, -10_000)).toBe(20_000);
  });

  it('clamps into [0, duration] — a seek past either end lands on the end', () => {
    expect(seekTarget(95_000, 10_000, 100_000)).toBe(100_000);
    expect(seekTarget(5_000, -10_000, 100_000)).toBe(0);
  });

  it('accepts the exact boundaries — landing ON 0 and ON duration is legal', () => {
    expect(seekTarget(10_000, -10_000, 100_000)).toBe(0);
    expect(seekTarget(90_000, 10_000, 100_000)).toBe(100_000);
  });

  it('without a duration the forward clamp is unbounded — a live stream has no end', () => {
    expect(seekTarget(30_000, 10_000)).toBe(40_000);
    expect(seekTarget(30_000, 10_000, undefined)).toBe(40_000);
  });

  it('the backward clamp to 0 still applies without a duration', () => {
    expect(seekTarget(5_000, -10_000)).toBe(0);
  });

  it('no-throw on garbage — NaN anchors fall back to 0', () => {
    expect(seekTarget(Number.NaN, 10_000)).toBe(10_000);
    expect(seekTarget(30_000, Number.NaN)).toBe(30_000);
    expect(seekTarget(Number.NaN, Number.NaN, Number.NaN)).toBe(0);
  });
});

describe('playbackProgress (the slider atom\u2019s 0..1 value contract)', () => {
  it('normalizes position into 0..1', () => {
    expect(playbackProgress(0, 100_000)).toBe(0);
    expect(playbackProgress(50_000, 100_000)).toBe(0.5);
    expect(playbackProgress(100_000, 100_000)).toBe(1);
  });

  it('clamps a position that overshoots the duration — engines report late frames', () => {
    expect(playbackProgress(120_000, 100_000)).toBe(1);
    expect(playbackProgress(-5_000, 100_000)).toBe(0);
  });

  it('no duration means nothing loaded: 0, never NaN', () => {
    expect(playbackProgress(50_000, 0)).toBe(0);
    expect(playbackProgress(50_000, -1)).toBe(0);
    expect(playbackProgress(50_000, Number.NaN)).toBe(0);
    expect(playbackProgress(Number.NaN, 100_000)).toBe(0);
  });
});

describe('clampVolume (the volume seam\u2019s bounds)', () => {
  it('keeps in-range values', () => {
    expect(clampVolume(0)).toBe(0);
    expect(clampVolume(0.5)).toBe(0.5);
    expect(clampVolume(1)).toBe(1);
  });

  it('clamps overshoot and undershoot', () => {
    expect(clampVolume(1.5)).toBe(1);
    expect(clampVolume(-0.5)).toBe(0);
  });

  it('falls back to 0 on NaN — muted-silent, never NaN', () => {
    expect(clampVolume(Number.NaN)).toBe(0);
  });
});
