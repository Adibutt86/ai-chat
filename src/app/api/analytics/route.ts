import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
  }

  // Aggregate stats from db
  const totalConversations = await prisma.conversation.count({ where: { agentId } });
  
  const totalMessages = await prisma.message.count({
    where: {
      conversation: { agentId }
    }
  });

  const totalLeads = await prisma.lead.count({ where: { agentId } });

  const recentLeads = await prisma.lead.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({
    analytics: {
      visitorsCount: totalConversations,
      chatsCount: totalConversations,
      messagesCount: totalMessages,
      leadCount: totalLeads,
      unansweredQuestions: [],
      popularPages: []
    },
    leads: recentLeads,
  });
}
