import { describe, expect, it } from 'vitest';
import {
  resolveVoiceGender,
  VOICE_ACCENTS,
  VOICE_GENDERS,
  type VoiceSelectorVoice,
  voiceAccentFlag,
  voicePreviewState,
} from '../packages/registry/src/components/ai/voice-selector.logic.ts';

/**
 * Pure logic only — the accent table, the gender fallback and the preview state
 * machine (see agent-status.test.ts's header for why rendering itself cannot live in
 * this tier). The accent table is the web original's, verbatim, so its outputs are
 * byte-parity claims — including the CASE-SENSITIVE lookup the KB documents as a
 * trap.
 */

describe('VOICE_ACCENTS (the web accent table, verbatim)', () => {
  it('carries exactly the web original\u2019s 30 lowercase keys', () => {
    expect(Object.keys(VOICE_ACCENTS)).toHaveLength(30);
    expect(Object.keys(VOICE_ACCENTS).every((k) => k === k.toLowerCase())).toBe(true);
  });

  it('maps every key to a non-empty flag', () => {
    for (const flag of Object.values(VOICE_ACCENTS)) {
      expect(flag.length).toBeGreaterThan(0);
    }
  });

  it('keeps the spot-check anchors from the KB', () => {
    expect(VOICE_ACCENTS.american).toBe('🇺🇸');
    expect(VOICE_ACCENTS.british).toBe('🇬🇧');
    expect(VOICE_ACCENTS.scottish).toBe('🏴󠁧󠁢󠁳󠁣󠁴󠁿');
    expect(VOICE_ACCENTS['south-african']).toBe('🇿🇦');
  });
});

describe('voiceAccentFlag (THE CASE-SENSITIVE LOOKUP — the KB trap)', () => {
  it('resolves exactly-lowercase keys', () => {
    expect(voiceAccentFlag('american')).toBe('🇺🇸');
    expect(voiceAccentFlag('new-zealand')).toBe('🇳🇿');
  });

  it('renders NOTHING for uppercase input — "AMERICAN" must not render 🇺🇸 (upstream byte-behavior)', () => {
    expect(voiceAccentFlag('AMERICAN')).toBeUndefined();
    expect(voiceAccentFlag('American')).toBeUndefined();
  });

  it('renders nothing for unknown accents — the web empty span, never a placeholder', () => {
    expect(voiceAccentFlag('klingon')).toBeUndefined();
  });

  it('renders nothing for a missing accent', () => {
    expect(voiceAccentFlag(undefined)).toBeUndefined();
  });
});

describe('resolveVoiceGender (fallback, never throw)', () => {
  it('resolves the four documented genders', () => {
    expect(resolveVoiceGender('male')).toBe('male');
    expect(resolveVoiceGender('female')).toBe('female');
    expect(resolveVoiceGender('transgender')).toBe('transgender');
    expect(resolveVoiceGender('non-binary')).toBe('non-binary');
    expect(VOICE_GENDERS).toHaveLength(4);
  });

  it('is case-insensitive — "Male" resolves rather than silently icon-less', () => {
    expect(resolveVoiceGender('Male')).toBe('male');
    expect(resolveVoiceGender('FEMALE')).toBe('female');
  });

  it('falls back to unknown for unrecognized input', () => {
    expect(resolveVoiceGender('robot')).toBe('unknown');
  });

  it('falls back for a missing value — which renders the default mark, upstream behavior', () => {
    expect(resolveVoiceGender(undefined)).toBe('unknown');
    expect(resolveVoiceGender('   ')).toBe('unknown');
  });
});

describe('voicePreviewState (the three-state preview control)', () => {
  it('is idle by default', () => {
    expect(voicePreviewState('alloy')).toBe('idle');
  });

  it('is playing for the previewing voice', () => {
    expect(voicePreviewState('alloy', 'alloy')).toBe('playing');
    expect(voicePreviewState('alloy', 'nova')).toBe('idle');
  });

  it('is loading for the loading voice', () => {
    expect(voicePreviewState('alloy', undefined, 'alloy')).toBe('loading');
  });

  it('loading WINS over playing — a restart requested mid-playback shows loading', () => {
    expect(voicePreviewState('alloy', 'alloy', 'alloy')).toBe('loading');
  });
});

describe('VoiceSelectorVoice (the caller-supplied shape)', () => {
  it('carries no field the component cannot display', () => {
    const voice: VoiceSelectorVoice = {
      id: 'alloy',
      name: 'Alloy',
      group: 'Professional',
      description: 'Balanced',
      gender: 'female',
      accent: 'american',
      age: '40-50',
      keywords: 'warm',
    };
    expect(Object.keys(voice)).toHaveLength(8);
  });
});
