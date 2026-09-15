
# 🦄 ai that works: PII Redaction and Sensitive Data Scrubbing

> When building generative AI systems, one of the biggest risks companies face is the LLM accidentally exposing PII or PHI to an end user that isn't cleared to see it. This week on the podcast, we cover how to fix this problem — prompting techniques, eval strategies, and how to get comfortable shipping these systems to production.

[Video](https://www.youtube.com/watch?v=Ql2gLHWuX7M)

[![PII Redaction and Sensitive Data Scrubbing](https://img.youtube.com/vi/Ql2gLHWuX7M/0.jpg)](https://www.youtube.com/watch?v=Ql2gLHWuX7M)

Links:

## Episode Highlights

## Key Takeaways

- **Separate your PII into two categories before writing a single line of code.** Class 1 is data with serious legal consequences if exposed — SSNs, medical record numbers, financial account details — and should be handled with strict, deterministic software controls with no LLMs in the critical path. Class 2 is contextually sensitive data where the damage is about trust, like a customer's name in the wrong response or an internal employee note leaking to a user; LLMs are great at catching Class 2 because it requires judgment.
- **Build three layers of rules, not one.** Static rules (regex for phone number patterns) handle the obvious stuff fast and cheaply, dynamic rules pull from your actual data so you can match directly against a list of customer names or account IDs in your database, and generative rules use LLMs for ambiguous cases like an address written out in prose. Stack all three and you cover far more ground than any single approach.
- **Write a `check_redaction` function alongside your `redact` function.** The `redact` call scrubs the output while `check_redaction` runs separately and asks whether anything slipped through, often using a second LLM call. This creates a feedback loop that continuously samples real production outputs and flags misses, feeding directly back into improving your rules and prompts over time.
- **PII redaction isn't a prompt engineering problem — it's a masking system.** Your LLM is one component in a pipeline that should also include deterministic rules, database lookups, and a separate verification pass. Teams that get this wrong wrote a single prompt that says "don't reveal PII" and called it done; teams that get it right treat it as a software architecture problem with LLMs as a useful but bounded tool inside it.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=Ql2gLHWuX7M)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

