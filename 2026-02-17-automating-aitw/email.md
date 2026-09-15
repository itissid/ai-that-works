Hello {firstName},

This week's 🦄 ai that works session was a meta one. We walked through the entire production pipeline we built to automate this podcast, from the moment someone pitches an episode idea all the way to the email you are reading.

The full recording is on [YouTube](https://www.youtube.com/watch?v=U5Gssat8IUw), and all the code is on [GitHub](https://github.com/hellovai/ai-that-works/tree/main/2026-02-17-automating-aitw).

Here's what's actually happening behind the scenes each week: we run a Claude Code command called `episode_prep`. It asks for the episode title, description, date, and Luma slug. Then it kicks off a sequence of specialized tools. NanoBanana Pro generates the thumbnail. A browser agent navigates the Riverside UI, fills in the event form, and publishes the listing. Luma gets set up via its API. The whole sequence used to take three to four hours a week. Now it's ten minutes, most of it hands-off.

**Actions you can take today:**

**Automate the boring middle, not the risky ends.** The pipeline doesn't try to auto-post everything. When a LinkedIn post or a subscriber email is ready, there's always a human review step before it goes out. Think of it as defining your "one-way door" actions: if you can delete it or edit it later, automate it. If it's going to thousands of people, review it first. Claude Code makes it easy to build this kind of approval checkpoint directly into your workflows.

**Define "automated enough".** The emails the pipeline generates are good 90% of the time, which means one round of edits instead of writing from scratch. Pushing from 90% to 99% takes roughly 10x the effort. Ship the 90% automation version, review it, iterate.

**If you remember one thing from this session:**

Automating doesn't have to be all or nothing. Going from 3-4 hours a week to 10 minutes is a massive win, even if there's still a human in the loop at the end. Define what "done enough" looks like, build to that bar, then decide if the last 10% is actually worth chasing.

**Next session: No Vibes Allowed February**

Tomorrow, we're doing another live coding session. We'll use everything from recent episodes like context engineering, backpressure, agentic patterns, and we'll actually ship features in real time. 

Sign up here: https://luma.com/no-vibes-allowed-feb

If you have questions, reply to this email or ask on [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
