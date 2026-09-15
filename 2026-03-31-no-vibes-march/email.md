Hello {firstName},

This week's 🦄 ai that works session was a live coding one. Vaibhav built a testing framework for BAML — a non-trivial compiler feature — from scratch, while walking through the design decisions in real time.

The full recording is on [YouTube](https://www.youtube.com/watch?v=0rMG-3iiilc), and all the code is on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-03-31-no-vibes-march).

Here's what we covered:

**Tests for non-deterministic systems need scenarios, not asserts.** When your system is an LLM, a boolean pass/fail test doesn't tell you much. Instead, define named scenarios ("glasses on" vs "glasses off") and collect soft metrics with `check`. The scenario passes when 80% of runs hit your threshold, not when every individual invocation does. This means you get useful signal even on a system that's supposed to vary.

**Collect test cases from production, not your imagination.** The test cases you write by hand represent the behavior you expected. The ones sampled from your production logs represent what users are actually doing. Vaibhav's framework lets you load test cases dynamically from a database — or even sample 1% of last month's real traffic — so your evals track what matters as your app evolves.

**Collect all test cases before running any of them.** Good testing libraries do a full collection sweep before execution begins. The reason: you can't parallelize runs without knowing what you're running. If your framework feeds one test off the collection at a time, you're leaving a lot of performance on the table.

**The model is sycophantic — and that's your problem to solve.** When you tell a model to do something, it assumes you're right. Even the best models will follow a bad idea if you frame it as a decision rather than a suggestion. Vaibhav spent multiple hours in design. He iterated, asked the model for options, steered it away from approaches that "just felt wrong" specifically to avoid the situation where your mistakes compound into a 10,000-line PR you can't debug. The rule: if it's a suggestion, say so. Don't outsource the thinking.

**If you remember one thing from this session:**

The upfront design work isn't overhead. It's the whole strategy. By the time Vaibhav handed the design doc to the coding agent, the feature basically wrote itself. That's what happens when the spec is tight enough that the only remaining work is execution.

**Next session: Evals Revisited!**

Tomorrow, we're getting into the practical side of building evals for AI systems embedded in software development pipelines — how to define what "good" looks like when AI is writing code, reviewing PRs, or generating tests.

Sign up here: https://luma.com/evals-revisited

If you have questions, reply to this email or ask on [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
