import Anthropic from "@anthropic-ai/sdk";
import { buildSystem, Mode } from "@/lib/persona";
import { createFollowupSplitter } from "@/lib/streamSplitter";
import { ChatMessage, ChatStreamEvent } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = process.env.ARCHI_MODEL || "claude-sonnet-5";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LEN = 6000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let payload: { messages?: ChatMessage[]; mode?: string | null };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (!messages.length) return json({ error: "messages required" }, 400);
  if (messages.length > MAX_MESSAGES) return json({ error: "too many messages" }, 400);
  for (const m of messages) {
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return json({ error: "malformed message" }, 400);
    }
    if (m.content.length > MAX_MESSAGE_LEN) return json({ error: "message too long" }, 400);
  }

  const mode: Mode = payload.mode === "interview" || payload.mode === "recruiter" ? payload.mode : null;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "server not configured: ANTHROPIC_API_KEY missing" }, 500);

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      const splitter = createFollowupSplitter((text) => send({ type: "delta", text }));

      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          system: buildSystem(mode),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        anthropicStream.on("text", (text) => splitter.push(text));
        await anthropicStream.finalMessage();

        const { followups } = splitter.finish();
        send({ type: "done", followups });
      } catch (e) {
        send({ type: "error", message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
