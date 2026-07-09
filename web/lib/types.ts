export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; followups: string[] }
  | { type: "error"; message: string };

export interface UIMessage {
  role: Role;
  text: string;
}
