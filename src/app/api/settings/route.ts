import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Org details missing' }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const apiKeys = await prisma.aPIKey.findMany({
    where: { userId: session.userId },
  });

  return NextResponse.json({ organization: org, apiKeys });
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { action, keyName, memberEmail, memberRole } = await request.json();

    if (action === 'create_key') {
      const randomKey = 'cb_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      const apiKey = await prisma.aPIKey.create({
        data: {
          userId: session.userId,
          key: randomKey,
          name: keyName || 'Production API Key',
        },
      });
      return NextResponse.json({ success: true, apiKey });
    }

    if (action === 'invite_member') {
      if (!memberEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 });
      
      // Look up user or create placeholder
      let targetUser = await prisma.user.findUnique({ where: { email: memberEmail } });
      if (!targetUser) {
        targetUser = await prisma.user.create({
          data: {
            email: memberEmail,
            name: memberEmail.split('@')[0],
          },
        });
      }

      const membership = await prisma.member.create({
        data: {
          organizationId: session.orgId!,
          userId: targetUser.id,
          role: memberRole || 'member',
        },
      });

      return NextResponse.json({ success: true, membership });
    }

    return NextResponse.json({ error: 'Invalid action option' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (keyId) {
      await prisma.aPIKey.delete({ where: { id: keyId } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Missing key ID' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
