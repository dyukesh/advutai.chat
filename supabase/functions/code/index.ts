import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-User-Api-Key",
};

interface CodeRequest {
  prompt: string;
  language: string;
  mode: string;
}

const MODE_PROMPTS: Record<string, string> = {
  generate: `You are an expert software engineer. Generate clean, production-ready {lang} code based on the user's description.
- Include all necessary imports
- Add brief inline comments only where non-obvious
- Use modern best practices and idioms for {lang}
- Wrap code in a properly labeled markdown code block
- After the code, briefly explain key implementation decisions`,

  fix: `You are an expert debugger. Analyze the user's {lang} code or error description and fix the bugs.
- Identify all bugs and issues clearly
- Show the fixed code in a markdown code block
- Explain what was wrong and why the fix works
- Mention any edge cases or potential issues to watch for`,

  explain: `You are a {lang} expert and teacher. Explain the provided code or concept clearly.
- Break down the logic step by step
- Explain why each part works the way it does
- Use simple analogies where helpful
- Highlight important patterns or idioms being used`,

  refactor: `You are a senior {lang} engineer focused on code quality. Refactor the provided code.
- Improve readability, performance, and maintainability
- Show the refactored code in a markdown code block
- List each change made and why it's an improvement
- Keep the same functionality — only improve the implementation`,

  analyze: `You are a {lang} code reviewer. Perform a thorough code analysis.
- Review for bugs, security issues, and performance problems
- Assess code quality, readability, and maintainability
- Provide a scored assessment for each category
- Give specific, actionable recommendations`,
};

async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string): Promise<{ ok: boolean; content?: string; error?: string }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  });

  const data = await res.json();
  if (!res.ok) return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { ok: false, error: "Empty response" };
  return { ok: true, content };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: CodeRequest = await req.json();
    const { prompt, language = "TypeScript", mode = "generate" } = body;

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userKey = req.headers.get("X-User-Api-Key");
    const serverKey = Deno.env.get("OPENAI_API_KEY");
    const apiKey = userKey || serverKey;

    if (apiKey) {
      const modePrompt = (MODE_PROMPTS[mode] ?? MODE_PROMPTS.generate).replaceAll("{lang}", language);
      const result = await callOpenAI(apiKey, modePrompt, prompt.trim());

      if (result.ok) {
        return new Response(
          JSON.stringify({ response: result.content }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isQuota = result.error?.includes("quota") || result.error?.includes("429");
      const errMsg = isQuota
        ? `⚠️ **API quota exceeded.** Go to **Settings → API Keys** to add your own OpenAI key.`
        : `⚠️ **AI Error:** ${result.error}`;
      return new Response(
        JSON.stringify({ response: errMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No key — prompt user to configure one
    return new Response(
      JSON.stringify({ response: `⚠️ **No API key configured.**\n\nTo use the Code Assistant with real AI:\n\n1. Go to **Settings → API Keys**\n2. Add your OpenAI API key\n3. Get a free key at https://platform.openai.com/api-keys` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
