import { NextResponse } from 'next/server';
import { chatCompletion } from '@/services/openai';
import { getModelForTask } from '@/services/modelRouter';

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const output = await chatCompletion(
    [
      {
        role: 'system',
        content:
          'You are an AI canvas builder. Generate notes, plans, tables, and creative structure for a workspace focused on the user prompt. Use headings and bullet lists for readability.',
      },
      { role: 'user', content: prompt },
    ],
    getModelForTask('analysis')
  );

  return NextResponse.json({ output: output.trim() });
}
