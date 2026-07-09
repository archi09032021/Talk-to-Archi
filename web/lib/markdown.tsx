import React, { Fragment, ReactNode } from "react";

// Minimal Markdown -> React renderer for Archi's replies. Deliberately not
// using dangerouslySetInnerHTML: everything below builds real React elements,
// so there is no HTML-injection surface even though the text ultimately comes
// from the model.

const STYLES = {
  p: { margin: "0 0 14px", lineHeight: 1.68, fontSize: 16 } as React.CSSProperties,
  h3: {
    margin: "24px 0 10px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: ".15em",
    textTransform: "uppercase",
    color: "#9c958a",
  } as React.CSSProperties,
  ul: { margin: "0 0 16px", paddingLeft: 22 } as React.CSSProperties,
  li: { margin: "0 0 7px", lineHeight: 1.62, fontSize: 16 } as React.CSSProperties,
  bq: {
    margin: "18px 0",
    padding: "2px 0 2px 18px",
    borderLeft: "2px solid rgba(236,231,221,.25)",
    fontFamily: "'Newsreader',serif",
    fontStyle: "italic",
    fontSize: 17.5,
    lineHeight: 1.6,
    color: "#c9c2b4",
  } as React.CSSProperties,
  strong: { fontWeight: 600, color: "#fdf8ee" } as React.CSSProperties,
  code: {
    fontFamily: "ui-monospace,Menlo,monospace",
    fontSize: ".88em",
    background: "rgba(236,231,221,.08)",
    padding: "2px 6px",
    borderRadius: 5,
  } as React.CSSProperties,
  hr: { border: "none", borderTop: "1px solid rgba(236,231,221,.12)", margin: "20px 0" } as React.CSSProperties,
  a: { color: "#ece7dd", textDecoration: "underline", textUnderlineOffset: 3 } as React.CSSProperties,
};

// Tokenizes `**bold**`, `*italic*`, `` `code` `` and `[text](url)` within a single line.
function renderInline(text: string): ReactNode[] {
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\((https?:[^)]+)\))/g;
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      out.push(
        <strong key={key++} style={STYLES.strong}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      out.push(
        <code key={key++} style={STYLES.code}>
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const url = match[1];
      out.push(
        <a key={key++} href={url} target="_blank" rel="noopener noreferrer" style={STYLES.a}>
          {label}
        </a>
      );
    } else {
      out.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderArchiMarkdown(src: string): ReactNode {
  const lines = src.split("\n");
  const blocks: ReactNode[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const Tag = list.type;
    blocks.push(
      <Tag key={key++} style={STYLES.ul}>
        {list.items.map((item, i) => (
          <li key={i} style={STYLES.li}>
            {renderInline(item)}
          </li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const raw of lines) {
    let m: RegExpMatchArray | null;
    if (/^\s*$/.test(raw)) {
      flushList();
      continue;
    }
    if ((m = raw.match(/^#{1,4}\s+(.+)/))) {
      flushList();
      blocks.push(
        <h3 key={key++} style={STYLES.h3}>
          {renderInline(m[1])}
        </h3>
      );
    } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(raw)) {
      flushList();
      blocks.push(<hr key={key++} style={STYLES.hr} />);
    } else if ((m = raw.match(/^\s*[-•*]\s+(.+)/))) {
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(m[1]);
    } else if ((m = raw.match(/^\s*\d+[.)]\s+(.+)/))) {
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(m[1]);
    } else if ((m = raw.match(/^>\s?(.*)/))) {
      flushList();
      blocks.push(
        <blockquote key={key++} style={STYLES.bq}>
          {renderInline(m[1])}
        </blockquote>
      );
    } else {
      flushList();
      blocks.push(
        <p key={key++} style={STYLES.p}>
          {renderInline(raw)}
        </p>
      );
    }
  }
  flushList();

  return <Fragment>{blocks}</Fragment>;
}
