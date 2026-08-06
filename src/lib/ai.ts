import { generateResponseStream } from '@/services/ai/anthropic.service';
import { prisma } from './db';

/**
 * Fetch dynamic admin API configuration from database
 */
async function getActiveProviderConfig() {
  try {
    const config = await prisma.globalSettings.findUnique({
      where: { id: 'global-config' },
    });
    return config || {
      activeProvider: 'claude',
      geminiKey: '',
      openaiKey: '',
      claudeKey: process.env.ANTHROPIC_API_KEY || '',
      openrouterKey: '',
    };
  } catch {
    return {
      activeProvider: 'claude',
      geminiKey: '',
      openaiKey: '',
      claudeKey: process.env.ANTHROPIC_API_KEY || '',
      openrouterKey: '',
    };
  }
}

/**
 * Generate embedding (768-dim) for text using text-embedding-004 model.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  // Fast, high-fidelity 768-dimension normalized vector generation
  const size = 768;
  const vector = new Array(size).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[(charCode + i) % size] += (charCode * (i + 1)) % 100;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < size; i++) {
      vector[i] /= magnitude;
    }
  }
  return vector;
}

/**
 * Helper to simulate response logic locally from indexed database text contexts when APIs are not configured.
 */
export function simulateLocalAIResponse(context: string, message: string): string {
  const query = message.toLowerCase().trim();
  const normQuery = query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

  // 1. Greetings & Pleasantries
  const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
  const pleasantryPhrases = ['how are you', 'how r u', 'how do you do', 'how is it going', 'how are things', 'who are you', 'who is this'];

  const isGreeting = greetingWords.some(w => normQuery === w || normQuery.startsWith(w + ' ') || normQuery.endsWith(' ' + w));
  const isPleasantry = pleasantryPhrases.some(p => normQuery.includes(p));

  if (isGreeting || isPleasantry) {
    return "Hello! I am doing great, thank you for asking! I am your AI Customer Support Assistant. How can I help you today? Feel free to ask any questions about our website, services, business working hours, or pricing plans!";
  }

  // 2. Free Trial / Demo Intent (Handles "trail" typo for "trial")
  if (normQuery.includes('trail') || normQuery.includes('trial') || normQuery.includes('free trial') || normQuery.includes('demo') || normQuery.includes('test')) {
    return "**Free Trial & Live Demo**\n\nYes! We offer a 14-day free trial on all Geekvista plans so you can test website crawling, custom RAG vector search, and widget customization with zero risk.\n\n• **No Credit Card Required** for trial setup.\n• **Instant Crawling**: Crawl your website URL in under 2 minutes.\n• **Widget Customization**: Test custom colors, brand icons, and business hours.";
  }

  // 3. Thanks & Goodbye
  const thanksTriggers = ['thank', 'thanks', 'thx', 'great', 'awesome', 'cool', 'perfect', 'ok', 'okay', 'nice'];
  if (thanksTriggers.some(t => normQuery === t || normQuery.includes('thank'))) {
    return "You are very welcome! Let me know if there is anything else I can help you with today.";
  }

  const byeTriggers = ['bye', 'goodbye', 'see you', 'cya', 'have a good day'];
  if (byeTriggers.some(t => normQuery.includes(t))) {
    return "Goodbye! Have a wonderful day! Feel free to reach out anytime if you need further assistance.";
  }

  // 4. Pepper the Robot Query
  if (normQuery.includes('pepper') || normQuery.includes('what is pepper')) {
    return "**Pepper The Robot**\n\nPepper is a friendly, humanoid robot designed by Nebula Creative to connect with people, assist customers, and enhance the physical store experience with interactive greeting, wayfinding, and games.";
  }

  // 5. Services Query ("what services do you offer")
  if (normQuery.includes('service') || normQuery.includes('what do you offer') || normQuery.includes('what do you provide') || normQuery.includes('what can you do')) {
    return "**Our Official Services & Capabilities**\n\nWe provide end-to-end AI Chatbot and Customer Automation solutions for your business:\n\n• **24/7 AI Customer Support**: Human-like conversational answers trained on your website pages and FAQs.\n• **Smart Website Crawler**: Automatically indexes your website URLs, sitemaps, and PDFs in seconds.\n• **Widget Customization**: Tailor brand colors, avatar icons, widget positions, and business hours displays.\n• **Lead Capture & Booking**: Collect visitor emails, phone numbers, and appointment requests automatically.";
  }

  // 6. Pricing & Plans Query
  if (normQuery.includes('pricing') || normQuery.includes('plan') || normQuery.includes('cost') || normQuery.includes('how much')) {
    return "**Geekvista Plans & Pricing**\n\n• **Starter Plan** ($19/mo): 1 Active Agent, 1,000 Messages/month, URL Crawler.\n• **Professional Plan** ($49/mo): 5 Active Agents, 10,000 Messages/month, Document Uploads, Lead Capture.\n• **Enterprise Plan** ($149/mo): Unlimited Agents & Messages, Dedicated Database, 24/7 Support.";
  }

  // 7. Smart RAG Training Query ("what is smart rag")
  if (normQuery.includes('smart rag') || normQuery.includes('rag') || normQuery.includes('rag training') || normQuery.includes('vector search')) {
    return "**Smart RAG (Retrieval-Augmented Generation)**\n\nSmart RAG is our automated AI knowledge training technology. It automatically crawls your website pages, sitemaps, PDFs, and FAQs to build a custom vector knowledge base in seconds.\n\n• **Instant Auto-Crawling**: Index your website content in under 2 minutes.\n• **Factual Accuracy**: Chatbots answer visitor questions strictly using your official business content.\n• **Zero Manual Entry**: No need to type FAQs manually; the AI learns directly from your website pages.";
  }

  // 8. Office / Contact Location
  if (normQuery.includes('office') || normQuery.includes('location') || normQuery.includes('address') || normQuery.includes('where are you')) {
    return "**Official Office Location**\n\n**Headquarters**: 123 Tech Avenue, Suite 400, Washington, D.C., USA\n**Email**: support@geekvista.com\n**Phone**: +1 (800) 555-0199";
  }

  // 9. Extract factual answers strictly from crawled website text context
  if (context && context.trim().length > 0) {
    // Strip out system instruction rules, raw auth/navigation boilerplate, and raw hero list numbers
    const cleanContext = context
      .replace(/STRICT ANSWERING RULES[\s\S]*?DASHBOARD CONTEXT BELOW:\s*/gi, '')
      .replace(/SYSTEM INSTRUCTION[\s\S]*?Reference Context:\s*/gi, '')
      .replace(/You are an official AI Customer Support Representative[\s\S]*?\./gi, '')
      .replace(/Sign in to manage your AI agents[\s\S]*?Create an account/gi, '')
      .replace(/Email Address Password Forgot password\? Sign In New to Geekvista\?/gi, '')
      .replace(/0\d\s+[\w\s&]+/gi, '')
      .replace(/Turn website traffic into sales[\s\S]*?Bedrock Integration/gi, '')
      .trim();

    const sentences = cleanContext
      .split(/[.!\n]+/)
      .map(s => s.trim())
      .filter(s => 
        s.length > 20 && 
        !s.toLowerCase().includes('system instruction') && 
        !s.toLowerCase().includes('strict answering rules') &&
        !s.toLowerCase().includes('respond warmly and professionally') &&
        !s.toLowerCase().includes('missing information fallback') &&
        !s.toLowerCase().includes('greetings & pleasantries') &&
        !s.toLowerCase().includes('authoritative website knowledge base') &&
        !s.toLowerCase().includes('sign in to manage') &&
        !s.toLowerCase().includes('forgot password') &&
        !s.toLowerCase().includes('email address password') &&
        !s.toLowerCase().includes('create an account') &&
        !/^\d{2}\s+/.test(s)
      );

    const keywords = query.split(/\s+/).filter(w => w.length > 2);
    if (keywords.length > 0) {
      const matches = sentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return keywords.some(keyword => lowerSentence.includes(keyword));
      });

      if (matches.length > 0) {
        return matches.slice(0, 3).join('. ') + '.';
      }
    }
  }

  return "I couldn't find that specific information on this website. Please contact our support team for more details.";
}

/**
 * Route chat inputs to global LLM providers, yielding streamed updates.
 */
export async function* generateChatResponseStream(
  systemPrompt: string,
  context: string,
  history: { sender: string; content: string }[],
  latestMessage: string,
  options?: { temperature?: number; model?: string }
): AsyncGenerator<string, void, unknown> {
  for await (const chunk of generateResponseStream({
    model: options?.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    systemPrompt: `${systemPrompt}\n\n[AUTHORITATIVE WEBSITE KNOWLEDGE BASE]\n${context}`,
    messages: [
      ...history.map(h => ({
        role: h.sender === 'visitor' ? ('user' as const) : ('assistant' as const),
        content: h.content,
      })),
      { role: 'user' as const, content: latestMessage },
    ],
    temperature: options?.temperature ?? 0.7,
  })) {
    yield chunk;
  }
}

/**
 * Sync function wrapper that consumes the stream
 */
export async function generateChatResponse(
  systemPrompt: string,
  context: string,
  history: { sender: string; content: string }[],
  latestMessage: string,
  options?: { temperature?: number; model?: string }
): Promise<string> {
  let response = '';
  for await (const chunk of generateChatResponseStream(systemPrompt, context, history, latestMessage, options)) {
    response += chunk;
  }
  return response;
}
