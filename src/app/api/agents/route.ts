import { NextResponse } from 'next/server';
import { chatCompletion } from '@/services/openai';
import { getModelForTask } from '@/services/modelRouter';

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Task prompt is required' }, { status: 400 });
  }

  const output = await chatCompletion(
    [
      {
        role: 'system',
        content:
          'You are an AI agent that breaks complex tasks into step-by-step plans. Create a process with steps, tools, and outcomes for the user prompt. Use clear task logic and keep the explanation concise but complete.',
      },
      { role: 'user', content: prompt },
    ],
    getModelForTask('reasoning')
  );

  return NextResponse.json({ output: output.trim() });
}
