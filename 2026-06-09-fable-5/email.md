Hello {firstName},

This week's 🦄 ai that works session went completely off-script. We had agent observability on the calendar, but Anthropic shipped Fable 5 about twenty minutes before we went live. So we threw out the plan and got hands-on with the new model instead. Zero prep, all live.

The full recording is on [YouTube](https://www.youtube.com/watch?v=hTkmSVuDMPg), and the notes are on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-06-09-agent-observability).

**Test a new model on the hardest problem you're already living in, not a toy.** The fastest way to learn nothing about a release is to hand it something Opus already nails. You won't see the gap. Vaibhav's rule is "hardest problem only," and ideally one you have fresh mental context on. He pointed Fable at an in-progress design doc for the BAML VM's observability layer, a problem the whole team has been grinding on for weeks. If you give it something you already understand cold, you can actually judge the answer.

**The first thing to look for is comprehension, not output.** Vaibhav's opening move with any new model isn't "can it do the work," it's "can it explain my in-progress task back to me." He fed Fable two dense design docs and asked it to describe the proposed architecture, draw diagrams, and flag anything missing. If it hands back a coherent summary and surfaces one or two details you hadn't considered, that's a solid win. That's the leverage you're hunting for before you ever trust it to write code.

**Keep a personal benchmark of problems that beat the models.** Dex keeps a text file of git SHAs paired with prompts: check out this commit, give it this prompt, and you've recreated a bug that took a week to solve and that the model choked on. His test for Fable was an old Human Layer race condition where approvals from Claude Code get correlated to the wrong session. Fable added correlation but piped through a key that isn't guaranteed unique per tool call, so it still missed the root cause. These hand-built mini-benches are worth more than any public leaderboard because the pain is burned into your memory.

**Model quality is really about how many constraints it can hold at once.** Fable did catch some nice things: swapping wall-clock time for a causality clock, trimming bookkeeping the docs assumed was necessary. But it missed that spawning thousands of threads means you need U64 thread IDs, not U32. At 10,000 threads per second, a U32 ID collides in five days. A U64 takes 585,000 years at a million per second. That constraint was written right into the design doc and Fable skipped it. The real measure of a model is whether it can attend to tens or hundreds of constraints when designing a solution, and that's exactly where they still fall short.

**Most model releases are more hype than day-to-day value, and that's fine.** Fable is probably smarter than Opus, but in this session it failed to one-shot both of our hardest problems, and it felt noticeably slower and thinkier (slow enough that Vaibhav thinks most people putting it in a product pipeline will need to redesign their UX so users tolerate the wait). Here's the thing though: if it handles even one more constraint than Opus before you have to step in, that's worth switching for. Cutting your corrections from five per conversation down to two roughly doubles your effectiveness.

**If you remember one thing from this session:**

Don't judge a new model by its launch-day demos or a clever one-shot puzzle. Judge it by handing it the hardest problem you're currently stuck on, the one where you know the right answer, and watching how many of your real constraints it actually holds in its head. The code a model writes for you expires. The skill of surfing new models, knowing how to test them and where they break, compounds.

**Next session: Product Specs with AI, June 16th**

We've talked a lot about using AI to plan work before writing code, but that process has a trap: it mixes product decisions (how should this work, what's the user experience) with technical ones (how do we build it, what patterns do we follow). Tangle those together and important questions get missed. Tomorrow we'll dig into splitting product questions from technical ones, so less-technical folks can shape a spec that's grounded in real codebase research while the engineering depth still gets its due. Sign up here: https://luma.com/ai-product-specs

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
