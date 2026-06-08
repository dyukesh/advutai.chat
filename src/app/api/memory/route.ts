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

  const memories = await prisma.memory.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(memories);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? session.user.id : undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key, value, category } = await request.json();
  if (!key?.trim() || !value?.trim()) {
    return NextResponse.json({ error: 'Missing memory key or value' }, { status: 400 });
  }

  const memory = await prisma.memory.create({
    data: {
      key: key.trim(),
      value: value.trim(),
      category: category ? category.trim() : null,
      user: { connect: { id: userId as string } },
    },
  });

  return NextResponse.json(memory);
}
