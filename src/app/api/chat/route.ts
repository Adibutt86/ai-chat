import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchRelevantChunks } from '@/lib/vector';
import { generateResponseStream } from '@/services/ai/anthropic.service';
import { simulateLocalAIResponse } from '@/lib/ai';
import { getCrawledWebsiteLinks } from '@/lib/crawled-links';

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
  
  // Exclude setup/configuration or general inquiry questions
  if (normalized.includes('connect') || normalized.includes('integrate') || normalized.includes('setup') || normalized.includes('how to')) {
    return false;
  }

  // Explicit phrases indicating direct intent to launch the booking flow
  const explicitPhrases = [
    'book an appointment',
    'book appointment',
    'schedule an appointment',
    'schedule appointment',
    'book a ride',
    'book ride',
    'book now',
    'schedule now',
    'want to book',
    'like to book',
    'make a reservation',
    'make a booking',
    'reserve a slot',
    'book a meeting',
    'schedule a meeting',
    'i want to book'
  ];

  if (explicitPhrases.some(phrase => normalized.includes(phrase))) {
    return true;
  }

  // Exact single word triggers for very short prompts (e.g. "book", "booking", "schedule")
  const shortMsgWords = normalized.split(/\s+/);
  if (shortMsgWords.length <= 3) {
    const singleTriggers = ['book', 'booking', 'schedule', 'reservation'];
    return singleTriggers.some(t => shortMsgWords.includes(t));
  }

  return false;
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

    // Direct Email Lead Capture Interception:
    // When visitor provides an email address in the chat message, save as Lead to DB and thank them directly
    const leadEmailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (leadEmailMatch) {
      const extractedEmail = leadEmailMatch[1].trim();

      let extractedName: string | undefined = undefined;
      const nameMatch = message.match(/(?:my name is|i am|this is|i'm|name:?)\s+([A-Za-z\s]{2,30})/i);
      if (nameMatch) {
        extractedName = nameMatch[1].trim();
      } else {
        const textWithoutEmail = message.replace(extractedEmail, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ').trim();
        const parts = textWithoutEmail.split(/\s+/).filter((p: string) => p.length >= 2 && !/^\d+$/.test(p));
        if (parts.length > 0 && parts[0].length >= 2 && !['hi', 'hello', 'hey', 'my', 'is', 'email', 'contact', 'please'].includes(parts[0].toLowerCase())) {
          extractedName = parts[0];
        }
      }

      try {
        await prisma.lead.create({
          data: {
            agentId: targetAgentId,
            conversationId: conv.id,
            email: extractedEmail,
            name: extractedName || undefined,
            company: message
          }
        });
      } catch {
        // Non-blocking lead creation
      }

      const thankMessage = extractedName 
        ? `Thanks ${extractedName} for providing your information! What would you like to know today?`
        : `Thanks for providing your information! What would you like to know today?`;

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ conversationId: conv.id }) + '\n'));
          controller.enqueue(encoder.encode(JSON.stringify({ chunk: thankMessage }) + '\n'));

          await prisma.message.create({
            data: {
              conversationId: conv.id,
              sender: 'assistant',
              content: thankMessage,
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

    // Booking Intent Detection - Only intercept if showBooking toggle is enabled in Widget Settings
    // Booking Intent Detection - Only trigger interactive booking flow if enabled AND configured to fetch from Dashboard
    const showBooking = agent.widgetSettings?.showBooking !== false;
    const bookingSourceMode = agent.widgetSettings?.bookingSourceMode || agent.widgetSettings?.dataSourceMode || 'dashboard';
    const isBookingFromDashboard = bookingSourceMode === 'dashboard';

    if (showBooking && isBookingFromDashboard && hasBookingIntent(message)) {
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
    const matches = await searchRelevantChunks(targetAgentId, message, 8);

    // RAG Debug Logging
    console.log(`[RAG DEBUG] Query: "${message}" | Retrieved ${matches.length} chunks for agent ${targetAgentId}:`);
    matches.forEach((m, idx) => {
      console.log(`  [Chunk ${idx + 1}] Score: ${m.score.toFixed(3)} | Title: "${m.name || 'N/A'}" | URL: ${m.url || 'N/A'}\n  Snippet: ${m.chunkContent.substring(0, 100)}...`);
    });

    // Format context including Page Title & URL
    let context = matches.map(m => {
      const title = m.name || 'Website Page';
      const url = m.url || 'https://website.com';
      return `[Source Title: ${title} | URL: ${url}]\n${m.chunkContent}`;
    }).join('\n\n');

    // Individual Per-Point Knowledge Retrieval Source Policy:
    const hoursSourceMode = agent.widgetSettings?.hoursSourceMode || agent.widgetSettings?.dataSourceMode || 'dashboard';
    const servicesSourceMode = agent.widgetSettings?.servicesSourceMode || agent.widgetSettings?.dataSourceMode || 'dashboard';
    const contactSourceMode = agent.widgetSettings?.contactSourceMode || agent.widgetSettings?.dataSourceMode || 'dashboard';

    // 1. Business Working Hours:
    const showHours = (agent.widgetSettings?.showHours === true) && (hoursSourceMode === 'dashboard');
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
        hoursContext = `Business Hours (${tz}):\n`;
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
            hoursContext += `• ${dayName}: Closed\n`;
          }
        });
      }
    }

    // 2. Services:
    const showServices = (agent.widgetSettings?.showServices === true) && (servicesSourceMode === 'dashboard');
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

    // 3. Dynamic Crawled Website Page Links (Book Now, Contact Us, Navigation Pages)
    const crawledLinks = await getCrawledWebsiteLinks(targetAgentId);
    const bookPageUrl = crawledLinks.bookNowUrl || '/book-now';
    const contactPageUrl = crawledLinks.contactUsUrl || '/contact-us';

    let crawledPagesContext = '';
    if (crawledLinks.allPages.length > 0) {
      crawledPagesContext = `CRAWLED WEBSITE NAVIGATION & PAGE DIRECTORY:\n` + 
        crawledLinks.allPages.map(p => `• ${p.name}: [${p.name}](${p.url})`).join('\n');
    }

    // 4. Contact Us / Lead Details:
    const showLeadForm = (agent.widgetSettings?.showLeadForm !== false) && (contactSourceMode === 'dashboard');
    const normMsgLower = message.trim().toLowerCase();
    const isContactQuery = normMsgLower.includes('contact') || normMsgLower.includes('reach') || normMsgLower.includes('support') || normMsgLower.includes('email') || normMsgLower.includes('phone') || normMsgLower.includes('call') || normMsgLower.includes('number') || normMsgLower.includes('help form') || normMsgLower.includes('office') || normMsgLower.includes('location') || normMsgLower.includes('address') || normMsgLower.includes('headquarter') || normMsgLower.includes('where are you');
    let contactContext = '';
    if (showLeadForm && isContactQuery) {
      contactContext = `Official Business Contact & Location Information:\n• Phone Support: +1 (800) 555-0199 / +1 (202) 555-0148\n• Email Support: support@geekvista.com\n• Contact Page: [Contact Us](${contactPageUrl})\n• Booking Page: [Book Appointment](${bookPageUrl})\n• Office Location: 123 Tech Avenue, Suite 400, Washington, D.C., USA\n• Support Response Time: Within 24 hours`;
    }

    context = [hoursContext, servicesContext, contactContext, crawledPagesContext, context].filter(Boolean).join('\n\n');

    // Grounding Context Assembly

    // 7. Check for Buying Intent to trigger Lead Capture prompt
    const buyingIntentKeywords = ['price', 'buy', 'cost', 'quote', 'premium', 'demo', 'pricing', 'subscribe', 'sales'];
    const hasBuyingIntent = buyingIntentKeywords.some(keyword => message.toLowerCase().includes(keyword));

    // 8. Generate Highest-Priority System Instruction block (Requirements #1, #3, #4, #10, #11)
    let systemPrompt = `You are an official AI Customer Support Representative for Geekvista (${agent.name}).

STRICT ANSWERING RULES:
1. GREETINGS & PLEASANTRIES: For greetings, pleasantries, or polite introductions (e.g. "hi", "hello", "how are you", "who are you", "good morning", "thank you"), respond warmly and professionally as the website's AI assistant, introduce yourself, and offer to help with any website or support inquiries.
2. HUMAN CONVERSATIONAL SYNTHESIS: Synthesize information into clear, readable, natural human conversational sentences. Use clean bullet points (•) and clear line breaks.
3. NO EMOJIS OR SYMBOLS: Do NOT include any emojis, icons, or symbols (such as 💳, ⚡, 🚀, 🏢, 🕒, 📍, 🛠️, 🎁, 🤖, 🟢, 🔴, 🧠, 🌐, 🎯, etc.) in your responses. Keep responses completely free of icon clutter.
4. BOLD MAIN HEADINGS: Always format main topic section headers in bold text without emojis (for example: **Geekvista Plans & Pricing** or **Business Hours**).
5. STRICT GROUNDING & INTELLIGENT FLEET SYNTHESIS: For questions about specific vehicle models (e.g. Mercedes-Benz S-Class, BMW 7 Series, executive sedans, SUVs, or minivans) or service options, answer helpful and naturally using the fleet and service information available on the website (e.g. our global chauffeured fleet features a wide range of luxury executive sedans, SUVs, and vans with customizable seating and climate control). Never output cold robotic disclaimers such as "The website does not provide a detailed breakdown of the specific fleet..." or "I couldn't find that information on this website...".
6. MISSING INFORMATION FALLBACK: For questions completely unrelated to the website or services, politely suggest reaching out to our support team directly.
7. TYPOS & MISSPELLINGS: Automatically interpret visitor questions even if they contain spelling mistakes, typos, or informal phrasing (e.g. "phon numbr", "pricin plan", "workin hour").
8. NO SOURCES OR CITATION LISTS: Do NOT output or append any "Sources:", "Page Sources:", or page link citation lists at the end of your response.
9. NO METADATA DISCLAIMERS OR REPETITIVE PREAMBLES: Do NOT begin your answer with boilerplate disclaimers or repetitive preamble phrases such as "Based on the information available on this website...", "Based on the context provided...", "The website does not provide a detailed breakdown...", "Here is what I can share about...", "According to the website...", or "Based on the website data...". Jump straight into answering the visitor's question naturally, directly, and conversationally.
10. ELEGANT SPACING & TYPOGRAPHY: Ensure every response is cleanly formatted with proper spaces between all words, sentences, and headers. Never run words together or output concatenated text without spaces. Break content into clean, logical paragraphs with clear line breaks.
11. SHORT & DIRECT RESPONSES: Keep answers short, direct, and tightly focused on the user's specific intent. Avoid long background explanations, unnecessary fluff, or listing unasked details unless explicitly requested.
12. RELATED QUESTIONS (ALWAYS INCLUDE 2-3 FOLLOW-UPS): At the end of every answer to an important question, ALWAYS append a section titled "**Related questions:**" containing 2 to 3 relevant, natural follow-up questions (bullet points •) that help guide the user to their next logical inquiry.
13. NO EXTRA PREAMBLE OR FOOTER NOTES ON BUSINESS HOURS: When providing business hours, output only the section header '**Business Hours**' followed by the daily hours list. Do NOT output preamble sentences such as 'Our support team is available during the following hours (UTC):' and do NOT output footer notes such as 'If you need to get in touch outside of these hours, feel free to leave a message...'.
14. DIRECT DYNAMIC PAGE LINKS: When suggesting visitors contact support, book an appointment, or navigate to any page, ALWAYS use direct clickable markdown links pointing to the exact page URLs extracted from the website's crawled content:
- Book Now / Appointment Page: [Book Now](${bookPageUrl}) or [Book Appointment](${bookPageUrl})
- Contact Us Page: [Contact Us](${contactPageUrl})
- Additional Pages: Always use the exact URLs listed in the CRAWLED WEBSITE NAVIGATION & PAGE DIRECTORY above. Never output invented, generic, or broken links.`;

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
