import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
}

const RESPONSES: Record<string, string[]> = {
  greeting: [
    "Hello! I'm advutai, your AI assistant. How can I help you today?",
    "Hey there! I'm ready to help with whatever you need. What's on your mind?",
    "Hi! Welcome to advutai.chat. I'm here to assist you with anything you'd like to discuss.",
  ],
  code: [
    "That's a great coding question! Here's my approach:\n\n1. Break the problem down into smaller parts\n2. Start with the core logic\n3. Add error handling\n4. Test with edge cases\n\nWould you like me to go deeper into any of these steps?",
    "For coding challenges, I'd recommend starting with a clean architecture. Let me outline a solution:\n\n- Define your data structures first\n- Implement the main algorithm\n- Add validation and error handling\n- Write tests\n\nWhat specific language or framework are you working with?",
  ],
  help: [
    "I can help you with a wide range of topics:\n\n- **Coding & Development** — Architecture, debugging, best practices\n- **Writing & Content** — Drafting, editing, brainstorming\n- **Analysis** — Data interpretation, problem-solving\n- **Learning** — Explaining concepts, recommending resources\n\nJust ask me anything!",
    "I'm here to assist! Some things I'm good at:\n\n1. Writing and reviewing code\n2. Explaining complex concepts simply\n3. Brainstorming creative solutions\n4. Helping with technical decisions\n\nWhat would you like to explore?",
  ],
  default: [
    "That's an interesting point. Let me think about this...\n\nFrom my perspective, there are several angles to consider. The key factor is understanding what outcome you're looking for. Could you share more details about what you're trying to achieve?",
    "Great question! Let me break this down:\n\nFirst, let's consider the context. Then we can explore different approaches and their trade-offs. What aspect would you like me to focus on?",
    "I appreciate the thoughtful question. Here's my take:\n\nThere are multiple ways to approach this, and the best path depends on your specific needs. Let me outline the main options and we can dive deeper into whichever resonates most.",
    "Interesting! Let me share some thoughts on this.\n\nThe key insight here is that context matters a lot. Different situations call for different approaches. Can you tell me more about the specific scenario you're working with?",
  ],
};

function classifyMessage(message: string): string {
  const lower = message.toLowerCase();
  if (/^(hi|hello|hey|howdy|greetings|sup|what'?s up)/i.test(lower)) return "greeting";
  if (/\b(code|program|function|bug|debug|api|database|javascript|typescript|python|react|html|css|algorithm)\b/i.test(lower)) return "code";
  if (/\b(help|assist|support|can you|what can|how do)\b/i.test(lower)) return "help";
  return "default";
}

function getResponse(message: string): string {
  const category = classifyMessage(message);
  const options = RESPONSES[category];
  return options[Math.floor(Math.random() * options.length)];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = getResponse(message);

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
