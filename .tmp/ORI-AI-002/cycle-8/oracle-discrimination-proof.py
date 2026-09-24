#!/usr/bin/env python3
"""Cycle-8 oracle discrimination proof against the COMMITTED native streams.

Positive: the shipped oracle (ANSWER_LEAD adjacency + wrap-tolerant ENGINE_TAG,
exactly as in live-example-proof.test.ts / live-example-proof.ts) must find
the follow-up recall in all four native targets.

Negative (disconnected recall): strip every follow-up-answer phrasing from all
sample texts — as if history were disconnected and no answer ever echoed the
marker-question — and re-run the SAME oracle. A discriminating oracle must
drop to 0 hits on ALL FOUR targets.

Run:  python3 oracle-discrimination-proof.py > discrimination-proof.txt
"""
import json
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
ANSWER_LEAD = re.compile(
    r"(gave|give) me the marker|asked me to remember|marker (you|vou) (gave|aave)", re.I
)
ENGINE_TAG = re.compile(r"OR[I1l|][^\w]{0,2}RN|\bRN[-:]?\d", re.I)
# The phrasings stripped for the disconnected-recall negative — exactly the
# ANSWER_LEAD alternatives, so the negative removes only what the oracle keys on.
STRIP = re.compile(
    r"(gave|give) me the marker|asked me to remember|marker (?:you|vou) (?:gave|aave)", re.I
)

def oracle_hits(sample_texts):
    for texts in sample_texts:
        for i, text in enumerate(texts):
            near = [texts[i - 1] if i > 0 else "", text, texts[i + 1] if i + 1 < len(texts) else ""]
            if ANSWER_LEAD.search(text) and any(ENGINE_TAG.search(t) for t in near if t):
                yield text

targets = [
    ("uniwind", "uniwind-ios"),
    ("uniwind", "uniwind-android"),
    ("nativewind", "nativewind-ios"),
    ("nativewind", "nativewind-android"),
]

print("ORI-AI-002 cycle-8 — oracle discrimination proof (committed streams)")
print()
positives = {}
for eng, target in targets:
    path = f"{ROOT}/tests/sprint-05-orient-search/evidence/ORI-AI-002/{eng}/{target}/stream.jsonl"
    lines = [json.loads(l) for l in open(path) if l.strip()]
    samples = [l.get("texts") or [] for l in lines if l.get("kind") == "dom-sample"]
    hits = list(oracle_hits(samples))
    positives[target] = (len(hits), hits[0] if hits else None)
    print(f"POSITIVE  {target}: {len(hits)} hit(s)" + (f"  e.g. {hits[0][:60]!r}" if hits else ""))

print()
failed_negative = False
for eng, target in targets:
    path = f"{ROOT}/tests/sprint-05-orient-search/evidence/ORI-AI-002/{eng}/{target}/stream.jsonl"
    lines = [json.loads(l) for l in open(path) if l.strip()]
    samples = [
        [STRIP.sub("", t) for t in (l.get("texts") or [])]
        for l in lines
        if l.get("kind") == "dom-sample"
    ]
    hits = list(oracle_hits(samples))
    mark = "OK " if not hits else "FAIL"
    if hits:
        failed_negative = True
    print(f"NEGATIVE {target} (answer phrasings stripped): {len(hits)} hit(s)  [{mark}]")

print()
print("verdict:", "DISCRIMINATING — negatives all 0, positives all >0"
      if not failed_negative and all(n > 0 for n, _ in positives.values())
      else "NOT DISCRIMINATING")
sys.exit(0 if not failed_negative and all(n > 0 for n, _ in positives.values()) else 1)
