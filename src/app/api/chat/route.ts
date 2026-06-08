import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { streamChatCompletion } from '@/services/openai';
import { getModelForTask, getToneSystemPrompt, type PersonalityTone } from '@/services/modelRouter';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? session.user.id : undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const prompt = body.prompt?.trim();
  const model = body.model ?? getModelForTask('chat');
  const tone = (body.tone ?? 'professional') as PersonalityTone;

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  await prisma.chat.create({
    data: {
      title: prompt.slice(0, 80),
      user: { connect: { id: userId } },
    },
  });

  const systemInstructions = `You are AdvutAI, an intelligent AI workspace assistant. ${getToneSystemPrompt(tone)}`;

  const stream = await streamChatCompletion(
    [
      { role: 'system', content: systemInstructions },
      { role: 'user', content: prompt },
    ],
    model
  );

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
