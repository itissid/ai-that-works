Hello {firstName},

This week's 🦄 ai that works session explored the Ralph Wiggum Technique—a thought experiment about what happens when you run a ridiculously simple prompt in a while loop and see how far it can go.

The full recording is now on [YouTube](https://www.youtube.com/watch?v=fOPvAPdqgPo), and all the code is available on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2025-10-28-ralph-wiggum-coding-agent-power-tools).

Ralph Wiggum isn't a product or recipe; it's a concept. What if you just ran "take one step, commit, repeat" in a loop? We built a Next.js to-do app live to explore this. The code doesn't get to 100% (yet), but the exploration reveals fascinating patterns. Geoff actually made it work for creating [Cursed Lang](https://cursed-lang.org/) - a whole language!

**What we learned building with the Ralph loop:**

**Short loops beat long context every time.** Don't ask the model to "please keep working". Just exit and restart. Fresh context = smarter decisions. The model doesn't get confused, you save tokens, and errors don't compound.

**Back pressure is your governor.** Tests, types, and builds are steering mechanisms. Strong typing in Rust/Zig gives you honest feedback. Weak typing means your agent can hallucinate success for hours.

**Specs before code changes everything.** We generated specs first, then code. One bad spec line can waste tens of thousands of tokens downstream. Get the ideas right first.

**Context budgeting keeps you in the smart zone.** Many agents benefit from staying under 40% context usage. The Ralph loop naturally enforces this by exiting frequently.

**The implementation details:**

- Exit after every meaningful change (don't batch operations)
- Commit working code immediately (creates rollback points)
- Use rolling implementation plans that evolve with the codebase
- Gate progress with real checks (tests must pass, builds must succeed)
- Configure minimal secrets by hand (don't let agents touch production configs)

**Next Session: Event-driven Agentic Loops (Nov 4th)**

How do you build agents that can handle interrupts, manage queues, and maintain state across complex workflows? Next week we're exploring event sourcing architecture for agents—type-safe patterns that enable resilient, interactive agent systems. Expect deep dives into real implementation patterns, not theory.

Sign up here: https://luma.com/event-driven-agents

If you have questions about this episode, reply to this email or ask on [Discord](https://boundaryml.com/discord). We read everything!

Happy coding 🧑‍💻

Vaibhav & Dex