
# 🦄 ai that works: Prompt Injections & Guardrails

> A major risk factor in agentic coding is Prompt Injections. Tool output, document retrieval, system prompts all get inputted into the LLM and are all at risk of prompt injections. In this episode, we cover how to handle this risk — protecting system prompts, avoiding hijacking, and implementing ethical guards.

[Video](https://www.youtube.com/watch?v=zU8GpxgYDvc)

[![Prompt Injections & Guardrails](https://img.youtube.com/vi/zU8GpxgYDvc/0.jpg)](https://www.youtube.com/watch?v=zU8GpxgYDvc)

Links:

## Episode Highlights

## Key Takeaways

- **The risk profile has three legs, and you only need to break one.** Prompt injection requires three things to go wrong at once: the model sees untrusted input, it has access to sensitive data, and it can reach the outside world — for example, a retrieval-augmented agent reading customer emails, with access to a CRM and outbound email send access. Block any one leg (sandbox the tools, scope the data access, or sanitize inputs) and the attack surface collapses significantly.
- **Structured outputs are not a defense by themselves.** You still need to validate what comes back — check field lengths, types, and content ranges before acting on them. If a malicious instruction makes it into your tool call output and your code is just `.tool_name` without validation, you'll process it. A structured type that passes parsing but has a suspiciously long string in a `reason` field is still worth flagging.
- **Layer fast rules with slower AI checks.** Run deterministic rules first (regex, field validators, blocklists) to catch obvious attacks cheaply, then run a lightweight AI guardrail in the background on anything that slips through. This keeps latency acceptable while still catching the creative stuff — think of it like a bouncer plus a security camera, where you want both.
- **Prompt injection defense is a systems problem, not a prompting problem.** You can't instruct your way out of it. The fix is in how your software layers are designed: it depends on what data the model can see, what actions it can take, and what validation lives between those two things.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=zU8GpxgYDvc)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

