enum UserDefinedCategory {
  HIGH_RISK_PII @description(#"
    social security number
    credit card number
    bank account number
    passport number
    driver's license number
  "#)
  @@dynamic
}

class GenerativeRule {
  name string @alias("id")
  category UserDefinedCategory?
  description string
  examples string[]
}

class LeakRisk {
    rule_name string @alias("rule_id")
    risk "none" | "high"
    reason string
}

function DetectRedaction(input: string, rules: GenerativeRule[]) -> LeakRisk[] {
    client "openai/gpt-4o-mini"
    prompt #"
      What are the risks in this message of leaking sensitive information?
      {{ ctx.output_format }}

      {% for rule in rules %}
      Rule {{ rule.name }}: {{ rule.description }}
      {% for example in rule.examples %}
      Example {{ loop.index }}:
      {{ example }}
      {% endfor %}
      {% endfor %}

      {{ _.role("user") }}
      {{ input }}
    "#
}

function Redact(input: string, rules: LeakRisk[]) -> string {
    client "openai/gpt-4o-mini"
    prompt #"
      Redact the sensitive information in the message.
      {{ ctx.output_format }}

      {% for rule in rules %}
      Rule {{ rule.rule_name }}: {{ rule.risk }}
      {% endfor %}

      {{ _.role("user") }}
      {{ input }}
    "#
}

function CheckRedaction(input: string, redacted: string) -> bool {
    client "openai/gpt-4o-mini"
    prompt #"
      
    "#
}
