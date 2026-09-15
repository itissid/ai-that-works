Hello {firstName},

This week's 🦄 ai that works session was about OpenAI's harness engineering article. We specifically looked at their claim that custom coding harnesses will be "bitter lessened away" and that you should just use whatever the lab ships.

The full recording is on [YouTube](https://www.youtube.com/watch?v=h99bTZTR_IU), and the notes are on [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2026-05-05-openai-tells-you-not-to-build-your-own-harness).

**Post-training is real, but it's narrower than the hype suggests.** When Anthropic trains Claude on the `old_string/new_string` edit tool, the model gets slightly better at calling that exact shape. Maybe 0.01% per call. That sounds small, but if your coding agent makes 500 tool calls per task, that gap compounds fast. This is why Ryan's point has some truth to it: for the specific tools the lab post-trains on, their version is slightly better. The mistake is extrapolating from "slightly better" to "you should give up."

**The harness runs on your machine. So the API surface is always observable.** Any lab's tool call format can be proxied, inspected, and replicated. Dex walked through this: put a proxy between Claude Code and the LLM API and you can pull out every tool shape it uses. The Devin prompt has already leaked. V0's system prompt is everywhere online. Cognition tried hard to keep their prompts secret, and Vaibhav's take was blunt: once you sell to enough people, it leaks. It's just physics.

**The alpha lives in the outer harness, not the inner one.** The inner harness is tool definitions and implementations. That's where the lab has leverage from post-training. The outer harness is orchestration: how you break down tasks, what domain context you inject, when you spin up sub-agents, how you recover from failures. A well-designed outer loop that knows your team's specific engineering workflow will outperform swapping to the lab's inner harness every time. Vaibhav's example: the RPI (recursive planner) loop he added on top of Claude Code improved performance more than any model upgrade did.

**For complex data types, custom beats default.** The Anthropic API doesn't support discriminated unions natively. Recursive types have less training data, which means the model is worse at calling tools that require them. If your domain has deeply nested or recursive schemas, something like BAML or DSPy can outperform native tool calling not because it's smarter, but because the labs haven't post-trained on those shapes.

**Your value is velocity, not the harness you built last quarter.** Vaibhav compared this to performance engineering on hardware: every new Nvidia GPU release is an opportunity to rewrite your algorithm and beat the old benchmark. Every model release is the same. The engineers who thrive are the ones who can take fundamentals, reassess, and rebuild quickly. The specific harness you have today will expire. The ability to build the next one fast is what compounds.

**If you remember one thing from this session:**

Your job is not to build any one while loop. Your job is to always build the next one. The inner harness that the lab ships today is their competitive moat. The outer harness you wrap around it tomorrow is yours. And since the inner harness runs in user-controlled environments, it will always be observable, replicable, and improvable by someone who thinks harder about the specific problem domain.

**Next session: "Code Mode" Deep Dive — May 12th**

On Monday, Pash from OpenAI revealed that Codex has a secret "code mode" feature: an alternative to traditional tool calling where the model writes code instead of calling tools. There's a lot of debate about what this means for harness builders. We're diving in tomorrow.

Sign up here: https://luma.com/code-mode-deep-dive

If you have questions, reply to this email or hop into [Discord](https://boundaryml.com/discord). We read everything.

Happy coding 🧑‍💻

Vaibhav & Dex
