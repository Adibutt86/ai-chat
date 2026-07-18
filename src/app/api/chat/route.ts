import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchRelevantChunks } from '@/lib/vector';
import { generateChatResponseStream } from '@/lib/ai';

const searchCache = new Map<string, string>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function isGreeting(message: string): boolean {
  const normalized = message.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
  return greetings.includes(normalized);
}

function isSmallTalk(message: string): string | null {
  const normalized = message.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const smallTalkMap: Record<string, string> = {
    'thanks': 'You are very welcome! Let me know if you need anything else.',
    'thank you': 'You are very welcome! Let me know if you need anything else.',
    'bye': 'Goodbye! Have a great day!',
    'goodbye': 'Goodbye! Have a great day!',
    'nice': 'Thank you! Let me know if I can help you with anything else.',
    'great': 'Awesome! Let me know if you have any other questions.',
    'awesome': 'Thank you! Let me know if you have any other questions.',
    'ok': 'No problem. Let me know if you need anything else.',
    'okay': 'No problem. Let me know if you need anything else.',
  };
  return smallTalkMap[normalized] || null;
}

function hasBookingIntent(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  
  // Exclude setup/configuration questions from launching the booking flow
  if (normalized.includes('connect') || normalized.includes('integrate') || normalized.includes('setup') || normalized.includes('how to')) {
    return false;
  }

  const triggers = [
    'book',
    'schedule',
    'appointment',
    'consultation',
    'meeting',
    'reserve',
    'slot',
    'calendar',
    'available',
    'availability',
    'free time'
  ];
  return triggers.some(keyword => normalized.includes(keyword));
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400, headers: corsHeaders });
  }

  const conversations = await prisma.conversation.findMany({
    where: { agentId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(conversations, { headers: corsHeaders });
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { agentId, visitorId, message, conversationId, meta } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json({ error: 'agentId and message are required' }, { status: 400, headers: corsHeaders });
    }

    let targetAgentId = agentId;
    if (agentId === 'demo') {
      const latestAgent = await prisma.agent.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (latestAgent) {
        targetAgentId = latestAgent.id;
      }
    }

    const agent = await prisma.agent.findUnique({
      where: { id: targetAgentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404, headers: corsHeaders });
    }

    // 1. Find or create conversation
    let conv;
    if (conversationId) {
      conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });
    }

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          agentId: targetAgentId,
          visitorId: visitorId || 'anonymous-visitor',
          country: meta?.country || 'United States',
          browser: meta?.browser || 'Chrome',
          pageUrl: meta?.pageUrl || 'https://widget-client.com',
        },
        include: { messages: true },
      });
    }

    // 2. Save visitor message
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        sender: 'visitor',
        content: message,
      },
    });

    const encoder = new TextEncoder();

    // Booking Intent Detection
    if (hasBookingIntent(message)) {
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ 
            conversationId: conv.id,
            bookingTrigger: true 
          }) + '\n'));
          
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'user',
              content: "[Switched to booking flow]",
            },
          });
          controller.close();
        }
      });
      return new Response(stream, { 
        headers: { 
          'Content-Type': 'text/event-stream',
          ...corsHeaders
        } 
      });
    }

    // 3. Greetings Detection
    if (isGreeting(message)) {
      const greetingResponse = "Hello! I am a professional AI assistant for this website. How can I help you today?";
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ conversationId: conv.id }) + '\n'));
          for (const word of greetingResponse.split(' ')) {
            controller.enqueue(encoder.encode(JSON.stringify({ chunk: word + ' ' }) + '\n'));
            await new Promise(r => setTimeout(r, 30));
          }
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'user',
              content: greetingResponse,
            },
          });
          controller.close();
        }
      });
      return new Response(stream, { 
        headers: { 
          'Content-Type': 'text/event-stream',
          ...corsHeaders
        } 
      });
    }

    // 4. Small Talk Detection
    const smallTalkText = isSmallTalk(message);
    if (smallTalkText) {
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ conversationId: conv.id }) + '\n'));
          for (const word of smallTalkText.split(' ')) {
            controller.enqueue(encoder.encode(JSON.stringify({ chunk: word + ' ' }) + '\n'));
            await new Promise(r => setTimeout(r, 30));
          }
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'user',
              content: smallTalkText,
            },
          });
          controller.close();
        }
      });
      return new Response(stream, { 
        headers: { 
          'Content-Type': 'text/event-stream',
          ...corsHeaders
        } 
      });
    }

    // 5. Cache Lookup
    const cacheKey = `${targetAgentId}:${message.trim().toLowerCase()}`;
    if (searchCache.has(cacheKey)) {
      const cachedResponse = searchCache.get(cacheKey)!;
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ conversationId: conv.id }) + '\n'));
          for (const word of cachedResponse.split(' ')) {
            controller.enqueue(encoder.encode(JSON.stringify({ chunk: word + ' ' }) + '\n'));
            await new Promise(r => setTimeout(r, 15));
          }
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'user',
              content: cachedResponse,
            },
          });
          controller.close();
        }
      });
      return new Response(stream, { 
        headers: { 
          'Content-Type': 'text/event-stream',
          ...corsHeaders
        } 
      });
    }

    // 6. Perform manual RAG vector lookup (Up to 10 chunks)
    const matches = await searchRelevantChunks(targetAgentId, message, 10);
    let context = matches.map(m => m.chunkContent).join('\n\n');

    // Fetch and inject business hours context
    const businessHoursList = await prisma.businessHours.findMany({
      where: { organizationId: agent.organizationId }
    });
    
    let hoursContext = '';
    if (businessHoursList.length > 0) {
      const tz = businessHoursList[0].timezone;
      hoursContext = `Our official Business Working Hours (Timezone: ${tz}):\n`;
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const sortedHoursList = [...businessHoursList].sort((a, b) => {
        const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
        const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
        return dayA - dayB;
      });
      sortedHoursList.forEach(bh => {
        const dayName = weekdays[bh.dayOfWeek];
        if (bh.isEnabled) {
          hoursContext += `- ${dayName}: ${bh.startTime} to ${bh.endTime}\n`;
        } else {
          hoursContext += `- ${dayName}: Closed / Unavailable\n`;
        }
      });
    } else {
      hoursContext = `Our official Business Working Hours: Monday to Friday from 09:00 to 17:00 (UTC). Weekends are Closed.`;
    }

    // Fetch and inject services context dynamically
    const servicesList = await prisma.service.findMany({
      where: { organizationId: agent.organizationId, isActive: true }
    });
    let servicesContext = '';
    if (servicesList.length > 0) {
      servicesContext = `Available Services for Booking:\n` + servicesList.map(s => 
        `- ${s.name}: ${s.description || 'No description'} (Duration: ${s.durationMinutes} minutes, Price: ${s.price} ${s.currency})`
      ).join('\n');
    } else {
      servicesContext = `No services are currently configured for booking.`;
    }

    context = `${hoursContext}\n\n${servicesContext}\n\n${context}`;

    // 7. Check for Buying Intent to trigger Lead Capture prompt
    const buyingIntentKeywords = ['price', 'buy', 'cost', 'quote', 'premium', 'demo', 'pricing', 'subscribe', 'sales'];
    const hasBuyingIntent = buyingIntentKeywords.some(keyword => message.toLowerCase().includes(keyword));

    // 8. Generate System Instruction block
    let systemPrompt = `You are a professional AI assistant for this website.

Your job is to answer visitors' questions using the provided website content and business working hours context.

Rules:
- Be friendly and conversational.
- Keep responses concise and easy to understand.
- Use the provided business working hours list to accurately answer any questions regarding opening hours, working days, timezone, or schedules.
- If services are listed in the "Available Services for Booking" context, you MUST use ONLY those services to answer questions about what services, products, or offerings are available. Completely ignore any conflicting services, offerings, or lorem-ipsum placeholder texts found in the raw crawled website content.
- Only answer the specific question asked. Do not append unrelated website descriptions, plugin download promotions, or general marketing slogans unless directly relevant.
- Do not output, prepend, or reference unrelated questions, FAQ headers, or headings (such as "Question: what is day today") when replying. Output only the actual answer to the current question.
- Never make up facts.
- Use previous conversation history for context.
- If the answer isn't available, politely say: "I couldn't find that information on the website. Please contact our support team for more information."
- Never answer questions unrelated to the website or business.
- If appropriate, suggest contacting support.
- Keep your answer under 150 words unless the user requests more detail. Format with clean paragraphs or bullet lists when appropriate.`;

    if (hasBuyingIntent) {
      systemPrompt += `\n[IMPORTANT] The visitor has shown interest in purchasing or pricing. Politely offer to have sales contact them, and ask for their email address or contact info.`;
    }

    // Limit conversation history to the last 20 messages
    const history = conv.messages.slice(-20).map(m => ({ sender: m.sender, content: m.content }));

    // 9. Generate and Stream bot response
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ conversationId: conv.id }) + '\n'));
        try {
          let fullReply = '';
          for await (const chunk of generateChatResponseStream(
            systemPrompt,
            context,
            history,
            message,
            { temperature: agent.temperature, model: agent.model }
          )) {
            fullReply += chunk;
            controller.enqueue(encoder.encode(JSON.stringify({ chunk }) + '\n'));
          }

          // Cache completed response
          searchCache.set(cacheKey, fullReply);

          // Save completed bot response to DB
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'user',
              content: fullReply,
            },
          });

          // Track usage metrics
          await prisma.usage.create({
            data: {
              organizationId: agent.organizationId,
              metric: 'chat_messages',
              amount: 1,
            },
          });

          // Transaction Logging
          const duration = Date.now() - startTime;
          console.log(`[CHAT LOG]
Question: "${message}"
Retrieved Doc IDs: ${JSON.stringify(matches.map(m => m.documentId))}
Scores: ${JSON.stringify(matches.map(m => m.score))}
Response Time: ${duration}ms
Token Estimate: ~${Math.round((message.length + fullReply.length) / 4)}
`);
        } catch (err: any) {
          console.error("Error during streaming generation:", err);
          controller.enqueue(encoder.encode(JSON.stringify({ chunk: " I couldn't find that information on the website. Please contact our support team for more information." }) + '\n'));
        } finally {
          controller.close();
        }
      }
    });

    // Capture lead if visitor provides email in conversation
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = message.match(emailRegex);
    if (emailMatch) {
      await prisma.lead.create({
        data: {
          conversationId: conv.id,
          agentId: targetAgentId,
          email: emailMatch[0],
          name: 'Captured visitor',
        },
      });
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Internal Route Error in /api/chat:", error);
    return NextResponse.json({ error: 'Internal server error handling message' }, { status: 500, headers: corsHeaders });
  }
}
