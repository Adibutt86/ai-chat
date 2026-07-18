import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { indexDocumentChunk } from '@/lib/vector';
import { chunkText } from '@/lib/crawler';

// GET: List all indexed documents for a specific agent
export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId parameter is required' }, { status: 400 });
  }

  const docs = await prisma.document.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(docs);
}

// DELETE: Delete an indexed document (cascade deletes embeddings)
export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('docId');

  if (!docId) {
    return NextResponse.json({ error: 'docId parameter is required' }, { status: 400 });
  }

  try {
    await prisma.document.delete({
      where: { id: docId },
    });

    return NextResponse.json({ success: true, message: 'Document and its embeddings deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete document' }, { status: 500 });
  }
}

// PUT: Edit and update document content (re-indexes embeddings)
export async function PUT(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { docId, name, content } = await request.json();
    if (!docId || !name || !content) {
      return NextResponse.json({ error: 'docId, name and content are required' }, { status: 400 });
    }

    // 1. Delete previous embeddings
    await prisma.embedding.deleteMany({
      where: { documentId: docId },
    });

    // 2. Update document fields
    const doc = await prisma.document.update({
      where: { id: docId },
      data: { name, content, status: 'completed' },
    });

    // 3. Generate new chunks and index embeddings
    const chunks = chunkText(content, 300);
    for (const chunk of chunks) {
      await indexDocumentChunk(doc.id, chunk);
    }

    return NextResponse.json({ success: true, doc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update document' }, { status: 500 });
  }
}
