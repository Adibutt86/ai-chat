import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { crawlWebsite } from '@/lib/crawler';

export async function POST(request: Request) {
  try {
    const { name, email, password, websiteUrl } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // Automatically create a default organization for the registered user
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-org-' + Math.floor(Math.random() * 1000);
    const org = await prisma.organization.create({
      data: {
        name: `${name}'s Org`,
        slug,
      },
    });

    // Create Owner membership
    await prisma.member.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'owner',
      },
    });

    // If websiteUrl is provided during signup, automatically provision a default chatbot agent and trigger web crawl indexing
    if (websiteUrl) {
      try {
        const agent = await prisma.agent.create({
          data: {
            name: `${name}'s Chatbot`,
            description: `Automated assistant for ${websiteUrl}`,
            themeColor: '#2563eb',
            language: 'en',
            model: 'gemini-2.5-flash',
            temperature: 0.7,
            organizationId: org.id,
          },
        });

        // Create default widget settings
        await prisma.widgetSettings.create({
          data: {
            agentId: agent.id,
            primaryColor: agent.themeColor,
            borderRadius: '0.75rem',
          },
        });

        // Add website record
        const website = await prisma.website.create({
          data: {
            agentId: agent.id,
            url: websiteUrl,
            status: 'pending',
          },
        });

        // Trigger crawler asynchronously
        crawlWebsite(agent.id, website.id, websiteUrl).catch(console.error);
      } catch (agentErr) {
        console.error('Failed to auto-create chatbot agent during registration:', agentErr);
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: org.id,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });

    response.headers.set(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
