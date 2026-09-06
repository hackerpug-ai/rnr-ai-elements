# TASK-F7: Declare and record the consumer @theme obligation the installed items silently require

> Task ID: TASK-F7  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `frontend-designer`  
> Points: 3  
> Type: INFRA
> Wave: D  
> Status: ✅ Completed
> TDD Mode: `shared` · RED_GREEN_REQUIRED: no
> Proposed By: `frontend-designer`
> Depends On: TASK-F3
> Commit: 3309f2454e40cb3214090477412f29d81ddf4039

## Outcome


## Critical Constraints

- NO DISTRIBUTION DECISION. Registry `cssVars` vs a documented install prerequisite vs converting the escape colors back to RNR roles is sprint-03's call, and it needs the flip evidence. Writing a preferred fix into the record as settled is the failure mode.
- NO SAFELIST CRUTCH. `apps/example` must contain no `class-safelist.tsx` or equivalent. If the badge only goes green with one, that IS the finding: record it and escalate to a registry change (making the class a JSX literal at its point of use), which is write_prohibited here.
- DERIVE, DO NOT TRANSCRIBE. The declared set comes from AC-1's derivation over the installed tree, never from reading a comment. This constraint exists because a human transcribing `apps/harness/src/global.css:28-34` counted three classes where `status.ts:30` writes four, and `--color-orange-500` has been missing ever since — invisible because a missing color looks like a color.
- VALUES ARE TRANSCRIBED, NEVER INVENTED. Every `--color-*` value is copied from the installed `tailwindcss` package's `theme.css`. A hand-picked hex here is the literal the token strategy forbids, smuggled in through the consumer's file.
- UNIT_TEST_JUSTIFIED (AC-2 only): see the field on that AC.
- SEQUENCING: this task's edit lands in wave D; the device consequence is observed by TASK-F8 AC-6 in wave G. AC-1 is deliberately independent of that timing so this task can be verified when it is done rather than waiting on the flow.

## Verification Checklist

| Command | Expect |
|---|---|
| `test -f apps/example/lib/status.ts && test -d apps/example/components/ai && echo INSTALLED-TREE` | prints `INSTALLED-TREE`. This gates every row below it: the derivation must read the tree the real RNR CLI wrote in gate step 2, never `packages/registry/src`, or it silently re-measures the monorepo. |
| `bash -c "grep -rhoE '(dark:)?(text\|bg\|border)-(zinc\|slate\|gray\|green\|orange\|yellow\|blue\|red)-[0-9]{2,3}' apps/example/components apps/example/lib \| sed -E 's/^dark://; s/^(text\|bg\|border)-/--color-/' \| sort -u \| wc -l"` | at least `8`, expected exactly the 8 written by `lib/status.ts` and `tool.logic.ts` (green-500, green-600, orange-500, orange-600, yellow-400, yellow-600, blue-400, blue-600). `0` is the empty-tree signature and makes the next row meaningless. |
| `bash -c "comm -23 <(grep -rhoE '(dark:)?(text\|bg\|border)-(zinc\|slate\|gray\|green\|orange\|yellow\|blue\|red)-[0-9]{2,3}' apps/example/components apps/example/lib \| sed -E 's/^dark://; s/^(text\|bg\|border)-/--color-/' \| sort -u) <(grep -oE -- '--color-(zinc\|slate\|gray\|green\|orange\|yellow\|blue\|red)-[0-9]+' apps/example/global.css \| sort -u)"` | 0 lines. Each line printed here is a class that compiles to nothing and renders colorless with no error. Run today against the harness this prints `--color-orange-500` — the live defect. |
| `bash -c "comm -13 <(grep -rhoE '(dark:)?(text\|bg\|border)-(zinc\|slate\|gray\|green\|orange\|yellow\|blue\|red)-[0-9]{2,3}' apps/example/components apps/example/lib \| sed -E 's/^dark://; s/^(text\|bg\|border)-/--color-/' \| sort -u) <(grep -oE -- '--color-(zinc\|slate\|gray\|green\|orange\|yellow\|blue\|red)-[0-9]+' apps/example/global.css \| sort -u)"` | 0 lines. Nothing declared beyond what the installed tree references; over-declaring the harness's full set hides which item requires what and makes sprint-02's per-item table underivable. |
| `grep -n -- '--color-orange-500' apps/example/global.css` | exactly 1 line, carrying an inline comment naming `lib/status.ts` denied-in-dark as its requirer. This is the entry a human transcribing the 3-class comment at `apps/harness/src/global.css:28-34` has missed since the harness was written. |
| `find apps/example -iname '*safelist*' \| wc -l` | `0`. A safelist gives every class a second home and makes the derivation meaningless. If the badge only goes green with one, that IS the finding — escalate to a registry change, which is write-prohibited here. |
| `node -e "const fs=require('fs'),p=require.resolve('tailwindcss/theme.css',{paths:['apps/example']});const F=/(--color-(?:zinc\|slate\|gray\|green\|orange\|yellow\|blue\|red)-\d+):\s*([^;]+);/g;const N=s=>s.replace(/([\d.]+)%/g,(_,d)=>(+d/100).toFixed(6)).replace(/\d*\.\d+/g,m=>(+m).toFixed(6)).replace(/\s+/g,' ').trim();const pick=t=>Object.fromEntries([...t.matchAll(F)].map(([,k,v])=>[k,N(v)]));const mine=pick(fs.readFileSync('apps/example/global.css','utf8')),tw=pick(fs.readFileSync(p,'utf8'));const bad=Object.entries(mine).filter(([k,v])=>tw[k]!==v);console.log(Object.keys(mine).length+' declared; '+(bad.length?JSON.stringify(bad):'0 invented values'))"` | `8 declared; 0 invented values`. Every value is compared against the installed tailwindcss `theme.css` after normalising its percentage lightness (`72.3%`) to the fraction form (`0.723`); a hand-picked hex or a mistyped digit prints as a drift pair. Verified today against `apps/harness/src/global.css`: `14 declared; 0 invented values`. |
| `grep -c -- '--color-orange-500' apps/harness/src/global.css; grep -c 'dark:text-orange-500' packages/registry/src/lib/status.ts` | prints `0` then `2`. ESCALATION 1, reproduced: the registry writes the class, our own harness never declared it, so a denied tool status has rendered colorless in dark mode. Paste both numbers into the record. |
| `grep -c class-safelist public/r/uniwind/file-tree.json public/r/uniwind/transcription.json` | `1` for each file. ESCALATION 2, reproduced: both shipped items carry a comment pointing consumers at `class-safelist.tsx`, a path that will not exist in their tree. |
| `node -e "const r=require('./packages/registry/registry.json');console.log(r.items.length, r.items.filter(i=>i.cssVars&&Object.keys(i.cssVars).length).length)"` | prints `56 0`. ESCALATION 3, reproduced: not one shipped item declares `cssVars`, and the RNR CLI merges no theme block, so the obligation reaches the consumer as nothing at all. Record the number; do NOT record a preferred fix — that is sprint-03's call. |
| `sed -n '/OBLIGATION-DERIVATION-SPRINT-01-START/,/OBLIGATION-DERIVATION-SPRINT-01-END/p' design/style-parity-remediation.md` | contains the verbatim stdout of rows 2, 3, 4 and 6, pasted and not retyped, in a block distinct from OBLIGATION-TABLE-SPRINT-01 so AC-2's diff still isolates the table. |
| `pnpm typecheck && pnpm lint` | both exit 0 |

## Behavior Proven By

Flow `UC-REG-01/core-happy-path`, owned by **TASK-F8/AC-1**. Delegated assertions:

- gate step 7: the `tool-badge-completed` glyph reads `Completed` and is GREEN on a booted device — the on-device consequence of the palette slice this task writes (TASK-F8 AC-1, measured by TASK-F8 AC-6 at chroma > 0.05, hue in [120,180], sampled from the glyph sub-bounds and persisted to `design/goldens/sprint-01/install/core-happy-path.json`)
- the watched-failing negative control for this task's substance: `bash tests/sprint-01/install-core.test.sh UC-REG-01/core-happy-path --mutate-theme green-600` exits 1 naming the measured chroma below 0.05 and the literal token `--color-green-600` (TASK-F8 AC-6, case 2). A grey / colorless check mark with `Flow Passed` printed is the documented silent failure this task exists to prevent, and TASK-F8 owns the RED log at `design/goldens/sprint-01/install/core-happy-path.RED.log`
- the app cold-boots and renders the transcript on iOS and Android with the palette slice compiled by the consumer's own Uniwind/Tailwind v4 build, not by the monorepo's (gate steps 4, 10)

## Acceptance Criteria

### AC-2: the record matches what the app declares and carries the three escalations
**GIVEN** the declared palette slice this task wrote into `apps/example/global.css`  
**WHEN** the table's entry set is diffed against the theme file's entry set  
**THEN** the diff is empty and the three escalation subsections are present with their reproducing commands

- FLOW_REF: `—`
- TEST_TIER: `unit`
- TEST_FILE: `tests/sprint-01/theme-obligation.test.ts`  ·  TEST_FUNCTION: `AC-2 the obligation table matches the consumer theme`
- VERIFY: `pnpm exec vitest run tests/sprint-01/theme-obligation.test.ts -t "AC-2 the obligation table matches the consumer theme"`
- VERIFICATION_SERVICE: the two files this task owns, read from disk
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
      "the table were hand-typed from the harness's 26 declaration lines rather than derived from this task's Verification Checklist derivation over the installed `apps/example` tree, which is the transcription failure that produced the orange-500 gap",
      "a preferred distribution fix were written into the record as settled \u2014 registry `cssVars` versus an install prerequisite versus converting the escape colors to RNR roles is sprint-03's decision and this task is bound not to pre-empt it",
      "either side of the diff were widened back to `--color-[a-z]+-[0-9]+`, which matches RNR's own `--color-chart-1` \u2026 `--color-chart-5` role tokens and would make the diff non-empty on a correct implementation \u2014 a check that is always red proves as little as one that is always green",
      "the diff were run with `apps/example/global.css` absent or with the palette slice not yet appended: both sides come back empty and a bare `diff` exits 0 on nothing-versus-nothing. The `>= 8` non-empty anchor in the command closes that hole and exits 1 instead",
      "the consumer `@theme` block were absent or empty in `apps/example/global.css` \u2014 every palette class compiles to nothing on device and the declared side of the diff comes back empty; the `>= 8` anchor exits 1 instead of passing on nothing-versus-nothing",
      "the command were pointed at `apps/harness/src/global.css` instead of the consumer's own theme file \u2014 it would read the monorepo's 26 declarations, never touch the installed tree, and pass forever while the consumer ships colorless",
      "the OBLIGATION-TABLE-SPRINT-01 markers were removed or misspelled so `sed -n` selected nothing \u2014 the table side goes empty and the diff exits 1 rather than silently comparing against a static blank",
      "the test read a fixture copy of either file instead of the two real paths on disk \u2014 it would assert against a snapshot of the answer and pass while the consumer's own theme drifted"
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
          "run `pnpm exec vitest run tests/sprint-01/theme-obligation.test.ts -t \"AC-2 the obligation table matches the consumer theme\"`, which reads both files from disk and compares the declared palette entries in `apps/example/global.css` against the OBLIGATION-TABLE-SPRINT-01 block, both sides narrowed to the palette families so RNR's own role tokens (`--color-chart-1` \u2026 `--color-chart-5`, written by TASK-F1) are not demanded as rows, and both sides required to be non-empty (`>= 8` declared entries)",
          "read the three escalation subsections and confirm each carries a command a reviewer can re-run"
        ]
      },
      "end_state": {
        "must_observe": [
          "an empty diff and exit code `0`, reached only after the declared set clears the `>= 8` non-empty anchor \u2014 a run against a missing or unappended theme file exits 1 rather than passing on two empty sets",
          "`8` table rows, each naming both the item (`tool`) and the module (`lib/status.ts` or `tool.logic.ts`) that requires it",
          "a FULL-SET subsection recording all `26` declaration lines of `apps/harness/src/global.css` as sprint-02's inheritance \u2014 `21` distinct names, with `--color-chart-1` through `--color-chart-5` declared twice (once in the light block, once in dark) \u2014 marked as NOT declared in this app",
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

| ID | Statement | Maps to | Verify |
|---|---|---|---|
| TC-3 |  | AC-2 | `—` |

## Guardrails

**WRITE-ALLOWED**
- `apps/example/global.css`
- `design/style-parity-remediation.md`
- `tests/sprint-01/theme-obligation.test.ts`

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
  "task_type": "INFRA",
  "tdd_mode": "shared",
  "verification_policy": {
    "requires_tests": false,
    "requires_red_evidence": false,
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
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/sprint-01/theme-obligation.test.ts",
      "test_function": "AC-2 the obligation table matches the consumer theme",
      "verify": "pnpm exec vitest run tests/sprint-01/theme-obligation.test.ts -t \"AC-2 the obligation table matches the consumer theme\"",
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
            "the table were hand-typed from the harness's 26 declaration lines rather than derived from this task's Verification Checklist derivation over the installed `apps/example` tree, which is the transcription failure that produced the orange-500 gap",
            "a preferred distribution fix were written into the record as settled \u2014 registry `cssVars` versus an install prerequisite versus converting the escape colors to RNR roles is sprint-03's decision and this task is bound not to pre-empt it",
            "either side of the diff were widened back to `--color-[a-z]+-[0-9]+`, which matches RNR's own `--color-chart-1` \u2026 `--color-chart-5` role tokens and would make the diff non-empty on a correct implementation \u2014 a check that is always red proves as little as one that is always green",
            "the diff were run with `apps/example/global.css` absent or with the palette slice not yet appended: both sides come back empty and a bare `diff` exits 0 on nothing-versus-nothing. The `>= 8` non-empty anchor in the command closes that hole and exits 1 instead",
            "the consumer `@theme` block were absent or empty in `apps/example/global.css` \u2014 every palette class compiles to nothing on device and the declared side of the diff comes back empty; the `>= 8` anchor exits 1 instead of passing on nothing-versus-nothing",
            "the command were pointed at `apps/harness/src/global.css` instead of the consumer's own theme file \u2014 it would read the monorepo's 26 declarations, never touch the installed tree, and pass forever while the consumer ships colorless",
            "the OBLIGATION-TABLE-SPRINT-01 markers were removed or misspelled so `sed -n` selected nothing \u2014 the table side goes empty and the diff exits 1 rather than silently comparing against a static blank",
            "the test read a fixture copy of either file instead of the two real paths on disk \u2014 it would assert against a snapshot of the answer and pass while the consumer's own theme drifted"
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
                "run `pnpm exec vitest run tests/sprint-01/theme-obligation.test.ts -t \"AC-2 the obligation table matches the consumer theme\"`, which reads both files from disk and compares the declared palette entries in `apps/example/global.css` against the OBLIGATION-TABLE-SPRINT-01 block, both sides narrowed to the palette families so RNR's own role tokens (`--color-chart-1` \u2026 `--color-chart-5`, written by TASK-F1) are not demanded as rows, and both sides required to be non-empty (`>= 8` declared entries)",
                "read the three escalation subsections and confirm each carries a command a reviewer can re-run"
              ]
            },
            "end_state": {
              "must_observe": [
                "an empty diff and exit code `0`, reached only after the declared set clears the `>= 8` non-empty anchor \u2014 a run against a missing or unappended theme file exits 1 rather than passing on two empty sets",
                "`8` table rows, each naming both the item (`tool`) and the module (`lib/status.ts` or `tool.logic.ts`) that requires it",
                "a FULL-SET subsection recording all `26` declaration lines of `apps/harness/src/global.css` as sprint-02's inheritance \u2014 `21` distinct names, with `--color-chart-1` through `--color-chart-5` declared twice (once in the light block, once in dark) \u2014 marked as NOT declared in this app",
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
      },
      "verification_service": "the two files this task owns, read from disk",
      "unit_test_justified": "Pure textual consistency between two files this task owns, zero I/O beyond reading them, asserting no product behavior. All product behavior for this task is asserted on real devices by TASK-F8 AC-1 and AC-6 under the locked flow `UC-REG-01/core-happy-path`; the derivation over the real installed tree runs as this task's Verification Checklist. A hand-typed obligation list drifting from what the app declares is the specific failure this catches, and it needs no runtime.",
      "surface_policy": null,
      "num": 2,
      "name": "the record matches what the app declares and carries the three escalations",
      "given": "the declared palette slice this task wrote into `apps/example/global.css`",
      "when": "the table's entry set is diffed against the theme file's entry set",
      "then": "the diff is empty and the three escalation subsections are present with their reproducing commands"
    },
    {
      "id": "TC-3",
      "type": "test_case",
      "text": "The record matches what the app declares",
      "maps_to_ac": "AC-2"
    }
  ]
}
-->
