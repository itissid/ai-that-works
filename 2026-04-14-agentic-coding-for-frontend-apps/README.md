
# 🦄 ai that works: Agentic Coding for Frontend Apps

> Practical techniques for moving faster and maintaining quality when building frontend code with AI agents — covering Storybook as a development vessel, separating presentation from business logic, and tight iteration loops that don't devolve into prompt yolo.

[Video](https://www.youtube.com/watch?v=adpUOpW85ns)

[![Agentic Coding for Frontend Apps](https://img.youtube.com/vi/adpUOpW85ns/0.jpg)](https://www.youtube.com/watch?v=adpUOpW85ns)

## Links

## Whiteboards

## Key Takeaways

- **Storybook is unit testing for your UI.** The same reason you write a unit test instead of spinning up a whole app to check one function applies here. When Dex needed to fix a to-do card that looked wrong in the "deleting" state, he didn't click through the app to recreate it — he opened the story, set `is_deleting: true` in the props, and iterated right there. Same component, 20 different states, zero app spinning up.
- **Separate pure components from wired components and life gets a lot easier.** Pure components just take props and render; wired components handle fetching, state, and hooks. Keeping them separate means the agent only has to think about one thing at a time, and your Storybook only has to model props — not mock API calls, manage auth, or fake a database. The rule: if a component fetches data it's wired, if it only renders data it's pure, and only the pure ones go in Storybook.
- **Storybook beats Figma for agentic workflows.** Figma always has a translation step — the designer approves the mockup, then someone turns it into React. With Storybook the mockup *is* the React component, so when your team says "approved" it's already implemented in your design system. The frontend engineer's job becomes just wiring up the data instead of translating designs into code.
- **A browser agent plus Storybook gives you a fully automated visual iteration loop.** You can get Storybook to output a PNG from the CLI, and Dex uses a browser agent skill to screenshot Storybook components and feed them back to Claude. The pattern: write the story, screenshot it, have Claude iterate until it looks right, screenshot again — no human in the loop for pure visual changes.
- **Frontend and backend need different workflows.** For backend code, reading the plan is enough to know if it's right; for frontend code, you have to see it. Storybook gives you a place to see every state your UI can be in without recreating it in production, which lets you apply the same tight agentic loop to UI that you've been using for everything else.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=adpUOpW85ns)
- [Code](https://github.com/ai-that-works/ai-that-works/tree/main/2026-04-14-agentic-coding-for-frontend-apps)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)
