// Edge-case PII rules that regex-based redaction typically fails on.

test spelled_out_phone_number {
  functions [DetectRedaction]
  args {
    input #"
      Hey, you can reach me at four one five, five five five, twelve thirty-four.
      I'm usually free after 3pm. My backup number is eight hundred triple-five oh one oh two.
    "#
    rules [
      {
        name "spelled_out_numerics"
        description "Detect phone numbers, SSNs, credit card numbers, or other sensitive numeric identifiers that have been spelled out as words instead of digits. Regex cannot catch these."
        examples [
          "Call me at nine one seven, five five five, forty-two ten.",
          "My social is one two three, four five, six seven eight nine.",
          "Card number: four seven two nine, oh oh one two, three four five six, seven eight nine oh."
        ]
      },
      {
        name "obfuscated_contact_info"
        description "Detect email addresses or usernames that have been intentionally obfuscated using words like 'dot', 'at', brackets, or spaces to avoid automated detection."
        examples [
          "Email me at john dot doe at gmail dot com",
          "My handle is alice_w [at] protonmail [dot] org",
          "Reach me: first name DOT last name AT company DOT io"
        ]
      },
      {
        name "unconventional_addresses"
        description "Detect physical mailing addresses or locations that use non-standard formats such as tech campus names, landmarks, cross-streets, or relative descriptions that a regex pattern for '123 Main St' would miss."
        examples [
          "Send it to 1 Infinite Loop, Cupertino, California.",
          "I live at the corner of 5th and Broadway, unit above the bakery.",
          "My office is Building 40, Microsoft Campus, Redmond WA."
        ]
      },
      {
        name "contextual_full_names"
        description "Detect full names that could be confused with common words, brand names, or place names. Regex cannot distinguish 'Chase Banks' the person from 'Chase Bank' the company, or 'Virginia' the name from 'Virginia' the state."
        examples [
          "Chase Banks called in yesterday about his account.",
          "I spoke with Virginia Park about the lease agreement.",
          "The new hire is Crystal Waters from the Denver office."
        ]
      },
      {
        name "partial_identifiers_in_context"
        description "Detect partial sensitive identifiers (last four of SSN, last four of credit card, employee IDs, medical record numbers) that are still personally identifying when combined with surrounding context."
        examples [
          "The patient with SSN ending in 6789 needs a follow-up.",
          "Please refund the Visa ending in 4242 for John's order.",
          "Employee #80412 in the Seattle office filed the complaint."
        ]
      },
      {
        name "implicit_location_fingerprinting"
        description "Detect descriptions that identify a specific person's location without using a formal address — e.g., unique landmarks, neighborhood details, or relative directions that could be used to locate someone."
        examples [
          "She lives in the yellow house across from Elm Park, right next to the fire station on Oak Ave.",
          "His apartment is the third floor of the only high-rise on Lakeshore between the two bridges.",
          "You can't miss it — it's the farmhouse at the dead end of Route 9, past the red barn."
        ]
      }
    ]
  }
}

test obfuscated_email_and_cross_streets {
  functions [DetectRedaction]
  args {
    input #"
      Thanks for your interest in the role. Please send your resume to
      hiring DOT team AT acme-corp DOT com and CC jsmith dot hr at acme-corp dot com.
      Our office is on the northwest corner of 3rd and Mission, 14th floor,
      right across from the Salesforce Tower entrance. Ask for Margaret Cho at the front desk.
      For verification, we have your application tied to the Amex ending in 1008.
    "#
    rules [
      {
        name "spelled_out_numerics"
        description "Detect phone numbers, SSNs, credit card numbers, or other sensitive numeric identifiers that have been spelled out as words instead of digits."
        examples [
          "Call me at nine one seven, five five five, forty-two ten.",
          "My social is one two three, four five, six seven eight nine."
        ]
      },
      {
        name "obfuscated_contact_info"
        description "Detect email addresses or usernames that have been intentionally obfuscated using words like 'dot', 'at', brackets, or spaces to avoid automated detection."
        examples [
          "Email me at john dot doe at gmail dot com",
          "My handle is alice_w [at] protonmail [dot] org"
        ]
      },
      {
        name "unconventional_addresses"
        description "Detect physical mailing addresses or locations that use non-standard formats such as tech campus names, landmarks, cross-streets, or relative descriptions."
        examples [
          "Send it to 1 Infinite Loop, Cupertino, California.",
          "I live at the corner of 5th and Broadway, unit above the bakery."
        ]
      },
      {
        name "contextual_full_names"
        description "Detect full names that could be confused with common words, brand names, or place names."
        examples [
          "Chase Banks called in yesterday about his account.",
          "I spoke with Virginia Park about the lease agreement."
        ]
      },
      {
        name "partial_identifiers_in_context"
        description "Detect partial sensitive identifiers (last four of SSN, last four of credit card, employee IDs) that are still personally identifying when combined with surrounding context."
        examples [
          "Please refund the Visa ending in 4242 for John's order.",
          "The patient with SSN ending in 6789 needs a follow-up."
        ]
      },
      {
        name "implicit_location_fingerprinting"
        description "Detect descriptions that identify a specific person's location without using a formal address — e.g., unique landmarks, neighborhood details, or relative directions."
        examples [
          "She lives in the yellow house across from Elm Park, right next to the fire station on Oak Ave.",
          "His apartment is the third floor of the only high-rise on Lakeshore between the two bridges."
        ]
      }
    ]
  }
}

test clean_message_with_tricky_words {
  functions [DetectRedaction]
  args {
    input #"
      The quarterly revenue report for Q3 shows a 12% increase in the
      enterprise segment. The Virginia office outperformed expectations.
      We should chase down the remaining invoices before end of month.
      The park avenue strategy is paying off — five new accounts signed.
    "#
    rules [
      {
        name "spelled_out_numerics"
        description "Detect phone numbers, SSNs, credit card numbers, or other sensitive numeric identifiers that have been spelled out as words instead of digits."
        examples [
          "Call me at nine one seven, five five five, forty-two ten."
        ]
      },
      {
        name "obfuscated_contact_info"
        description "Detect email addresses or usernames that have been intentionally obfuscated using words like 'dot', 'at', brackets, or spaces to avoid automated detection."
        examples [
          "Email me at john dot doe at gmail dot com"
        ]
      },
      {
        name "unconventional_addresses"
        description "Detect physical mailing addresses or locations that use non-standard formats."
        examples [
          "Send it to 1 Infinite Loop, Cupertino, California."
        ]
      },
      {
        name "contextual_full_names"
        description "Detect full names that could be confused with common words, brand names, or place names."
        examples [
          "Chase Banks called in yesterday about his account."
        ]
      },
      {
        name "partial_identifiers_in_context"
        description "Detect partial sensitive identifiers that are still personally identifying when combined with surrounding context. Generic words don't leak information, but specifics do"
        examples [
          "Please refund the Visa ending in 4242 for John's order."
        ]
      },
      {
        name "implicit_location_fingerprinting"
        description "Detect descriptions that identify a specific person's location without using a formal address."
        examples [
          "She lives in the yellow house across from Elm Park, right next to the fire station on Oak Ave."
        ]
      }
    ]
  }
}

test medical_context_with_edge_cases {
  functions [DetectRedaction]
  args {
    input #"
      Patient notes for visit on 2/14: The individual with record ending in
      dash-4471 presented with chronic lower back pain. Lives in the converted
      church building on Haight near Ashbury. Referred by Dr. Crystal Waters.
      Callback number is eight zero zero, two two two, thirty-three oh one.
      Insurance info forwarded to billing DOT dept AT northside-clinic DOT org.
    "#
    rules [
      {
        name "spelled_out_numerics"
        description "Detect phone numbers, SSNs, credit card numbers, or other sensitive numeric identifiers that have been spelled out as words instead of digits."
        examples [
          "Call me at nine one seven, five five five, forty-two ten.",
          "My social is one two three, four five, six seven eight nine."
        ]
      },
      {
        name "obfuscated_contact_info"
        description "Detect email addresses or usernames that have been intentionally obfuscated using words like 'dot', 'at', brackets, or spaces to avoid automated detection."
        examples [
          "Email me at john dot doe at gmail dot com",
          "My handle is alice_w [at] protonmail [dot] org"
        ]
      },
      {
        name "unconventional_addresses"
        description "Detect physical mailing addresses or locations that use non-standard formats such as landmarks, cross-streets, or unique building descriptions."
        examples [
          "I live at the corner of 5th and Broadway, unit above the bakery.",
          "My office is Building 40, Microsoft Campus, Redmond WA."
        ]
      },
      {
        name "contextual_full_names"
        description "Detect full names that could be confused with common words, brand names, or place names."
        examples [
          "I spoke with Virginia Park about the lease agreement.",
          "The new hire is Crystal Waters from the Denver office."
        ]
      },
      {
        name "partial_identifiers_in_context"
        description "Detect partial sensitive identifiers (last four of SSN, last four of credit card, medical record numbers, employee IDs) that are still personally identifying when combined with surrounding context."
        examples [
          "The patient with SSN ending in 6789 needs a follow-up.",
          "Employee #80412 in the Seattle office filed the complaint."
        ]
      },
      {
        name "implicit_location_fingerprinting"
        description "Detect descriptions that identify a specific person's location without using a formal address — e.g., unique landmarks, neighborhood details, or relative directions."
        examples [
          "She lives in the yellow house across from Elm Park, right next to the fire station on Oak Ave.",
          "You can't miss it — it's the farmhouse at the dead end of Route 9, past the red barn."
        ]
      }
    ]
  }
}
