// Talk segmentation for unconference transcripts

class TalkSegment {
  talk_number int @description(#"
    1-based sequential number of this talk.
  "#)
  title string @description(#"
    A short, descriptive title for this talk (5–8 words).
    Based on the content, not any introduction by the host.
  "#)
  speaker_name string? @description(#"
    Speaker's name if it can be determined from the transcript (e.g. they introduce
    themselves or are introduced). Null if unknown.
  "#)
  start_anchor string @description(#"
    Verbatim copy of the first 20–30 words that begin this specific talk
    (i.e. when the new speaker starts their presentation, not the MC intro).
    This string MUST appear exactly in the transcript — copy it character-for-character.
    It should be distinctive enough to locate uniquely.
  "#)
}

class TranscriptSegmentation {
  talks TalkSegment[] @description(#"
    All talks found in the transcript, ordered by their position (talk_number ascending).
  "#)
  notes string? @description(#"
    Any observations about ambiguous boundaries, overlapping topics, or segments
    that were hard to classify.
  "#)
}

function ExtractTalkSegments(transcript: string) -> TranscriptSegmentation {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    You are analyzing a raw, unsegmented transcript from an unconference event.
    Multiple speakers gave short talks back-to-back. The transcript has no timestamps,
    no speaker labels, and no explicit break markers — it is plain Whisper output.

    Your job is to identify every distinct talk in the transcript.

    Clues that a new talk is starting:
    - An MC or host says something like "Next up...", "Our next speaker...", "Give a hand for..."
    - Someone introduces themselves: "Hi, I'm [name], I'm going to talk about..."
    - There's an abrupt topic shift after audience Q&A or applause
    - A new speaker starts explaining a completely different subject

    For each talk you find:
    1. Assign it a sequential talk_number starting at 1
    2. Write a short descriptive title based on its content
    3. Record the speaker's name if it appears anywhere (intro by host, self-introduction, etc.)
    4. Copy the EXACT verbatim first 20–30 words of the talk itself (not the MC intro —
       the moment the actual presenter begins speaking). This will be used as a string
       anchor to split the transcript, so it MUST match the transcript character-for-character.

    Transcript:
    {{ transcript }}

    {{ ctx.output_format }}
  "#
}

// Speaker identity extracted from an individual talk transcript
class SpeakerInfo {
  speaker_name string? @description(#"
    The speaker's full name (or first name if that's all that's available).
    Null if it cannot be determined from the transcript.
    Look for: self-introductions ("I'm [name]", "My name is [name]"),
    audience references ("Hey [name], great question"), slide mentions, etc.
  "#)
  speaker_company string? @description(#"
    The company, employer, or affiliation the speaker mentions.
    Null if not mentioned anywhere in the transcript.
    Look for: "I work at [company]", "I'm from [company]", "[company] engineer", etc.
  "#)
}

function ExtractSpeakerInfo(talk_transcript: string) -> SpeakerInfo {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    You are analyzing the transcript of a single talk from an unconference event.
    Your job is to identify the speaker's name and company/employer if they appear
    anywhere in the text.

    Sources to look for:
    - Self-introductions: "Hi, I'm [name]", "My name is [name]", "I'm [name] from [company]"
    - Host introductions: "Please welcome [name]", "Next up is [name] who works at [company]"
    - Audience questions directed at the speaker by name
    - Any mention of where the speaker works or what their role is

    Be conservative — only return a value if you are confident it refers to this speaker.
    If the name or company cannot be determined, return null for that field.

    Talk transcript:
    {{ talk_transcript }}

    {{ ctx.output_format }}
  "#
}

test ExtractSpeakerInfoTest {
  functions [ExtractSpeakerInfo]
  args {
    talk_transcript #"
      Hey everyone, I'm Mario Castaneda, I work at Stripe. Today I want to show you how
      prompt caching cuts your API costs by 80 percent. The basic idea is that you structure
      your prompts so the static parts come first and the dynamic parts come last.
      Any questions? Yeah, does it work with streaming? Yes it does.
    "#
  }
}

test ExtractTalkSegmentsTest {
  functions [ExtractTalkSegments]
  args {
    transcript #"
      Alright, next up we have Mario who's going to talk about prompt caching.
      Hey everyone, I'm Mario. Today I want to show you how prompt caching cuts your API costs
      by 80 percent. The basic idea is that you structure your prompts so the static parts
      come first and the dynamic parts come last. Anthropic caches everything above the cache
      breakpoint automatically. Any questions? Yeah, does it work with streaming? Yes it does.
      Great, thank you Mario. Next up is Sarah with a talk on evaluation.
      Hi, I'm Sarah. So I've been obsessed with evals lately and I want to share why most
      people do them wrong. The number one mistake is using LLM-as-a-judge without calibration.
    "#
  }
}
