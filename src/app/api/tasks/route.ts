import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? session.user.id : undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? session.user.id : undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, priority } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? '',
      priority: priority || 'medium',
      user: { connect: { id: userId as string } },
    },
  });

  return NextResponse.json(task);
}
