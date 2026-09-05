# TASK-F7: Declare and record the consumer @theme obligation the installed items silently require

> Task ID: TASK-F7  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `frontend-designer`  
> Points: 3  
> Type: FEATURE  
> Wave: D  
> Status: ⬜ Pending  
> Proposed By: `frontend-designer`  
> Depends On: TASK-F3

## Outcome



## Critical Constraints

- NO DISTRIBUTION DECISION. Registry `cssVars` vs a documented install prerequisite vs converting the escape colors back to RNR roles is sprint-03's call, and it needs the flip evidence. Writing a preferred fix into the record as settled is the failure mode.
- NO SAFELIST CRUTCH. `apps/example` must contain no `class-safelist.tsx` or equivalent. If the badge only goes green with one, that IS the finding: record it and escalate to a registry change (making the class a JSX literal at its point of use), which is write_prohibited here.
- DERIVE, DO NOT TRANSCRIBE. The declared set comes from AC-1's derivation over the installed tree, never from reading a comment. This constraint exists because a human transcribing `apps/harness/src/global.css:28-34` counted three classes where `status.ts:30` writes four, and `--color-orange-500` has been missing ever since — invisible because a missing color looks like a color.
- VALUES ARE TRANSCRIBED, NEVER INVENTED. Every `--color-*` value is copied from the installed `tailwindcss` package's `theme.css`. A hand-picked hex here is the literal the token strategy forbids, smuggled in through the consumer's file.
- UNIT_TEST_JUSTIFIED (AC-2 only): see the field on that AC.
- SEQUENCING: this task's edit lands in wave D; the device consequence is observed by TASK-F8 AC-6 in wave G. AC-1 is deliberately independent of that timing so this task can be verified when it is done rather than waiting on the flow.

## Acceptance Criteria

### AC-1 — PRIMARY: every palette class the installed tree references is declared in the consumer's own theme

**GIVEN** the `apps/example` tree exactly as the real RNR CLI wrote it in gate step 2, including the installed `lib/status.ts` and `tool.logic.ts`  
**WHEN** the referenced-class set is derived mechanically from the installed sources and subtracted from the declared set in the consumer's theme  
**THEN** the difference is empty, at least 8 distinct palette classes were actually found, and `find apps/example -iname '*safelist*'` returns 0 files

- FLOW_REF: `—`
- TEST_TIER: `integration`
- TEST_FILE: `—`  ·  TEST_FUNCTION: `—`
- VERIFY: `comm -23 <(grep -rhoE '(dark:)?(text|bg|border)-(zinc|slate|gray|green|orange|yellow|blue|red)-[0-9]{2,3}' apps/example/components apps/example/lib | sed -E 's/^dark://; s/^(text|bg|border)-/--color-/' | sort -u) <(grep -oE -- '--color-[a-z]+-[0-9]+' apps/example/global.css | sort -u)`
- VERIFICATION_SERVICE: the real `apps/example` consumer tree written by `npx @react-native-reusables/cli@latest add` against the v0.1.0 tag — a real artifact from a real resolver, not a synthetic input
- SURFACE_POLICY: `—`

<details><summary>Scenario <code>SC-F7-1</code></summary>

```json
{
  "id": "SC-F7-1",
  "primary": true,
  "tier": "visible",
  "test_tier": "integration",
  "verification_service": "the real `apps/example` consumer tree written by the RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "`--color-orange-500` were left undeclared while `lib/status.ts` still writes `dark:text-orange-500` \u2014 this is not hypothetical, it is the live defect this check was built to catch, and it survived in `apps/harness` because a human transcribed three classes from a comment that names four",
      "the obligation were transcribed by hand from a comment instead of derived from the installed source \u2014 the exact failure mode that produced the orange-500 gap in the first place",
      "a `class-safelist.tsx` were copied into `apps/example` to force classes to compile, which would make the derivation meaningless by giving every class a second home",
      "the derivation were run against `packages/registry/src` instead of the installed consumer tree, which would silently re-measure the monorepo rather than the consumer",
      "the class-name regex were narrowed to the colors already known to be declared, which would make the check tautological"
    ]
  },
  "evidence": {
    "artifact_type": "stdout",
    "required_capture": true,
    "path": "design/style-parity-remediation.md"
  },
  "cases": [
    {
      "start_ref": "installed-consumer-tree",
      "action": {
        "actor": "designer",
        "steps": [
          "run the referenced-class derivation over `apps/example/components` and `apps/example/lib` and count the distinct results",
          "run `comm -23` of the referenced set against the `--color-*` entries declared in `apps/example/global.css`",
          "run `find apps/example -iname '*safelist*' | wc -l`",
          "paste all three outputs verbatim into the obligation section of `design/style-parity-remediation.md`"
        ]
      },
      "end_state": {
        "must_observe": [
          "at least `8` distinct palette classes found in the installed tree \u2014 the non-empty anchor, expected to be exactly the 8 written by `lib/status.ts` and `tool.logic.ts`: green-500, green-600, orange-500, orange-600, yellow-400, yellow-600, blue-400, blue-600",
          "`0` lines of `comm -23` output \u2014 every referenced class has a matching declaration",
          "`0` files matching `*safelist*` under `apps/example`",
          "`--color-orange-500` present among the declared entries, with an inline comment naming `lib/status.ts` denied-in-dark as its requirer"
        ],
        "must_not_observe": [
          "`0` palette classes found \u2014 the empty-tree signature, which makes an empty `comm` result meaningless and is exactly what this check would print against a scaffold with nothing installed",
          "any line of `comm -23` output, each of which is a class that renders colorless with no error",
          "any file matching `*safelist*` under `apps/example`",
          "a declared set larger than the referenced set by the 17 entries only the other 51 items need \u2014 over-declaring hides which item requires what and makes sprint-02's per-item table underivable"
        ]
      }
    }
  ]
}
```
</details>

### AC-2: the record matches what the app declares and carries the three escalations

**GIVEN** the declared slice written under AC-1  
**WHEN** the table's entry set is diffed against the theme file's entry set  
**THEN** the diff is empty and the three escalation subsections are present with their reproducing commands

- FLOW_REF: `—`
- TEST_TIER: `unit` — *Pure textual consistency between two files this task owns, zero I/O beyond reading them, asserting no product behavior. All product behavior for this task is asserted at integration tier by AC-1 over the real installed tree and at e2e tier by TASK-F8 AC-6 on real devices. A hand-typed obligation list drifting from what the app declares is the specific failure this catches, and it needs no runtime.*
- TEST_FILE: `—`  ·  TEST_FUNCTION: `—`
- VERIFY: `diff <(grep -oE -- '--color-[a-z]+-[0-9]+' apps/example/global.css | sort -u) <(sed -n '/OBLIGATION-TABLE-SPRINT-01-START/,/OBLIGATION-TABLE-SPRINT-01-END/p' design/style-parity-remediation.md | grep -oE -- '--color-[a-z]+-[0-9]+' | sort -u)`
- VERIFICATION_SERVICE: —
- SURFACE_POLICY: `—`

<details><summary>Scenario <code>SC-F7-2</code></summary>

```json
{
  "id": "SC-F7-2",
  "primary": false,
  "tier": "visible",
  "test_tier": "unit",
  "verification_service": "the two files this task owns, read from disk",
  "negative_control": {
    "would_fail_if": [
      "a var were added to `apps/example/global.css` without a matching table row, or a row survived its var's removal \u2014 the diff goes non-empty and the command exits 1",
      "the table were hand-typed from the harness's 26 rather than derived from AC-1's output, which is the transcription failure that produced the orange-500 gap",
      "a preferred distribution fix were written into the record as settled \u2014 registry `cssVars` versus an install prerequisite versus converting the escape colors to RNR roles is sprint-03's decision and this task is bound not to pre-empt it"
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true,
    "path": "design/style-parity-remediation.md"
  },
  "cases": [
    {
      "start_ref": "consumer-theme-slice",
      "action": {
        "actor": "designer",
        "steps": [
          "run the diff of the declared entries against the OBLIGATION-TABLE-SPRINT-01 block",
          "read the three escalation subsections and confirm each carries a command a reviewer can re-run"
        ]
      },
      "end_state": {
        "must_observe": [
          "an empty diff and exit code `0`",
          "`8` table rows, each naming both the item (`tool`) and the module (`lib/status.ts` or `tool.logic.ts`) that requires it",
          "a FULL-SET subsection recording all `26` entries as sprint-02's inheritance, marked as NOT declared in this app",
          "an escalation naming `apps/harness/src/global.css:28-34` \u2014 the comment enumerates three classes while `packages/registry/src/lib/status.ts:30` writes four, so `--color-orange-500` was never transcribed and a denied tool status has rendered colorless in dark mode in our own harness",
          "an escalation carrying the literal command `grep -c class-safelist public/r/uniwind/file-tree.json public/r/uniwind/transcription.json` and its output `1` for each, showing the harness-path instruction ships into consumer trees"
        ],
        "must_not_observe": [
          "an empty table, a placeholder row, or a `TODO`",
          "a table listing all 26 entries as though this app required them",
          "any sentence choosing among the three distribution options",
          "an escalation stated as prose with no reproducing command \u2014 an unreproducible finding is a rumor"
        ]
      }
    }
  ]
}
```
</details>


## Test Criteria

| ID | Maps to | Assertion |
|---|---|---|
| TC-1 | AC-1 | No palette class in the installed tree is undeclared |
| TC-2 | AC-1 | No scanner-forcing file exists in the consumer |
| TC-3 | AC-2 | The record matches what the app declares |

## Guardrails

**WRITE-ALLOWED**
- `apps/example/global.css`
- `design/style-parity-remediation.md`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `.github/workflows/**`
- `apps/example/**/*safelist*`

## Boundary Contracts

- CEDED to TASK-F8: the measured chroma/hue assertion and the mutated-theme negative control. F8 AC-6 owns both, with `--mutate-theme green-600` exiting 1 and both numbers persisted to `design/goldens/sprint-01/install/core-happy-path.json`. This task no longer asserts them.
- ACCEPTED from TASK-F8: its narrow `apps/example/global.css` write for the mutation, with trap-restore. Correct call — the mutation must edit the real consumer theme or it proves nothing. Two conditions: the restore must be verified byte-identical after the run, and F8 must not use that write for anything except the mutation, or wave-D/wave-G ownership of this file becomes genuinely ambiguous.
- CONSUMES from TASK-F3: an `apps/example` tree written by the real CLI. If any file was hand-placed, AC-1's derivation measures a fiction.
- SHARES `apps/example/global.css` with TASK-F1, which creates it with RNR's real theme. This task appends the palette slice only and must not alter F1's role tokens — sprint-03's flip depends on that starting state being RNR's real one.

## Fixtures

- **`installed-consumer-tree`** (cli) — The `apps/example` tree exactly as the real RNR CLI wrote it in gate step 2 — five AI Elements items plus RNR's own text/avatar/button/icon/popover from the v0.1.0 tag, including the installed `lib/status.ts` and `tool.logic.ts` that carry every palette class AC-1 derives.
- **`consumer-theme-slice`** (cli) — The palette block this task appends to `apps/example/global.css`: the 8 `--color-*` entries the installed set requires, values transcribed from the installed tailwindcss `theme.css`, each with an inline comment naming the item and module requiring it.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F7",
  "task_type": "FEATURE",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "installed-consumer-tree": {
      "description": "The `apps/example` tree exactly as the real RNR CLI wrote it in gate step 2 \u2014 five AI Elements items plus RNR's own text/avatar/button/icon/popover from the v0.1.0 tag, including the installed `lib/status.ts` and `tool.logic.ts` that carry every palette class AC-1 derives.",
      "seeded_through": "REAL entrypoint \u2014 `npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/{conversation,message,prompt-input,tool,context}.json`. No hand-placed file, no workspace import, no metro alias.",
      "produced_by": "TASK-F3",
      "seed_method": "cli"
    },
    "consumer-theme-slice": {
      "description": "The palette block this task appends to `apps/example/global.css`: the 8 `--color-*` entries the installed set requires, values transcribed from the installed tailwindcss `theme.css`, each with an inline comment naming the item and module requiring it.",
      "seeded_through": "REAL entrypoint \u2014 compiled by the consumer's own Uniwind/Tailwind v4 build during `npx expo run:ios` / `run:android`.",
      "produced_by": "TASK-F7",
      "seed_method": "cli"
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": true,
      "flow_ref": null,
      "test_file": null,
      "test_function": null,
      "verify": "comm -23 <(grep -rhoE '(dark:)?(text|bg|border)-(zinc|slate|gray|green|orange|yellow|blue|red)-[0-9]{2,3}' apps/example/components apps/example/lib | sed -E 's/^dark://; s/^(text|bg|border)-/--color-/' | sort -u) <(grep -oE -- '--color-[a-z]+-[0-9]+' apps/example/global.css | sort -u)",
      "test_tier": "integration",
      "verification_service": "the real `apps/example` consumer tree written by `npx @react-native-reusables/cli@latest add` against the v0.1.0 tag \u2014 a real artifact from a real resolver, not a synthetic input",
      "scenario": {
        "id": "SC-F7-1",
        "primary": true,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "the real `apps/example` consumer tree written by the RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "`--color-orange-500` were left undeclared while `lib/status.ts` still writes `dark:text-orange-500` \u2014 this is not hypothetical, it is the live defect this check was built to catch, and it survived in `apps/harness` because a human transcribed three classes from a comment that names four",
            "the obligation were transcribed by hand from a comment instead of derived from the installed source \u2014 the exact failure mode that produced the orange-500 gap in the first place",
            "a `class-safelist.tsx` were copied into `apps/example` to force classes to compile, which would make the derivation meaningless by giving every class a second home",
            "the derivation were run against `packages/registry/src` instead of the installed consumer tree, which would silently re-measure the monorepo rather than the consumer",
            "the class-name regex were narrowed to the colors already known to be declared, which would make the check tautological"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true,
          "path": "design/style-parity-remediation.md"
        },
        "cases": [
          {
            "start_ref": "installed-consumer-tree",
            "action": {
              "actor": "designer",
              "steps": [
                "run the referenced-class derivation over `apps/example/components` and `apps/example/lib` and count the distinct results",
                "run `comm -23` of the referenced set against the `--color-*` entries declared in `apps/example/global.css`",
                "run `find apps/example -iname '*safelist*' | wc -l`",
                "paste all three outputs verbatim into the obligation section of `design/style-parity-remediation.md`"
              ]
            },
            "end_state": {
              "must_observe": [
                "at least `8` distinct palette classes found in the installed tree \u2014 the non-empty anchor, expected to be exactly the 8 written by `lib/status.ts` and `tool.logic.ts`: green-500, green-600, orange-500, orange-600, yellow-400, yellow-600, blue-400, blue-600",
                "`0` lines of `comm -23` output \u2014 every referenced class has a matching declaration",
                "`0` files matching `*safelist*` under `apps/example`",
                "`--color-orange-500` present among the declared entries, with an inline comment naming `lib/status.ts` denied-in-dark as its requirer"
              ],
              "must_not_observe": [
                "`0` palette classes found \u2014 the empty-tree signature, which makes an empty `comm` result meaningless and is exactly what this check would print against a scaffold with nothing installed",
                "any line of `comm -23` output, each of which is a class that renders colorless with no error",
                "any file matching `*safelist*` under `apps/example`",
                "a declared set larger than the referenced set by the 17 entries only the other 51 items need \u2014 over-declaring hides which item requires what and makes sprint-02's per-item table underivable"
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "flow_ref": null,
      "test_file": null,
      "test_function": null,
      "verify": "diff <(grep -oE -- '--color-[a-z]+-[0-9]+' apps/example/global.css | sort -u) <(sed -n '/OBLIGATION-TABLE-SPRINT-01-START/,/OBLIGATION-TABLE-SPRINT-01-END/p' design/style-parity-remediation.md | grep -oE -- '--color-[a-z]+-[0-9]+' | sort -u)",
      "test_tier": "unit",
      "scenario": {
        "id": "SC-F7-2",
        "primary": false,
        "tier": "visible",
        "test_tier": "unit",
        "verification_service": "the two files this task owns, read from disk",
        "negative_control": {
          "would_fail_if": [
            "a var were added to `apps/example/global.css` without a matching table row, or a row survived its var's removal \u2014 the diff goes non-empty and the command exits 1",
            "the table were hand-typed from the harness's 26 rather than derived from AC-1's output, which is the transcription failure that produced the orange-500 gap",
            "a preferred distribution fix were written into the record as settled \u2014 registry `cssVars` versus an install prerequisite versus converting the escape colors to RNR roles is sprint-03's decision and this task is bound not to pre-empt it"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "design/style-parity-remediation.md"
        },
        "cases": [
          {
            "start_ref": "consumer-theme-slice",
            "action": {
              "actor": "designer",
              "steps": [
                "run the diff of the declared entries against the OBLIGATION-TABLE-SPRINT-01 block",
                "read the three escalation subsections and confirm each carries a command a reviewer can re-run"
              ]
            },
            "end_state": {
              "must_observe": [
                "an empty diff and exit code `0`",
                "`8` table rows, each naming both the item (`tool`) and the module (`lib/status.ts` or `tool.logic.ts`) that requires it",
                "a FULL-SET subsection recording all `26` entries as sprint-02's inheritance, marked as NOT declared in this app",
                "an escalation naming `apps/harness/src/global.css:28-34` \u2014 the comment enumerates three classes while `packages/registry/src/lib/status.ts:30` writes four, so `--color-orange-500` was never transcribed and a denied tool status has rendered colorless in dark mode in our own harness",
                "an escalation carrying the literal command `grep -c class-safelist public/r/uniwind/file-tree.json public/r/uniwind/transcription.json` and its output `1` for each, showing the harness-path instruction ships into consumer trees"
              ],
              "must_not_observe": [
                "an empty table, a placeholder row, or a `TODO`",
                "a table listing all 26 entries as though this app required them",
                "any sentence choosing among the three distribution options",
                "an escalation stated as prose with no reproducing command \u2014 an unreproducible finding is a rumor"
              ]
            }
          }
        ]
      }
    }
  ]
}
-->
