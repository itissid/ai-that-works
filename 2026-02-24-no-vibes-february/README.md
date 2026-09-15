
# 🦄 ai that works: No Vibes Allowed February

> In our February edition of our No Vibes Allowed series, we will be coding and shipping real features in our products using all of the concepts we cover on this podcast, including using advanced context engineering and backpressure. Join us to see how these concepts apply to real code and real products.

[Video](https://www.youtube.com/watch?v=YcT7gjzj2TU)

[![No Vibes Allowed February](https://img.youtube.com/vi/YcT7gjzj2TU/0.jpg)](https://www.youtube.com/watch?v=YcT7gjzj2TU)

Links:

## Episode Highlights

## Key Takeaways

- **Run learning tests before you write implementation code.** Before touching Riptide's code, Dex had Claude write a 20-line test that actually exercises the Claude Agent SDK queue behavior — it runs `bash sleep 3`, immediately queues a follow-up message, and checks what comes back. If the SDK doesn't behave the way the docs claim, you find out in 30 seconds instead of three days into a feature branch.
- **Use three kinds of research, not one.** Most people do code research (read the codebase) or web research (read the docs), but the third type — proof research, running small programs against the real system — is the one that catches the expensive assumptions. The Claude Agent SDK's core binary is minified and closed source, so the only way to know exactly how message queuing works is to run it and look at the output.
- **Plan vertically, not horizontally.** Instead of building the full UI layer, then the API, then the backend, pick one testable slice and take it all the way through. For this feature that meant getting one message successfully queued and delivered end-to-end before worrying about edge cases like multiple queued messages or cancellations.
- **The faster you want to move, the more you have to invest upfront in being right.** Discovering a wrong assumption before you write code costs 20 minutes; discovering it after you've merged means untangling all the downstream decisions built on top of it. Learning tests are the fastest way to convert assumptions into facts.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=YcT7gjzj2TU)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

