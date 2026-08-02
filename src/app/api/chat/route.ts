import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchRelevantChunks } from '@/lib/vector';
import { generateResponseStream } from '@/services/ai/anthropic.service';
import { simulateLocalAIResponse } from '@/lib/ai';

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

function isOffTopicQuery(message: string): boolean {
  const norm = message.trim().toLowerCase();
  const offTopicKeywords = [
    'write python', 'write a python', 'write javascript', 'write code',
    'solve equation', 'who is the president', 'capital of france', 'recipe for',
    'quantum physics', 'political stance', 'what is 2+2', 'derivative of',
    'history of rome', 'who won the world cup'
  ];
  return offTopicKeywords.some(kw => norm.includes(kw));
}

function isModelQuery(message: string): boolean {
  const norm = message.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const triggers = [
    'what model',
    'which model',
    'model name',
    'model are you',
    'model is working',
    'current model',
    'active model',
    'what ai model',
    'which ai model',
    'model'
  ];
  return triggers.some(t => norm.includes(t));
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
      include: { widgetSettings: true }
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

    // Booking Intent Detection - Only intercept if showBooking toggle is enabled in Widget Settings
    const showBooking = agent.widgetSettings?.showBooking !== false;
    if (showBooking && hasBookingIntent(message)) {
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

    // Instant Active Model Query Response
    if (isModelQuery(message)) {
      const currentModelId = agent.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      let friendlyModelName = currentModelId;
      if (currentModelId.includes('3-5-sonnet') || currentModelId.includes('3.5-sonnet')) friendlyModelName = 'Claude 3.5 Sonnet';
      else if (currentModelId.includes('3-5-haiku') || currentModelId.includes('3.5-haiku')) friendlyModelName = 'Claude 3.5 Haiku';
      else if (currentModelId.includes('3-7-sonnet') || currentModelId.includes('3.7-sonnet')) friendlyModelName = 'Claude 3.7 Sonnet';
      else if (currentModelId.includes('opus')) friendlyModelName = 'Claude 3 Opus';
      else if (currentModelId.includes('3-haiku')) friendlyModelName = 'Claude 3 Haiku';

      const replyText = `I am currently running on **${friendlyModelName}** (\`${currentModelId}\`).`;

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ conversationId: conv.id }) + '\n'));
          controller.enqueue(encoder.encode(JSON.stringify({ chunk: replyText }) + '\n'));

          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'assistant',
              content: replyText,
            },
          });
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...corsHeaders,
        },
      });
    }

    // Perform RAG vector lookup (Top 8 chunks)

    // 6. Perform RAG vector lookup (Top 8 chunks - Requirement #6)
    const matches = await searchRelevantChunks(targetAgentId, message, 8);

    // RAG Debug Logging (Requirement #12)
    console.log(`[RAG DEBUG] Query: "${message}" | Retrieved ${matches.length} chunks for agent ${targetAgentId}:`);
    matches.forEach((m, idx) => {
      console.log(`  [Chunk ${idx + 1}] Score: ${m.score.toFixed(3)} | Title: "${m.name || 'N/A'}" | URL: ${m.url || 'N/A'}\n  Snippet: ${m.chunkContent.substring(0, 100)}...`);
    });

    // Format context including Page Title & URL (Requirement #8)
    let context = matches.map(m => {
      const title = m.name || 'Website Page';
      const url = m.url || 'https://website.com';
      return `[Source Title: ${title} | URL: ${url}]\n${m.chunkContent}`;
    }).join('\n\n');

    // 1. Business Working Hours:
    // If showHours === true (ENABLED): use Dashboard Business Hours
    // If showHours === false (DISABLED): search purely from Website Crawled Data (vector RAG chunks)
    const showHours = agent.widgetSettings?.showHours === true;
    let hoursContext = '';
    
    if (showHours) {
      let businessHoursList = await prisma.businessHours.findMany({
        where: { organizationId: agent.organizationId }
      });
      
      if (businessHoursList.length === 0 && agent.organizationId) {
        const DEFAULT_HOURS = [
          { dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 6, isEnabled: false, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 0, isEnabled: false, startTime: '09:00', endTime: '17:00' },
        ];
        await prisma.businessHours.createMany({
          data: DEFAULT_HOURS.map(h => ({
            ...h,
            organizationId: agent.organizationId,
            timezone: 'UTC'
          }))
        });
        businessHoursList = await prisma.businessHours.findMany({
          where: { organizationId: agent.organizationId }
        });
      }

      if (businessHoursList.length > 0) {
        const tz = businessHoursList[0].timezone || 'UTC';
        hoursContext = `Official Dashboard Business Working Hours (${tz}):\n`;
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const sortedHoursList = [...businessHoursList].sort((a, b) => {
          const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
          const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
          return dayA - dayB;
        });
        sortedHoursList.forEach(bh => {
          const dayName = weekdays[bh.dayOfWeek];
          if (bh.isEnabled) {
            hoursContext += `• ${dayName}: ${bh.startTime} to ${bh.endTime}\n`;
          } else {
            hoursContext += `• ${dayName}: Closed / Unavailable\n`;
          }
        });
      }
    }

    // 2. Services:
    // If showServices === true (ENABLED): use Dashboard Services data
    // If showServices === false (DISABLED): search purely from Website Crawled Data (vector RAG chunks)
    const showServices = agent.widgetSettings?.showServices === true;
    let servicesContext = '';
    
    if (showServices) {
      let servicesList = await prisma.service.findMany({
        where: { organizationId: agent.organizationId, isActive: true }
      });
      if (servicesList.length === 0) {
        servicesList = await prisma.service.findMany({ where: { isActive: true } });
      }
      if (servicesList.length > 0) {
        servicesContext = `Official Dashboard Business Services:\n` + servicesList.map(s => 
          `• ${s.name}: ${s.description || 'Standard service'}`
        ).join('\n');
      }
    }

    // 3. Contact Us / Lead Details:
    // If showLeadForm === true (ENABLED): use Dashboard Contact Info
    // If showLeadForm === false (DISABLED): search purely from Website Crawled Data (vector RAG chunks)
    const showLeadForm = agent.widgetSettings?.showLeadForm !== false;
    const normMsgLower = message.trim().toLowerCase();
    const isContactQuery = normMsgLower.includes('contact') || normMsgLower.includes('reach') || normMsgLower.includes('support') || normMsgLower.includes('email') || normMsgLower.includes('phone') || normMsgLower.includes('call') || normMsgLower.includes('number') || normMsgLower.includes('help form') || normMsgLower.includes('office') || normMsgLower.includes('location') || normMsgLower.includes('address') || normMsgLower.includes('headquarter') || normMsgLower.includes('where are you');
    let contactContext = '';
    if (showLeadForm && isContactQuery) {
      contactContext = "Official Dashboard Business Contact & Location Information:\n• Phone Support: +1 (800) 555-0199 / +1 (202) 555-0148\n• Email Support: support@chatboxai.com\n• Online Help Desk: /contact\n• Office Location: 123 Tech Avenue, Suite 400, Washington, D.C., USA\n• Support Response Time: Within 24 hours";
    }

    context = [hoursContext, servicesContext, contactContext, context].filter(Boolean).join('\n\n');

    // Grounding Context Assembly

    // 7. Check for Buying Intent to trigger Lead Capture prompt
    const buyingIntentKeywords = ['price', 'buy', 'cost', 'quote', 'premium', 'demo', 'pricing', 'subscribe', 'sales'];
    const hasBuyingIntent = buyingIntentKeywords.some(keyword => message.toLowerCase().includes(keyword));

    // 8. Generate Highest-Priority System Instruction block (Requirements #1, #3, #4, #10, #11)
    let systemPrompt = `You are an official AI Customer Support Representative for ChatBox AI (${agent.name}).

STRICT ANSWERING RULES:
1. GREETINGS & PLEASANTRIES: For greetings, pleasantries, or polite introductions (e.g. "hi", "hello", "how are you", "who are you", "good morning", "thank you"), respond warmly and professionally as the website's AI assistant, introduce yourself, and offer to help with any website or support inquiries.
2. HUMAN CONVERSATIONAL SYNTHESIS: Synthesize information into clear, readable, natural human conversational sentences. Use clean bullet points (•) and clear line breaks.
3. NO EMOJIS OR SYMBOLS: Do NOT include any emojis, icons, or symbols (such as 💳, ⚡, 🚀, 🏢, 🕒, 📍, 🛠️, 🎁, 🤖, 🟢, 🔴, 🧠, etc.) in your responses. Keep responses completely free of icon clutter.
4. BOLD MAIN HEADINGS: Always format main topic section headers in bold text without emojis (for example: **ChatBox AI Plans & Pricing** or **Official Business Working Hours**).
5. STRICT GROUNDING FOR FACTUAL QUESTIONS: For questions about products, services, pricing, business hours, features, or website content, answer strictly using ONLY the provided Authoritative Website Knowledge Base and Dashboard Context below.
6. MISSING INFORMATION FALLBACK: For factual questions where the answer is NOT available in the website context, reply EXACTLY with:
   "I couldn't find that information on this website. Please contact our team for assistance."
   Do NOT hallucinate, extrapolate, or invent details.
7. TYPOS & MISSPELLINGS: Automatically interpret visitor questions even if they contain spelling mistakes, typos, or informal phrasing (e.g. "phon numbr", "pricin plan", "workin hour").`;

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
          for await (const chunk of generateResponseStream({
            model: agent.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
            systemPrompt: `${systemPrompt}\n\n[AUTHORITATIVE WEBSITE KNOWLEDGE BASE]\n${context}`,
            messages: [
              ...history.map(h => ({
                role: h.sender === 'visitor' ? ('user' as const) : ('assistant' as const),
                content: h.content,
              })),
              { role: 'user' as const, content: message },
            ],
            temperature: agent.temperature ?? 0.7,
          })) {
            fullReply += chunk;
            controller.enqueue(encoder.encode(JSON.stringify({ chunk }) + '\n'));
          }

          // Build Sources Citations at the end of answer (Requirement #15)
          const validSourcesMap = new Map<string, string>();
          matches.forEach(m => {
            if (m.name || m.url) {
              const link = m.url || '#';
              const linkLower = link.toLowerCase();
              const labelLower = (m.name || '').toLowerCase();
              
              // Skip CSS, JS, feed, or plugin asset sources
              if (linkLower.includes('.css') || linkLower.includes('.js') || linkLower.includes('/feed') || linkLower.includes('wp-content/plugins') || labelLower.includes('.css')) {
                return;
              }

              const label = m.name || 'Website Page';
              if (!validSourcesMap.has(label)) {
                validSourcesMap.set(label, link);
              }
            }
          });

          const isFallbackReply = fullReply.includes("couldn't find that information");
          if (validSourcesMap.size > 0 && !isFallbackReply) {
            let citationsText = '\n\n**Sources:**\n';
            validSourcesMap.forEach((link, label) => {
              citationsText += `• [${label}](${link})\n`;
            });
            fullReply += citationsText;
            controller.enqueue(encoder.encode(JSON.stringify({ chunk: citationsText }) + '\n'));
          }

          // Save completed bot response to DB
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'assistant',
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
          console.error("[Anthropic API Error]:", err?.message || err);
          const errorReply = "Sorry, we have a connection issue.";
          controller.enqueue(encoder.encode(JSON.stringify({ chunk: errorReply }) + '\n'));

          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'assistant',
              content: errorReply,
            },
          });
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
