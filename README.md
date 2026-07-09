# Talk to Archi

An AI-powered digital twin of Archishman Choudhury. Not a chatbot, resume, or portfolio — the goal is that talking to it feels like actually talking to him.

**The real, deployable app lives in [`web/`](./web) — see [`web/README.md`](./web/README.md) to run or deploy it.**

## Repo layout

- **`web/`** — the live implementation: a Next.js app with a real streaming Claude backend. This is what you run or deploy.
- **`project/`** — the original Claude Design handoff bundle (HTML/CSS/JS prototype, resume, knowledge base) that `web/` was built from.
- **`chats/`** — the design conversation transcript that shaped the brief in `project/CLAUDE.md`.

## Deploying

`web/` is a standard Next.js app. On Vercel (or similar): import this repo, set the project's **Root Directory to `web`**, and add an `ANTHROPIC_API_KEY` environment variable. See `web/README.md` for details.
