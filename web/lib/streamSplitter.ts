// Splits a token-by-token stream of model output into the visible reply body
// and the trailing "FOLLOWUPS:" block the system prompt asks for, without
// ever letting a fragment of the marker flash in the visible body.
const MARKER = /FOLLOWUPS:\s*/i;
const HOLD = 30;

export function createFollowupSplitter(onBodyDelta: (text: string) => void) {
  let running = "";
  let sentUpTo = 0;
  let markerFound = false;
  let followupsRaw = "";

  function push(text: string) {
    if (markerFound) {
      followupsRaw += text;
      return;
    }

    running += text;
    const m = running.slice(sentUpTo).match(MARKER);
    if (m && m.index !== undefined) {
      markerFound = true;
      const markerStart = sentUpTo + m.index;
      const bodyPart = running.slice(sentUpTo, markerStart).replace(/\n+[-—]{3,}\s*$/, "").trimEnd();
      if (bodyPart) onBodyDelta(bodyPart);
      followupsRaw = running.slice(markerStart + m[0].length);
      sentUpTo = running.length;
      return;
    }

    const safeUpTo = Math.max(sentUpTo, running.length - HOLD);
    if (safeUpTo > sentUpTo) {
      onBodyDelta(running.slice(sentUpTo, safeUpTo));
      sentUpTo = safeUpTo;
    }
  }

  function finish(): { followups: string[] } {
    if (!markerFound && running.length > sentUpTo) {
      onBodyDelta(running.slice(sentUpTo));
    }
    const followups = followupsRaw
      .split("\n")
      .map((l) => l.match(/^\s*\d+[.)]\s*(.+)/))
      .filter((x): x is RegExpMatchArray => !!x)
      .map((x) => x[1].trim())
      .slice(0, 3);
    return { followups };
  }

  return { push, finish };
}
