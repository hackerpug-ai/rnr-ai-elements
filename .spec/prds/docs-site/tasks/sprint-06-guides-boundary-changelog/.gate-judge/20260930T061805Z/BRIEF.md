# Judge brief

You are the blind judge. Your whole input is THIS directory (source.md = the sprint's gate section
source). You may: run the documented commands in /Users/justinrich/Projects/rnr-ai-elements (the
product repo working dir), drive the running product at http://localhost:4321 with Playwright
(resolvable at node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core), and run
read-only machine commands (command -v, ls on named paths, curl). You may NOT read the repo's
source, specs, tests, or task files. The machine and the running product are your only evidence.

Write plan.json FIRST: for each numbered gate step in source.md's TESTING-GATE block, record
{n, text (VERBATIM quote), type} — verify-gate-evidence.sh --check-plan refuses paraphrase.
Then drive each step in order and decide both judgments (step + whole-surface contradiction).
For step 6 (first contact), launch exactly as the step words it, on this machine as it is,
recording id -un, hostname, $HOME; take no write action beyond what the step names; grade each
Promise line verbatim.

Append one JSONL line per step attempt to run.jsonl: {"n", "attempt", "result": "pass|fail|blocked",
"observed": {literal values you saw}, "screenshot": "<path under this dir>", "expect": ["<verbatim
step words you graded>"]}. Screenshots MUST exist on disk. Write report.md at the end (per-step
verdicts, first-contact section first, any surface contradictions).
