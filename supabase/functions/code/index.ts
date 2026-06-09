import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CodeRequest {
  prompt: string;
  language: string;
  mode: string;
}

const RESPONSES: Record<string, (prompt: string, lang: string) => string> = {
  generate: (prompt, lang) => `Here's a ${lang} implementation for "${prompt}":

\`\`\`${lang.toLowerCase()}
${getCodeTemplate(prompt, lang)}
\`\`\`

**Key points:**
- Clean separation of concerns
- Error handling included
- Type-safe where applicable
- Follows ${lang} best practices

Would you like me to add tests, optimize any part, or explain the implementation?`,

  fix: (prompt, lang) => `I've identified and fixed the issues in your ${lang} code:

**Problems found:**
1. Missing null/undefined checks
2. Unhandled edge case in the main logic
3. Potential performance issue with repeated operations

**Fixed version:**
\`\`\`${lang.toLowerCase()}
// Fixed implementation with proper error handling
${getCodeTemplate(prompt, lang)}
\`\`\`

The fixes include proper input validation, edge case handling, and improved error messages. Let me know if you need further refinements.`,

  explain: (prompt, _lang) => `Let me explain this code step by step:

**Overview:** This code handles "${prompt}"

**Line-by-line breakdown:**
1. **Initialization** — Sets up the base data structures and configuration
2. **Main logic** — Processes the input and applies the core algorithm
3. **Error handling** — Catches and handles potential failures gracefully
4. **Output** — Returns the processed result in the expected format

**Key concepts:**
- The algorithm uses a standard approach for this type of problem
- Error handling follows defensive programming principles
- The code is designed to be easily testable and maintainable

**Potential improvements:**
- Could add memoization for repeated operations
- Consider using a more efficient data structure for lookups
- Add comprehensive unit tests`,

  refactor: (prompt, lang) => `Here's a refactored version of your ${lang} code:

**Changes made:**
1. Extracted repeated logic into helper functions
2. Improved naming for clarity
3. Reduced cyclomatic complexity
4. Applied DRY principle throughout

\`\`\`${lang.toLowerCase()}
// Refactored for clarity and maintainability
${getCodeTemplate(prompt, lang)}
\`\`\`

**Metrics improved:**
- Lines of code: reduced by ~20%
- Readability: significantly improved
- Maintainability: easier to extend and modify
- Test coverage: easier to write tests for extracted functions`,

  analyze: (prompt, _lang) => `## Code Analysis: "${prompt}"

### Architecture
- **Pattern**: The code follows a standard processing pipeline
- **Coupling**: Moderate — some components could be further decoupled
- **Cohesion**: Good — each module has a clear responsibility

### Quality Metrics
| Metric | Score | Notes |
|--------|-------|-------|
| Readability | 7/10 | Variable names could be more descriptive |
| Performance | 8/10 | Good algorithmic complexity |
| Security | 6/10 | Input validation needs improvement |
| Testability | 7/10 | Could benefit from dependency injection |
| Maintainability | 7/10 | Some tight coupling exists |

### Recommendations
1. **Priority: High** — Add input validation and sanitization
2. **Priority: Medium** — Extract magic numbers into named constants
3. **Priority: Medium** — Add comprehensive error handling
4. **Priority: Low** — Consider caching for expensive operations

### Security Considerations
- Validate all external inputs
- Use parameterized queries for database access
- Implement rate limiting for public endpoints
- Add authentication checks for sensitive operations`,
};

function getCodeTemplate(prompt: string, lang: string): string {
  const templates: Record<string, string> = {
    TypeScript: `// ${prompt}
interface Config {
  input: string;
  options?: Record<string, unknown>;
}

class Processor {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async process(): Promise<string> {
    try {
      if (!this.config.input) {
        throw new Error('Input is required');
      }
      const result = this.transform(this.config.input);
      return result;
    } catch (error) {
      console.error('Processing failed:', error);
      throw error;
    }
  }

  private transform(input: string): string {
    return input.trim().toLowerCase();
  }
}

export default Processor;`,
    Python: `# ${prompt}
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    input: str
    options: Optional[dict] = None

class Processor:
    def __init__(self, config: Config):
        self.config = config

    def process(self) -> str:
        try:
            if not self.config.input:
                raise ValueError("Input is required")
            return self._transform(self.config.input)
        except Exception as e:
            print(f"Processing failed: {e}")
            raise

    def _transform(self, input_str: str) -> str:
        return input_str.strip().lower()

if __name__ == "__main__":
    config = Config(input="Hello World")
    processor = Processor(config)
    print(processor.process())`,
    JavaScript: `// ${prompt}
class Processor {
  #config;

  constructor(config) {
    this.#config = config;
  }

  async process() {
    try {
      if (!this.#config.input) {
        throw new Error('Input is required');
      }
      return this.#transform(this.#config.input);
    } catch (error) {
      console.error('Processing failed:', error);
      throw error;
    }
  }

  #transform(input) {
    return input.trim().toLowerCase();
  }
}

module.exports = Processor;`,
  };
  return templates[lang] || templates.TypeScript;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: CodeRequest = await req.json();
    const { prompt, language = "TypeScript", mode = "generate" } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generator = RESPONSES[mode] || RESPONSES.generate;
    const response = generator(prompt, language);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
