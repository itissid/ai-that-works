// X (Twitter) post generation and consistency review for approved unconference talks

class XPost {
  tweet string @description(#"
    A single tweet under 280 characters promoting this talk video.
    - Open with a specific, concrete insight from the talk — not a generic hook
    - Mention the speaker by name
    - No em dashes, no "dive into", no "explore", no "unpack", no "fascinating"
    - No hashtags
    - Sounds like a human wrote it
    - Under 280 characters
  "#)
}

client<llm> ClaudeSonnet {
  provider anthropic
  options {
    model "claude-sonnet-4-6"
    api_key env.ANTHROPIC_API_KEY
  }
}

class XPostForReview {
  slug string @description("Identifier for this post — return it unchanged")
  tweet string @description("The tweet text")
}

class XPostReviewed {
  slug string @description("Must match the input slug exactly")
  tweet string @description("The final tweet — rewritten if it had issues, otherwise identical to input")
}

function ReviewXPosts(posts: XPostForReview[]) -> XPostReviewed[] {
  client ClaudeSonnet
  prompt #"
    {{ _.role('user') }}
    Review this set of X (Twitter) posts together. They promote different talks from the same event.

    Your job: rewrite any posts that have problems. Leave the rest exactly as-is.

    Problems to fix:
    - Generic sign-offs: "good talk", "worth a watch", "worth watching", "solid logic", "interesting talk", or any other filler ending
    - Repeated phrases or structures that appear in more than one post
    - Anything that sounds like marketing copy or a press release

    Rules for rewrites:
    - Keep the same core content and specific details
    - Stay under 280 characters
    - Match the tone of the posts that don't need changes
    - No hashtags, no em dashes

    Return exactly one result per input post, with the slug matching the input.

    Posts to review:
    {% for post in posts %}
    slug: {{ post.slug }}
    tweet: {{ post.tweet }}

    {% endfor %}

    {{ ctx.output_format }}
  "#
}

function GenerateXPost(
  transcript: string,
  speaker: string,
  company: string,
  title: string,
) -> XPost {
  client ClaudeSonnet
  prompt #"
    {{ _.role('user') }}
    Write a single tweet promoting this unconference talk video.

    Speaker: {{ speaker }} ({{ company }})
    Talk title: {{ title }}

    Transcript excerpt:
    {{ transcript }}

    Rules:
    - Under 280 characters total
    - Open with a specific, concrete insight or surprising claim from the talk — not "Here's what X said about Y"
    - Mention the speaker by first name
    - No em dashes, no "dive into", no "explore", no "unpack", no "fascinating", no "delve"
    - No hashtags
    - No "wild"
    - No emojis unless they're genuinely useful
    - Write it like a person dashing off a tweet, not like a marketing copy

    {{ ctx.output_format }}
  "#
}
