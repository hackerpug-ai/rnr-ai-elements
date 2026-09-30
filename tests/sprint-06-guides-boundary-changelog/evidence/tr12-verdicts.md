# TR-12 per-page verdicts (GBC-006)

One checklist row per sprint-06 authored page. The verdict records the GBC-006
review against `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`:
Google style baseline (active voice, short sentences, second person, present
tense), the terminology lock (engine, engine tree, registry item, family,
verdict, peers, dev client), the page template for the page's kind, and the
single-canonical-page rule. The machine-enforced half (forbidden terms, canonical
usage, verdict-row bijection) runs in
`tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts`.

| Page | Verdict | Checklist notes |
| --- | --- | --- |
| apps/docs/src/content/docs/guides/customize-rendering.md | pass | Guide template: "This guide shows you how to…" opener, prerequisites, imperative numbered steps each with its observable result, next steps. No forbidden term; dev-client fact deferred to the owning page. |
| apps/docs/src/content/docs/guides/preview-on-device.md | pass | Guide template conformed; canonical "dev client" introduced at first use and paired with "development build"; the four opt-in items match the dev-client matrix; steps state what the learner should see. |
| apps/docs/src/content/docs/guides/re-theme.md | pass | Guide template conformed; token instructions split per engine tree (uniwind, nativewind) with canonical terms; steps carry expected results (reload, git diff shows one line). |
| apps/docs/src/content/docs/guides/troubleshooting.md | pass | Troubleshooting template: four entries, each symptom → cause → fix, one fix per symptom, links to the canonical page owning each topic; uses canonical "verdict" for Expo Go status. |
| apps/docs/src/content/docs/guides/update-installed-items.md | pass | Guide template conformed; update-as-re-add steps carry the CLI's real output states (skipped, prompt, Updated line) as the expected results; engine tree named in the URL contract. |
| apps/docs/src/content/docs/owns-vs-does-not-own.mdx | pass | Boundary page: five gaps each stated as a consumer-owned responsibility in "What your app supplies"; no gap names a shipped item (exact-equality check green); "dev client" defined where the development-build concept appears; single canonical boundary route. |
| apps/docs/src/content/docs/porting.md | pass | Porting page: mapping 40 / not-ported 9 / upstream 49 reconcile with the tracked 56-item ledger; no boundary-table copy (no shared header row, no boundary cell vocabulary); canonical engine tree and registry item terms; prior-art links absolute https. |
| apps/docs/src/content/changelog/0.1.0.md | pass | Entry body traced to its cited range (git log v0.1.0: 64 non-merge commits from 5f13ec4a through the tag; ledger at the tag carries 56 items); sections Added/Changed/Fixed in order; canonical engine tree term. |
| apps/docs/src/content/changelog/0.2.0.md | pass | Entry body traced to its cited range (git log v0.1.0..v0.2.0: permissions, engine parity proof, declared-deps gate, check:contract wiring, seven-item polish, URL repoint each map to a commit in range); canonical terms. |
| apps/docs/src/content/changelog/0.2.1.md | pass | Entry body traced to its cited range (git log v0.2.0..v0.2.1: sibling-file fix, full 56-item example install, icon comment fix); the broken-tree claim verified against the emitted registry JSON at both tags. |
