Hello {firstName},

This week's 🦄 ai that works session was on prompt injections - the attack vector most people building agentic systems aren't thinking about until it bites them.

The full recording is on [YouTube](https://www.youtube.com/watch?v=zU8GpxgYDvc), and all the code is on [GitHub](https://github.com/hellovai/ai-that-works/tree/main/2026-03-17-prompt-injections-guardrails).

Here's what we covered:

**The risk profile has three legs, and you only need to break one.** Prompt injection requires three things to go wrong at once: the model sees untrusted input, it has access to sensitive data, and it can reach the outside world. For example, a retrieval-augmented agent reading customer emails, with access to a CRM, and outbound email send access. Block any one leg (sandbox the tools, scope the data access, or sanitize inputs) and the attack surface collapses significantly.

**Structured outputs are not a defense by themselves.** You still need to validate what comes back. Check field lengths, types, and content ranges before acting on them. If a malicious instruction makes it into your tool call output and your code is just `.tool_name` without validation, you'll process it. A structured type that passes parsing but has a suspiciously long string in a `reason` field is still worth flagging.

**Layer fast rules with slower AI checks.** The pattern that works: run deterministic rules first (regex, field validators, blocklists) to catch obvious attacks cheaply. Then run a lightweight AI guardrail in the background on anything that slips through. This keeps latency acceptable while still catching the creative stuff. Think of it like a bouncer plus a security camera — you want both.

**If you remember one thing from this session:**

Prompt injection defense is a systems problem, not a prompting problem. You can't instruct your way out of it. The fix is in how your software layers are designed. It depends on what data the model can see, what actions it can take, and what validation lives between those two things.

If you have questions, reply to this email or ask on [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
