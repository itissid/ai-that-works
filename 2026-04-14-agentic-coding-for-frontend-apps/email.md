Hello {firstName},

This week's 🦄 ai that works session was about frontend development — specifically, why the research-plan-implement workflow that works so well for backend systems completely falls apart when you're trying to build UI.

The full recording is on [YouTube](https://www.youtube.com/watch?v=adpUOpW85ns), and all the code is on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-04-14-agentic-coding-for-frontend-apps).

**Storybook is unit testing for your UI.** The same reason you write a unit test instead of spinning up a whole app to check one function — that's the reason to use Storybook. When Dex wanted to fix a bug where a to-do card looked wrong in the "deleting" state, he didn't recreate that state by clicking through the app. He opened the story, set `is_deleting: true` in the props, and iterated right there. Same component, 20 different states, zero app spinning up.

**Separate pure components from wired components, and life gets a lot easier.** Pure components just take props and render. Wired components handle fetching, state, hooks. When you keep these separate, the agent only has to think about one thing at a time. And your storybook only has to model props — not mock API calls, not manage auth, not fake a database. The rule: if a component fetches data, it's wired. If it only renders data, it's pure. Put only the pure ones in Storybook.

**Storybook beats Figma for agentic workflows.** The problem with Figma is there's always a translation step: the designer approves the mockup, then someone has to turn it into React. With Storybook, the mockup *is* the React component. When your team reviews it and says "approved," it's already implemented in your design system. The frontend engineer's job becomes just wiring up the data — not translating designs into code.

**Use a browser agent with Storybook for a fully automated visual iteration loop.** Vaibhav asked if you could get Storybook to output a PNG from the CLI — and the answer is yes. Dex already uses a browser agent skill to screenshot Storybook components and feed them back to Claude. The pattern: write the story, screenshot it, have Claude iterate until it looks right, screenshot again. No human in the loop for pure visual changes.

**If you remember one thing from this session:**

Frontend and backend need different workflows. For backend code, reading the plan is enough to know if it's right. For frontend code, you have to see it. Storybook gives you a place to see every state your UI can be in, without having to recreate it in production. Once you have that, you can apply the same tight agentic loop to UI that you've been using for everything else.

**Next session: Harness Engineering Without the Hype**

Dex has opinions about harness engineering and is going to crash out about it live. That's tomorrow, April 21st.

Sign up here: https://luma.com/harness-eng-hype

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
