// Highlight clip extraction for unconference talks

class TalkClip {
  hook string @description(#"
    1-2 sentence punchy, social-media-ready summary of why this clip is compelling.
    Write it as a teaser — make someone want to watch.
  "#)
  rationale string @description(#"
    Internal note explaining why this moment is worth highlighting.
    What makes it insightful, surprising, or memorable?
  "#)
  clip_start_anchor string @description(#"
    Verbatim first 10-15 words of the clip, exactly as they appear in the transcript.
    This MUST match the transcript character-for-character — it will be used to locate the clip.
  "#)
  clip_end_anchor string @description(#"
    Verbatim last 10-15 words of the clip, exactly as they appear in the transcript.
    This MUST match the transcript character-for-character — it will be used to locate the clip.
  "#)
  estimated_word_count int @description(#"
    Estimated word count of the clip. Target range: 65–195 words (30 seconds to 1.5 minutes).
  "#)
}

function FindBestClips(
  talk_transcript: string,
  talk_title: string,
  speaker_name: string?,
) -> TalkClip[] {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    You are curating a highlight reel from an unconference talk.

    Talk title: {{ talk_title }}
    Speaker: {{ speaker_name | default("Unknown") }}

    Your job: find the single best clip from this transcript, if one exists.
    Return an array with exactly 1 clip, or an empty array if nothing is worth highlighting.

    The bar is high. Only return a clip if it is genuinely exceptional:
    - Counterintuitive or contrarian — says something most people wouldn't expect
    - Quotable — a single clear idea someone would want to share or screenshot
    - Self-contained — a viewer with zero context gets immediate value
    - Concrete — specific examples or numbers, not vague generalities
    - 65–195 words (30 seconds to 1.5 minutes at speaking pace)
    - Starts and ends at natural sentence boundaries

    If the talk is mostly Q&A, scene-setting, introductions, or generic content with no
    standout moment, return an empty array. When in doubt, return nothing.

    For the clip you select, return the EXACT verbatim words that begin and end it.
    These strings will be searched in the transcript to locate boundaries,
    so they must match character-for-character.

    Talk transcript:
    {{ talk_transcript }}

    {{ ctx.output_format }}
  "#
}

class ClipSummary {
  index int @description("0-based index of this clip in the candidates list")
  hook string @description("The clip's hook text")
  rationale string @description("Why this clip was selected")
  talk_title string @description("Title of the talk this clip is from")
}

function SelectTopClips(
  candidates: ClipSummary[],
  max_clips: int,
) -> int[] {
  client Gemini25Pro
  prompt #"
    {{ _.role('user') }}
    You are curating a highlight reel from an unconference on AI.

    Below are {{ candidates | length }} candidate clips, each with a hook and rationale.
    Your job: select the {{ max_clips }} best clips to include in the final reel.

    Prioritize diversity (different topics, speakers, angles) and quality:
    - Counterintuitive or surprising takes beat generic advice
    - Specific, concrete moments beat vague generalities
    - Quotable one-idea clips beat multi-topic clips
    - Self-contained clips that work cold (no context needed)

    Return an array of exactly {{ max_clips }} integers — the 0-based indices of the clips
    you select, in your preferred order (best first).
    If there are fewer than {{ max_clips }} candidates, return all of them.

    Candidates:
    {% for c in candidates %}
    [{{ c.index }}] {{ c.talk_title }}
      Hook: {{ c.hook }}
      Why: {{ c.rationale }}
    {% endfor %}

    {{ ctx.output_format }}
  "#
}

test FindBestClipsTest {
  functions [FindBestClips]
  args {
    talk_title "Prompt Caching with Anthropic"
    speaker_name "Mario"
    talk_transcript #"
      So the thing people don't realize about prompt caching is that it's not just about
      cost. Yes, you save 80 percent on tokens, but the real win is latency. When your
      static context is cached, your time-to-first-token drops dramatically. We went from
      4 seconds to under 400 milliseconds on our most common queries. That's not a
      marginal improvement — that's a product-level difference. Users notice. They go from
      "this feels like a chatbot" to "this feels like a real tool." And the implementation
      is surprisingly simple. You just structure your prompt so the stable parts come first
      — your system instructions, your examples, your context — and the dynamic user input
      goes last. Anthropic's infrastructure handles the rest automatically. No special API
      calls, no cache management on your end. It just works.
    "#
  }
}
