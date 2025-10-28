/// OpenAI client configuration
client<llm> OpenAIClient {
  provider "openai"
  options {
    model "gpt-4"
    api_key env.OPENAI_API_KEY
    temperature 0.7
  }
}

/// Anthropic client configuration
client<llm> AnthropicClient {
  provider "anthropic"
  options {
    model "claude-sonnet-4"
    api_key env.ANTHROPIC_API_KEY
  }
}
