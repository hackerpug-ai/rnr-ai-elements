import { resolveLiveChatConfig } from '../../../apps/example/lib/live-chat-config';

const asserts: Array<[unknown, boolean]> = [
  [resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: undefined }).ok, false],
  [resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: '' }).ok, false],
  [resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'not-a-url' }).ok, false],
  [resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'ftp://example.com' }).ok, false],
];
for (const [got, want] of asserts) {
  if (got !== want) throw new Error(`seam assertion failed: got ${got}, want ${want}`);
}
const okConfig = resolveLiveChatConfig({ EXPO_PUBLIC_API_BASE_URL: 'http://127.0.0.1:4000' });
if (okConfig.ok !== true) throw new Error('ok config should be ok');
if (okConfig.endpoint !== 'http://127.0.0.1:4000/api/chat') throw new Error('endpoint mismatch: ' + okConfig.endpoint);
console.log('resolveLiveChatConfig seam: all assertions PASS');
