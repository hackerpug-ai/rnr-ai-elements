/**
 * AudioPlayer — pure logic. Zero react-native imports, so the Vitest tier owns it (see
 * the header of sources.logic.ts for why component files themselves cannot load under
 * Node).
 *
 * THE PRD VERDICT IS NATIVE-SUBSTITUTE: "Built on the HTML audio element. Replaced by a
 * native audio module; transport controls and progress bar keep the same product
 * surface." The substitution lands in the CONTRACT, not in a dependency — the audio
 * module is the CALLER'S (expo-audio, a native player, a howler on web), the component
 * renders transport controls and progress over state the caller reports back. That is
 * the speech-input precedent (its verdict also demanded native modules; the port ships
 * the caller seam), and unlike web-preview — whose verdict explicitly prescribed
 * react-native-webview as a shipped peer dependency — nothing here names a module, so
 * nothing here is a STOP.
 *
 * Time units are MILLISECONDS at this component's surface (the RN-native clock the
 * caller's engine reports), and SECONDS only inside seekOffsetMs naming and the
 * upstream part names (seekOffset 10, currentTime). The conversions live here so the
 * component and its tests share one arithmetic.
 */

/**
 * The transport clock: m:ss under an hour, h:mm:ss past it — the media element's own
 * display convention the web original renders via media-chrome's time displays.
 * Minutes are unpadded ("0:05", never "00:05"); seconds and minutes past the hour are
 * padded. Garbage in, "0:00" out — a missing duration must never render as NaN.
 */
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
