
# 🦄 ai that works: Hands-on with Fable 5

> This one went off-script. We had agent observability on the schedule, but Anthropic shipped Fable 5 about twenty minutes before we went live, so we tossed the plan and got hands-on with the new model instead. What you get is an unscripted look at exactly how we kick the tires on a fresh release: take the hardest problem you're already deep in, hand it over, and watch whether it finds leverage you didn't.

[Video](https://www.youtube.com/watch?v=hTkmSVuDMPg)

[![Hands-on with Fable 5](https://img.youtube.com/vi/hTkmSVuDMPg/0.jpg)](https://www.youtube.com/watch?v=hTkmSVuDMPg)

Links:

## Episode Highlights

## Key Takeaways

- **Test a new model on the hardest problem you're already living in, not a toy.** Handing a release something Opus already nails tells you nothing about the gap. Vaibhav's rule is "hardest problem only," ideally one you have fresh mental context on. He pointed Fable at an in-progress design doc for the BAML VM's observability layer, a problem the team had been grinding on for weeks, because only then can you actually judge the answer.
- **Look for comprehension before output.** The first move with any new model isn't "can it do the work," it's "can it explain my in-progress task back to me." Vaibhav fed Fable two dense design docs and asked it to describe the architecture, draw diagrams, and flag what was missing. If it surfaces one or two details you hadn't considered, that's the leverage you're hunting for before you ever trust it to write code.
- **Keep a personal benchmark of problems that beat the models.** Dex keeps a text file of git SHAs paired with prompts: check out this commit, run this prompt, and you've recreated a bug that took a week to solve. His Fable test was an old Human Layer race condition where Claude Code approvals get correlated to the wrong session. Fable added correlation but piped through a key that isn't unique per tool call, so it still missed the root cause.
- **Model quality is really about how many constraints it can hold at once.** Fable caught some nice things (swapping wall-clock time for a causality clock, trimming unnecessary bookkeeping) but missed that spawning thousands of threads needs `U64` IDs, not `U32`. At 10,000 threads/second a `U32` ID collides in five days; a `U64` takes 585,000 years at a million/second. That constraint was written into the doc and Fable skipped it.
- **Most model releases are more hype than day-to-day value, and that's fine.** Fable is probably smarter than Opus, but it failed to one-shot both of the hardest problems and felt noticeably slower and thinkier (slow enough that real-time product pipelines may need a UX redesign). Still, if it handles even one more constraint before you step in, that's worth switching for. Cutting corrections from five per conversation to two roughly doubles your effectiveness.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=hTkmSVuDMPg)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards
