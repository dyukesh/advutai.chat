import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-User-Api-Key",
};

interface ChatRequest {
  message: string;
  model?: string;
  history?: { role: string; content: string }[];
}

const OPENAI_MODEL_MAP: Record<string, string> = {
  "gpt-4o":      "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4-turbo": "gpt-4-turbo",
};

async function callOpenAI(apiKey: string, model: string, messages: object[]): Promise<{ ok: boolean; content?: string; error?: string }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048, temperature: 0.7 }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) return { ok: false, error: "Empty response from OpenAI" };

  return { ok: true, content };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const { message, model = "gpt-4o", history = [] } = body;

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User-provided key takes priority over server key
    const userKey = req.headers.get("X-User-Api-Key");
    const serverKey = Deno.env.get("OPENAI_API_KEY");
    const openaiKey = userKey || serverKey;
    const openaiModel = OPENAI_MODEL_MAP[model] ?? "gpt-4o";

    const systemPrompt = `You are AdvutAI, a helpful, accurate AI assistant powered by ${openaiModel}. Answer questions directly and thoroughly. Use markdown formatting for code, lists, and emphasis where appropriate.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20).filter(h => (h.role === "user" || h.role === "assistant") && h.content?.trim()).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message.trim() },
    ];

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ response: "⚠️ **No API key configured.**\n\nTo use real AI responses, go to **Settings → API Keys** and enter your OpenAI API key. You can get one at https://platform.openai.com/api-keys" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await callOpenAI(openaiKey, openaiModel, messages);

    if (!result.ok) {
      // If server key fails, tell user to add their own
      const isQuota = result.error?.includes("quota") || result.error?.includes("429");
      const msg = isQuota
        ? `⚠️ **API quota exceeded.**\n\nThe server's OpenAI quota is exhausted. To continue chatting:\n\n1. Go to **Settings → API Keys**\n2. Enter your own OpenAI API key\n3. Get a key at https://platform.openai.com/api-keys\n\n*Your key is stored locally and never shared.*`
        : `⚠️ **AI Error:** ${result.error}`;
      return new Response(
        JSON.stringify({ response: msg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ response: result.content }),
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
