import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

async function extractText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (file.type.startsWith('text/')) {
    return await file.text();
  }

  return `Unable to extract text from file type ${file.type}.`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? session.user.id : undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const files = await prisma.file.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(files);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? session.user.id : undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File upload required' }, { status: 400 });
  }

  const summary = await extractText(file);

  const created = await prisma.file.create({
    data: {
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      summary: summary.slice(0, 1200),
      user: { connect: { id: userId as string } },
    },
  });

  return NextResponse.json(created);
}
