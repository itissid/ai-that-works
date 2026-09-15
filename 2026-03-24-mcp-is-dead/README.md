
# 🦄 ai that works: MCP is Dead?

> MCP isn't dead — but most people are using it wrong. In this episode, we dig into the on-again, off-again relationship developers have with MCP on Twitter and cut through the hype. We define what MCP actually is, map out exactly when it helps and when it hurts, and give you a framework for making the right call.

[Video](https://www.youtube.com/watch?v=z5inaSXkiTU)

[![MCP is Dead?](https://img.youtube.com/vi/z5inaSXkiTU/0.jpg)](https://www.youtube.com/watch?v=z5inaSXkiTU)

Links:

## Episode Highlights

## Key Takeaways

- **MCP is a plugin system, not an SDK replacement.** Its core job is just two things: list all functions and call a function. It shines when it lets your *users* bring their own tools — like a Jira MCP your app never had to integrate — but breaks down when you reach for it instead of calling an SDK yourself. If you control the code and know what you need, write the integration.
- **Every tool definition is an instruction the model has to attend to.** Adding the GitHub MCP doesn't just grant GitHub access — it injects 60,000 tokens of function definitions into every call, and models don't know which instructions matter so they try to attend to all of them. The Claude Code team fights hard for every tool they add because adding one degrades performance for every user who doesn't need it.
- **Build first-class integrations for what everyone uses; reserve MCP for the long tail.** If 80% of your users need GitHub access, build the OAuth integration properly. When a niche MCP starts getting popular, treat that as your signal to migrate it into a first-class integration — and remember users who bring their own MCPs are already primed to expect lower quality, because they brought the code, not you.
- **Tell users when their MCPs aren't being called.** If someone installed a Jira MCP three weeks ago and hasn't touched a ticket since, surface it: "Looks like this MCP hasn't been used in a while — want to disable it?" You're paying the context cost on every call whether the tool actually runs or not.
- **The real question is "who is bringing this tool to the conversation?"** MCP isn't dead, but most people use it wrong. If *you* are building the integration, use an SDK. If *your users* are bringing functionality you didn't anticipate, that's exactly what MCP is for.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=z5inaSXkiTU)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

<img width="1592" height="1634" alt="image" src="https://github.com/user-attachments/assets/623e9e3a-ac2c-4dd3-b32f-fbb18d56bb94" />


<img width="2015" height="2353" alt="image" src="https://github.com/user-attachments/assets/c13d5da7-7b65-45e9-b25b-19591e6c641e" />

<img width="2003" height="1414" alt="image" src="https://github.com/user-attachments/assets/3b594d21-727d-4cb4-9f57-45ea8a80d5b9" />

<img width="2715" height="2234" alt="image" src="https://github.com/user-attachments/assets/490e1fc8-9d9b-4134-a3a6-b21d03528960" />


<img width="1715" height="918" alt="image" src="https://github.com/user-attachments/assets/74e74199-c256-45de-af08-22371dcbe1dc" />


<img width="2527" height="1564" alt="image" src="https://github.com/user-attachments/assets/b2415339-ab83-40a5-a88f-683c3cf29a13" />

<img width="1952" height="1196" alt="image" src="https://github.com/user-attachments/assets/47e93342-5586-489a-8f9c-0e1b17c68cb7" />

<img width="2118" height="1460" alt="image" src="https://github.com/user-attachments/assets/d9b2cfaa-eab8-49cc-b4c4-20127157f9ff" />


