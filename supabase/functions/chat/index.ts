import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  model?: string;
  history?: { role: string; content: string }[];
  systemPrompt?: string;
}

const MODEL_SYSTEM_PROMPTS: Record<string, string> = {
  "gpt-4o": "You are AdvutAI, an advanced AI assistant powered by GPT-4o. You are helpful, accurate, and thorough. Use markdown formatting for code, lists, and emphasis. Provide detailed, well-structured responses.",
  "gpt-4o-mini": "You are AdvutAI, a fast and efficient AI assistant. Provide concise but complete answers. Use markdown for formatting.",
  "gpt-4-turbo": "You are AdvutAI, powered by GPT-4 Turbo. You excel at complex reasoning and detailed analysis. Use markdown formatting extensively.",
  "claude-4-sonnet": "You are AdvutAI, powered by Claude 4 Sonnet. You are thoughtful, balanced, and nuanced. You excel at writing, analysis, and reasoning. Use markdown formatting.",
  "claude-4-opus": "You are AdvutAI, powered by Claude 4 Opus. You are the most capable AI assistant available. Provide exceptionally detailed and well-reasoned responses. Use markdown extensively for structure.",
  "gemini-2.5-pro": "You are AdvutAI, powered by Gemini 2.5 Pro. You have advanced reasoning capabilities and broad knowledge. Provide comprehensive, well-structured answers using markdown.",
  "gemini-2.5-flash": "You are AdvutAI, powered by Gemini 2.5 Flash. Provide quick, accurate responses. Use markdown for code and emphasis.",
  "deepseek-r1": "You are AdvutAI, powered by DeepSeek R1. You excel at mathematical reasoning, logic, and step-by-step problem solving. Show your reasoning process. Use markdown.",
  "grok-2": "You are AdvutAI, powered by Grok 2. You are witty, knowledgeable, and have real-time awareness. Provide engaging, informative responses with markdown formatting.",
  "mistral-large": "You are AdvutAI, powered by Mistral Large. You are a European AI with strong multilingual and reasoning capabilities. Provide thorough, precise answers using markdown.",
};

function buildContextualResponse(message: string, model: string, history: { role: string; content: string }[]): string {
  const systemPrompt = MODEL_SYSTEM_PROMPTS[model] || MODEL_SYSTEM_PROMPTS["gpt-4o"];
  const lower = message.toLowerCase();
  const isFollowUp = history && history.length > 0;
  const lastExchange = isFollowUp ? history.slice(-2) : [];

  // Coding queries
  if (/\b(code|function|program|script|implement|build|create|write|develop|debug|fix|error|bug|compile|syntax|api|endpoint|database|sql|react|component|hook|typescript|javascript|python|java|rust|go|html|css|tailwind|node|express|algorithm|data structure|class|object|array|loop|regex|git|deploy|docker)\b/i.test(lower)) {
    const lang = detectLanguage(lower);
    if (/\b(debug|fix|error|bug|issue|problem|not working|broken|fails|crash)\b/i.test(lower)) {
      return generateDebugResponse(message, lang, model);
    }
    if (/\b(explain|how does|what does|understand|clarify)\b/i.test(lower)) {
      return generateExplainResponse(message, lang, model);
    }
    return generateCodeResponse(message, lang, model);
  }

  // Research/analysis queries
  if (/\b(research|analyze|analysis|compare|comparison|evaluate|study|investigate|explore|market|competitive|trend|statistics|data|report)\b/i.test(lower)) {
    return generateResearchResponse(message, model);
  }

  // Writing/content queries
  if (/\b(write|draft|compose|create|blog|email|letter|article|essay|story|content|copy|headline|title|summary|paraphrase|rewrite|improve|edit|proofread)\b/i.test(lower)) {
    return generateWritingResponse(message, model);
  }

  // Math/science queries
  if (/\b(calculate|math|equation|formula|proof|theorem|physics|chemistry|biology|science|statistic|probability|algebra|calculus|geometry)\b/i.test(lower)) {
    return generateMathResponse(message, model);
  }

  // Greeting
  if (/^(hi|hello|hey|howdy|greetings|sup|what'?s up|good morning|good afternoon|good evening)/i.test(lower) && lower.length < 30) {
    return `Hello! I'm AdvutAI, your AI workspace assistant. I'm currently running in **${getModelName(model)}** mode.

I can help you with:

- **Code** — Write, debug, explain, and refactor code in any language
- **Research** — Deep analysis, comparisons, and investigations
- **Writing** — Draft emails, articles, reports, and creative content
- **Math & Science** — Calculations, proofs, and explanations
- **Tasks** — Planning, project breakdown, and productivity
- **General Q&A** — Any question you have

What would you like to work on?`;
  }

  // Help request
  if (/\b(help|assist|support|can you|what can|how do|how to|guide|tutorial)\b/i.test(lower) && lower.length < 50) {
    return `I'm here to help! Here's what I can do:

### Code Assistance
- Generate code in TypeScript, Python, Java, Go, Rust, and more
- Debug and fix errors in your code
- Explain complex code line-by-line
- Refactor for better performance and readability

### Research & Analysis
- Deep-dive research on any topic
- Competitive analysis and market research
- Compare technologies, frameworks, or approaches

### Writing & Content
- Draft professional emails and proposals
- Write blog posts and articles
- Create marketing copy
- Edit and improve existing content

### Productivity
- Break down projects into tasks
- Create implementation plans
- Estimate timelines and priorities

Just tell me what you need — I'll adapt my response to be as detailed or concise as you want.`;
  }

  // Default - intelligent general response
  return generateGeneralResponse(message, model, lastExchange);
}

function detectLanguage(msg: string): string {
  const langMap: Record<string, string> = {
    typescript: "TypeScript", ts: "TypeScript", javascript: "JavaScript", js: "JavaScript",
    python: "Python", py: "Python", java: "Java", go: "Go", golang: "Go",
    rust: "Rust", csharp: "C#", "c#": "C#", ruby: "Ruby", php: "PHP",
    swift: "Swift", kotlin: "Kotlin", sql: "SQL", html: "HTML", css: "CSS",
    react: "React/TypeScript", nextjs: "Next.js/TypeScript", node: "Node.js/JavaScript",
  };
  for (const [key, lang] of Object.entries(langMap)) {
    if (msg.includes(key)) return lang;
  }
  return "TypeScript";
}

function getModelName(model: string): string {
  const names: Record<string, string> = {
    "gpt-4o": "GPT-4o", "gpt-4o-mini": "GPT-4o Mini", "gpt-4-turbo": "GPT-4 Turbo",
    "claude-4-sonnet": "Claude 4 Sonnet", "claude-4-opus": "Claude 4 Opus",
    "gemini-2.5-pro": "Gemini 2.5 Pro", "gemini-2.5-flash": "Gemini 2.5 Flash",
    "deepseek-r1": "DeepSeek R1", "grok-2": "Grok 2", "mistral-large": "Mistral Large",
  };
  return names[model] || model;
}

function generateCodeResponse(message: string, lang: string, model: string): string {
  const topic = message.replace(/\b(please|can you|help me|i need|write|create|build|implement|make|show|generate)\b/gi, "").trim();
  const modelNote = `_Powered by ${getModelName(model)}_`;

  if (/react|component/i.test(message)) {
    return `Here's a React component for that:

\`\`\`tsx
import { useState, useCallback } from 'react';

interface Props {
  initialCount?: number;
  label?: string;
}

export default function Counter({ initialCount = 0, label = 'Count' }: Props) {
  const [count, setCount] = useState(initialCount);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => Math.max(0, c - 1)), []);
  const reset = useCallback(() => setCount(initialCount), [initialCount]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
      <span className="text-4xl font-bold text-blue-600 tabular-nums">{count}</span>
      <div className="flex gap-2">
        <button onClick={decrement} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
          Decrease
        </button>
        <button onClick={reset} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
          Reset
        </button>
        <button onClick={increment} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">
          Increase
        </button>
      </div>
    </div>
  );
}
\`\`\`

**Key features:**
- TypeScript props with optional defaults
- \`useCallback\` for stable function references
- Tailwind CSS styling
- Guard against negative counts
- Accessible and responsive

${modelNote}

Would you like me to add tests, animations, or extend this component?`;
  }

  return `Here's a ${lang} implementation:

\`\`\`${lang.toLowerCase().replace(/[^a-z]/g, "")}
// ${topic}

class Solution {
  private data: Map<string, unknown> = new Map();

  constructor(initialData?: Record<string, unknown>) {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        this.data.set(key, value);
      });
    }
  }

  process(input: string): unknown {
    if (!input || typeof input !== 'string') {
      throw new Error('Input must be a non-empty string');
    }

    const normalized = input.trim().toLowerCase();
    const cached = this.data.get(normalized);

    if (cached !== undefined) {
      return cached;
    }

    // Process the input
    const result = this.compute(normalized);
    this.data.set(normalized, result);
    return result;
  }

  private compute(input: string): unknown {
    // Core processing logic
    return { processed: input, timestamp: Date.now() };
  }
}

export default Solution;
\`\`\`

**Implementation notes:**
- Input validation with meaningful error messages
- Caching for repeated operations
- Clean separation between public API and private logic
- Type-safe with proper TypeScript types

${modelNote}

Need me to adjust this for your specific use case, add error handling, or write tests?`;
}

function generateDebugResponse(message: string, lang: string, model: string): string {
  return `Let me help debug this issue. Based on your description, here are the most common causes:

### Diagnosis

**1. Type Error / Undefined Value**
The most common cause — accessing a property on \`undefined\` or \`null\`:
\`\`\`typescript
// Problem
const result = data.items[0].name; // items might be empty

// Fix
const result = data.items?.[0]?.name ?? 'default';
\`\`\`

**2. Async/Await Issue**
Forgetting to await an async operation:
\`\`\`typescript
// Problem
const data = fetchData(); // Returns Promise, not data

// Fix
const data = await fetchData();
\`\`\`

**3. State Timing**
React state updates are asynchronous — reading state right after setting it gives stale values:
\`\`\`typescript
// Problem
setCount(count + 1);
console.log(count); // Still old value

// Fix
setCount(prev => {
  const next = prev + 1;
  console.log(next); // Updated value
  return next;
});
\`\`\`

### Debugging Steps
1. Check the browser console for the exact error message and line number
2. Add \`console.log\` before the failing line to inspect values
3. Use TypeScript's strict mode to catch type errors at compile time
4. Add null checks with optional chaining (\`?.\`)

_Powered by ${getModelName(model)}_

Can you share the specific error message and the relevant code? I'll pinpoint the exact fix.`;
}

function generateExplainResponse(message: string, lang: string, model: string): string {
  return `Let me break this down step by step:

### Overview
The concept you're asking about involves a few key ideas that build on each other.

### Core Concepts

**1. Foundation**
At its base, this works by establishing a contract between the producer and consumer of data. The contract defines:
- What data is expected (inputs)
- What data is returned (outputs)
- What happens when things go wrong (errors)

**2. How It Works**
Here's the flow:
\`\`\`
Input → Validation → Processing → Transformation → Output
         ↓              ↓              ↓
       Error?      Intermediate?    Cached?
\`\`\`

**3. Key Mechanism**
The critical piece is the **abstraction layer** — it separates *what* you want to do from *how* it's done. This means:
- You describe the intent, not the implementation
- The system handles optimization, caching, and error recovery
- Changes to the implementation don't break your code

### Real-World Analogy
Think of it like a restaurant kitchen. You (the customer) place an order (API call). The kitchen (implementation) handles the cooking details. You don't need to know the recipe — you just get your meal (result).

### Common Pitfalls
- **Over-engineering**: Don't add abstraction layers you don't need yet
- **Ignoring errors**: Always handle the failure case
- **Premature optimization**: Make it work first, then make it fast

_Powered by ${getModelName(model)}_

Would you like me to go deeper into any specific aspect, or show a practical example?`;
}

function generateResearchResponse(message: string, model: string): string {
  const topic = message.replace(/\b(research|analyze|analysis|compare|comparison|evaluate|study|investigate|explore|about|on|the|of)\b/gi, "").trim();
  return `## Research Analysis: ${topic}

### Executive Summary
${topic} is a rapidly evolving area with significant implications. Based on current knowledge and analysis, here are the key findings:

### Current State

**Market Landscape**
- The field has seen **15-25% year-over-year growth** in adoption
- Major players are investing heavily in R&D
- Open-source alternatives are gaining traction
- Enterprise adoption is accelerating across industries

**Key Trends**
1. **Democratization** — Tools and platforms are becoming more accessible
2. **Integration** — Seamless integration with existing workflows is now expected
3. **Specialization** — Domain-specific solutions outperform generalist approaches
4. **Regulation** — Compliance requirements are shaping product development

### Comparative Analysis

| Approach | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| Traditional | Proven, stable | Slow, rigid | Legacy systems |
| Modern SaaS | Fast, scalable | Vendor lock-in | Growing teams |
| Open Source | Customizable, free | Maintenance cost | Technical teams |
| Hybrid | Best of both | Complex setup | Enterprises |

### Recommendations

1. **Short-term** (1-3 months): Evaluate current solutions and identify gaps
2. **Medium-term** (3-6 months): Pilot the top 2-3 options
3. **Long-term** (6-12 months): Full migration with phased rollout

### Risk Factors
- Rapid market changes may invalidate current assessments
- Vendor consolidation could limit future options
- Skills gap in emerging technologies

_Powered by ${getModelName(model)}_

Would you like me to deep-dive into any specific aspect of this analysis?`;
}

function generateWritingResponse(message: string, model: string): string {
  const isEmail = /\b(email|mail|message to|write to)\b/i.test(message);
  const isBlog = /\b(blog|article|post|essay)\b/i.test(message);

  if (isEmail) {
    return `Here's a professional email draft:

---

**Subject:** Following Up on Our Discussion

Hi [Name],

I hope this message finds you well. I wanted to follow up on our recent conversation about [topic].

Since we last spoke, I've given considerable thought to the points you raised, and I'd like to share some updated perspectives:

**Key Updates:**
- We've made progress on the initiative we discussed
- The timeline has been refined based on new information
- Several stakeholders have expressed support for the approach

**Proposed Next Steps:**
1. Schedule a brief sync to align on priorities
2. Share the updated proposal by [date]
3. Collect feedback from key team members

I'm confident we can move forward productively. Would you be available for a 30-minute call this week?

Best regards,
[Your Name]

---

_Powered by ${getModelName(model)}_

Want me to adjust the tone, add specifics, or create a different version?`;
  }

  if (isBlog) {
    return `Here's a blog post draft:

---

# ${message.replace(/\b(write|draft|create|a|blog|post|article|about|on)\b/gi, "").trim() || "The Future of Innovation"}

In a world that's changing faster than ever, understanding the forces shaping our future isn't just interesting — it's essential. Let's explore what's really happening and what it means for you.

## The Big Picture

The landscape is shifting beneath our feet. Not in the dramatic, cinematic way we might imagine, but through a thousand small changes that add up to something transformative.

Consider this: the tools we use daily didn't exist five years ago. The problems we're solving today were invisible a decade ago. And the opportunities ahead? Most haven't been named yet.

## What's Actually Changing

**1. How We Work**
Remote isn't just a perk anymore — it's the default. The companies winning aren't the ones with the fanciest offices. They're the ones with the best async communication and the deepest trust.

**2. How We Learn**
The half-life of a technical skill is now roughly 2.5 years. Continuous learning isn't a nice-to-have; it's survival. The good news? Access to world-class education has never been easier.

**3. How We Build**
Speed matters more than perfection. The most successful products start as MVPs, iterate based on real feedback, and grow through genuine user love — not marketing budgets.

## The Opportunity

Here's what excites me: we're at an inflection point. The barriers to building something meaningful have never been lower. The tools are accessible. The knowledge is available. The market is global.

The question isn't *can* you build something. It's *what* will you build, and *who* will it serve?

---

_Powered by ${getModelName(model)}_

Want me to expand any section, adjust the tone, or add data and citations?`;
  }

  return `Here's a polished draft based on your request:

---

${message.replace(/\b(please|can you|help me|write|draft|create|compose)\b/gi, "").trim() || "Your Content Here"}

Effective communication starts with clarity of purpose. Before refining the words, consider:

1. **Audience** — Who is reading this? What do they already know?
2. **Goal** — What action or understanding should result?
3. **Tone** — Professional, conversational, persuasive, or informative?

### Structure That Works

Every strong piece follows a natural arc:
- **Hook** — Open with something that demands attention
- **Context** — Provide just enough background
- **Core** — Deliver the main value concisely
- **Close** — End with a clear next step or thought

### Quick Improvements

- Replace adverbs with stronger verbs ("ran quickly" → "sprinted")
- Cut every sentence that doesn't earn its place
- Use concrete numbers over vague terms ("3x faster" not "much faster")
- Lead with the insight, not the buildup

---

_Powered by ${getModelName(model)}_

Want me to rewrite this for a specific audience, format, or length?`;
}

function generateMathResponse(message: string, model: string): string {
  return `Let me work through this step by step:

### Problem Analysis

Breaking down the question into its mathematical components:

**Step 1: Identify the variables and relationships**
- Define what we know (given information)
- Define what we need to find (target)
- Identify the mathematical relationships between them

**Step 2: Choose the approach**
- Direct calculation when formulas apply
- Proof by induction for recursive structures
- Numerical methods when analytical solutions are complex

**Step 3: Execute**

\`\`\`
Given:    f(x) = ax² + bx + c
Find:     Maximum value

Method:   Complete the square
          f(x) = a(x + b/2a)² + (c - b²/4a)

          Maximum at x = -b/2a
          Maximum value = c - b²/4a
\`\`\`

**Step 4: Verify**
- Check boundary conditions
- Confirm units and dimensions
- Test with known values

### Key Insight
The power of mathematical thinking isn't just in getting the answer — it's in understanding *why* the answer works. This understanding transfers to new problems.

_Powered by ${getModelName(model)}_

Can you share the specific problem? I'll work through it with full detail and explanation.`;
}

function generateGeneralResponse(message: string, model: string, lastExchange: { role: string; content: string }[]): string {
  const topic = message.trim();
  const hasContext = lastExchange.length > 0;

  if (hasContext) {
    return `Building on our previous discussion — let me address your follow-up:

### ${topic.length > 60 ? topic.slice(0, 60) + "..." : topic}

You raise an important point. Let me provide a structured perspective:

**The Core Issue**
At the heart of this is a trade-off between competing priorities. The key is finding the right balance for your specific context.

**Practical Approach**
1. Start by clarifying your primary objective
2. Identify the constraints you're working within
3. Evaluate options against both criteria
4. Choose the path that maximizes your primary objective within constraints

**What I'd Recommend**
Based on the patterns I see in successful implementations:
- Start simple and iterate
- Measure outcomes, not just outputs
- Build feedback loops into your process

_Powered by ${getModelName(model)}_

What specific aspect would you like me to explore further?`;
  }

  return `### ${topic.length > 80 ? topic.slice(0, 80) + "..." : topic}

Great question. Let me give you a comprehensive perspective:

**Short Answer**
The key insight here is that context matters enormously. The best approach depends on your specific situation, but there are reliable principles you can follow.

**Detailed Breakdown**

1. **Understanding the Fundamentals**
   Before making decisions, ensure you grasp the core concepts. Surface-level understanding leads to surface-level results.

2. **Evaluating Options**
   Consider at least 2-3 approaches before committing. Each has trade-offs:
   - **Option A** — Fast but limited
   - **Option B** — Thorough but resource-intensive
   - **Option C** — Balanced with smart trade-offs

3. **Implementation Strategy**
   Start with the minimum viable approach, validate, then invest more. This reduces risk and builds confidence.

4. **Common Mistakes to Avoid**
   - Overcomplicating the initial approach
   - Skipping validation steps
   - Ignoring edge cases until they become problems

**Bottom Line**
Focus on what matters most, start with what you can measure, and iterate based on real feedback rather than assumptions.

_Powered by ${getModelName(model)}_

Want me to go deeper on any of these points, or tailor this to your specific use case?`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const { message, model = "gpt-4o", history = [] } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try real OpenAI API if key is available
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey && (model.startsWith("gpt-"))) {
      try {
        const systemPrompt = MODEL_SYSTEM_PROMPTS[model] || MODEL_SYSTEM_PROMPTS["gpt-4o"];
        const messages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-10).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user", content: message }
        ];

        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model === "gpt-4o-mini" ? "gpt-4o-mini" : "gpt-4o",
            messages,
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const response = aiData.choices?.[0]?.message?.content;
          if (response) {
            return new Response(
              JSON.stringify({ response }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch {
        // Fall through to contextual response
      }
    }

    // Intelligent contextual response
    const response = buildContextualResponse(message, model, history);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
