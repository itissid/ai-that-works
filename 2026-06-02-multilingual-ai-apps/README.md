
# 🦄 ai that works: Multilingual AI Apps

> Practical engineering strategies for building AI applications that perform consistently across languages, with cross-lingual prompt architectures that maintain semantic alignment without separate pipelines for every language.

[Video](https://www.youtube.com/watch?v=-gFdtc-HbOY)

[![Multilingual AI Apps](https://img.youtube.com/vi/-gFdtc-HbOY/0.jpg)](https://www.youtube.com/watch?v=-gFdtc-HbOY)

Links:

## Episode Highlights

## Key Takeaways

- **LLMs speak multiple languages, but your pipeline doesn't.** When your system prompt, tool names, and few-shot examples are all in English, your context ends up 80% English even when the user writes in French — and the model will almost always respond in English. Its multilingual capability gets outvoted by your prompt.
- **The parallel pipeline approach sounds logical but breaks in practice.** Building a separate French pipeline alongside your English one leaves you with two eval matrices, two sets of prompts to keep in sync, and a team that speaks English plus maybe one other language reviewing prompts for ten. Your French users always end up a few iterations behind — the same way Mac apps ship updates a month before their Windows versions.
- **Build once in English, normalize at the edges.** Translate the user's input to English before it touches your main pipeline, run your English pipeline as normal, then translate the response back. This mirrors how voice agents work — speech-to-text in, text-to-speech out — with your core agent in the middle never knowing the difference. The translation work lives in small, cheap models (the generated pipeline picked `Haiku`) and your core agent doesn't change at all.
- **Tone preservation is where this gets interesting.** The output translation step can match the original register, even mixed Hindi and English. A live demo booking a flight "from Bangalore to Goa, 3 passengers, business class" in a Hindi/English mix returned a response in the same register — coherence that's nearly impossible to get from a parallel pipeline without a ton of extra work.
- **Add a fast-path for your majority language users.** A simple heuristic — counting common English words in the input — lets you skip the translation layer entirely for native English speakers, so there's no latency penalty for your most common case and full multilingual support for everyone else. You eval the translation nodes independently since they do a narrower job, and your existing main pipeline evals cover everything downstream.
- **Treat translation as a pre- and post-processing wrapper, not a mid-flow model capability.** Your pipeline is already English-biased by construction, so work with that instead of fighting it: build one great English pipeline and put a thin normalization layer on each end. Every eval you write, every prompt you improve, and every optimization you ship then benefits every language at once.

## Resources

- [Session Recording](https://www.youtube.com/watch?v=-gFdtc-HbOY)
- [Discord Community](https://boundaryml.com/discord)
- Sign up for the next session on [Luma](https://lu.ma/baml)

## Whiteboards

