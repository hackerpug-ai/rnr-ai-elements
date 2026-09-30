# GBC-005 changelog git-log reconciliation (GBC-006 review evidence)

Recorded 2026-09-29 in the GBC-006 worktree at trunk fdac4bae. Every
`git log` below ran as `/usr/bin/git` (rtk's git truncates at 50 lines and the
v0.1.0 history is 64 non-merge commits — a truncated log would wrongly
conclude the citation is wrong). Each changelog entry carries an HTML comment
naming its deriving commit range; this record checks every entry body bullet
against the real commits in that range.

## Entry 0.1.0 — cited range: `git log v0.1.0` (5f13ec4a init-project through the v0.1.0 tag)

Range shape: 64 non-merge commits, first 5f13ec4a `chore: init-project`, last
under the tag per `git log v0.1.0 --no-merges`. The tracked
packages/registry/registry.json at tag v0.1.0 carries exactly 56 items.

| Entry body claim | Commits in range |
| --- | --- |
| The complete 56-item registry, installable through the RNR CLI by absolute HTTPS item URL, in both engine trees | The whole 64-commit range is the registry's construction; verified directly: `git show v0.1.0:packages/registry/registry.json` → 56 items; CLI-URL install exercised by 0242d041 (alias verdict, CLI rewrites all three shapes), b76177e3 (zero-@/registry contract) |
| The worked integration example apps/example, Expo SDK 57 consumer, walking-skeleton set installed through the real RNR CLI | ed8dbda0 `TASK-F1: scaffold apps/example as a genuine Expo SDK 57 consumer app`; cac5ced6 `TASK-F3: install the walking-skeleton item set into apps/example via the real RNR CLI from the pinned v0.1.0 tag` |
| Self-referencing URLs pin to the release tag through the {version} token | 9b21e1b5 `TASK-F2: pin registry self-URLs to the v0.1.0 tag via the {version} token` |

Verdict: reconciles. No body bullet lacks a commit in the cited range.

## Entry 0.2.0 — cited range: `git log v0.1.0..v0.2.0` (18 non-merge commits)

| Entry body claim | Commit(s) in range |
| --- | --- |
| `meta.permissions` mined from real imports, verified both directions; prompt-input declares photo-library + camera keys | f59ed6c6 `feat(registry): meta.permissions mined from imports, verified both directions` |
| Engine parity proof in CI (same file set, byte-identical after the engine token) | 6b1a90f4 `test(registry): engine parity proof — both trees differ only by the engine token` |
| Declared-dependencies gate (imports equal declarations, both directions) | 4f200f1a `test(registry): declared deps must match imports, both directions (+4 fixes)` |
| Web-only-construct checks wired into CI through `check:contract` | 1b131cb0 `feat(contract): web-only-construct checks + wire check:contract into CI` |
| Seven items polished; prompt-input web parity | 5ed750b1 `feat(registry): polish shipped component set + harness storybook-web wiring` |
| Dependency declarations match imports on every item (speech-input/voice-selector reanimated; item/sheet class-variance-authority; terminal drops unused; prompt-input declares pickers) | 42fe0605 `fix(registry): real check:tokens gate + declare the two undeclared native imports`; 4f200f1a `(+4 fixes)` |
| Self-referencing URLs pin to the v0.2.0 tag; manifest keeps the {version} token | 5f59a131 `chore(release): v0.2.0 — registry repoints self-referencing URLs` |
| Fixed: `check:tokens` declared with no script; `check:contract` never invoked; both now real CI scanners with documented raw-color exceptions | 42fe0605 (`real check:tokens gate`); 1b131cb0 (`wire check:contract into CI`) |

Verdict: reconciles. Every Added/Changed/Fixed bullet maps to at least one
commit inside v0.1.0..v0.2.0.

## Entry 0.2.1 — cited range: `git log v0.2.0..v0.2.1` (4 non-merge commits)

Commits: 32634b4c (biome style for the import scan), 0a899ada
`fix(registry): ship every sibling file an item imports — v0.2.1`, 2499d4ff
`fix(example): installed icon.tsx doc comment shows the consumer alias`,
ad2267d5 `feat(example): install the full 56-item set through the real RNR CLI`.

| Entry body claim | Commit(s) in range |
| --- | --- |
| Six items shipped without the sibling files their sources import; prompt-input now ships prompt-input.logic + attachments.logic, agent ships persona, plan ships task.logic, model-selector/mic-selector/voice-selector ship command.logic | 0a899ada; verified against the emitted registry: `git show v0.2.0:public/r/uniwind/prompt-input.json` lists only `prompt-input.tsx` (siblings absent) and v0.2.1 lists all three; `agent.json` at v0.2.0 has no persona, v0.2.1 has `persona.tsx` |
| The example app installs the full 56-item set, replacing the walking skeleton | ad2267d5 |
| Installed icon.tsx comment pointed at a registry-internal path; now shows the consumer alias | 2499d4ff |

Verdict: reconciles. The broken-tree claim is verified in both directions
(broken at v0.2.0, fixed at v0.2.1) against the emitted trees, not just the
commit messages.

## Cross-entry invariants

- Ledger count at every tag: v0.1.0 = 56, v0.2.0 = 56, v0.2.1 = 56 (read from
  the tracked registry.json at each tag) — no entry claims an item-count change
  and none occurred.
- No commit in any cited range contradicts an entry bullet; no entry bullet
  cites a commit outside its range (the three range comments match the tags
  that GBC-007's tag-sync gate enforces).
