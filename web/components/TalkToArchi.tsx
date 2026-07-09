"use client";

import { useEffect, useRef, useState } from "react";
import { EGGS } from "@/lib/commands";
import { ChatStreamEvent, UIMessage } from "@/lib/types";
import { colors } from "@/lib/theme";
import { Landing } from "./Landing";
import { ChatView } from "./ChatView";

const STORAGE_KEY = "tta-state-v1";
const CONNECTION_HICCUP =
  "Hm — I lost my train of thought there (a connection hiccup on my end, not yours). Mind asking that again?";

type PersistedState = {
  msgs: UIMessage[];
  followups: string[];
  interview: boolean;
};

export function TalkToArchi() {
  const [view, setView] = useState<"landing" | "chat">("landing");
  const [leaving, setLeaving] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<UIMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [followups, setFollowups] = useState<string[]>([]);
  const [interview, setInterview] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);
  const hydrated = useRef(false);

  // Load any prior conversation on mount.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as PersistedState | null;
      if (saved && saved.msgs && saved.msgs.length) {
        setMsgs(saved.msgs);
        setFollowups(saved.followups || []);
        setInterview(!!saved.interview);
        setView("chat");
      }
    } catch {
      // ignore corrupt storage
    } finally {
      hydrated.current = true;
    }
  }, []);

  // Persist whenever the durable parts of state change (skip the initial hydration write).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ msgs, followups, interview }));
    } catch {
      // storage may be unavailable (private mode, quota) — non-fatal
    }
  }, [msgs, followups, interview]);

  // Keep the transcript scrolled to the latest message / streamed token.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = msgs.length !== prevLen.current;
    prevLen.current = msgs.length;
    if (busy || streamingText != null || grew) el.scrollTop = el.scrollHeight;
  }, [msgs, busy, streamingText]);

  function goChat() {
    if (view === "landing" && !leaving) {
      setLeaving(true);
      setTimeout(() => {
        setView("chat");
        setLeaving(false);
      }, 480);
    }
  }

  function pushLocal(userText: string, reply: string, followupList: string[]) {
    goChat();
    setMsgs((prev) => prev.concat([{ role: "user", text: userText }, { role: "assistant", text: reply }]));
    setFollowups(followupList);
    setBusy(false);
    setStreamingText(null);
  }

  async function ask(prompt: string, mode: "interview" | "recruiter" | null, displayText?: string) {
    goChat();
    const shown = displayText || prompt;
    const nextMsgs = msgs.concat([{ role: "user", text: shown }]);
    setMsgs(nextMsgs);
    setBusy(true);
    setFollowups([]);
    setStreamingText(null);

    const history = nextMsgs.slice(-14).map((m) => ({ role: m.role, content: m.text }));
    history[history.length - 1] = { role: "user", content: prompt };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode }),
      });
      if (!res.ok || !res.body) throw new Error(`request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";
      let finalFollowups: string[] = [];
      let sawError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line) as ChatStreamEvent;
          if (evt.type === "delta") {
            full += evt.text;
            setStreamingText(full);
          } else if (evt.type === "done") {
            finalFollowups = evt.followups;
          } else if (evt.type === "error") {
            sawError = true;
          }
        }
      }

      if (sawError || !full.trim()) {
        setMsgs((prev) => prev.concat([{ role: "assistant", text: CONNECTION_HICCUP }]));
        setFollowups([]);
      } else {
        setMsgs((prev) => prev.concat([{ role: "assistant", text: full }]));
        setFollowups(finalFollowups);
      }
    } catch {
      setMsgs((prev) => prev.concat([{ role: "assistant", text: CONNECTION_HICCUP }]));
      setFollowups([]);
    } finally {
      setBusy(false);
      setStreamingText(null);
    }
  }

  function handleCommand(t: string) {
    const cmd = t.toLowerCase().split(/\s/)[0];
    if (cmd === "/resume") {
      const a = document.createElement("a");
      a.href = "/Archishman-Choudhury-Resume.pdf";
      a.download = "Archishman-Choudhury-Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      pushLocal(
        t,
        "There it goes — downloading now. That's the two-page version of me.\n\nThough between us: the PDF is the trailer, this conversation is the film. Pick any bullet point on it and I'll tell you what actually happened behind it.",
        ["What's the story behind the 2.8x ROAS at INME?", "What did I-PAC teach you about scale?", "What have you learned from theatre?"]
      );
      return;
    }
    const q = EGGS[cmd];
    if (q) {
      ask(q, interview ? "interview" : null, t);
    } else {
      pushLocal(
        t,
        "Hm, that's not a door I've built yet. The ones that open: `/music` `/theatre` `/product` `/marketing` `/timeline` `/why-openai` — or `/resume` for the PDF.",
        ["Tell me about yourself", "Show me your best work", "Convince me to interview you"]
      );
    }
  }

  function send(text?: string) {
    const t = (text != null ? text : input).trim();
    if (!t || busy) return;
    setInput("");
    if (t[0] === "/") return handleCommand(t);
    ask(t, interview ? "interview" : null);
  }

  function newChat() {
    setMsgs([]);
    setFollowups([]);
    setBusy(false);
    setStreamingText(null);
    setView("landing");
    setLeaving(false);
    setInput("");
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: colors.bg,
        color: colors.text,
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      {view === "landing" ? (
        <Landing leaving={leaving} input={input} onInputChange={setInput} onSend={send} />
      ) : (
        <ChatView
          msgs={msgs}
          streamingText={streamingText}
          busy={busy}
          followups={followups}
          input={input}
          onInputChange={setInput}
          onSend={send}
          interview={interview}
          onToggleInterview={() => setInterview((v) => !v)}
          onRecruiter={() => ask("Should we interview Archi? Give me the honest brief.", "recruiter", "Should we interview Archi?")}
          onNewChat={newChat}
          scrollRef={scrollRef}
        />
      )}
    </div>
  );
}
