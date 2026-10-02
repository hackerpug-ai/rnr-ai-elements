"""Export an existing native Claude handoff; never reauthor response content."""

import ast
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path('/Users/justinrich/Projects/rnr-ai-elements')
BASE = Path('/Users/justinrich/.claude/projects/-Users-justinrich-Projects-rnr-ai-elements')
PARENT = '980eaef0-1402-4f2d-a8d3-7109ca2d872c'
AGENT = 'a86f5372a397fc1f3'
RESPONSE = 'b245852d-c41a-47d8-bdda-be065a8a606b'
REQUEST = '591da0ba-fa1d-4fc0-8137-2f65b6c4de78'
TASK = 'FIX-ORI-RN-004-3'
OUT = Path(__file__).resolve().parent


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def select(path, uuid):
    source = path.read_bytes()
    matches = []
    offset = 0
    for number, raw in enumerate(source.splitlines(keepends=True), 1):
        row = json.loads(raw)
        if row.get('uuid') == uuid:
            matches.append((row, raw, number, offset))
        offset += len(raw)
    assert len(matches) == 1
    return source, matches[0]


def emit(name, raw):
    path = OUT / name
    if path.exists():
        assert path.read_bytes() == raw, f'Conflicting retained artifact: {path}'
    else:
        path.write_bytes(raw)


def json_bytes(value):
    return (json.dumps(value, indent=2) + '\n').encode()


source_path = BASE / PARENT / 'subagents' / f'agent-{AGENT}.jsonl'
source, (response, response_raw, line_number, byte_offset) = select(source_path, RESPONSE)
_, (request, request_raw, _, _) = select(source_path, REQUEST)
meta_path = source_path.with_suffix('.meta.json')
meta_raw = meta_path.read_bytes()
meta = json.loads(meta_raw)
state = json.loads((ROOT / '.kb-run-sprint/sprint-05-orient-search/state.json').read_bytes())
task = state['tasks'][TASK]
registration = task['implementer_session']
assert response['type'] == 'assistant' and response['isSidechain'] is True
assert response['agentId'] == AGENT and response['sessionId'] == PARENT
assert request['agentId'] == AGENT and request['sessionId'] == PARENT
assert response['message']['stop_reason'] == 'end_turn'
assert registration['session_id'] == registration['dispatch_handle'] == AGENT
assert registration['implementer'] == meta['agentType']
assert registration['dispatch_receipt'] == {
    'agent': meta['agentType'], 'session_id': AGENT, 'dispatch_handle': AGENT, 'task': TASK,
}
assert len(response['message']['content']) == 1
assert response['message']['content'][0]['type'] == 'text'
text = response['message']['content'][0]['text']
blocks = re.findall(r'```json\n(.*?)\n```', text, re.S)
assert len(blocks) == 1
# Preserve every character between the JSON fence lines, including its final LF.
payload_raw = (blocks[0] + '\n').encode()
payload = json.loads(payload_raw)
assert task['merge_sha'] in payload['done']
assert task['merge_sha'] in request['message']['content']

# Run the current production pure schema validator, without module imports,
# state stores, filesystem mutation, or synthesized replacement implementation.
validator_path = Path('/Users/justinrich/Projects/brain/tools/sprint-handoff/sprint_handoff.py')
tree = ast.parse(validator_path.read_bytes())
nodes = [node for node in tree.body if
    isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name in {'Blocked', 'validate_handoff'}
    or isinstance(node, ast.Assign) and any(
        isinstance(target, ast.Name) and target.id in {'HANDOFF_KEYS', 'STRING_ARRAY_KEYS'}
        for target in node.targets)]
namespace = {'Any': object}
exec(compile(ast.Module(body=nodes, type_ignores=[]), str(validator_path), 'exec'), namespace)
namespace['validate_handoff'](payload, TASK, task['approved_sha'])
for ancestor, descendant in [(task['approved_sha'], task['merge_sha']), (task['merge_sha'], 'main')]:
    subprocess.run(['git', '-C', str(ROOT), 'merge-base', '--is-ancestor', ancestor, descendant], check=True)

# Cross-check the child's role and identity against the original parent's native
# Agent invocation and native tool result, not the child's prose.
parent_path = BASE / f'{PARENT}.jsonl'
parent_source = parent_path.read_bytes()
dispatches = []
results = []
for raw in parent_source.splitlines(keepends=True):
    row = json.loads(raw)
    for content in row.get('message', {}).get('content', []):
        if not isinstance(content, dict):
            continue
        if content.get('id') == meta['toolUseId']:
            assert content['name'] == 'Agent'
            assert content['input']['subagent_type'] == meta['agentType']
            dispatches.append((row, raw))
        if content.get('tool_use_id') == meta['toolUseId']:
            assert AGENT in json.dumps(content['content'])
            results.append((row, raw))
assert len(dispatches) == len(results) == 1

receipt = {
    'agent': meta['agentType'],
    'session_id': response['agentId'],
    'dispatch_handle': registration['dispatch_handle'],
    'response_id': response['uuid'],
    'payload_sha256': digest(payload_raw),
}
audit = {
    'method': 'Exact existing native response extraction; no resume or successor identity',
    'source_path': str(source_path), 'source_bytes': len(source), 'source_sha256': digest(source),
    'response_line': line_number, 'response_byte_offset': byte_offset,
    'response_row_bytes': len(response_raw), 'response_row_sha256': digest(response_raw),
    'response_uuid': response['uuid'], 'message_id': response['message']['id'],
    'response_timestamp': response['timestamp'], 'parent_session_id': response['sessionId'],
    'original_agent_id': response['agentId'], 'meta_sha256': digest(meta_raw),
    'parent_source_path': str(parent_path), 'parent_source_sha256': digest(parent_source),
    'dispatch_uuid': dispatches[0][0]['uuid'], 'dispatch_tool_use_id': meta['toolUseId'],
    'dispatch_result_uuid': results[0][0]['uuid'], 'post_merge_request_uuid': request['uuid'],
    'handoff_bytes': len(payload_raw), 'handoff_sha256': digest(payload_raw),
    'approved_sha': task['approved_sha'], 'merge_sha': task['merge_sha'],
    'current_task_sha256': digest((ROOT / registration['task_path']).read_bytes()),
    'registered_task_sha256': registration['task_sha256'],
    'registered_dispatch_receipt_sha256': registration['dispatch_receipt_sha256'],
    'schema_validation': 'current production validate_handoff passed',
    'ancestry_validation': 'approved -> merge -> main passed',
    'receipt_mapping': 'agent from native meta and parent Agent invocation; session from native agentId; handle cross-checked against registration; response_id from native UUID; payload hash from exact fenced bytes',
}
for name, raw in {
    'native-response.jsonl': response_raw,
    'native-response.txt': text.encode(),
    'native-post-merge-request.jsonl': request_raw,
    'native-agent.meta.json': meta_raw,
    'native-dispatch.jsonl': dispatches[0][1],
    'native-dispatch-result.jsonl': results[0][1],
    'handoff.json': payload_raw,
    'response-receipt.json': json_bytes(receipt),
    'extraction-audit.json': json_bytes(audit),
}.items():
    emit(name, raw)
print(json.dumps(audit, indent=2))
