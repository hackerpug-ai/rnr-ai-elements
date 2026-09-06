# TASK-F5: Commit the UIMessageStream fixture with honest provenance and render / from it with zero network calls

> Task ID: TASK-F5  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 3  
> Type: INFRA  
> Wave: E  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`
> Depends On: TASK-F4

## Outcome

The / route renders a committed transcript containing a completed tool call, with no network call and a provenance file stating what the fixture is.

## Critical Constraints

- NO fetch, no timer, no provider on this route. A network dependency makes the cold-boot gate flaky on day one; streaming against a real /api/chat is sprint 04's work.
- The transcript MUST contain a completed tool call, not only text bubbles. That card's badge is the only thing on screen whose color answers to a palette slice the consumer must declare rather than to an RNR role — it is what TASK-F8 AC-6 samples for chroma.
- PROVENANCE.md is not optional. A hand-assembled fixture carrying no provenance inherits the credibility of a recorded one, and that is a quiet lie. State which it is.
- Compose at RNR's mobile density: base classes ARE the mobile size. No bare h-11 or h-12 to chase a 44pt target; hitSlop is the only sanctioned deviation because it moves no pixel.
- Do not edit anything under apps/example/components/ai/ — CLI-installed files. Editing one destroys the evidence that the install produces working code.

## Verification Checklist

| Command | Expect |
|---|---|
| `node -e "const t=require('./apps/example/fixtures/transcript.json');console.log(t.messages.length)"` | prints 2 (one user message, one assistant message); the file parses as JSON |
| `node -e "const t=require('./apps/example/fixtures/transcript.json');console.log(t.messages[1].parts.filter(p=>p.type==='text')[0].text)"` | prints exactly `Registry item installed.` |
| `node -e "const t=require('./apps/example/fixtures/transcript.json');const p=t.messages[1].parts.find(x=>x.type&&x.type.startsWith('tool-'));console.log(p.state,p.toolName)"` | prints `output-available searchRegistry`; both strings are asserted by TASK-F8's flow, so renaming either breaks the locked flow |
| `node apps/example/fixtures/validate.mjs` | exit 0 — validates the fixture against `ai@7.0.89`'s own `uiMessagesSchema` via the SDK's `validateUIMessages` (message roles, part discriminants, tool-state union), which is what proves the fixture's shape satisfies the real `UIMessage` type rather than merely being valid JSON. (The whole-project `tsc --noEmit -p apps/example` cannot be this proof: it exits 1 on 5 pre-existing errors outside this task's diff, and the route's `resolveJsonModule` import is cast through `UIMessage[]`, so tsc never inspects the JSON's shape.) |
| `cat apps/example/fixtures/PROVENANCE.md` | carries an origin line reading either `hand-assembled` or `recorded from /api/chat`, the string `ai@7.0.89`, and a `created:` ISO-8601 date |
| `grep -cE 'fetch\(|setTimeout\(|setInterval\(' apps/example/app/index.tsx` | returns 0 — no network, no timer on this route |
| `git diff --name-only -- apps/example/components/ai/` | prints 0 lines; no CLI-installed file was edited |
| `pnpm typecheck && pnpm lint` | both exit 0 |

## Behavior Proven By

Flow `UC-REG-01/core-happy-path`, owned by **TASK-F8 AC-1 and AC-6**. Delegated assertions:

- the second bubble reads `Registry item installed.` on a booted device in Airplane Mode (gate step 6)
- 3 transcript rows mount with 0 network requests
- the tool card badge reads `Completed` and its glyph measures chroma > 0.05, hue in [120,180] (gate step 7, F8 AC-6)

## Guardrails

**WRITE-ALLOWED**
- `apps/example/app/**`
- `apps/example/fixtures/**`
- `apps/example/components/**`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `apps/example/components/ai/**`
- `tests/sprint-01/**`
- `.maestro/**`

## Fixtures

- **`installed_example_app`** (cli) — apps/example scaffolded, rnr init run, the 5 sprint items installed from the v0.1.0 tag by the real RNR CLI
- **`seeded_transcript`** (recorded_external) — apps/example/fixtures/transcript.json committed: 1 user part, 1 assistant text part, 1 completed tool part

## Notes

- Reclassified FEATURE -> INFRA. This task produces seed data and wires it to a screen; the fixture is configuration and the render is proven downstream by F8's arc. Every assertion from the three ACs it replaces is preserved in the checklist above or delegated explicitly.
- write_prohibited gains apps/example/components/ai/** — a defect I flagged when I sent the expansion. The write_allowed glob apps/example/components/** swallows the CLI-installed directory, so without this line F5 could legally edit an installed component and nothing would notice.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F5",
  "task_type": "INFRA",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": false,
    "requires_red_evidence": false,
    "requires_seeded_evidence": false
  },
  "fixtures": {
    "installed_example_app": {
      "description": "apps/example scaffolded, rnr init run, the 5 sprint items installed from the v0.1.0 tag by the real RNR CLI",
      "seed_method": "cli",
      "records": [
        "apps/example/components.json written by rnr init",
        "components/ai/tool.tsx present",
        "components/ui/popover.tsx present"
      ]
    },
    "seeded_transcript": {
      "description": "apps/example/fixtures/transcript.json committed: 1 user part, 1 assistant text part, 1 completed tool part",
      "seed_method": "recorded_external",
      "records": [
        "assistant text part reads `Registry item installed.`",
        "tool part state is `output-available`",
        "tool part toolName is `searchRegistry`"
      ]
    }
  },
  "requirements": []
}
-->
