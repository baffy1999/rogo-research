import { describe, expect, it } from "vitest";
import {
  createConversation,
  MAX_CONVERSATION_MESSAGES,
  parseConversation,
} from "../src/conversation.ts";
import type { Message } from "../src/types.ts";

describe("createConversation", () => {
  it("appends the current user question without mutating existing messages", () => {
    const messages: Message[] = [
      { role: "user", text: "Tell me about Acme." },
      { role: "assistant", text: "Acme is a software company." },
    ];

    const conversation = createConversation(messages, "What are its risks?");

    expect(conversation).toEqual([
      ...messages,
      { role: "user", text: "What are its risks?" },
    ]);
    expect(messages).toHaveLength(2);
  });

  it("keeps only the 12 most recent messages, including the new question", () => {
    const messages: Message[] = Array.from({ length: 12 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      text: `Message ${index + 1}`,
    }));

    const conversation = createConversation(messages, "Latest question");

    expect(conversation).toHaveLength(MAX_CONVERSATION_MESSAGES);
    expect(conversation[0]?.text).toBe("Message 2");
    expect(conversation.at(-1)).toEqual({
      role: "user",
      text: "Latest question",
    });
  });
});

describe("parseConversation", () => {
  it("accepts a valid conversation ending in a user message", () => {
    const conversation: Message[] = [
      { role: "user", text: "Tell me about Acme." },
      { role: "assistant", text: "Acme is a software company." },
      { role: "user", text: "What are its risks?" },
    ];

    expect(parseConversation({ conversation })).toEqual({
      ok: true,
      conversation,
    });
  });

  it.each([
    ["a missing conversation", {}],
    ["a non-array conversation", { conversation: "hello" }],
    ["an empty conversation", { conversation: [] }],
    [
      "too many messages",
      {
        conversation: Array.from(
          { length: MAX_CONVERSATION_MESSAGES + 1 },
          (_, index) => ({ role: "user", text: `Message ${index}` }),
        ),
      },
    ],
    [
      "an unsupported role",
      { conversation: [{ role: "system", text: "Instructions" }] },
    ],
    [
      "empty message text",
      { conversation: [{ role: "user", text: "   " }] },
    ],
    [
      "an assistant message at the end",
      { conversation: [{ role: "assistant", text: "Answer" }] },
    ],
  ])("rejects %s", (_description, body) => {
    expect(parseConversation(body)).toMatchObject({ ok: false });
  });
});
