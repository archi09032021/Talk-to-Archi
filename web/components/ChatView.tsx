"use client";

import { RefObject } from "react";
import { colors } from "@/lib/theme";
import { UIMessage } from "@/lib/types";
import { renderArchiMarkdown } from "@/lib/markdown";
import { Composer } from "./Composer";
import { Pill } from "./Pill";

function TypingCursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 17,
        background: colors.text,
        marginLeft: 3,
        verticalAlign: -2,
        animation: "ttaBlink 1s steps(1) infinite",
      }}
    />
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", margin: "22px 0", height: 12 }}>
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.dotColor,
            animation: `ttaPulse 1.2s infinite ${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ChatView({
  msgs,
  streamingText,
  busy,
  followups,
  input,
  onInputChange,
  onSend,
  interview,
  onToggleInterview,
  onRecruiter,
  onNewChat,
  scrollRef,
}: {
  msgs: UIMessage[];
  streamingText: string | null;
  busy: boolean;
  followups: string[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text?: string) => void;
  interview: boolean;
  onToggleInterview: () => void;
  onRecruiter: () => void;
  onNewChat: () => void;
  scrollRef: RefObject<HTMLDivElement>;
}) {
  const hasFollowups = followups.length > 0 && !busy;
  const thinking = busy && streamingText == null;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        animation: "ttaFadeUp .5s ease both",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "13px 24px",
          borderBottom: "1px solid rgba(236,231,221,.09)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: colors.textBright }}>Archishman Choudhury</div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: colors.textDim }}>
            digital twin
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onToggleInterview}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "none",
              border: `1px solid ${colors.border}`,
              borderRadius: 999,
              padding: "7px 13px",
              color: "#c9c2b4",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color .18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.borderHover)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: interview ? colors.text : "rgba(236,231,221,.22)",
                transition: "background .18s",
              }}
            />
            {interview ? "Interview mode · on" : "Interview mode"}
          </button>
          <button
            onClick={onRecruiter}
            style={{
              background: colors.text,
              color: colors.bg,
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.text)}
          >
            Should we interview Archi?
          </button>
          <button
            onClick={onNewChat}
            style={{
              background: "none",
              border: `1px solid ${colors.border}`,
              borderRadius: 999,
              padding: "7px 13px",
              color: "#c9c2b4",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color .18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.borderHover)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
          >
            New chat
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "28px 24px 8px", minHeight: 0 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column" }}>
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div
                key={i}
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "78%",
                  background: colors.bubbleBg,
                  border: `1px solid ${colors.bubbleBorder}`,
                  padding: "12px 18px",
                  borderRadius: "18px 18px 4px 18px",
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: colors.bubbleText,
                  margin: "20px 0 8px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            ) : (
              <div key={i} style={{ margin: "8px 0 6px", color: "#ded8cc" }}>
                {renderArchiMarkdown(m.text)}
              </div>
            )
          )}
          {streamingText != null && (
            <div style={{ margin: "8px 0 6px", color: "#ded8cc" }}>
              {renderArchiMarkdown(streamingText)}
              <TypingCursor />
            </div>
          )}
          {thinking && <ThinkingDots />}
          {hasFollowups && (
            <div
              style={{
                margin: "14px 0 10px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                animation: "ttaFadeUp .4s ease both",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: colors.textDim }}>
                You might also want to ask
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {followups.map((q) => (
                  <Pill
                    key={q}
                    onClick={() => onSend(q)}
                    style={{ padding: "8px 14px", fontSize: 13, textAlign: "left", lineHeight: 1.4 }}
                  >
                    {q}
                  </Pill>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: 28 }} />
        </div>
      </div>

      <div style={{ padding: "12px 24px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <Composer value={input} onChange={onInputChange} onSend={() => onSend()} placeholder="Ask Archi anything..." />
        </div>
      </div>
    </div>
  );
}
