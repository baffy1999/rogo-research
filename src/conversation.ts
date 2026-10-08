import type { Conversation, Message } from "./types.ts";

export const MAX_CONVERSATION_MESSAGES = 12;

export type ConversationParseResult =
  | { ok: true; conversation: Conversation }
  | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMessage(value: unknown): value is Message {
  return (
    isObject(value) &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.text === "string" &&
    value.text.trim().length > 0
  );
}

export function createConversation(
  messages: readonly Message[],
  question: string,
): Conversation {
  return [...messages, { role: "user" as const, text: question }].slice(
    -MAX_CONVERSATION_MESSAGES,
  );
}

export function parseConversation(body: unknown): ConversationParseResult {
  if (!isObject(body) || !Array.isArray(body.conversation)) {
    return {
      ok: false,
      error: "Request body must include a conversation array.",
    };
  }

  if (
    body.conversation.length === 0 ||
    body.conversation.length > MAX_CONVERSATION_MESSAGES
  ) {
    return {
      ok: false,
      error: `Conversation must contain between 1 and ${MAX_CONVERSATION_MESSAGES} messages.`,
    };
  }

  if (!body.conversation.every(isMessage)) {
    return {
      ok: false,
      error:
        'Each message must have a role of "user" or "assistant" and non-empty text.',
    };
  }

  const conversation = body.conversation;
  const lastMessage = conversation.at(-1);

  if (!lastMessage || lastMessage.role !== "user") {
    return {
      ok: false,
      error: "The last conversation message must be from the user.",
    };
  }

  return { ok: true, conversation };
}
