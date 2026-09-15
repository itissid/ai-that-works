
# 🦄 ai that works: OpenAI tells you not to build your own harness

> A breakdown of OpenAI's harness engineering article and Ryan Lopopolo's claim that custom coding harnesses will be "bitter lessened away" — plus why Dex and Vaibhav think the labs don't actually own this space as firmly as they claim.

[Video](https://www.youtube.com/watch?v=h99bTZTR_IU)

[![OpenAI tells you not to build your own harness](https://img.youtube.com/vi/h99bTZTR_IU/0.jpg)](https://www.youtube.com/watch?v=h99bTZTR_IU)

## Episode Highlights

> "While alternative coding harnesses may have short-term lift, they will be bitter lessened away. I am bearish on any harness that doesn't come from the lab whose model you are using. You're fighting against post-training." — Ryan Lopopolo, OpenAI

> "As long as you know the shape of the call that the model prefers to make, nothing prevents you from having the model make that shape of call. There's nothing."

> "If you're doing 500 tool calls on a coding agent task, [a 1% accuracy drop] compounds real fast."

> "Your job is not to build any one while loop. Your job is to always build the next while loop."

> "It's the velocity, not the position."

> "Your skill set is your ability to understand core concepts and reapply them over and over again in a very different way."

## Key Takeaways

- **Post-training gives labs a real but narrow edge.** When a lab post-trains a model on a specific tool call format (like Claude Code's `old_string`/`new_string` edit tool), the model gets slightly better at that exact shape. Across hundreds of tool calls in a coding task, even a 1% improvement compounds hard. But "slightly better" is the honest framing — these models are general enough that switching formats doesn't crater performance.
- **The harness runs on your machine, which means the API surface is always observable.** Any alpha a lab bakes into tool call formats is inspectable by proxying the LLM API. You can disassemble binaries, trace syscalls, or just ask an agent to reverse-engineer a minified harness. Secrets don't stay secret when user code runs in user environments.
- **The real edge lives in the outer harness, not the inner one.** Inner harness (tool definitions, implementations) is where labs have post-training leverage. Outer harness — orchestration, stacking while loops, injecting domain context — is where builders have alpha. An outer loop that knows your team's engineering workflow will outperform a generic inner loop every time.
- **For complex data types, the labs haven't caught up.** Recursive types, discriminated unions, deeply nested schemas — there's less training data for these, which means custom structured output solutions (BAML, DSPy) can outperform the model's native tool calling on these specific cases.
- **Surfing the releases is a skill.** New model drops, you context-engineer on top of it faster than the training cycle. The models change every few months. What lasts is the velocity: your ability to understand fundamentals and rebuild on top of whatever ships next.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=h99bTZTR_IU)
- [GitHub Repo](https://github.com/ai-that-works/ai-that-works/tree/main/2026-05-05-openai-tells-you-not-to-build-your-own-harness)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

## Links
