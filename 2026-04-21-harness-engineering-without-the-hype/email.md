Hello {firstName},

This week's 🦄 ai that works session was about harness engineering. Not the hype version. The real one — what it actually is, where it came from, and when it's genuinely worth your time.

The full recording is on [YouTube](https://www.youtube.com/watch?v=gX9WpYY61xA), and the notes are on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-04-21-harness-engineering-without-the-hype).

**A harness is the OS around the while loop.** The core agent pattern hasn't changed since 2023: send a context window to an LLM, get a tool call back, execute it, repeat. What harnesses add is batteries — automatic CLAUDE.md loading, context compression, built-in MCP registration, extension points. Swapping your raw LLM loop for Claude Code is mostly copy-paste with some nice defaults included.

**The one genuinely new thing: RLing a model on specific tools.** If you try to run Claude Code in the Codex harness, it falls apart. If you try to run a GPT model trained on `apply_patch` against Claude Code's `old_string/new_string` edit tool, it has no idea what to do. The model gets RL'd on the tool interface, and that specialization is real product alpha. This is the part of "harness engineering" that's worth getting excited about — building and owning a harness your model trains against.

**Nested while loops = nested intelligence.** Sub-agents are a while loop with another while loop inside. Orchestrators wrap that. GasTowns wrap the orchestrators. Every layer adds abstraction. But Vaibhav's point was sharp: before you add a second while loop, exhaust everything you can do with the first one. Better system prompt, better tool design, better context engineering. Only reach for the next layer when the current layer is genuinely maxed out.

**The compiler analogy.** Claude Code's team is like a compiler. They have 40-50 engineers constantly optimizing the harness. You should only "beat the compiler" when you have domain knowledge so specific that the general-purpose solution can't touch it — like handwriting assembly when you know something about cache locality that the compiler can't generalize. For 90% of your prompts, the compiler wins. For your one critical financial filing workflow that has to be 99.8% accurate, that's when you roll up your sleeves.

**Surfing the models is a real skill.** New model drops. Your context engineering gives it a head start. You iterate fast. You can learn to use models faster than the labs can release new ones. The code you wrote may expire — the intuition for using models well compounds.

**If you remember one thing from this session:**

Look at the data. Vaibhav said it plainly: the most common mistake in context engineering and harness engineering is that people say "Claude, figure it out" and never look at what comes back. Auto-research is powerful, but Viv flagged the failure mode — a generated system prompt with 60 if-else cases that overfit the eval set completely. The solution isn't less automation. It's having a human look at the actual outputs and decide if they make sense.

**Next session: No Vibes Allowed — Building Design Docs with AI**

Vaibhav is going to show how he uses AI to write design docs for complicated BAML features. Real task, real production system, no demos. That's tomorrow, April 28th.

Sign up here: https://luma.com/no-vibes-design-docs

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
