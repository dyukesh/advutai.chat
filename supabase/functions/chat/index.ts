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
}

const MODEL_SYSTEM_PROMPTS: Record<string, string> = {
  "gpt-4o": "You are AdvutAI, powered by GPT-4o. Be helpful, accurate, and thorough. Use markdown for formatting.",
  "gpt-4o-mini": "You are AdvutAI, powered by GPT-4o Mini. Be helpful and concise. Use markdown for formatting.",
  "gpt-4-turbo": "You are AdvutAI, powered by GPT-4 Turbo. Excel at complex reasoning. Use markdown.",
};

const OPENAI_MODEL_MAP: Record<string, string> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4-turbo": "gpt-4-turbo",
};

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

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const openaiModel = OPENAI_MODEL_MAP[model] || "gpt-4o";

    if (openaiKey) {
      const systemPrompt = MODEL_SYSTEM_PROMPTS[model] || MODEL_SYSTEM_PROMPTS["gpt-4o"];
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      for (const h of history.slice(-10)) {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({ role: h.role as "user" | "assistant", content: h.content });
        }
      }
      messages.push({ role: "user", content: message });

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openaiModel,
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
      } else {
        const errData = await aiRes.text();
        console.error("OpenAI API error:", aiRes.status, errData);
      }
    }

    // Fallback response when no API key or API fails
    const response = `Hello! I'm AdvutAI.

**Note:** I'm currently running in demo mode with simulated responses. To enable real AI responses:

1. The system has detected an OpenAI API key but it may be invalid or rate-limited
2. Contact support to verify API configuration

In the meantime, I can help with general guidance on code, writing, research, and more. What would you like to explore?`;

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
