Hello {firstName},

This week's 🦄 ai that works session was a live coding one. Dex built message queuing into Riptide, the HumanLayer IDE, while Vaibhav watched and kept things honest.

The full recording is on [YouTube](https://www.youtube.com/watch?v=YcT7gjzj2TU), and all the code is on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-02-24-no-vibes-february).

The feature itself is simple to describe: right now, if Claude is mid-task and you want to send a follow-up, your only option is to interrupt. The goal was to let you queue a message instead—so if Claude is running `bash sleep 10` and you type "when you're done, sleep again," it holds that until Claude finishes rather than cutting it off.

**Actions you can take today:**

**Run learning tests before you write implementation code.** Before touching Riptide's code, Dex had Claude write a 20-line test that actually exercises the Claude Agent SDK queue behavior. The test runs `bash sleep 3`, immediately queues a follow-up message, and checks what comes back. If the SDK doesn't behave the way the docs claim, you'll find out in 30 seconds instead of three days into a feature branch.

**Use three kinds of research, not one.** Most people do code research (read the codebase) or web research (read the docs). The third type—proof research, running small programs against the real system—is the one that catches the expensive assumptions. The Claude Agent SDK's core binary is minified and closed source, so the only way to know exactly how message queuing works is to run it and look at the output.

**Plan vertically, not horizontally.** Instead of building the full UI layer, then the API, then the backend, pick one testable slice and take it all the way through. For this feature that meant getting one message successfully queued and delivered end-to-end before worrying about edge cases like multiple queued messages or cancellations.

**If you remember one thing from this session:**

The faster you want to move, the more you have to invest upfront in being right. Discovering a wrong assumption before you write code costs 20 minutes. Discovering it after you've merged means untangling all the downstream decisions built on top of it. Learning tests are the fastest way to convert assumptions into facts.

**Next session: PII Redaction and Sensitive Data Scrubbing**

Next Tuesday, March 3rd, we're covering one of the messier problems in production AI systems: how to stop LLMs from accidentally exposing PII or PHI to users who shouldn't see it. We'll get into prompting techniques and, more importantly, how to build evals that give you enough confidence to actually ship.

Sign up here: https://luma.com/pii-scrubbing

If you have questions, reply to this email or drop them in [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
