Hello {firstName},

This week's 🦄 ai that works session was a deep dive into Claude's agent primitives — skills, slash commands, subagents, and how they actually work under the hood.

The full recording is now on [YouTube](https://www.youtube.com/watch?v=b5O6gb_Zuk8), and all the code is available on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-03-10-claude-agent-skills-deep-dive).

We walked through the full history of how these tools evolved — from slash commands that you could only invoke manually, to custom subagents, to the current skills system — and why that history matters for how you structure things today.

**Actions you can take today:**

**Separate context isolation from instruction modules. They're different problems.** Subagents are for context isolation: when a task is going to generate a ton of tokens (like a Playwright agent clicking around the DOM), you fork it into a subagent so it doesn't pollute your main context. Skills are for instruction modules: when you have a set of instructions you want to inject on demand, like "here's how we write backend code." Don't use subagents to carry instructions — use skills for that.

**Watch your context window tool budget.** Every subagent description, every skill description, and every MCP tool gets injected into your context window on every turn. If you have 30 skills installed globally, those descriptions are eating into the token budget your model uses to follow your actual instructions. Claude Code handles this with a tool search feature once you cross a certain threshold, but the solution is simpler: install fewer things and be intentional about what's global vs. per-project.

**Use `disable_model_invocation: true` for skills that should only be user-triggered.** If you have a skill that's meant to be run as a slash command and not auto-invoked by the agent mid-task, add this flag in the skill frontmatter. It removes the skill from the context window entirely so the model doesn't see it or try to call it on its own.

**If you remember one thing from this session:**

Skills and subagents solve different problems. A subagent gives you a fresh context window — great for long, token-heavy tasks you want to run in isolation. A skill gives you a way to inject instructions into any context window, parent or child, on demand. Most people conflate the two because before skills existed, custom subagents were the only way to bundle instructions. Now that skills exist, you can use each for what it's actually good at.

**Next session: Prompt Injections & Guardrails**

Tomorrow, we're covering prompt injections, one of the bigger risks in agentic systems. Tool output, retrieved documents, and system prompts are all vectors. We'll walk through how to protect system prompts, prevent hijacking, and implement ethical guards in real codebases.

Sign up here: https://luma.com/prompt-injection-guardrails

If you have questions, reply to this email or drop them in [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
