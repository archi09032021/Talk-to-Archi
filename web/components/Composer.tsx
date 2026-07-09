"use client";

import { KeyboardEvent } from "react";
import { colors } from "@/lib/theme";

export function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  autoFocus,
  large,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  autoFocus?: boolean;
  large?: boolean;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: "100%",
          background: colors.bgInput,
          border: `1px solid ${colors.borderSoft}`,
          borderRadius: 16,
          padding: large ? "17px 60px 17px 20px" : "16px 60px 16px 20px",
          fontSize: large ? 15.5 : 15,
          color: colors.text,
          outline: "none",
          transition: "border-color .18s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = colors.borderFocus)}
        onBlur={(e) => (e.currentTarget.style.borderColor = colors.borderSoft)}
      />
      <button
        onClick={onSend}
        aria-label="Send"
        style={{
          position: "absolute",
          right: large ? 10 : 9,
          top: "50%",
          transform: "translateY(-50%)",
          width: large ? 38 : 36,
          height: large ? 38 : 36,
          borderRadius: "50%",
          border: "none",
          background: colors.text,
          color: colors.bg,
          fontSize: large ? 18 : 17,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = colors.text)}
      >
        ↑
      </button>
    </div>
  );
}
