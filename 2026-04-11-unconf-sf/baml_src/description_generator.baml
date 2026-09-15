// YouTube description generation for unconference talks

class TalkInput {
  talk_number int @description("Talk number within the video")
  title string @description("Talk title")
  speaker_name string? @description("Speaker name, if known")
  speaker_company string? @description("Speaker's company or affiliation, if known")
  transcript_excerpt string @description("First ~600 words of the talk transcript")
}

class TalkDescriptionResult {
  talk_number int @description("Must match the input talk_number exactly")
  description string @description(#"
    YouTube description for this talk. Format:
    - First 2 sentences: punchy hook capturing the core insight (visible before 'Show more')
    - Blank line
    - 3-4 bullet points covering what the viewer will learn
    - Blank line
    - Speaker bio: 1 sentence on who they are and their company
    - Blank line
    - 3-5 relevant hashtags (no spaces, lowercase)

    Tone: direct, concrete, no filler phrases. Write for someone deciding in 5 seconds
    whether to click. Avoid: 'In this talk', 'join us', 'deep dive', 'fascinating',
    'explore', 'journey', 'passionate', 'thrilled to share'.
  "#)
}

function GenerateTalkDescriptions(
  talks: TalkInput[],
) -> TalkDescriptionResult[] {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    Write YouTube descriptions for each of these unconference talks on AI.

    Return exactly one TalkDescriptionResult per input talk, in the same order,
    with talk_number matching the input.

    {% for talk in talks %}
    ---
    Talk {{ talk.talk_number }}: {{ talk.title }}
    Speaker: {{ talk.speaker_name | default("Unknown") }}{% if talk.speaker_company %} ({{ talk.speaker_company }}){% endif %}

    Transcript:
    {{ talk.transcript_excerpt }}
    {% endfor %}

    {{ ctx.output_format }}
  "#
}
