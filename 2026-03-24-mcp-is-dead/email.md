Hello {firstName},

This week's 🦄 ai that works session was about MCP — specifically, when it's actually the right call and when it's quietly making your agent worse.

The full recording is on [YouTube](https://www.youtube.com/watch?v=z5inaSXkiTU), and all the code is on [GitHub](https://github.com/hellovai/ai-that-works/tree/main/2026-03-24-mcp-is-dead).

Here's what we covered:

**MCP is a plugin system, not an SDK replacement.** The core job of MCP is two things: list all functions, call a function. That's it. Where it shines is letting your *users* bring their own tools — like a Jira MCP that your app never had to integrate. Where it breaks down is when you use it instead of just calling an SDK yourself. If you control the code and know what you need, write the integration.

**Every tool definition is an instruction.** When you add the GitHub MCP, you're not just getting GitHub access — you're injecting 60,000 tokens worth of function definitions into every call. Models don't know which instructions matter, so they try to attend to all of them. The Claude Code team fights hard for every tool they add because they know this: adding a tool degrades performance for every user who doesn't need it.

**Build first-class integrations for the things everyone uses; use MCP for the long tail.** If 80% of your users need GitHub access, build the OAuth integration properly. When a niche MCP starts getting popular, that's your signal to migrate it into a first-class integration. Users who bring their own MCPs are primed to expect lower quality — because they brought the code, not you.

**Tell users when their MCPs aren't being called.** If a user installed a Jira MCP three weeks ago and hasn't touched a ticket since, surface that. "Looks like this MCP hasn't been used in a while — want to disable it?" You're already paying the context cost on every call whether the tool runs or not.

**If you remember one thing from this session:**

MCP isn't dead, but most people are using it wrong. The question isn't "should I use MCP?" . It's "who is bringing this tool to the conversation?" If *you* are building the integration, use an SDK. If *your users* are bringing functionality you didn't anticipate, that's what MCP is for.

**Next session: No Vibes Allowed — March Edition**

Tomorrow, we're live coding in production — real features, real trade-offs, real systems. No slides, no demos, just shipping real features.

Sign up here: https://lu.ma/no-vibes-allowed-march-26

If you have questions, reply to this email or ask on [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
