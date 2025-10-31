/// Greet a person
function Greet(p: Person) -> string {
  client "openai/gpt-4"
  prompt #"
    Say hello to {{ p.name }}
  "#
}

/// Extract person data from text
function ExtractPerson(text: string) -> Person | null {
  client "anthropic/claude-sonnet-4"
  prompt #"
    Extract person information from the following text:
    {{ text }}

    {{ ctx.output_format }}
  "#
}
