import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return authError();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                agents: {
                  select: {
                    id: true,
                    name: true,
                    _count: {
                      select: {
                        documents: true,
                        bookings: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return authError();

  try {
    const { action, agentId } = await request.json();

    if (action === 'clear-cache' && agentId) {
      await prisma.manualKnowledge.deleteMany({ where: { agentId } });
      await prisma.website.deleteMany({ where: { agentId } });
      await prisma.document.deleteMany({ where: { agentId } });
      await prisma.training.deleteMany({ where: { agentId } });
      
      return NextResponse.json({ success: true, message: 'Agent cache wiped successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return authError();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (userId === session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own active admin account' }, { status: 400 });
    }

    const memberships = await prisma.member.findMany({
      where: { userId }
    });

    for (const mem of memberships) {
      if (mem.role === 'owner') {
        try {
          await prisma.organization.delete({
            where: { id: mem.organizationId }
          });
        } catch (orgErr) {
          console.error(`Failed to delete organization ${mem.organizationId}:`, orgErr);
        }
      }
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true, message: 'User account and associated organizations deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
