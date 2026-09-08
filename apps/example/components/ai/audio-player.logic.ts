export function formatPlaybackTime(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const ss = String(seconds).padStart(2, '0');
  if (hours === 0) return `${minutes}:${ss}`;
  return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
}

/**
 * The target the seek buttons land on: position + delta, clamped into [0, duration]
 * exactly as media-chrome clamps a seek past either end. Without a known duration the
 * forward clamp is unbounded — a live stream has no end to clamp to, and inventing one
 * would be the lie. No-throw on garbage input: both anchors fall back to 0.
 */
export function seekTarget(positionMs: number, deltaMs: number, durationMs?: number): number {
  const from = Number.isFinite(positionMs) ? Math.max(0, positionMs) : 0;
  const delta = Number.isFinite(deltaMs) ? deltaMs : 0;
  const target = from + delta;
  if (durationMs === undefined || !Number.isFinite(durationMs)) return Math.max(0, target);
  return Math.min(Math.max(0, target), Math.max(0, durationMs));
}

/**
 * The scrubber's normalized value for the slider atom — the wave-4 slider value
 * contract is 0..1, and playback progress is where that contract earns its keep.
 * No duration (0, negative, NaN) means nothing has loaded: progress 0, never NaN —
 * a NaN width/percent renders as nothing with no error.
 */
export function playbackProgress(positionMs: number, durationMs: number): number {
  if (!Number.isFinite(positionMs) || !Number.isFinite(durationMs) || durationMs <= 0) return 0;
  const pct = positionMs / durationMs;
  return Math.min(1, Math.max(0, pct));
}

/** Volume lives in 0..1; callers report engine sliders and OS faders — clamp, no-throw. */
export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0;
  return Math.min(1, Math.max(0, volume));
}
