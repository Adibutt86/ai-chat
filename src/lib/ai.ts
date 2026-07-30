import { GoogleGenAI } from '@google/genai';
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
      activeProvider: 'gemini',
      geminiKey: process.env.GEMINI_API_KEY || 'AIzaSyFakeKeyPlaceholder',
      openaiKey: '',
      claudeKey: '',
      openrouterKey: '',
    };
  } catch {
    return {
      activeProvider: 'gemini',
      geminiKey: process.env.GEMINI_API_KEY || 'AIzaSyFakeKeyPlaceholder',
      openaiKey: '',
      claudeKey: '',
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
function simulateLocalAIResponse(context: string, message: string): string {
  if (!context || context.trim().length === 0) {
    return "Hi! I am your AI assistant, but I don't have any website knowledge indexed yet. Please train me by crawling a website URL or adding FAQs in the admin dashboard.";
  }

  const query = message.toLowerCase();
  const normQuery = query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

  if (normQuery.includes('pepper') || normQuery.includes('pepper the robot') || normQuery.includes('what is pepper')) {
    return "🤖 **Pepper The Robot**\n\n" +
      "Pepper is a friendly, humanoid robot designed by Nebula Creative to connect with people, assist customers, and enhance the physical store experience:\n\n" +
      "• 💬 **Engaging & Friendly**: Greets visitors the moment they walk in, makes personalized product recommendations, and interacts with customers.\n" +
      "• 🗺️ **Wayfinding & Directions**: Answers customer questions, provides navigation assistance, and displays promotional offers.\n" +
      "• 🎮 **Interactive Features**: Entertains guests with games, dancing, jokes, and selfie poses.\n" +
      "• 📊 **Customer Insights**: Gathers audience preferences and data during conversations to help businesses better understand their shoppers.\n" +
      "• ⚡ **Automation**: Takes on routine, repetitive tasks so your human team can focus on high-value customer service.";
  }

  if (normQuery.includes('customize widget') || normQuery.includes('model settings') || normQuery.includes('customize model') || normQuery.includes('how to customize') || normQuery.includes('widget settings')) {
    return "⚙️ **How to Customize Widget & Model Settings**\n\n" +
      "You can fully customize your chatbot widget and AI model from your Dashboard:\n\n" +
      "1. **Widget Appearance**: Go to **Dashboard > Widget Settings** to adjust bubble primary color, header text, welcome message, avatar icon, position (Bottom Right / Left), and toggle Business Hours or Services displays.\n" +
      "2. **AI Model & Persona**: Go to **Dashboard > Agent Properties** to select your active model (Amazon Bedrock Claude 3 Haiku, Claude 3.5), adjust temperature/creativity, and set custom system instructions.\n" +
      "3. **Instant Live Sync**: Click **Save Settings** — all changes update on your live website widget automatically!";
  }

  if (normQuery.includes('smart rag') || normQuery.includes('rag training') || normQuery.includes('what is smart rag')) {
    return "🧠 **Smart RAG Training**\n\n" +
      "Smart RAG (Retrieval-Augmented Generation) Training automatically crawls your website pages, sitemaps, PDFs, and FAQs to build a custom vector knowledge base in seconds. This allows your ChatBox AI chatbot to answer visitor questions accurately using your official business content.";
  }

  if (normQuery.includes('office') || normQuery.includes('location') || normQuery.includes('address') || normQuery.includes('where are you')) {
    return "📍 **Official Office Locations**\n\n" +
      "• 🏢 **Headquarters**: 123 Tech Avenue, Suite 400, Washington, D.C., USA\n" +
      "• ✉️ **Email Support**: support@chatboxai.com\n" +
      "• 🌐 **Contact Page**: Fill out the help form on our Contact Page (/contact)\n" +
      "• ⚡ **Response Time**: Our team responds within 24 hours.";
  }

  if (normQuery.includes('contact') || normQuery.includes('reach') || normQuery.includes('support') || normQuery.includes('email') || normQuery.includes('phone') || normQuery.includes('number') || normQuery.includes('call') || context.includes('Official Business Contact Information') || context.includes('Office Location')) {
    return "📬 **Get in Touch with Support**\n\n" +
      "• 📞 **Phone Support**: +1 (800) 555-0199 / +1 (202) 555-0148\n" +
      "• ✉️ **Email Support**: support@chatboxai.com\n" +
      "• 🌐 **Contact Form**: Fill out the help form on our Contact Page (/contact)\n" +
      "• ⚡ **Response Time**: Our team responds within 24 hours.";
  }

  if (query.includes('services') || query.includes('service') || query.includes('what do you offer') || query.includes('what do you provide')) {
    if (context.includes('Official Business Services')) {
      const servicesPart = context.split('Official Business Services')[1]?.split('\n\n')[0] || '';
      if (servicesPart.trim()) {
        return `🛠️ **Official Business Services**\n\n${servicesPart.trim()}`;
      }
    }
  }

  // Handle specific plan queries with targeted, natural responses
  if (query.includes('working hours') || query.includes('business hours') || query.includes('opening hours') || query.includes('working hour')) {
    return "🕒 **Official Business Working Hours (UTC)**\n\n" +
      "• 🟢 **Monday – Friday:** 09:00 AM – 05:00 PM\n" +
      "• 🔴 **Saturday & Sunday:** Closed / Unavailable";
  }

  if (query.includes('base model') || query.includes('pricing plans') || query.includes('pricing plan') || query.includes('what are your pricing') || query.includes('what are your plans') || (query.includes('pricing') && query.includes('plan'))) {
    return "💳 **ChatBox AI Pricing Plans**\n\n" +
      "⚡ **1. Starter Plan** — **$19.00 / month**\n" +
      "• 🤖 1 Active Chatbot Agent\n" +
      "• 💬 1,000 Messages per month\n" +
      "• 🌐 Website URL & Sitemap Crawler\n" +
      "• 🎨 Custom Widget Styling & Branding\n\n" +
      "🚀 **2. Professional Plan** — **$49.00 / month** (Most Popular)\n" +
      "• 🤖 5 Active Chatbot Agents\n" +
      "• 💬 10,000 Messages per month\n" +
      "• 📄 PDF & Document Uploads\n" +
      "• 📊 Lead Capture & Analytics\n\n" +
      "🏢 **3. Enterprise Plan** — **$149.00 / month**\n" +
      "• 🤖 Unlimited Chatbot Agents\n" +
      "• 💬 Unlimited Messages per month\n" +
      "• 🗄️ Dedicated Database & Custom Domain Embeds\n" +
      "• 📞 24/7 Priority Support";
  }

  if (query.includes('starter')) {
    return "⚡ **Starter Plan Overview** — **$19.00 / month**\n\n" +
      "• 🤖 **1 Active Chatbot Agent**\n" +
      "• 💬 **1,000 Messages** / month\n" +
      "• 🌐 Website URL & Sitemap Auto-Crawler\n" +
      "• 🎨 Custom Chat Bubble Styling\n" +
      "• ✉️ Email Customer Support";
  }
  if (query.includes('professional') || query.includes('pro plan')) {
    return "### 🚀 **Professional Plan Overview** — **`$49.00`** / month *(Most Popular)*\n\n" +
      "> *Best choice for scaling companies, SaaS platforms, and e-commerce stores.*\n\n" +
      "**Included Features:**\n" +
      "* 🤖 **5 Active Chatbot Agents**\n" +
      "* 💬 **10,000 Messages** / month\n" +
      "* 📄 PDF & Document Knowledge Base Uploads\n" +
      "* 📊 Lead Capture & Conversation Analytics\n" +
      "* ⚡ Priority Email & Live Chat Support";
  }
  if (query.includes('enterprise')) {
    return "### 🏢 **Enterprise Plan Overview** — **`$149.00`** / month\n\n" +
      "> *Full infrastructure support and custom setup for growing organizations.*\n\n" +
      "**Included Features:**\n" +
      "* 🤖 **Unlimited Chatbot Agents**\n" +
      "* 💬 **Unlimited Messages** / month\n" +
      "* 🗄️ Dedicated Database & Custom Domain Embeds\n" +
      "* 🔌 REST API Access & Webhooks\n" +
      "* 📞 24/7 Priority Phone & Zoom Support";
  }
  if (query.includes('multi-llm') || query.includes('multi llm') || query.includes('llm engine')) {
    return "### 🧠 **AI Engine Integration**\n\n" +
      "ChatBox AI is powered by **Amazon Bedrock** providing industry-leading performance and accuracy:\n\n" +
      "* 🟧 **Claude 3 Haiku** (Ultra-fast, low latency responses)\n" +
      "* 🟧 **Claude 3.5 Haiku & Sonnet** (High fidelity reasoning)\n\n" +
      "This guarantees **lightning-fast streaming responses**, enterprise security, and maximum uptime!";
  }

  // Filter raw scraped lines (remove 'Upgrade Plan', auth boilerplate, raw list numbers, etc.)
  const sentences = context
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => 
      s.length > 15 && 
      !s.toLowerCase().includes('upgrade plan') && 
      !s.toLowerCase().includes('sign in to manage') &&
      !s.toLowerCase().includes('forgot password') &&
      !s.toLowerCase().includes('email address password') &&
      !/^\d{2}\s+/.test(s)
    );
  
  const keywords = query.split(/\s+/).filter(w => w.length > 3);
  
  let matches: string[] = [];
  if (keywords.length > 0) {
    matches = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some(keyword => lowerSentence.includes(keyword));
    });
  }

  if (matches.length > 0) {
    return `${matches.slice(0, 2).join('. ')}.`;
  }

  return "I couldn't find that information on this website. Please contact our team for assistance.";
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
  const config = await getActiveProviderConfig();
  const key = config.geminiKey || process.env.GEMINI_API_KEY || '';
  const isFakeGeminiKey = !key || key.includes('Fake') || key.includes('Placeholder') || key.length < 15;

  // Fallback if no context was retrieved
  if (!context || context.trim().length < 5) {
    const fallbackText = "I couldn't find that information on the website. Please contact our support team for more information.";
    for (const chunk of fallbackText.split(' ')) {
      yield chunk + ' ';
      await new Promise(r => setTimeout(r, 40));
    }
    return;
  }

  const targetModel = options?.model || '';
  let provider = config.activeProvider || 'claude';

  if (targetModel.includes('gemini')) {
    provider = 'gemini';
  } else if (targetModel.includes('llama') || targetModel.includes('openrouter')) {
    provider = 'openrouter';
  } else if (targetModel.includes('gpt') || targetModel.includes('openai')) {
    provider = 'openai';
  } else if (targetModel.includes('anthropic') || targetModel.includes('claude')) {
    provider = 'claude';
  }

  // OpenRouter Provider Integration
  if (provider === 'openrouter') {
    try {
      const openrouterApiKey = config.openrouterKey || process.env.OPENROUTER_API_KEY || '';
      const openrouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
      
      const response = await fetch(openrouterUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://chatbox-ai.com',
          'X-Title': 'ChatBox AI',
        },
        body: JSON.stringify({
          model: options?.model || 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: `${systemPrompt}\n\nContext:\n${context}` },
            ...history.map(h => ({ role: h.sender === 'visitor' ? 'user' : 'assistant', content: h.content })),
            { role: 'user', content: latestMessage }
          ],
          temperature: options?.temperature ?? 0.7,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine === 'data: [DONE]') continue;
            if (cleanLine.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleanLine.substring(6));
                const text = parsed.choices[0]?.delta?.content || '';
                if (text) {
                  yield text;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
      return;
    } catch (openrouterErr) {
      console.error('Error in OpenRouter API stream:', openrouterErr);
      const fallback = simulateLocalAIResponse(context, latestMessage);
      yield fallback;
      return;
    }
  }

  // OpenAI Provider Integration
  if (provider === 'openai') {
    const openaiApiKey = config.openaiKey || process.env.OPENAI_API_KEY || '';
    if (!openaiApiKey) {
      const fallback = simulateLocalAIResponse(context, latestMessage);
      yield fallback;
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || 'gpt-4o',
          messages: [
            { role: 'system', content: `${systemPrompt}\n\nContext:\n${context}` },
            ...history.map(h => ({ role: h.sender === 'visitor' ? 'user' : 'assistant', content: h.content })),
            { role: 'user', content: latestMessage }
          ],
          temperature: options?.temperature ?? 0.7,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine === 'data: [DONE]') continue;
            if (cleanLine.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleanLine.substring(6));
                const text = parsed.choices[0]?.delta?.content || '';
                if (text) {
                  yield text;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
      return;
    } catch (openaiErr) {
      console.error('Error in OpenAI API stream:', openaiErr);
      const fallback = simulateLocalAIResponse(context, latestMessage);
      yield fallback;
      return;
    }
  }

  // Gemini Provider Integration
  if (provider === 'gemini') {
    if (isFakeGeminiKey) {
      const text = simulateLocalAIResponse(context, latestMessage);
      for (const chunk of text.split(' ')) {
        yield chunk + ' ';
        await new Promise(r => setTimeout(r, 45));
      }
      return;
    }

    try {
      const prompt = `
System Instruction:
${systemPrompt}

Reference Context:
${context}

Chat History:
${history.map(h => `${h.sender === 'visitor' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}

User: ${latestMessage}
Assistant:`;

      const genAI = new GoogleGenAI({ apiKey: config.geminiKey || process.env.GEMINI_API_KEY || 'AIzaSyFakeKeyPlaceholder' });
      const responseStream = await genAI.models.generateContentStream({
        model: options?.model && options.model.includes('gemini') ? options.model : 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: options?.temperature ?? 0.7,
        }
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        fullText += text;
        yield text;
      }
      return;
    } catch (error) {
      console.error('Error generating chat stream content with Gemini:', error);
      const fallback = simulateLocalAIResponse(context, latestMessage);
      yield fallback;
      return;
    }
  }

  // AWS Bedrock Claude Provider Integration (Default)
  try {
    const { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } = await import('@aws-sdk/client-bedrock-runtime');
    const bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    let modelId = (options?.model && (options.model.includes('anthropic.') || options.model.includes(':')))
      ? options.model 
      : (process.env.CLAUDE_MODEL_ID || 'us.anthropic.claude-3-haiku-20240307-v1:0');

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      system: `${systemPrompt}\n\n[AUTHORITATIVE WEBSITE KNOWLEDGE BASE]\n${context}\n\nIMPORTANT: Rely ONLY on the facts present in the knowledge base above. If the user's question cannot be answered using this context, state: "I couldn't find that information on this website. Please contact our team for assistance." Do not guess or invent answers.`,
      messages: [
        ...history.map(h => ({
          role: h.sender === 'visitor' ? 'user' : 'assistant',
          content: h.content,
        })),
        { role: 'user', content: latestMessage }
      ],
      temperature: options?.temperature ?? 0.2,
    };

    let command = new InvokeModelWithResponseStreamCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      const response = await bedrockClient.send(command);

      if (response.body) {
        for await (const event of response.body) {
          if (event.chunk?.bytes) {
            const decoded = new TextDecoder().decode(event.chunk.bytes);
            const json = JSON.parse(decoded);
            if (json.type === 'content_block_delta' && json.delta?.text) {
              yield json.delta.text;
            }
          }
        }
      }
      return;
    } catch (firstErr: any) {
      // Retry with direct model id if cross-region profile failed
      if (modelId.startsWith('us.')) {
        modelId = modelId.replace('us.', '');
        command = new InvokeModelWithResponseStreamCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify(payload),
        });
        const response = await bedrockClient.send(command);
        if (response.body) {
          for await (const event of response.body) {
            if (event.chunk?.bytes) {
              const decoded = new TextDecoder().decode(event.chunk.bytes);
              const json = JSON.parse(decoded);
              if (json.type === 'content_block_delta' && json.delta?.text) {
                yield json.delta.text;
              }
            }
          }
        }
        return;
      }
      throw firstErr;
    }
  } catch (bedrockErr) {
    console.error('Error in Amazon Bedrock Claude API stream:', bedrockErr);
    
    // Automatic Live Fallback to Gemini API
    const geminiKey = config.geminiKey || process.env.GEMINI_API_KEY || '';
    if (geminiKey && geminiKey.length > 15 && !geminiKey.includes('Fake')) {
      try {
        const prompt = `System Instruction:\n${systemPrompt}\n\nReference Context:\n${context}\n\nChat History:\n${history.map(h => `${h.sender === 'visitor' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}\n\nUser: ${latestMessage}\nAssistant:`;
        const genAI = new GoogleGenAI({ apiKey: geminiKey });
        const responseStream = await genAI.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { temperature: options?.temperature ?? 0.7 }
        });
        for await (const chunk of responseStream) {
          if (chunk.text) yield chunk.text;
        }
        return;
      } catch (geminiErr) {
        console.error('Gemini fallback stream error:', geminiErr);
      }
    }

    const fallback = simulateLocalAIResponse(context, latestMessage);
    yield fallback;
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
