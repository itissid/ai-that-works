// Defining a data model.
class Resume {
  name string
  email string
  experience string[] @assert({{ this|length > 0 }})
  skills string[]
}

// Create a function to extract the resume from a string.
function ExtractResume(resume: string) -> Resume {
  // Specify a client as provider/model-name
  // You can also use custom LLM params with a custom client name from clients.baml like "client CustomGPT5" or "client CustomSonnet4"
  client "openai/gpt-4" // Set OPENAI_API_KEY to use this client.
  prompt #"
    Extract a resume in this format
    {{ ctx.output_format(prefix="") }}

    {{ _.role('user') }}

    {{ resume }}
  "#
}



// Test the function with a sample resume. Open the VSCode playground to run this.
test vaibhav_resume {
  functions [ExtractResume]
  args {
    resume #"
      Vaibhav Gupta
      vbv@boundaryml.com

      Experience:
      - Founder at BoundaryML
      - CV Engineer at Google
      - CV Engineer at Microsoft

      Skills:
      - Rust
      - C++
    "#
  }
}


test get_event {
  functions [ExtractResume]
  args {
    resume #"
      I dont care about resumes.

      Alice and Bob are going to a science fair on Friday.
    "#
  }
}
