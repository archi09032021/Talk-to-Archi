// Client-safe constants: suggested prompts and easter-egg slash commands.
// The actual persona/knowledge system prompt (lib/persona.ts) stays server-only.

export const EGGS: Record<string, string> = {
  "/music": "Show me your music — the jingles, what you composed, and what music taught you about your craft.",
  "/theatre": "Tell me about your theatre work — the original production you wrote and directed, and what it shaped in you.",
  "/product": "Walk me through your product work — the INME app and digital product strategy.",
  "/marketing": "Walk me through your marketing work — INME, I-PAC, Nestlé — the way you actually think about marketing.",
  "/timeline": "Give me your career timeline — from Nestlé to MICA to I-PAC to INME — as a clean timeline with what each chapter taught you.",
  "/why-openai": "Why OpenAI? Tell me honestly.",
};

export const PROMPTS: string[] = [
  "Tell me about yourself",
  "Show me your best work",
  "Why OpenAI?",
  "Tell me about the INME App",
  "Explain MyQuest",
  "Show your creative work",
  "What have you learned from theatre?",
  "How do you think about Product Marketing?",
  "Convince me to interview you",
];
