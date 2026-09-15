Hello {firstName},

This week's 🦄 ai that works session was a deep dive on "code mode," the emerging alternative to Bash where your agent writes and executes real TypeScript or Python to call its tools instead of chaining shell commands together.

The full recording is on [YouTube](https://www.youtube.com/watch?v=0dx3j4CmSFw), and the notes are on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-05-12-code-mode-deep-dive).

**Code mode is what happens when your bash script hits 500 lines.** Vaibhav made this point cleanly. When a bash script gets too long, every senior engineer says the same thing: "rewrite it as a program." Code mode is that rewrite applied to agent tool-calling. Instead of chaining `gh pr create | jq '.html_url'` and hoping the model remembers the pipe, the agent writes `const result = await tools.github.createPR(); console.log(result.url)`. One result, typed, readable.

**Output shaping is where code mode wins most obviously today.** When you call `gh pr create` in bash, the full JSON blob goes into the context window. That can be 5,000 tokens you didn't need. With code mode, the agent just logs the field it cares about. Dex walked through this with test suite output: models keep running `bun run test | head -n 40` over and over because they truncated the output and missed which test failed, then have to re-run to grep for errors. Code mode means you can accumulate results properly with `const result1 = await tool1(); const result2 = await tool2(result1.filter(...))`, and the intermediate noise never touches the context.

**Bash has a global state problem that sandboxes can't cleanly solve.** Rhys pointed out that the Google Workspace CLI can only be signed into one account per machine. Not per session. Per machine. If you're building multi-tenant agents where different users need different credentials, you have two choices: run a full sandbox per user (which rules out anyone without a VM setup) or live with the mess. Code mode lets you attach credentials per tool at the call layer, using proxy objects, so the execution environment doesn't need to own auth state at all.

**The best investment is a good OpenAPI spec, not a good bash skill.** Whatever format wins, whether that's bash today, code mode in six months, or something else after that, a clean OpenAPI spec can be converted to any of them. Rhys built this into executor: give it an OpenAPI spec and it generates typed tool declarations the model can call directly, with configurable depth so you don't dump 10,000 tokens of nested schemas into context for a simple API call.

**CLIs are for humans. Agents don't use tab.** Rhys's take was blunt: tab autocomplete is the foundational UX assumption behind every CLI design guideline. Agents skip it entirely. The model has to run `gh --help` then `gh pr create --help` to understand what a command does. That's three tool calls before it's done anything useful. Code mode with a typed tool catalog gives the model immediate, searchable schema information. Reese's prediction: CLIs will be considered harmful for agents by end of 2026.

**If you remember one thing from this session:**

Tool calls are the primitive. Bash and code mode are just two different implementations of the same thing: a name, an input, and an output. Don't overindex on either. Build a tool catalog with clean names and typed schemas, then wire it up to whatever execution format makes sense. That catalog will outlast every format war.

**Next session: Multilingual AI Apps, June 2nd**

What happens when your user stops typing in English? You can't just run your English prompt through Google Translate and hope it holds up in production. We're digging into how to build prompt architectures that stay semantically aligned across Spanish, French, and whatever else your users speak, without standing up a separate pipeline for every language. Sign up here: https://luma.com/multilingual-ai-apps

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
