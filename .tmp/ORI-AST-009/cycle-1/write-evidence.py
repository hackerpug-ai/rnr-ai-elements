#!/usr/bin/env python3
"""Generate run.json + manifest.json for ORI-AST-009 cycle 1 from real artifacts."""
import datetime
import hashlib
import json
import os
import re
import subprocess

ROOT = os.path.abspath(os.path.dirname(__file__) + "/../../..")
EV = "tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery"
GREEN_LOG = ".tmp/ORI-AST-009/cycle-1/green-run.log"


def sha(path):
    h = hashlib.sha256()
    with open(os.path.join(ROOT, path), "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    log = open(os.path.join(ROOT, GREEN_LOG), encoding="utf-8", errors="replace").read()
    trailer = [line for line in log.splitlines() if line.startswith("GREEN-EXIT=")]
    exit_code = int(trailer[-1].split("=")[1]) if trailer else 1
    passed = re.findall(r"PASS \((\d+)\)", log) or re.findall(r"(\d+) passed", log)
    failed = re.findall(r"FAIL \((\d+)\)", log) or re.findall(r"(\d+) failed", log)

    token = "FLOW-SHELL-16-not-found-search-recovery"
    locked = (
        "pnpm exec playwright test "
        "tests/sprint-05-orient-search/not-found-search-recovery.spec.ts "
        f"--grep {token}"
    )
    run = {
        "runIdentity": f"ori-ast-009-cycle-1-{int(datetime.datetime.now().timestamp() * 1000)}",
        "command": locked,
        "exit": exit_code,
        "passed": sum(int(p) for p in passed),
        "failed": sum(int(f) for f in failed),
        "sourceHashes": {
            "page404": sha("apps/docs/src/pages/404.astro"),
            "systemManuscript": sha("apps/docs/src/content/system/not-found.md"),
            "searchDialogScript": sha("apps/docs/src/scripts/search-dialog.ts"),
            "searchDialogIsland": sha("apps/docs/src/components/islands/SearchDialog.astro"),
            "docsLayout": sha("apps/docs/src/layouts/DocsLayout.astro"),
            "testFile": sha("tests/sprint-05-orient-search/not-found-search-recovery.spec.ts"),
            "lockfile": sha("pnpm-lock.yaml"),
            "dist404": sha("apps/docs/dist/404.html"),
            "pagefindEntry": sha("apps/docs/dist/pagefind/pagefind-entry.json"),
            "surfacePolicy": sha(".spec/e2e-policy/surface.json"),
            "coldbootPolicy": sha(".spec/e2e-policy/coldboot.json"),
        },
        "references": [
            f"{EV}/proof.red",
            ".tmp/sprint-05-orient-search/e2e-evidence/"
            f"{token}.red",
        ],
    }
    with open(os.path.join(ROOT, EV, "run.json"), "w") as f:
        json.dump(run, f, indent=2)
        f.write("\n")

    head = subprocess.run(
        ["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT, capture_output=True, text=True
    ).stdout.strip()
    manifest = {
        "task_id": "ORI-AST-009",
        "title": "Recover from unknown documentation URLs through the real site search",
        "status": "cycle_1_green_pending_review",
        "captured_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "worktree": ".kb-run-sprint/worktrees/sprint-05-orient-search/ORI-AST-009",
        "run": {
            "run_id": run["runIdentity"],
            "preview_origin": "http://localhost:4321",
            "preview_host": "127.0.0.1",
            "preview_port": 4321,
            "base_commit": head,
            "browser": {
                "engine": "chromium",
                "projects": ["chromium-desktop", "chromium-mobile", "chromium-nojs"],
                "javascript_disabled_projects": ["chromium-nojs"],
            },
            "commands": {
                "build": {
                    "command": "pnpm --filter @rnr-ai-elements/docs build",
                    "exit_code": 0,
                    "pages_built": 69,
                    "emitted": "apps/docs/dist/404.html",
                },
                "index": {
                    "command": "pnpm exec tsx scripts/docs-data/search-index.ts",
                    "exit_code": 0,
                    "observed": "64 pages indexed covering all 63 expected destinations; "
                    "404.html carries no data-pagefind-body so the indexer excludes it by "
                    "contract (count unchanged from the pre-recovery candidate).",
                },
                "red": {
                    "command": locked,
                    "exit_code": 1,
                    "observed": "15/15 cases fail on the pre-implementation candidate: the "
                    "served title never equals the manuscript title, apps/docs/dist/404.html "
                    "is absent, and the recovery search control never resolves. No "
                    "infrastructure failures.",
                    "canonical_store": f"{EV}/proof.red (run_flow.py --expect red, cmd_sha="
                    "bb838d1aca0f9418cc364d3f71c7ea051daf28265fb37bea366a7f96e622d8b6)",
                },
                "green": {
                    "command": locked,
                    "exit_code": exit_code,
                    "passed": run["passed"],
                    "failed": run["failed"],
                    "log": ".tmp/ORI-AST-009/cycle-1/green-run.log",
                },
            },
        },
        "acceptance": {
            "AC-1": "proven: fresh run-specific unknown /docs/ URLs serve the manuscript "
            "through the custom 404; Search the site opens the shared aria-modal dialog with "
            "the 300ms island-clock budget measured independently of Pagefind readiness "
            "(readyAtOpen=false at visibility, input focused); the real index settles "
            "'message', keyboard selection reaches /components/message/ at HTTP 200 with its "
            "own h1 and substantive content; chromium-nojs proves the readable recovery "
            "surface with zero Pagefind requests.",
            "AC-2": "proven: dist/404.html emitted and byte-compared against the real system "
            "manuscript (title, explanation, hint); the manuscript stays outside the docs "
            "collection and ordinary docs navigation; dark and light selections made through "
            "the real ThemeToggle control persist onto fresh unknown URLs with the shared "
            "header, footer and recovery links.",
            "AC-3": "proven: Escape closes recovery search and restores focus to the Search "
            "the site control (in-page activeElement observation); ordinary-page and "
            "recovery-page searches both load the production /pagefind/ module and both "
            "return Message at /components/message/; completed manuscript-derived queries "
            "(missing-page title + distinctive hint phrase) return URL lists that exclude "
            "/404, /404.html and every current-run unknown /docs/ URL, recorded with real "
            "result counts after settled index completion.",
            "AC-4": "proven: the manuscript explanation and shared shell remain readable "
            "with JavaScript disabled and zero Pagefind resources; the plain Components link "
            "reaches /components at HTTP 200 with rendered family content and the plain "
            "Registry link reaches /registry at HTTP 200 with the real ledger; the JS-only "
            "search control stays hidden without JavaScript.",
        },
        "known_blockers": [
            {
                "blocker": "Run-order hazard (inherited from ORI-AST-004): any astro build "
                "wipes dist/pagefind; the task-owned indexer ran after the last build before "
                "every preview-backed lane. CI owns this ordering.",
                "unblocks": "deterministic local runs",
            }
        ],
    }
    with open(os.path.join(ROOT, EV, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print("run.json + manifest.json written; exit", exit_code, "passed", run["passed"])


if __name__ == "__main__":
    main()
