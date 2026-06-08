import { NextResponse } from 'next/server';
import { chatCompletion } from '@/services/openai';
import { getModelForTask } from '@/services/modelRouter';

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const enhancedPrompt = await chatCompletion(
    [
      {
        role: 'system',
        content: 'Rewrite the user prompt to be more specific, expressive, and effective for an AI assistant.',
      },
      { role: 'user', content: prompt },
    ],
    getModelForTask('writing')
  );

  return NextResponse.json({ enhancedPrompt: enhancedPrompt.trim() });
}
