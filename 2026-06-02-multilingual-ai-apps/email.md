Hello {firstName},

This week's 🦄 ai that works session was about building multilingual AI apps that actually hold up in production.

The full recording is on [YouTube](https://www.youtube.com/watch?v=-gFdtc-HbOY), and the notes are on [GitHub](https://github.com/hellovai/ai-that-works/tree/main/2026-06-02-multilingual-ai-apps).

**LLMs speak multiple languages. Your pipeline doesn't.** When your system prompt is in English, your tool names are in English, and your few-shot examples are in English, you end up with a context that's 80% English even when the user writes in French. The model will almost always respond in English. The model's multilingual capability doesn't save you here because it's being outvoted by your prompt.

**The parallel pipeline approach sounds logical but breaks in practice.** The obvious fix is to build a French version of the pipeline alongside the English one. The problem: now you have two eval matrices to maintain, two sets of prompts to keep in sync, and a team that probably speaks English and maybe one other language reviewing prompts for ten. Your French users will always be a few iterations behind your English users. Vaibhav's analogy: this is why Mac apps get updates a month before their Windows versions.

**Build once in English. Normalize at the edges.** The pattern that actually works is: translate the user's input to English before it touches your main pipeline, run your English pipeline as normal, then translate the response back in a way that matches the original tone. This is exactly what voice agents do — speech-to-text in, text-to-speech out, with your agent in the middle never knowing the difference. The translation work lives in small, cheap models (Vaibhav's generated pipeline picked Haiku); your core agent doesn't change at all.

**Tone preservation is where this gets interesting.** If a user sends a message mixing Hindi and English, the output translation step can match that pattern back. Vaibhav ran a live demo booking a flight "from Bangalore to Goa, 3 passengers, business class" in a Hindi/English mix and the response matched the same register. That kind of coherence is impossible to get from a parallel pipeline approach without a ton of extra work.

**Add a fast-path for your majority language users.** A simple heuristic — count common English words in the input — lets you skip the translation layer entirely for native English speakers. No latency penalty for your most common case, full multilingual support for everyone else. You eval the translation nodes independently since they're doing a much narrower job, and the main pipeline evals you already have cover everything downstream.

**If you remember one thing from this session:**

Treat language translation as a pre- and post-processing wrapper around your core pipeline, not as a capability you ask the model to handle mid-flow. Your pipeline is already English-biased by construction. Work with that instead of fighting it. Build one great English pipeline, then put a thin normalization layer on each end. Every eval you write, every prompt you improve, every optimization you ship benefits every language at once.

**Next session: Agent Observability, June 9th**

Your agent did something weird three days ago and you have no idea why. Print statements don't scale, and re-running the agent won't reproduce it. We're digging into structured logging, tracing, and how to reconstruct an agent's exact decision tree after the fact. If you're running anything in production, this one is directly applicable. Sign up here: https://luma.com/agent-observability

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
