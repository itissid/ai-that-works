Hello {firstName},

This week's 🦄 ai that works session was about streaming — not just getting LLM tokens out faster, but building a full real-time site summarizer with Server-Sent Events that streams results back to the browser as they're generated.

The full recording is on [YouTube](https://www.youtube.com/watch?v=9MFiATinGC0), and all the code is on [GitHub](https://github.com/hellovai/ai-that-works/tree/main/2026-04-07-sse-streaming).

**SSE is simpler than you think — and usually enough.** Server-Sent Events are a one-way protocol: the server pushes updates, the client listens. No handshake complexity, no bidirectional overhead. For most AI streaming use cases — showing users what the agent is doing, streaming LLM output to the browser — SSE gets you there faster than WebSockets with less code to maintain.

**BAML's `@stream.done` and `@stream.not_null` give you semantic control over what streams.** Not every field should stream token-by-token. With `@stream.done`, a field like a title only appears once it's complete — no partial "SS" showing up before "SSE Streaming" finishes. With `@stream.not_null`, the parent object waits to appear until a key discriminator field is known. So instead of streaming empty objects, you wait until you have enough signal to show something meaningful.

**Batch your async calls, don't just fire them all at once.** When you crawl a site and summarize 20 pages in parallel, naive async gives you 20 simultaneous LLM calls. We used `asyncio.Semaphore` to limit concurrency to a sensible batch size — fast enough to stream results progressively to the user, without hammering the API rate limits or blowing through your budget.

**Streaming is an architectural choice, not a performance trick.** The real win isn't latency. It's that users can see progress, understand what the agent is doing, and decide whether to cancel. When your site summarizer has crawled 3 pages out of 20, the user knows it's working. If the summaries aren't what they wanted, they can stop it early. That kind of responsiveness changes the feel of an app from "waiting for a result" to "watching something think."

**If you remember one thing from this session:**

Streaming makes your AI app feel alive. A user asking your app to summarize a website shouldn't see a spinner for 30 seconds and then get a wall of text. They should see results appearing as they're ready. SSE + batched async + BAML's streaming attributes is a complete pattern you can drop into any FastAPI app today.

**Next session: Building a Software Factory using Eval-Driven Development**

Sign up here: [Sign up link]

If you have questions, reply to this email or ask on [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
