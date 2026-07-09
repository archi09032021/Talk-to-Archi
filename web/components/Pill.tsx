"use client";

import { CSSProperties, ReactNode } from "react";
import { colors } from "@/lib/theme";

export function Pill({
  onClick,
  children,
  style,
}: {
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: `1px solid ${colors.border}`,
        borderRadius: 999,
        padding: "9px 15px",
        color: "#c9c2b4",
        fontSize: 13.5,
        cursor: "pointer",
        fontFamily: "inherit",
        lineHeight: 1.3,
        transition: "border-color .18s,color .18s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderHover;
        e.currentTarget.style.color = colors.text;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.color = "#c9c2b4";
      }}
    >
      {children}
    </button>
  );
}
