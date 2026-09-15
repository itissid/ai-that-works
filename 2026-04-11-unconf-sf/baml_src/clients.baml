client<llm> Gemini25Pro {
  provider google-ai
  retry_policy Exponential  
  options {
    model "gemini-2.5-pro"
    api_key env.GOOGLE_API_KEY
  }
}


retry_policy Exponential {
  max_retries 2
  strategy {
    type exponential_backoff
    delay_ms 500
    multiplier 2.0
    max_delay_ms 10000
  }
}
