# ORI-AI-002 — cycle 7 remediation (2026-09-24, reviewer NEEDS_FIXES at 394670d7)

Both in-scope findings repaired in the allowlisted runner + suite; NO engine
re-runs needed — the corrected oracles re-derive from the committed native
streams and now actually discriminate. Gates: vitest 4/4 (vitest-green.txt),
typecheck clean (typecheck.txt), scoped biome clean (biome.txt).

## Finding 1 — latest_user_message_nonce_occurrences was vacuous by construction

The follow-up-bubble lookup used startsWith('For request') — the WEB session's
prompt wording. The native drivers send "What marker did I ask you to
remember?" (uniwind) / "What marker did I give you?" (nativewind); their
bubbles never matched, so the count was always 0 without observing anything.

Fix: the native synthesis and the suite both now locate the drivers' literal
"What marker …" bubble in the OBSERVED sample texts (present in all four
committed native streams: 1/18/24/24 hits) and count first-nonce occurrences
in its visible text — an observation that would fail if the nonce were
repeated into the visible bubble.

## Finding 2 — the recall fallback was non-discriminating (bare marker lines)

Every marker rendering in the native OCR streams is a wrapped ~36-char LINE:
the nonce sits on its own line whether it comes from the turn-1 user bubble,
the seed prompt, or the follow-up answer, so any marker-line match (including
the reviewer-flagged uniwind-ios degenerate anchor case) proves nothing. A
length-based answer-shape predicate also finds nothing — line-fragment OCR
never yields marker+context on one line, and inline marker text is OCR-mangled
("0RI-AI", "vou aave").

Fix: an ANSWER-LEAD adjacency oracle, in both the synthesizer and the suite's
re-derivation over the committed streams: a declarative answer phrasing OCR
renders reliably ("gave me the marker", "asked me to remember",
"identifier you provided", "with identifier") with an OCR-tolerant
engine-tagged marker fragment (OR[I1l|]…RN) on the same or an adjacent OCR
line. The user prompt's imperative "Remember the marker" never matches. All
four committed native streams carry real answer text through this oracle
(e.g. uniwind-ios: "ORI-RN-004 with identifier ORI-" + "…is acknowledged";
nativewind-ios: "The identifier you provided is \"ORI-" + adjacent
"RN-005:0RI-AI-002-…"). Verified discriminating: the first same-line-only
draft failed against uniwind-ios — the oracle genuinely reads the evidence.

## Also per the review — prior_exchange_count de-constant-ed

Derived from the session's own records: generation-0 completed conversational
turns minus the latest (the committed sessions' records yield 2; a session
that completed fewer turns reports fewer). The hardcoded 2 is gone.

## What did NOT change

The committed per-engine evidence sets (uniwind ORI-AI-002-1790254489381,
nativewind ORI-AI-002-1790256894249) are untouched — the oracles re-derive
from them. The synthesizer changes affect future runs' result.json only.
