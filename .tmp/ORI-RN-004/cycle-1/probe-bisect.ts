/**
 * Diagnostic probe #5 (not product code): replay the captured regenerate body and
 * bisect which element the provider rejects: full body, de-duplicated ids,
 * without empty assistants, without providerMetadata/state, without step-start.
 */
import { readFileSync } from 'node:fs';

import { launchOwnedBackend } from '../../../tests/sprint-05-orient-search/support/live-backend';

type Msg = {
  id: string;
  role: string;
  parts: Array<Record<string, unknown>>;
};

async function send(port: number, label: string, body: unknown): Promise<void> {
  const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  await res.text();
  void res;
  void label;
}

async function main(): Promise<void> {
  const backend = await launchOwnedBackend({ maxOutputTokens: 4096 });
  if (!backend.started) throw new Error('backend failed');
  const original = JSON.parse(
    readFileSync('.tmp/ORI-RN-004/cycle-1/regenerate-body.json', 'utf8'),
  ) as { id: string; messages: Msg[]; trigger: string };

  const cases: Array<[string, unknown]> = [];

  cases.push(['full', original]);

  const dedup = {
    ...original,
    messages: original.messages.filter((m, i) => original.messages.findIndex((x) => x.id === m.id) === i),
  };
  cases.push(['dedup-ids', dedup]);

  const noEmpty = {
    ...original,
    messages: original.messages.filter((m) => m.parts.length > 0),
  };
  cases.push(['no-empty-assistants', noEmpty]);

  const stripPartExtras = {
    ...original,
    messages: original.messages.map((m) => ({
      ...m,
      parts: m.parts.map((p) => {
        const { providerMetadata, state, ...rest } = p as Record<string, unknown>;
        void providerMetadata;
        void state;
        return rest;
      }),
    })),
  };
  cases.push(['no-part-extras', stripPartExtras]);

  const noStepStart = {
    ...original,
    messages: original.messages.map((m) => ({
      ...m,
      parts: m.parts.filter((p) => p.type !== 'step-start'),
    })),
  };
  cases.push(['no-step-start', noStepStart]);

  for (const [label, body] of cases) {
    await send(backend.port, label, { ...body, id: `bisect-${label}` });
    await new Promise((r) => setTimeout(r, 2500));
    const rec = backend.records().at(-1);
    console.log(
      label.padEnd(20),
      rec ? `${rec.outcome} deltas=${rec.deltaCount} ${rec.errorText ?? ''}` : 'NO RECORD',
    );
  }
  await backend.stop();
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
