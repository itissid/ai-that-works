// High-impact clip extraction from episode transcripts

// Represents a timestamp in the transcript (e.g., "33:46.326")
class Timestamp {
  minutes int
  seconds int
  milliseconds int @description("Optional, defaults to 0")
}

// A high-impact clip extracted from the transcript
class HighImpactClip {
  rationale string @description(#"
    Explain why this clip would be high-impact:
    - What key insight or takeaway does it contain?
    - Why would this resonate with viewers?
    - How does it relate to the main themes of the episode?
  "#)
  start_timestamp string @description("The timestamp where the clip starts, e.g., '33:46'")
  end_timestamp string @description("The timestamp where the clip ends, e.g., '35:15'")
  speaker string @description("The primary speaker in this clip, or 'Multiple' if it's a back-and-forth exchange between two or more people")
  transcript_excerpt string @description(#"
    The exact text from the transcript that should be included in the clip.
    Include speaker names and timestamps as they appear in the original.
  "#)
  hook string @description("A short, punchy summary (1-2 sentences) that could be used as a caption or title for the clip")
}

// Extract high-impact clips from a transcript given the key takeaways
function ExtractHighImpactClips(
  transcript: string,
  episode_title: string,
  key_takeaways: string[],
  one_thing_to_remember: string
) -> HighImpactClip[] {
  client Gemini25Flash
  prompt #"
    {{ _.role('user') }}
    You are finding the most impactful clip from an AI That Works episode transcript.

    Episode Title: {{ episode_title }}

    Key Takeaways from this episode:
    {% for takeaway in key_takeaways %}
    - {{ takeaway }}
    {% endfor %}

    The one thing to remember from this episode:
    {{ one_thing_to_remember }}

    Full Transcript:
    {{ transcript }}

    {{ _.role('user') }}
    Find the THREE best portions of this transcript that would make high-impact clips for social media or promotional use.

    Each high-impact clip should:
    1. Be self-contained and understandable without additional context
    2. Contain a concrete insight, surprising or counterintuitive fact, or actionable advice
    3. Should be an "aha" moment - a moment where someone has a "lightbulb moment" or breakthrough realization
    4. Be about 1 minute when spoken — NO longer than 2 minutes (roughly 150-300 words)
    5. Relate directly to one of the key takeaways
    6. Have a clear "hook" that grabs attention
    7. Avoid rambling setup - get to the point quickly
    8. PREFER clips where two or more people are exchanging ideas — a genuine back-and-forth dialogue is more engaging than a solo monologue. That said, a single powerful insight is still valid if no good exchanges exist.

    Look for moments where the speakers:
    - Build on each other's ideas — one person says something, the other extends or challenges it
    - Have a genuine back-and-forth: questions, reactions, pushback, or "yes, and" moments
    - Share a surprising insight or counterintuitive advice
    - Explain something complex in a simple, memorable way
    - Give a concrete example that illustrates an abstract concept
    - Have a "lightbulb moment" or breakthrough realization — especially when one person sparks it in the other
    - State a strong, quotable opinion that the other person reacts to

    IMPORTANT:
    - Return exactly 3 clips, ordered from most impactful to least impactful
    - The clips should be about 1 minute when spoken — NO longer than 2 minutes (roughly 150-300 words)
    - The clips should not overlap - pick different moments from the transcript
    - Include the exact transcript text including speaker names and timestamps as they appear in the original

    {{ ctx.output_format }}
  "#
}

// An in-medias-res clip that drops the viewer directly into action
class InMediasResClip {
  rationale string @description(#"
    Explain why this clip works as an in-medias-res moment:
    - What action is being performed (live coding, whiteboarding, debugging, building)?
    - Why is watching this action compelling without setup?
    - What does the viewer learn from witnessing this directly?
  "#)
  action_type string @description("The type of action being performed, e.g., 'live coding', 'whiteboarding', 'debugging', 'building', 'pair programming'")
  start_timestamp string @description("The timestamp where the clip starts, e.g., '33:46'")
  end_timestamp string @description("The timestamp where the clip ends, e.g., '35:15'")
  speaker string @description("The primary person doing the action in this clip, or 'Multiple' if two people are collaborating on the action together")
  transcript_excerpt string @description(#"
    The exact text from the transcript that should be included in the clip.
    Include speaker names and timestamps as they appear in the original.
  "#)
  hook string @description("A short context-setting caption (1-2 sentences) that tells the viewer what they're jumping into — NOT a teaser, but a title card that names the action")
}

// Extract in-medias-res clips that drop the viewer directly into the action
function ExtractInMediasResClips(
  transcript: string,
  episode_title: string,
  key_takeaways: string[],
  one_thing_to_remember: string
) -> InMediasResClip[] {
  client Gemini25Flash
  prompt #"
    {{ _.role('user') }}
    You are finding in-medias-res action clips from an AI That Works episode transcript.
    These clips drop the viewer directly into the middle of the action — no preamble, no setup, just watching someone DO something.

    Episode Title: {{ episode_title }}

    Key Takeaways from this episode:
    {% for takeaway in key_takeaways %}
    - {{ takeaway }}
    {% endfor %}

    The one thing to remember from this episode:
    {{ one_thing_to_remember }}

    Full Transcript:
    {{ transcript }}

    {{ _.role('user') }}
    Find the THREE best portions of this transcript where someone is actively DOING something — live coding, whiteboarding, debugging, building, demonstrating — and the viewer is thrown right into the middle of the action.

    Each in-medias-res clip should:
    1. Start mid-action — someone is already doing something when the clip begins, not explaining what they're about to do
    2. Show real, hands-on work: typing code, drawing diagrams, stepping through a debugger, wiring up components
    3. Be compelling to watch without any setup — the action itself is the hook
    4. Be about 1 minute when spoken — NO longer than 2 minutes (roughly 150-300 words) — long enough to show meaningful progress
    5. Prefer moments where two people are working through something together — one driving, one reacting, asking questions, or suggesting changes. Collaborative action is more engaging than a solo demo.
    6. Avoid moments that are purely one person explaining to dead air — find the moments where things are actually being built, demonstrated, or figured out together
    7. Ideally (but not necessarily) end at a satisfying moment — something works, something is revealed, a key piece clicks into place

    Look for moments where:
    - Two people are pair-programming or debugging together, talking through what they're doing
    - One person writes code while the other asks questions or reacts in real time
    - A whiteboard or diagram is being drawn and discussed back-and-forth
    - A bug is being tracked down and fixed collaboratively
    - A tool or workflow is being demonstrated while someone else drives or responds
    - Something is assembled, wired together, or run for the first time — and someone reacts to the result

    IMPORTANT:
    - Return exactly 3 clips, ordered from most compelling to least compelling
    - The clips should NOT overlap — pick different moments from the transcript
    - Include the exact transcript text including speaker names and timestamps as they appear in the original
    - The hook should SET CONTEXT (e.g., "Dex live-codes a BAML extractor from scratch") — not tease or ask a question
    - If the episode has no clear action/hands-on moments, pick the closest approximations

    {{ ctx.output_format }}
  "#
}

// Test for ExtractHighImpactClips
test ExtractHighImpactClipsTest {
  functions [ExtractHighImpactClips]
  args {
    transcript #"
      Dex (05:30.123)
      So the key thing about prompts is that they're not magic.

      Vaibhav (05:35.456)
      Exactly. And this is what people get wrong. They think if they just find the right words, the model will suddenly work perfectly.

      Dex (05:42.789)
      Right, it's like they're looking for an incantation.

      Vaibhav (05:45.012)
      But really, prompts are just instructions. The clearer you are about what you want, the better the output. It's not about finding magic words, it's about being specific.

      Dex (05:55.345)
      And that's why iteration matters so much. Your first prompt is never going to be perfect.

      Vaibhav (06:01.678)
      Never. You have to test, see what works, refine. It's software engineering, not poetry.
    "#
    episode_title "Prompt Engineering Best Practices"
    key_takeaways [
      "Prompts are instructions, not magic incantations",
      "Be specific about what you want",
      "Iterate and refine your prompts systematically"
    ]
    one_thing_to_remember "Treat prompt engineering like software engineering: test, iterate, and be specific."
  }
}
