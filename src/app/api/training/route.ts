import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { crawlWebsite, chunkText } from '@/lib/crawler';
import { indexDocumentChunk } from '@/lib/vector';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId parameter is required' }, { status: 400 });
  }

  const logs = await prisma.training.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { agentId, type, url, crawlOption, content, question, answer, category } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    if (type === 'website') {
      if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

      // Create Website record
      const website = await prisma.website.create({
        data: {
          agentId,
          url,
          status: 'pending',
        },
      });

      // Async trigger crawl operation so interface returns immediately
      crawlWebsite(agentId, website.id, url, crawlOption || 'url').catch(console.error);

      return NextResponse.json({ success: true, message: 'Website crawling and embedding started' });
    }

    if (type === 'faq') {
      if (!question || !answer) {
        return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
      }

      const faq = await prisma.fAQ.create({
        data: {
          agentId,
          question,
          answer,
          category: category || 'General',
        },
      });

      // Create a document and chunk for faq search
      const doc = await prisma.document.create({
        data: {
          agentId,
          name: `FAQ: ${question.substring(0, 30)}`,
          type: 'faq',
          content: `Question: ${question}\nAnswer: ${answer}`,
          status: 'completed',
        },
      });

      // Index embeddings chunks
      const chunks = chunkText(`Question: ${question}\nAnswer: ${answer}`, 300);
      for (const chunk of chunks) {
        await indexDocumentChunk(doc.id, chunk);
      }

      await prisma.training.create({
        data: {
          agentId,
          sourceType: 'faq',
          sourceName: question,
          status: 'completed',
          message: 'Indexed FAQ question & answer entry.',
        },
      });

      return NextResponse.json({ success: true, faq });
    }

    if (type === 'manual') {
      if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
      }

      const manual = await prisma.manualKnowledge.create({
        data: {
          agentId,
          title: 'Manual Info ' + new Date().toLocaleDateString(),
          content,
        },
      });

      const doc = await prisma.document.create({
        data: {
          agentId,
          name: manual.title,
          type: 'manual',
          content,
          status: 'completed',
        },
      });

      // Index embeddings chunks
      const chunks = chunkText(content, 300);
      for (const chunk of chunks) {
        await indexDocumentChunk(doc.id, chunk);
      }

      await prisma.training.create({
        data: {
          agentId,
          sourceType: 'manual',
          sourceName: manual.title,
          status: 'completed',
          message: 'Saved and indexed custom manual guidelines.',
        },
      });

      return NextResponse.json({ success: true, manual });
    }

    return NextResponse.json({ error: 'Invalid source type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  // Mock file uploads (PDF, DOCX, TXT)
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { agentId, fileName, fileContent } = await request.json();
    if (!agentId || !fileName || !fileContent) {
      return NextResponse.json({ error: 'Missing document parameters' }, { status: 400 });
    }

    const doc = await prisma.document.create({
      data: {
        agentId,
        name: fileName,
        type: fileName.endsWith('.pdf') ? 'pdf' : fileName.endsWith('.docx') ? 'docx' : 'txt',
        content: fileContent,
        status: 'completed',
      },
    });

    // Index embeddings chunks
    const chunks = chunkText(fileContent, 300);
    for (const chunk of chunks) {
      await indexDocumentChunk(doc.id, chunk);
    }

    await prisma.training.create({
      data: {
        agentId,
        sourceType: 'file',
        sourceName: fileName,
        status: 'completed',
        message: `Parsed document files and created chunks.`,
      },
    });

    return NextResponse.json({ success: true, doc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Reset logs or stop active indexing processes
export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const action = searchParams.get('action'); // 'reset' or 'stop'

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
  }

  try {
    const logId = searchParams.get('logId');
    if (logId) {
      await prisma.training.delete({
        where: { id: logId },
      });
      return NextResponse.json({ success: true, message: 'Log entry deleted' });
    }

    if (action === 'reset') {
      await prisma.training.deleteMany({
        where: { agentId },
      });
      return NextResponse.json({ success: true, message: 'Activity logs reset' });
    }

    if (action === 'clear-cache') {
      await prisma.manualKnowledge.deleteMany({ where: { agentId } });
      await prisma.website.deleteMany({ where: { agentId } });
      await prisma.document.deleteMany({ where: { agentId } });
      await prisma.training.deleteMany({ where: { agentId } });
      return NextResponse.json({ success: true, message: 'Agent knowledge base cache completely wiped.' });
    }

    if (action === 'stop') {
      // Mark all 'running' training tasks as failed
      await prisma.training.updateMany({
        where: { agentId, status: 'running' },
        data: { status: 'failed', message: 'Index process stopped by user.' },
      });

      // Mark pending or crawling websites/documents as failed
      await prisma.website.updateMany({
        where: { agentId, status: { in: ['pending', 'crawling'] } },
        data: { status: 'failed' },
      });

      await prisma.document.updateMany({
        where: { agentId, status: { in: ['pending', 'indexing'] } },
        data: { status: 'failed' },
      });

      return NextResponse.json({ success: true, message: 'All active processes stopped' });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
