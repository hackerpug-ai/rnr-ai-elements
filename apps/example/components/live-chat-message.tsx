import { type UIMessage } from 'ai';

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageResponse,
} from '@/components/ai/message';

/**
 * Live chat turn — one chronological UIMessage rendered for the text-only worked
 * example.
 *
 * The live screen carries no tools, files, reasoning or attachments, so every part
 * that is not a `text` part is dropped here rather than half-rendered. The remaining
 * text parts are joined into a single string for `MessageResponse`, whose `children`
 * contract is string-only and whose default renderer is the plain RNR Text (Expo Go
 * compatible — no markdown native module).
 */

/** Joins the narrowed text parts of a message into the single string the default
 * MessageResponse renders. Non-text parts (step-start, reasoning, …) are ignored. */
function textOf(message: UIMessage): string {
  let out = '';
  for (const part of message.parts) {
    if (part.type === 'text') {
      out += part.text;
    }
  }
  return out;
}

export function LiveChatMessage({ message }: { message: UIMessage }) {
  return (
    <Message from={message.role}>
      {message.role === 'assistant' ? <MessageAvatar fallback="AI" /> : null}
      <MessageContent>
        <MessageResponse>{textOf(message)}</MessageResponse>
      </MessageContent>
    </Message>
  );
}
