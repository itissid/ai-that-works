// Generic document deslopper functions

class DocumentSlopPattern {
  pattern string @description("The specific pattern or element that sounds AI-generated")
  example string @description("A concrete example from the document that demonstrates this pattern")
  rationale string @description("Why this pattern makes the document sound artificial or low-quality")
}

function IdentifyDocumentSlop(document: string) -> DocumentSlopPattern[] {
  client DeslopOpus45
  prompt #"
    {{ _.role("user") }}
    This document looks like AI slop. Identify the patterns and elements that make it sound like a human did not write it carefully.

    Document:
    {{ document }}

    {{ _.role("user") }}
    Analyze the document and identify specific patterns that make it sound AI-generated, generic, or sloppy. For each pattern:
    - Name the pattern
    - Provide a specific example from the document
    - Explain why it weakens the writing

    Focus on issues like generic phrasing, repetitive structure, vague claims, unnatural transitions, empty intensifiers, or anything else that makes the writing feel synthetic.

    {{ ctx.output_format }}
  "#
}

function RewriteDocumentWithoutSlop(document: string, patterns: DocumentSlopPattern[]) -> string {
  client DeslopOpus45
  prompt #"
    {{ _.role("user") }}
    The following document was written in a way that feels like AI slop. Rewrite it so it sounds sharper, more specific, and more human.

    Original document:
    {{ document }}

    Patterns to fix:
    {% for pattern in patterns %}
    - {{ pattern.pattern }}: {{ pattern.rationale }}
      Example: "{{ pattern.example }}"
    {% endfor %}

    {{ _.role("user") }}
    Rewrite the document fixing all of the identified patterns.

    Important:
    - Preserve the original meaning and core claims
    - Preserve the overall structure and formatting when possible
    - Remove vague, generic, repetitive, or over-polished phrasing
    - Make the writing sound like a thoughtful human wrote it
    - Return only the rewritten document text

    {{ ctx.output_format }}
  "#
}

test IdentifyDocumentSlopTest {
  functions [IdentifyDocumentSlop]
  args {
    document #"
      This document explores the transformative power of AI in today's rapidly evolving landscape.

      In this comprehensive guide, we'll dive deep into the key insights, important considerations, and actionable strategies you need to know.

      At the end of the day, the future is bright for teams that embrace innovation and unlock the full potential of these cutting-edge tools.
    "#
  }
}
