
# 🦄 ai that works: No Vibes Allowed March Edition

> This week on the podcast is our March episode of our no vibes allowed series! Join us to watch how we implement everything we discuss on a weekly basis in our company's product. Real code, real trade-offs, and real production systems.

[Video](https://www.youtube.com/watch?v=0rMG-3iiilc)

[![No Vibes Allowed March Edition](https://img.youtube.com/vi/0rMG-3iiilc/0.jpg)](https://www.youtube.com/watch?v=0rMG-3iiilc)

Links:

## Episode Highlights

## Key Takeaways

- **Tests for non-deterministic systems need scenarios, not asserts.** When your system is an LLM, a boolean pass/fail test doesn't tell you much. Instead, define named scenarios ("glasses on" vs "glasses off") and collect soft metrics with `check`. The scenario passes when 80% of runs hit your threshold, not when every individual invocation does — so you get useful signal even on a system that's supposed to vary.
- **Collect test cases from production, not your imagination.** The cases you write by hand represent the behavior you expected; the ones sampled from production logs represent what users are actually doing. Vaibhav's framework lets you load test cases dynamically from a database — or even sample 1% of last month's real traffic — so your evals track what matters as your app evolves.
- **Collect all test cases before running any of them.** Good testing libraries do a full collection sweep before execution begins, because you can't parallelize runs without knowing what you're running. If your framework feeds one test off the collection at a time, you're leaving a lot of performance on the table.
- **The model is sycophantic — and that's your problem to solve.** When you tell a model to do something, it assumes you're right, and even the best models will follow a bad idea if you frame it as a decision rather than a suggestion. Vaibhav spent multiple hours in design, asking the model for options and steering it away from approaches that "just felt wrong" — specifically to avoid mistakes compounding into a 10,000-line PR you can't debug. The rule: if it's a suggestion, say so. Don't outsource the thinking.
- **Upfront design work isn't overhead — it's the whole strategy.** By the time Vaibhav handed the design doc to the coding agent, the feature basically wrote itself. That's what happens when the spec is tight enough that the only remaining work is execution.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=0rMG-3iiilc)
- [Code](https://github.com/ai-that-works/ai-that-works/tree/main/2026-03-31-no-vibes-march)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

