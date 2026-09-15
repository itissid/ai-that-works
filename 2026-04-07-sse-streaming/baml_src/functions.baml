// {"type": "partial", "url": url, "title": partial.title, "summary": partial.summary}

class PageSummaryPartial {
  type "partial"
  url string
  title string
  summary string | null
}

class PageSummaryFinal {
  type "final"
  url string
  title string
  summary string
}

type SSEEvents = PageSummaryPartial | PageSummaryFinal


class PageSummary {
  title string @description("The page title or topic") @stream.done @stream.not_null
  summary string @description("A 2-3 sentence summary of what the page is about")
}

function SummarizePage(url: string, content: string) -> PageSummary {
  client "openai/gpt-4o-mini"
  prompt #"
    {{ _.role("system") }}
    Summarize the following web page content. Be concise.

    {{ _.role("user") }}
    URL: {{ url }}

    Content:
    {{ content }}

    {{ ctx.output_format }}
  "#
}
