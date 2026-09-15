
# 🦄 ai that works: Harness Engineering Without the Hype

> Cutting through the discourse around harness engineering to separate signal from noise — what's actually new, what's just rebranded agent engineering, and when it's worth building your own.

[Video](https://www.youtube.com/watch?v=gX9WpYY61xA)

[![Harness Engineering Without the Hype](https://img.youtube.com/vi/gX9WpYY61xA/0.jpg)](https://www.youtube.com/watch?v=gX9WpYY61xA)

Guests: Viv (LangChain), Jeff Dean (creator of the Ralph Wiggum Loop), Dex Horthy, Vaibhav Gupta. Recorded live from AI Engineer Miami at the CodeRabbit podcast studio.

Links:

- [Ralph Wiggum Agent Loop](https://github.com/ai-that-works/ai-that-works/tree/main/2025-10-28-ralph-wiggum-coding-agent-power-tools)
- [Context Engineering Deep Dive](https://github.com/ai-that-works/ai-that-works/tree/main/2025-07-08-context-engineering)
- [12 Factor Agents](https://github.com/humanlayer/12-factor-agents)

## Episode Highlights

> "The harness is really the operating system around the agent — and the agent is the while true loop."

> "All that happened in the last year is you took the agent loop, copied it, swapped out the LLM call with Claude Code calls, and got some nice batteries included: context compression, automatic CLAUDE.md loading, built-in MCPs."

> "You should totally exhaust all the avenues in the single-while-loop stack before you even think about adding a second while loop. Don't throw more compute at the problem when you could sit down with your team and figure out the right instruction set."

> "Harness engineering is only genuinely new when you're RLing a model on a specific set of tools. That's the thing worth hyping. A GPT-trained-on-apply-patch model cannot do old-string/new-string. That gap is real and it's where product alpha lives."

> "Look at the damn data. I see this all the time — people just say 'Claude, figure it out' and never look at what's coming back."

> "Surfing the models: you can always do more context engineering on top of a new model release. Yes, some code becomes irrelevant — but if you have good evals, the new code is cheap to write. The evals are what survive."

> "You're not a senior engineer right now unless you can teach these primitives — draw a sequence diagram of how inferencing works, design a tool, explain what a sub-agent is under the hood."

## Key Takeaways

- **A harness is the OS, the agent is the while loop.** The agent loop — tool calls, LLM, response, repeat — hasn't fundamentally changed since 2023. What harnesses add is an opinionated execution environment: permissions, context management, MCP registration, extension points. Claude Code is both an agent and a harness at the same time.
- **Nested while loops are how you scale intelligence.** Sub-agents are just a while loop with another while loop inside. Orchestrators wrap that. Gastons wrap the orchestrators. Every layer buys you abstraction. The question is always whether the added abstraction justifies the complexity for your specific task.
- **Only build your own harness if you're going to RL a model on your tools.** Otherwise you're fighting against a 40-50 person engineering team that is constantly making the existing harness better. The compiler analogy applies: you should only handwrite assembly when you *know* you understand something about the data pattern that the compiler cannot generalize.
- **Evals are the spec that outlives everything else.** The code you write today may be irrelevant in six months. Your eval set — especially if it's grounded in production traces — encodes what the system needs to do regardless of which model or harness you're using. Auto-research can optimize against evals, but watch for overfitting (if the generated system prompt looks like 60 if-else cases, you've overfit).
- **"Surfing the models" is a real skill.** New model drops, your context engineering gets a head start, you iterate. You can learn to use models faster than they release new ones. That 5-10% edge compounds.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=gX9WpYY61xA)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

