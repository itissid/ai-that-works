Hello {firstName},

This week's 🦄 ai that works session was No Vibes Allowed: building design docs with AI for genuinely hard problems.

The full recording is on [YouTube](https://www.youtube.com/watch?v=KCqsoXveqiI), and the notes are on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-04-28-no-vibes-design-docs).

**If the design is good, implementation can be one-shot.** Vaibhav spent four days designing BAML's threading system before writing a single line of code. Not because he was stuck — because a thorough enough design means you can break the work into five chunks, each of which a coding agent can implement without additional guidance. The upfront cost buys you a much cheaper execution phase.

**It is okay to write slop to fight slop.** The BAML team built an internal tool called BEPs (BAML Enhancement Proposals) to manage their design docs. It's a web UI with Slack integration, versioning, and comment threads. Vaibhav freely admitted: he has no idea what the code looks like. He never opened an editor to build it. Coding agents wrote and maintain it, and that's fine, because it's not customer-facing. The output quality is what matters. The code is a means to an end.

**Meeting transcripts are design doc raw material.** When Vaibhav finished a two-hour huddle about the threading design, he copied the full Granola transcript into Claude and asked it to re-outline the BEP with all the implicit decisions made explicit. Things like: can futures be shared across threads? What happens when a parent spawn is cancelled? Can you await a future twice? Those are decisions that live in the transcript and never make it into the doc unless you extract them deliberately.

**If you remember one thing from this session:**

You cannot one-shot a hard problem. But you can one-shot a well-scoped chunk of a hard problem. The design work doesn't eliminate implementation complexity — it splits it into pieces that are small enough to hand off. That's the actual job of a good design doc: not to document decisions, but to make execution tractable.

**Tomorrow's session: OpenAI tells you not to build your own harness**

OpenAI published an article in February arguing the era of hand-written code is over. They shipped a million-line product with zero manual coding. We're breaking it down live. That's tomorrow.

Sign up here: https://luma.com/harness-eng-article-discussion

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
