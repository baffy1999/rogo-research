export interface Message {
  role: "user" | "assistant";
  text: string;
}

export interface Conversation extends Array<Message> {}
