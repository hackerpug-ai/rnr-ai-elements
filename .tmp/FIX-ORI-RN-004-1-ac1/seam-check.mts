import { resolveLiveChatConfig } from '../../apps/example/lib/live-chat-config';

const asserts: Array<[string, boolean]> = [
  ['undefined -> !ok', resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: undefined }).ok === false],
  ["'' -> !ok", resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: '' }).ok === false],
  ['not-a-url -> !ok', resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'not-a-url' }).ok === false],
  ['ftp:// -> !ok', resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'ftp://example.com' }).ok === false],
];
const okConfig = resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'http://127.0.0.1:4100' });
asserts.push(['ok for http', okConfig.ok === true]);
asserts.push(['endpoint derived', okConfig.endpoint === 'http://127.0.0.1:4100/api/chat']);

let failed = false;
for (const [name, pass] of asserts) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failed = true;
}
process.exit(failed ? 1 : 0);
