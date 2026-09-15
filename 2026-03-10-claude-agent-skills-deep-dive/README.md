
# 🦄 ai that works: Claude Agent Skills Deep Dive

> Claude Code has exploded in its abilities over the past 8 months, and it can be hard to keep up. Seemingly overnight, everyone is discussing claude's skills, commands, agents, and subagents, and a lot of the literature out there already assumes you know what these are. In this episode, we go over all of them — what each one is, how and when to use it, the tradeoffs, and how they fit into the broader context engineering picture.

[Video](https://www.youtube.com/watch?v=b5O6gb_Zuk8)

[![Claude Agent Skills Deep Dive](https://img.youtube.com/vi/b5O6gb_Zuk8/0.jpg)](https://www.youtube.com/watch?v=b5O6gb_Zuk8)

Links:

## Episode Highlights

## Key Takeaways

- **Skills and subagents solve different problems — don't conflate them.** A subagent gives you a fresh context window, great for long, token-heavy tasks you want to run in isolation. A skill gives you a way to inject instructions into any context window, parent or child, on demand. Most people conflate the two because before skills existed, custom subagents were the only way to bundle instructions; now that skills exist, you can use each for what it's actually good at.
- **Use subagents for context isolation, not for carrying instructions.** When a task is going to generate a ton of tokens — like a Playwright agent clicking around the DOM — you fork it into a subagent so it doesn't pollute your main context. For a set of instructions you want to inject on demand, like "here's how we write backend code," reach for a skill instead.
- **Watch your context window tool budget.** Every subagent description, every skill description, and every MCP tool gets injected into your context window on every turn. If you have 30 skills installed globally, those descriptions are eating into the token budget your model uses to follow your actual instructions. Claude Code mitigates this with a tool search feature past a certain threshold, but the simpler fix is to install fewer things and be intentional about what's global vs. per-project.
- **Use `disable_model_invocation: true` for skills that should only be user-triggered.** If you have a skill meant to be run as a slash command and not auto-invoked by the agent mid-task, add this flag in the skill frontmatter. It removes the skill from the context window entirely, so the model doesn't see it or try to call it on its own.

## Resources

- [rpi-coordination repository](https://github.com/humanlayer/rpi-coordination-template)
- [Session Recording](https://www.youtube.com/watch?v=b5O6gb_Zuk8)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

<img width="1364" height="340" alt="2026-03-10-ai-that-works-agent-stuff (1)" src="https://github.com/user-attachments/assets/31247f25-9f05-4a36-99bd-1aad0d8d559f" />


<img width="2212" height="838" alt="2026-03-10-ai-that-works-agent-stuff (2)" src="https://github.com/user-attachments/assets/301cae1c-6cff-468c-be87-55c193b21104" />

<img width="1963" height="595" alt="2026-03-10-ai-that-works-agent-stuff (3)" src="https://github.com/user-attachments/assets/afbacefb-b4e2-4b0e-b0fb-15bbe98af765" />

<img width="550" height="814" alt="2026-03-10-ai-that-works-agent-stuff (4)" src="https://github.com/user-attachments/assets/dcace952-d8b6-4b22-8028-596be61696bb" />

<img width="1748" height="920" alt="2026-03-10-ai-that-works-agent-stuff (6)" src="https://github.com/user-attachments/assets/130ca5cc-40f4-4a56-a1f1-69458864b52a" />


<img width="1931" height="1251" alt="2026-03-10-ai-that-works-agent-stuff" src="https://github.com/user-attachments/assets/25998486-7685-4bcb-8f9f-7c1cdca9b22d" />


