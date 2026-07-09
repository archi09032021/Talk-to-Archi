"use client";

import { colors, serif } from "@/lib/theme";
import { PROMPTS } from "@/lib/commands";
import { Composer } from "./Composer";
import { Pill } from "./Pill";

export function Landing({
  leaving,
  input,
  onInputChange,
  onSend,
}: {
  leaving: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text?: string) => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "40px 24px",
        overflowY: "auto",
        transition: "opacity .5s ease,transform .5s ease",
        opacity: leaving ? 0 : 1,
        transform: `translateY(${leaving ? -20 : 0}px)`,
      }}
    >
      <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", margin: "auto" }}>
        <h1
          style={{
            margin: "0 0 30px",
            fontSize: 56,
            fontWeight: 300,
            lineHeight: 1.12,
            letterSpacing: "-0.015em",
            color: colors.textBright,
            animation: "ttaFadeUp .7s ease both",
          }}
        >
          Hello.
          <br />
          I&apos;m Archishman.
        </h1>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 19,
            lineHeight: 1.7,
            color: colors.textMuted,
            animation: "ttaFadeUp .7s ease .12s both",
          }}
        >
          Most people send resumes. I thought I&apos;d send{" "}
          <em style={{ fontFamily: serif, fontStyle: "italic", color: colors.text, fontSize: 21 }}>myself</em>.
        </p>
        <p
          style={{
            margin: "0 0 40px",
            fontSize: 19,
            lineHeight: 1.7,
            color: colors.textMuted,
            animation: "ttaFadeUp .7s ease .2s both",
          }}
        >
          I&apos;ve been trained on everything I&apos;ve built, written, designed and learned. Instead of reading a
          PDF&nbsp;— ask me anything.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 40,
            animation: "ttaFadeUp .7s ease .3s both",
          }}
        >
          {PROMPTS.map((label) => (
            <Pill key={label} onClick={() => onSend(label)}>
              {label}
            </Pill>
          ))}
        </div>
        <div style={{ width: "100%", animation: "ttaFadeUp .7s ease .4s both" }}>
          <Composer
            value={input}
            onChange={onInputChange}
            onSend={() => onSend()}
            placeholder="Ask Archi anything..."
            autoFocus
            large
          />
        </div>
        <p
          style={{
            margin: "18px 2px 0",
            fontSize: 12.5,
            color: colors.textFaint,
            animation: "ttaFadeUp .7s ease .5s both",
          }}
        >
          Try <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>/theatre</span>,{" "}
          <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>/music</span>,{" "}
          <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>/timeline</span>,{" "}
          <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>/why-openai</span> — or{" "}
          <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>/resume</span> if you really want the PDF.
        </p>
      </div>
    </div>
  );
}
