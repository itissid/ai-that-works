# 🦄 ai that works: SSE Streaming

> Build a real-time site summarizer using Server-Sent Events (SSE) streaming. Crawl a website, summarize each page with an LLM using BAML's semantic streaming, and stream partial results back to the browser as they're generated.

[Video](https://www.youtube.com/watch?v=9MFiATinGC0)

[![SSE Streaming](https://img.youtube.com/vi/9MFiATinGC0/0.jpg)](https://www.youtube.com/watch?v=9MFiATinGC0)

## Links

## Whiteboards

## Key Takeaways

- **SSE is simpler than you think — and usually enough.** Server-Sent Events are a one-way protocol: the server pushes updates, the client listens. There's no handshake complexity and no bidirectional overhead. For most AI streaming use cases — showing users what the agent is doing, streaming LLM output to the browser — SSE gets you there faster than WebSockets with less code to maintain.
- **BAML's `@stream.done` and `@stream.not_null` give you semantic control over what streams.** Not every field should stream token-by-token. With `@stream.done`, a field like a title only appears once it's complete — no partial "SS" showing up before "SSE Streaming" finishes. With `@stream.not_null`, the parent object waits to appear until a key discriminator field is known, so you stream meaningful objects instead of empty ones.
- **Batch your async calls, don't just fire them all at once.** When you crawl a site and summarize 20 pages in parallel, naive async gives you 20 simultaneous LLM calls. Using `asyncio.Semaphore` to cap concurrency to a sensible batch size keeps results streaming progressively to the user without hammering API rate limits or blowing through your budget.
- **Streaming is an architectural choice, not a performance trick.** The real win isn't latency — it's that users can see progress, understand what the agent is doing, and decide whether to cancel. When the site summarizer has crawled 3 pages out of 20, the user knows it's working and can stop early if the summaries aren't what they wanted. That changes the feel of an app from "waiting for a result" to "watching something think."
- **Streaming makes your AI app feel alive.** A user asking your app to summarize a website shouldn't see a spinner for 30 seconds and then get a wall of text — they should see results appearing as they're ready. SSE + batched async + BAML's streaming attributes is a complete pattern you can drop into any FastAPI app today.

---

## Demo

Crawls a website, summarizes each page with an LLM (via BAML), and streams the results over SSE.

## Setup

```bash
uv sync
export OPENAI_API_KEY=sk-...
```

## Run

### CLI mode

```bash
uv run python main.py
```

Prints a summary of each page to stdout.

### Server mode (SSE)

```bash
uv run fastapi dev main.py
```

Then open: http://localhost:8000/summaries

Pass a custom URL: http://localhost:8000/summaries?url=https://boundaryml.com/podcast

### Regenerate BAML client

After editing any `.baml` file in `baml_src/`:

```bash
uv run baml-cli generate
```
