/**
 * VoiceSelector — pure logic. Zero react-native imports, so the Vitest tier owns it
 * (see the header of sources.logic.ts for why component files themselves cannot load
 * under Node).
 *
 * The web original's voice set comes from the browser TTS API; the PRD verdict
 * (port-adapted) says the available voice set comes from the NATIVE speech synthesis
 * provider — so the list is caller-supplied here and this file holds what the
 * component derives from it: the accent→flag table, the gender fallback, and the
 * preview-button state machine.
 */

/** One voice the caller offers (native TTS provider, ElevenLabs roster, …). */
export type VoiceSelectorVoice = {
  id: string;
  name: string;
  /** Section heading — the web's VoiceSelectorGroup heading, caller-defined. */
  group?: string;
  description?: string;
  /** 'male' | 'female' | 'transgender' | 'non-binary' — anything else falls back, never throws. */
  gender?: string;
  /** One of the VOICE_ACCENTS keys, CASE-SENSITIVE (upstream byte-behavior). */
  accent?: string;
  /** Free text, e.g. "40-50". */
  age?: string;
  /** Extra filter terms beyond name, accent, age and description. */
  keywords?: string;
};

/**
 * The web original's accent table, verbatim: 30 lowercase keys, each to a flag
 * emoji. THE LOOKUP IS CASE-SENSITIVE — upstream renders nothing for "AMERICAN"
 * (the KB's documented trap), and the port preserves that byte-behavior rather than
 * silently normalizing data the caller can normalize themselves. Android flag-glyph
 * coverage varies (KB port advice); the accent is ALSO carried into the filter
 * keywords, so the text channel is never lost.
 */
export const VOICE_ACCENTS = {
  american: '🇺🇸',
  british: '🇬🇧',
  australian: '🇦🇺',
  canadian: '🇨🇦',
  irish: '🇮🇪',
  scottish: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  indian: '🇮🇳',
  'south-african': '🇿🇦',
  'new-zealand': '🇳🇿',
  spanish: '🇪🇸',
  french: '🇫🇷',
  german: '🇩🇪',
  italian: '🇮🇹',
  portuguese: '🇵🇹',
  brazilian: '🇧🇷',
  mexican: '🇲🇽',
  argentinian: '🇦🇷',
  japanese: '🇯🇵',
  chinese: '🇨🇳',
  korean: '🇰🇷',
  russian: '🇷🇺',
  arabic: '🇸🇦',
  dutch: '🇳🇱',
  swedish: '🇸🇪',
  norwegian: '🇳🇴',
  danish: '🇩🇰',
  finnish: '🇫🇮',
  polish: '🇵🇱',
  turkish: '🇹🇷',
  greek: '🇬🇷',
} as const;

export type VoiceAccent = keyof typeof VOICE_ACCENTS;

/**
 * The flag for `accent`, or undefined when it is unknown or not exactly lowercase —
 * "AMERICAN" renders NOTHING, by upstream behavior. Callers render nothing for
 * undefined, which is the web's empty span.
 */
export function voiceAccentFlag(accent: string | undefined): string | undefined {
  if (!accent) return undefined;
  return (VOICE_ACCENTS as Record<string, string | undefined>)[accent];
}

export const VOICE_GENDERS = ['male', 'female', 'transgender', 'non-binary'] as const;

export type VoiceGender = (typeof VOICE_GENDERS)[number] | 'unknown';

/**
 * The gender key for the icon lookup. UNKNOWN VALUES FALL BACK, NEVER THROW (the
 * KB's documented gender behavior) — and unlike the accent table, the match is
 * case-INSENSITIVE: the web documents graceful fallback for gender with no
 * case-sensitivity language, so "Male" resolves instead of silently icon-less.
 * undefined and unrecognized inputs return 'unknown', which renders the default mark.
 */
export function resolveVoiceGender(gender: string | undefined): VoiceGender {
  const key = gender?.trim().toLowerCase();
  return (VOICE_GENDERS as readonly string[]).includes(key ?? '')
    ? (key as Exclude<VoiceGender, 'unknown'>)
    : 'unknown';
}

export type VoicePreviewState = 'idle' | 'playing' | 'loading';

/**
 * The preview button's state for one voice: loading wins over playing (a restart
 * requested mid-playback shows loading), playing needs previewingId === voiceId, and
 * everything else is idle. Loading is disabled; playing shows the pause mark.
 */
export function voicePreviewState(
  voiceId: string,
  previewingId?: string,
  previewLoadingId?: string,
): VoicePreviewState {
  if (previewLoadingId && previewLoadingId === voiceId) return 'loading';
  if (previewingId && previewingId === voiceId) return 'playing';
  return 'idle';
}
