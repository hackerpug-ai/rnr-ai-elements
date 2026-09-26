#!/usr/bin/env python3
"""Assemble ask-wave21-add-foreign-suite-repair.result.json from parts.

Renders the FIX-ORI-SUITE-2 charter (scenario blocks + REQUIREMENT-CONTRACT
comment from the single requirements.json source of truth), applies the
SPRINT.md and ROADMAP.md deltas, and writes the record-result payload.
"""
import hashlib
import json
import re
from pathlib import Path

PARTS = Path("/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/sprint-05-orient-search/planning-results/ask-wave21-parts")
REPO = Path("/Users/justinrich/Projects/rnr-ai-elements")
SPRINT = REPO / ".spec/prds/docs-site/tasks/sprint-05-orient-search/SPRINT.md"
ROADMAP = REPO / ".spec/prds/docs-site/ROADMAP.md"
TASK_REL = ".spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md"
RESULT = REPO / ".kb-run-sprint/sprint-05-orient-search/planning-results/ask-wave21-add-foreign-suite-repair.result.json"

TASK_TITLE = "Repair the foreign suite drifts behind the aggregate's residual failures"
ASK_ID = "ask-wave21-add-foreign-suite-repair"
PLANNER = "ghactions-planner"
IMPLEMENTER = "ghactions-implementer"
REVIEWER = "ghactions-reviewer"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def jline(obj) -> str:
    return json.dumps(obj, ensure_ascii=True)


def main() -> None:
    req = json.loads((PARTS / "requirements.json").read_text())
    head = (PARTS / "charter-head.md").read_text()
    details = (PARTS / "charter-details.md").read_text()
    tail = (PARTS / "charter-tail.md").read_text()

    # --- render scenario blocks + fixture block into the details section ---
    by_id = {r["id"]: r for r in req["requirements"]}
    for ac in ("AC-1", "AC-2", "AC-3"):
        block = "```json\n" + jline(by_id[ac]["scenario"]) + "\n```"
        details = details.replace("@@SCENARIO:" + ac + "@@", block)
    fixture_block = "```json\n" + jline(req["fixtures"]) + "\n```"
    details = details.replace("@@FIXTURE@@", fixture_block)
    assert "@@" not in details, "unresolved placeholder in details"

    # --- render the REQUIREMENT-CONTRACT comment from the same source ---
    contract = {
        "version": req["version"],
        "task_id": req["task_id"],
        "tdd_mode": req["tdd_mode"],
        "verification_policy": req["verification_policy"],
        "fixtures": req["fixtures"],
        "supersedes": req["supersedes"],
        "requirements": req["requirements"],
    }
    contract_comment = (
        "<!-- REQUIREMENT-CONTRACT v1 -->\n<!--\n" + jline(contract) + "\n-->"
    )

    handoff = (
        "## Handoff\n\n```json\n"
        + json.dumps(
            {
                "task": "FIX-ORI-SUITE-2",
                "commit_sha": "",
                "done": "",
                "deviations": [],
                "concerns": [],
                "findings": [],
                "scope_impact": [],
                "feedback": [],
            },
            indent=2,
        )
        + "\n```\n"
    )

    task_md = (
        "# FIX-ORI-SUITE-2: " + TASK_TITLE[0].upper() + TASK_TITLE[1:].replace("Repair the foreign", "Repair the foreign", 1) + "\n\n"
        + head.split("\n", 1)[1].lstrip("\n")
        + details
        + tail
        + "\n" + contract_comment + "\n</details>\n\n"
        + handoff
    )
    # The head part already starts with the title line; rebuild cleanly instead.
    task_md = head.rstrip("\n") + "\n" + details + tail + "\n" + contract_comment + "\n</details>\n\n" + handoff

    # --- SPRINT.md deltas: one row + count line + link ---
    sprint_old = SPRINT.read_text()
    sprint_expected = "0d93d8db89a260a9416a59262f56d4826ffb5140d945217e00407c535d9b7823"
    assert sha256_bytes(sprint_old.encode()) == sprint_expected, "SPRINT.md base sha drifted"

    row_after = "| FIX-ORI-CONT-004-1 | Pin react-native-web 0.21.2 in both consumer templates | react-native-reusables-implementer | 2 | 20 | ORI-RN-001, ORI-RN-003 |"
    new_row = "| FIX-ORI-SUITE-2 | " + TASK_TITLE + " | ghactions-implementer | 3 | 21 | ORI-CI-002 |"
    assert sprint_old.count(row_after) == 1, "SPRINT row anchor not unique"
    sprint_new = sprint_old.replace(row_after, row_after + "\n" + new_row)

    count_old = "**Total: 46 tasks / 152 points** (the approved 36-task/131-point plan plus FIX-ORI-AI-001-1, FIX-ORI-RN-005-1, FIX-ORI-RN-004-2, FIX-ORI-RN-004-3, FIX-ORI-AI-002-1, FIX-ORI-CI-001-1, FIX-ORI-AST-004-1, FIX-ORI-VIS-001-1, FIX-ORI-SUITE-1 and FIX-ORI-CONT-004-1, added in flight by planner asks ask-wave8-add-payload-retry-fix, ask-wave9-add-nativewind-compile-fix, ask-wave10-add-uniwind-webleg-stall-fix, ask-wave11-add-caller-backend-restart-fix, ask-wave12-add-nativewind-baseline-ordering-fix, ask-wave16-add-quickstart-tutorial-designation, ask-wave17-add-streamdown-dependency-destination, ask-wave18-add-theming-nav-inclusion, ask-wave19-add-preexisting-suite-repair and ask-wave20-add-rnw-pin)."
    count_new = "**Total: 47 tasks / 155 points** (the approved 36-task/131-point plan plus FIX-ORI-AI-001-1, FIX-ORI-RN-005-1, FIX-ORI-RN-004-2, FIX-ORI-RN-004-3, FIX-ORI-AI-002-1, FIX-ORI-CI-001-1, FIX-ORI-AST-004-1, FIX-ORI-VIS-001-1, FIX-ORI-SUITE-1, FIX-ORI-CONT-004-1 and FIX-ORI-SUITE-2, added in flight by planner asks ask-wave8-add-payload-retry-fix, ask-wave9-add-nativewind-compile-fix, ask-wave10-add-uniwind-webleg-stall-fix, ask-wave11-add-caller-backend-restart-fix, ask-wave12-add-nativewind-baseline-ordering-fix, ask-wave16-add-quickstart-tutorial-designation, ask-wave17-add-streamdown-dependency-destination, ask-wave18-add-theming-nav-inclusion, ask-wave19-add-preexisting-suite-repair, ask-wave20-add-rnw-pin and ask-wave21-add-foreign-suite-repair)."
    assert sprint_old.count(count_old) == 1, "SPRINT count line anchor not found"
    sprint_new = sprint_new.replace(count_old, count_new)

    link_after = "- [TASK-FIX-ORI-CONT-004-1.md](./TASK-FIX-ORI-CONT-004-1.md)"
    assert sprint_old.count(link_after) == 1, "SPRINT link anchor not unique"
    sprint_new = sprint_new.replace(
        link_after, link_after + "\n\n- [TASK-FIX-ORI-SUITE-2.md](./TASK-FIX-ORI-SUITE-2.md)"
    )

    # --- ROADMAP.md deltas: one row + provenance note ---
    roadmap_old = ROADMAP.read_text()
    roadmap_expected = "eca465c78a5d13367729ae05d5ba46885bdbb193c1a0fc857cd198f46e672b9d"
    assert sha256_bytes(roadmap_old.encode()) == roadmap_expected, "ROADMAP.md base sha drifted"

    rm_row_after = "| FIX-ORI-CONT-004-1 | Pin react-native-web 0.21.2 in both consumer templates | react-native-reusables-implementer | 2 | 20 | ⬜ Pending |"
    rm_new_row = "| FIX-ORI-SUITE-2 | " + TASK_TITLE + " | ghactions-implementer | 3 | 21 | ⬜ Pending |"
    assert roadmap_old.count(rm_row_after) == 1, "ROADMAP row anchor not unique"
    roadmap_new = roadmap_old.replace(rm_row_after, rm_row_after + "\n" + rm_new_row)

    provenance = (
        "\nAdded 2026-09-26 via ask `ask-wave21-add-foreign-suite-repair`: the in-flight seven-suite repair landed all seven chartered repairs and blocked on its aggregate clause — six foreign suites fail on the candidate through no fault of those repairs (cycle-1 blocked report, wave-21 decision). Planner-verified standalone on the recorded candidate: four are test-side drift or runtime-class damage now chartered — docs-collection.test.ts's scratch fixture predates the app's repo-root references (TokenTable.astro's scripts/docs-data/token-map import and the quickstart page's packages/docs-snippets render-time read, so every scratch build dies UNRESOLVED_IMPORT then ENOENT; mirroring the two trees makes the identical build exit 0), docs-data-prebuild.test.ts's tracked-files assertion meets the five authored font files ORI-VIS-001 landed under apps/docs/public/fonts/, live-example-api.test.ts's AC-4 hook literal predates FIX-ORI-AI-001-1's lazy expo/fetch import, and the two 75-minute NativeWind marathon tokens recorded concluded-but-failed legs (no assertion drift; the 5-entry source manifest is hash-current). Two of the six are NOT drift and are routed, not masked: ci-chain-order's only failing token embeds the full Playwright lane through recovery-presentation.spec.ts's ac-5 public-origin prerequisite (the apex answers HTTP 404 with an empty body — ORI-DEP-002/003 own it; the suite's other two tokens verified green standalone), and contributing-content.test.ts verified 4/4 green standalone (its aggregate failure was the end-of-run tmpdir-reaper cascade — run hygiene for the one rerun). Test-files-only; zero product-source changes; depends on ORI-CI-002 (completed); collapses the aggregate's residual failure set to exactly the deployment-gated closure and unblocks the aggregate acceptance behind ORI-DEP-002/003.\n"
    )
    rm_note_after = "Added 2026-09-25 via ask `ask-wave20-add-rnw-pin`"
    idx = roadmap_old.find(rm_note_after)
    assert idx != -1, "ROADMAP wave-20 note anchor not found"
    # append the new note right after the wave-20 note paragraph (next blank line)
    end = roadmap_old.find("\n\n", idx)
    assert end != -1
    roadmap_new = roadmap_new[:end] + "\n" + provenance.rstrip("\n") + roadmap_new[end:]

    # --- write the task file bytes (not to the repo — into the result payload) ---
    task_bytes = task_md.encode()

    # --- guardrails projection (mirrors the charter's writeAllowed) ---
    write_allowed = [
        "tests/sprint-05-orient-search/docs-collection.test.ts (MODIFY)",
        "tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts (MODIFY)",
        "tests/sprint-05-orient-search/live-example-api.test.ts (MODIFY)",
        "tests/sprint-05-orient-search/nativewind-live-example.test.ts (MODIFY — budget arithmetic only; assertions byte-effective)",
        "tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts (NEW)",
        "tests/sprint-05-orient-search/evidence/ORI-AI-001/package-contract.json (drill-emitted rewrite)",
        "tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json (drill-emitted rewrite)",
        "tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json (drill-emitted rewrite)",
        ".tmp/FIX-ORI-SUITE-2/red.json",
        ".tmp/FIX-ORI-SUITE-2/green.json",
        ".tmp/FIX-ORI-SUITE-2/run.json",
    ]

    payload = {
        "ask_id": ASK_ID,
        "planner": PLANNER,
        "files": [
            {"path": TASK_REL, "expected_sha256": None, "content": task_md},
            {"path": ".spec/prds/docs-site/tasks/sprint-05-orient-search/SPRINT.md", "expected_sha256": sprint_expected, "content": sprint_new},
            {"path": ".spec/prds/docs-site/ROADMAP.md", "expected_sha256": roadmap_expected, "content": roadmap_new},
        ],
        "task_plan": {
            "expanded_tasks": [
                {
                    "task_id": "FIX-ORI-SUITE-2",
                    "planner": PLANNER,
                    "agent": IMPLEMENTER,
                    "reviewer": REVIEWER,
                    "guardrails": {"write_allowed": write_allowed, "write_prohibited": []},
                    "supersedes": req["supersedes"],
                    "requirements": req["requirements"],
                }
            ],
            "journey_proofs": [],
            "blocked_flows": [],
        },
    }

    result_bytes = json.dumps(payload, ensure_ascii=False, indent=2).encode() + b"\n"
    RESULT.write_bytes(result_bytes)

    # --- self-checks ---
    parsed = json.loads(RESULT.read_text())
    assert parsed["ask_id"] == ASK_ID
    assert len(parsed["files"]) == 3
    assert parsed["files"][0]["expected_sha256"] is None
    for f in parsed["files"][1:]:
        base = (REPO / f["path"]).read_bytes()
        assert sha256_bytes(base) == f["expected_sha256"], f["path"] + " base sha mismatch"
    # task markdown self-consistency: the REQUIREMENT-CONTRACT comment parses and matches the projection
    m = re.search(r"<!-- REQUIREMENT-CONTRACT v1 -->\n<!--\n(.*?)\n-->", task_md, re.S)
    assert m, "contract comment not found in task markdown"
    embedded = json.loads(m.group(1))
    assert embedded["requirements"] == parsed["task_plan"]["expanded_tasks"][0]["requirements"]
    assert embedded["supersedes"] == req["supersedes"]
    # every scenario block in the markdown matches its requirement's scenario
    for r in req["requirements"]:
        if "scenario" in r:
            assert jline(r["scenario"]) in task_md, r["id"] + " scenario block missing"
    # supersedes <-> write_allowed overlap rule: every EXISTING test file in write_allowed is superseded
    for w in write_allowed:
        rel = w.split(" (")[0]
        if rel.endswith(".test.ts") and "foreign-suite-repair-proof" not in rel:
            assert rel in req["supersedes"], rel + " in write_allowed but not superseded"
    print("task bytes:", len(task_bytes))
    print("sprint delta bytes:", len(sprint_new) - len(sprint_old))
    print("roadmap delta bytes:", len(roadmap_new) - len(roadmap_old))
    print("result sha256:", sha256_bytes(result_bytes))
    # keep the assembled task file beside the parts for inspection
    (PARTS / "TASK-FIX-ORI-SUITE-2.assembled.md").write_bytes(task_bytes)


if __name__ == "__main__":
    main()
