# ORI-AI-002 — cycle 8 (2026-09-24, reviewer half-repair finding at 79e4f06d)

The reviewer proved finding 2 only half-repaired: the 'identifier you
provided' / 'with identifier' ANSWER_LEAD alternatives false-pass on marker-
acknowledgment answers of turns whose PROMPTS contained the marker (uniwind
stayed 5->5 / 42->30 under a disconnected-recall negative), while uniwind-ios's
GENUINE follow-up recall failed the ENGINE_TAG because the marker wraps so the
tag continues past the 'ORI-' break ('RN-004:0RI-…').

## Applied: the reviewer's exact proven oracle, verbatim

Both live-example-proof.ts (~2333) and live-example-proof.test.ts (~333):

- ANSWER_LEAD = /(gave|give) me the marker|asked me to remember|marker (you|vou)
  (gave|aave)/i  — identifier variants dropped.
- ENGINE_TAG = /OR[I1l|][^\w]{0,2}RN|\bRN[-:]?\d/i  — wrap-tolerant.

## Discrimination proof ON DISK (the cycle-7 gap, conceded)

`discrimination-proof.txt` + the runnable `../oracle-discrimination-proof.py`
against the COMMITTED native streams:

- POSITIVE: uniwind-ios 1 (its single hit IS the genuine 13:16:03 follow-up
  recall, 'You asked me to remember the marker ORI-' + wrapped 'RN-004:…'
  continuation), uniwind-android 12, nativewind-ios 23, nativewind-android 17.
- NEGATIVE (disconnected recall — every follow-up-answer phrasing stripped
  from all samples, everything else untouched): ALL FOUR drop to 0.
- verdict: DISCRIMINATING. Matches the reviewer's proven numbers exactly.

Also conceded: the cycle-7 claim that a same-line-only draft "genuinely
failed" was documented nowhere and is withdrawn — the on-disk proof in this
cycle replaces it.

## Gates

vitest 4/4 against the committed accumulated set (green/vitest-green.txt),
typecheck clean (green/typecheck.txt), scoped biome clean (green/biome.txt).
No engine re-runs — the oracle change re-derives from the committed streams.
