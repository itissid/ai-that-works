
# 🦄 ai that works: No Vibes Allowed - Building Design Docs with AI

> In this month's No Vibes Allowed episode, Vaibhav shows how he uses AI to build design docs for complicated tasks by working through an actual design doc for a threading system in BAML. Real code, real trade-offs, real production systems.

[Video](https://www.youtube.com/watch?v=KCqsoXveqiI)

[![No Vibes Allowed - Building Design Docs with AI](https://img.youtube.com/vi/KCqsoXveqiI/0.jpg)](https://www.youtube.com/watch?v=KCqsoXveqiI)

## Episode Highlights

> "Implementation can often be one-shot if the design is phenomenally correct. But phenomenally correct design is very hard to do."

> "We generate slop code and don't care what it does. As long as the workflow is good, we're very happy. This is what we mean by fighting slop with slop."

> "The call site determines if it's happening concurrently or not. That's the key insight — we don't want function coloring forcing async all the way up the stack."

> "When you're doing an incredibly hard problem, good design can break it into four or five chunks that are each individually one-shot implementable."

## Key Takeaways

- Design docs pay off at implementation time. When a design is thorough and correct, coding agents can one-shot individual chunks. Spending days in design is not wasted time — it's scope reduction.
- Fight slop with slop. Internal tooling doesn't need to be clean. Build quick, AI-generated tools to manage design docs, keep them reviewable, and connect them to Slack — then let coding agents maintain that tooling so you never have to.
- The problem of "colored functions" is real in agentic systems. When async needs to propagate all the way up the call stack, it creates massive diffs. Design your concurrency model to let the call site decide, not the function signature.
- BEPs (BAML Enhancement Proposals) are a concrete pattern for structured design thinking. Each BEP documents why a feature is needed, the trade-offs considered, and what decision was made — giving AI models rich context when implementing.
- Involve your team by making design docs readable. GitHub isn't built for sharing large markdown files with comments. A simple internal dashboard with Slack integration makes design review a habit rather than a chore.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=KCqsoXveqiI)
- [GitHub Repo](https://github.com/ai-that-works/ai-that-works/tree/main/2026-04-28-no-vibes-design-docs)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

## Links
