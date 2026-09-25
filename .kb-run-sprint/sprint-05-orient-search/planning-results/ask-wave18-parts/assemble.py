"""Assemble the ask-wave18-add-theming-nav-inclusion planner result.

Reads the current SPRINT.md / ROADMAP.md from the repo (read-only), applies the
exact charter deltas, pairs them with the authored task file part, and writes
the single record-result JSON. Asserts every replacement matches exactly once
and every expected sha256 matches the current on-disk bytes.
"""
import hashlib
import json
import re
import sys

REPO = '/Users/justinrich/Projects/rnr-ai-elements'
PARTS = f'{REPO}/.kb-run-sprint/sprint-05-orient-search/planning-results/ask-wave18-parts'
OUT = (
    '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/sprint-05-orient-search/'
    'planning-results/ask-wave18-add-theming-nav-inclusion.result.json'
)

SPRINT_REL = '.spec/prds/docs-site/tasks/sprint-05-orient-search/SPRINT.md'
ROADMAP_REL = '.spec/prds/docs-site/ROADMAP.md'
TASK_REL = '.spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-VIS-001-1.md'
EXPECTED = {
    SPRINT_REL: '7bab5eddc111941f4657c97252ecaa619352122456bb1b9579042b216e130e6e',
    ROADMAP_REL: '37763f195a383e962f44a74b4dfb114c60aa70656fd307a686e42d2921ddb1e3',
}


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    assert count == 1, f'{label}: expected exactly 1 match, found {count}'
    return text.replace(old, new, 1)


sprint = open(f'{REPO}/{SPRINT_REL}', encoding='utf-8').read()
roadmap = open(f'{REPO}/{ROADMAP_REL}', encoding='utf-8').read()
task = open(f'{PARTS}/task-file.md', encoding='utf-8').read()

for rel, expected in EXPECTED.items():
    current = sha256(open(f'{REPO}/{rel}', encoding='utf-8').read())
    assert current == expected, f'{rel}: on-disk sha {current} != ask-recorded {expected}'

# --- SPRINT.md delta 1: the task-table row, sibling-adjacent to its source task
sprint = replace_once(
    sprint,
    '| ORI-VIS-001 | Complete the shared reading layout for orientation and boundary pages'
    ' | frontend-designer | 5 | 12 | ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-004,'
    ' ORI-AST-007, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005 |',
    '| ORI-VIS-001 | Complete the shared reading layout for orientation and boundary pages'
    ' | frontend-designer | 5 | 12 | ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-004,'
    ' ORI-AST-007, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005 |\n'
    '| FIX-ORI-VIS-001-1 | Include the reserved theming entry in section navigation'
    ' | astro-implementer | 1 | 18 | ORI-AST-003 |',
    'sprint row',
)

# --- SPRINT.md delta 2: the count line, 43/146 -> 44/147
sprint = replace_once(
    sprint,
    '**Total: 43 tasks / 146 points** (the approved 36-task/131-point plan plus FIX-ORI-AI-001-1,'
    " FIX-ORI-RN-005-1, FIX-ORI-RN-004-2, FIX-ORI-RN-004-3, FIX-ORI-AI-002-1, FIX-ORI-CI-001-1 and"
    ' FIX-ORI-AST-004-1, added in flight by planner asks ask-wave8-add-payload-retry-fix,'
    ' ask-wave9-add-nativewind-compile-fix, ask-wave10-add-uniwind-webleg-stall-fix,'
    ' ask-wave11-add-caller-backend-restart-fix, ask-wave12-add-nativewind-baseline-ordering-fix,'
    ' ask-wave16-add-quickstart-tutorial-designation and ask-wave17-add-streamdown-dependency-destination).',
    '**Total: 44 tasks / 147 points** (the approved 36-task/131-point plan plus FIX-ORI-AI-001-1,'
    " FIX-ORI-RN-005-1, FIX-ORI-RN-004-2, FIX-ORI-RN-004-3, FIX-ORI-AI-002-1, FIX-ORI-CI-001-1,"
    ' FIX-ORI-AST-004-1 and FIX-ORI-VIS-001-1, added in flight by planner asks'
    ' ask-wave8-add-payload-retry-fix, ask-wave9-add-nativewind-compile-fix,'
    ' ask-wave10-add-uniwind-webleg-stall-fix, ask-wave11-add-caller-backend-restart-fix,'
    ' ask-wave12-add-nativewind-baseline-ordering-fix, ask-wave16-add-quickstart-tutorial-designation,'
    ' ask-wave17-add-streamdown-dependency-destination and ask-wave18-add-theming-nav-inclusion).',
    'sprint count line',
)

# --- SPRINT.md delta 3: the task-file link, sibling-adjacent to its source task
sprint = replace_once(
    sprint,
    '- [ORI-VIS-001-complete-the-shared-reading-layout-for-orientation-and-boundary-pages.md]'
    '(./ORI-VIS-001-complete-the-shared-reading-layout-for-orientation-and-boundary-pages.md)',
    '- [ORI-VIS-001-complete-the-shared-reading-layout-for-orientation-and-boundary-pages.md]'
    '(./ORI-VIS-001-complete-the-shared-reading-layout-for-orientation-and-boundary-pages.md)\n\n'
    '- [TASK-FIX-ORI-VIS-001-1.md](./TASK-FIX-ORI-VIS-001-1.md)',
    'sprint link',
)

# --- ROADMAP.md delta 1: the in-flight task addition row
roadmap = replace_once(
    roadmap,
    '| FIX-ORI-AST-004-1 | Publish the docs-owned streamdown dependency-explainer destination'
    ' | astro-implementer | 2 | 17 | ⬜ Pending |',
    '| FIX-ORI-AST-004-1 | Publish the docs-owned streamdown dependency-explainer destination'
    ' | astro-implementer | 2 | 17 | ⬜ Pending |\n'
    '| FIX-ORI-VIS-001-1 | Include the reserved theming entry in section navigation'
    ' | astro-implementer | 1 | 18 | ⬜ Pending |',
    'roadmap row',
)

# --- ROADMAP.md delta 2: the provenance note after the wave-17 note
roadmap = replace_once(
    roadmap,
    "Depends on ORI-AST-008; unblocks ORI-AST-004's remaining streamdown legs and every task"
    ' chained behind it.\n\n#### Dependencies',
    "Depends on ORI-AST-008; unblocks ORI-AST-004's remaining streamdown legs and every task"
    ' chained behind it.\n\n'
    "Added 2026-09-25 via ask `ask-wave18-add-theming-nav-inclusion`:"
    " apps/docs/src/lib/docs-navigation.ts RESERVED_DOC_SLUGS=['theming'] feeds both"
    ' publishedDocs (catch-all route generation, where the exclusion is correct — the static'
    ' /docs/theming route owns the destination) and sectionNavigation (the nav derivation every'
    ' rendered page consumes), so /docs/theming is silently absent from every page\'s section nav'
    ' and the Guides group never renders; ORI-AST-003 landed the static route but never adapted'
    ' the nav its own module comment anticipated ("until ORI-AST-003 adapts it") (ORI-VIS-001'
    ' cycle-1 blocked report, checkpoint 1c732dc1). Depends on ORI-AST-003; unblocks'
    " ORI-VIS-001's AC-2 theming leg and every task chained behind it.\n\n"
    '#### Dependencies',
    'roadmap note',
)

# --- requirements come from the task file's own REQUIREMENT-CONTRACT, guaranteeing parity
contract = json.loads(
    re.search(r'<!-- REQUIREMENT-CONTRACT v1 -->\n<!--\n(.*?)\n-->', task, re.S).group(1)
)

result = {
    'ask_id': 'ask-wave18-add-theming-nav-inclusion',
    'planner': 'astro-planner',
    'files': [
        {'path': TASK_REL, 'expected_sha256': None, 'content': task},
        {'path': SPRINT_REL, 'expected_sha256': EXPECTED[SPRINT_REL], 'content': sprint},
        {'path': ROADMAP_REL, 'expected_sha256': EXPECTED[ROADMAP_REL], 'content': roadmap},
    ],
    'task_plan': {
        'expanded_tasks': [
            {
                'task_id': 'FIX-ORI-VIS-001-1',
                'planner': 'astro-planner',
                'agent': 'astro-implementer',
                'reviewer': 'astro-reviewer',
                'guardrails': {
                    'write_allowed': [
                        'apps/docs/src/lib/docs-navigation.ts (MODIFY)',
                        'tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts (NEW)',
                        '.tmp/FIX-ORI-VIS-001-1/red.json',
                        '.tmp/FIX-ORI-VIS-001-1/green.json',
                        '.tmp/FIX-ORI-VIS-001-1/run.json',
                    ],
                    'write_prohibited': [],
                },
                'requirements': contract['requirements'],
            }
        ],
        'journey_proofs': [],
        'blocked_flows': [],
    },
}

with open(OUT, 'w', encoding='utf-8') as handle:
    json.dump(result, handle, ensure_ascii=False)
    handle.write('\n')

# verify it parses back and report the sha
reread = json.load(open(OUT, encoding='utf-8'))
assert reread['ask_id'] == 'ask-wave18-add-theming-nav-inclusion'
assert [f['path'] for f in reread['files']] == [TASK_REL, SPRINT_REL, ROADMAP_REL]
assert reread['files'][1]['content'] == sprint and reread['files'][2]['content'] == roadmap
assert [req['id'] for req in reread['task_plan']['expanded_tasks'][0]['requirements']] == [
    'AC-1',
    'AC-2',
    'TC-1',
    'TC-2',
]
digest = hashlib.sha256(open(OUT, 'rb').read()).hexdigest()
print(f'OK {OUT}')
print(f'WRITTEN {digest}')
