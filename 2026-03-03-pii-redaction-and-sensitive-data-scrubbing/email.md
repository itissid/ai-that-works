Hello {firstName},

This week's 🦄 ai that works session was about PII redaction and sensitive data scrubbing in production AI systems.

The full recording is now on [YouTube](https://www.youtube.com/watch?v=Ql2gLHWuX7M), and all the code is available on [GitHub](https://github.com/hellovai/ai-that-works/tree/main/2026-03-03-pii-redaction-and-sensitive-data-scrubbing).

The session started from a real problem: your LLM is chatting with a support agent, and it accidentally surfaces a customer's SSN or home address from the context. How do you stop that? We built out a practical approach from scratch.

**Actions you can take today:**

**Separate your PII into two categories before writing a single line of code.**
Class 1 is things with serious legal consequences if exposed: SSNs, medical record numbers, financial account details. Handle those with strict, deterministic software controls. No LLMs in the critical path. Class 2 is contextually sensitive data where the damage is about trust: a customer's name in the wrong response, an internal employee note leaking to a user. LLMs are actually great for catching Class 2, because it requires judgment.

**Build three layers of rules, not one.**
Static rules (regex for phone number patterns) handle the obvious stuff fast and cheaply. Dynamic rules pull from your actual data, so if you have a list of customer names or account IDs in your database, you can match against those directly. Generative rules use LLMs for the ambiguous cases, like an address written out in prose. Stack all three and you cover a lot more ground than any single approach.

**Write a `check_redaction` function alongside your `redact` function.**
The `redact` call scrubs the output. The `check_redaction` call runs separately and asks: did anything slip through? You can use a second LLM call here. This creates a feedback loop where you're continuously sampling real production outputs and flagging misses, which feeds directly back into improving your rules and prompts over time.

**If you remember one thing from this session:**

PII redaction isn't a prompt engineering problem. It's a masking system. Your LLM is one component in a pipeline that should also include deterministic rules, database lookups, and a separate verification pass. The teams that get this wrong are the ones who wrote a single prompt that says "don't reveal PII" and called it done. The teams that get it right treat it as a software architecture problem with LLMs as a useful but bounded tool inside it.

**Next session: Claude Agent Skills Deep Dive**

Tomorrow, we're covering something a lot of people have been asking about: what exactly are Claude's skills, commands, agents, and subagents, and how do you use them well? There's a lot of assumed knowledge in the current literature, so we're going to ground it from first principles and walk through when to reach for each one.

Sign up here: https://luma.com/claude-skills-deep-dive

If you have questions, reply to this email or drop them in [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
