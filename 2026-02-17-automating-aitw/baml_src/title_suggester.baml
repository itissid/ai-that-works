// Title suggestion functions for AI That Works episodes

// Key takeaways extracted from the transcript
class EpisodeTakeaways {
  main_topic string @description(#"
    The core topic of the episode in plain, accessible language (no jargon)
  "#)
  key_takeaways string[] @description(#"
    3-5 concrete things viewers learned or can apply after watching
  "#)
  surprising_insight string @description(#"
    The most surprising or counterintuitive thing discussed, if any
  "#)
  audience string @description(#"
    Who would benefit most from this episode (e.g. "developers building AI pipelines")
  "#)
}

// A single title suggestion with rationale
class TitleSuggestion {
  rationale string @description(#"
    Why this title works: what hook it uses, who it speaks to
  "#)
  title string @description(#"
    A YouTube/podcast title that is specific, clear, and avoids jargon.
    Should be 5-10 words. Accessible to a technical but non-expert audience.
  "#)
}

// Stage 1: Extract key takeaways from transcript
function ExtractEpisodeTakeaways(transcript: string) -> EpisodeTakeaways {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    You are analyzing an AI That Works podcast episode transcript to extract key takeaways.

    AI That Works is a technical podcast that teaches practical AI techniques for production systems.
    The audience is software developers who want to build real AI applications, not just play with demos.

    Full Transcript:
    {{ transcript }}

    {{ _.role('user') }}
    Extract the key information from this episode. Focus on:
    1. What is the core topic, described simply (avoid acronyms and jargon)
    2. What are the 3-5 most concrete, actionable takeaways a viewer would walk away with
    3. What was the most surprising or counterintuitive insight (if any)
    4. Who is the target audience for this episode

    Be specific and grounded. Avoid vague buzzwords.

    {{ ctx.output_format }}
  "#
}

// Stage 2: Suggest three episode titles
function SuggestEpisodeTitles(
  current_title: string,
  takeaways: EpisodeTakeaways,
  transcript: string,
) -> TitleSuggestion[] {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    You are helping name an AI That Works podcast episode.

    AI That Works is a technical podcast that teaches practical AI techniques for production systems.
    The audience is software developers who care about building real things, not just theory.

    Current working title: {{ current_title }}

    Episode topic: {{ takeaways.main_topic }}
    Target audience: {{ takeaways.audience }}

    Key takeaways:
    {% for t in takeaways.key_takeaways %}
    - {{ t }}
    {% endfor %}

    {% if takeaways.surprising_insight %}
    Most surprising insight: {{ takeaways.surprising_insight }}
    {% endif %}

    The transcript is the full episode transcript.
    {{ transcript }}

    {{ _.role('user') }}
    Suggest exactly 3 episode titles. Each title should:

    - Be 2-10 words
    - Be specific and concrete (no vague words like "leveraging", "unlocking", "harnessing", "revolutionizing")
    - Be accessible to a developer who hasn't heard of this specific technique or tool
    - Avoid overly technical jargon that only insiders would recognize (e.g. "agentic backpressure" sounds technical; "How AI agents slow down without breaking" is better)
    - Avoid the word "AI" as the first word (it's overused)
    - The title should highlight generally applicable concepts or takeaways and not be too specific to the episode topic
    - Each title should encompass the entire episode topic and not be too specific about one particular concept or takeaway
    - Mix styles: at least one question format, at least one "how to" or actionable format, and one that leads with the benefit or outcome
    - It should be very slightly click-baity, but not too much
    - Do NOT reuse the current working title

    Good example: "Prompt Optimizer"
    Good example: "Understanding Latency"

    {{ ctx.output_format }}
  "#
}

// Test for ExtractEpisodeTakeaways
test ExtractTakeawaysTest {
  functions [ExtractEpisodeTakeaways]
  args {
    transcript #"
      Welcome to AI That Works. Today we're talking about how we automated our podcast production pipeline.
      Every week after recording, we need to: edit the transcript, generate a summary email, find clippable moments,
      create thumbnails, and post to social media. We built a multi-step AI pipeline using BAML to do all of this.
      The key insight is that you don't need one giant prompt - you break the task into stages where each stage
      has a clear input and output. We also discovered that you need human review at certain checkpoints,
      especially for anything public-facing. The browser agent part was the trickiest - getting it to reliably
      click through Luma and YouTube required a lot of iteration on the prompts and fallback handling.
    "#
  }
}

// Test for SuggestEpisodeTitles
test SuggestTitlesTest {
  functions [SuggestEpisodeTitles]
  args {
    current_title "AI Content Pipeline Revisited"
    takeaways {
      main_topic "How we automated podcast production using multi-step AI pipelines"
      key_takeaways [
        "Break complex automation into discrete stages with clear inputs and outputs",
        "Use browser agents for tasks that require navigating real websites",
        "Human review checkpoints are essential before anything goes public",
        "BAML makes it easy to define typed inputs/outputs for each pipeline stage"
      ]
      surprising_insight "The hardest part wasn't the AI - it was making the browser agent reliably click the right buttons"
      audience "Developers who want to automate repetitive content or operational workflows with AI"
    }
    transcript #"
      Welcome to AI That Works. Today we're talking about how we automated our podcast production pipeline.
      Every week after recording, we need to: edit the transcript, generate a summary email, find clippable moments,
      create thumbnails, and post to social media. We built a multi-step AI pipeline using BAML to do all of this.
    "#
  }
}
