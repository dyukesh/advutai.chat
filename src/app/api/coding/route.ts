import { NextResponse } from 'next/server';
import { chatCompletion } from '@/services/openai';
import { getModelForTask } from '@/services/modelRouter';

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Coding prompt is required' }, { status: 400 });
  }

  const output = await chatCompletion(
    [
      {
        role: 'system',
        content:
          'You are a senior developer AI assistant specialized in coding, debugging, and explaining programming concepts. Answer clearly and include code examples where appropriate.',
      },
      { role: 'user', content: prompt },
    ],
    getModelForTask('coding')
  );

  return NextResponse.json({ output: output.trim() });
}
