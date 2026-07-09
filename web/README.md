# Talk to Archi

Live implementation of the "Talk to Archi" design (see `../README.md` and `../chats/chat1.md` for the original design brief and decisions). Next.js App Router + a server-side streaming route that calls the real Anthropic API — this is not the design-tool prototype, it actually answers.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Environment variables

- `ANTHROPIC_API_KEY` (required) — your Anthropic API key. The chat route (`app/api/chat/route.ts`) is the only place it's used; it never reaches the browser.
- `ARCHI_MODEL` (optional) — overrides the model id, defaults to `claude-sonnet-5`.

## Layout

- `app/page.tsx` + `components/TalkToArchi.tsx` — the app: landing → chat state machine, localStorage persistence, easter-egg commands.
- `app/api/chat/route.ts` — streams a real Anthropic completion back to the browser as NDJSON, stripping the persona's `FOLLOWUPS:` trailer out of the visible reply and delivering it as a separate `followups` list.
- `lib/persona.ts` — the system prompt + knowledge base (server-only; ported from `../project/knowledge/persona.js`).
- `lib/commands.ts` — client-safe suggested prompts + `/slash` command map.
- `lib/streamSplitter.ts` — the marker-stripping logic used by the API route.
- `lib/markdown.tsx` — small Markdown → React renderer for assistant replies (no `dangerouslySetInnerHTML`).

## Deploy

Any Next.js host works (Vercel, etc.) — set `ANTHROPIC_API_KEY` in the host's environment variables and deploy the `web/` directory.
