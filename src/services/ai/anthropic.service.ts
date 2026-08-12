import { getAnthropicClient } from '@/lib/anthropic';
import { simulateLocalAIResponse } from '@/lib/ai';
import Anthropic from '@anthropic-ai/sdk';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateResponseOptions {
  model?: string;
  systemPrompt?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface StandardizedAiResponse {
  id: string;
  role: 'assistant';
  content: string;
  model: string;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

function normalizeMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  if (!messages || messages.length === 0) {
    return [{ role: 'user', content: 'Hello' }];
  }

  const validMessages: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';
    const content = msg.content?.trim() || '';

    if (!content) continue;

    const lastMsg = validMessages[validMessages.length - 1];
    if (lastMsg && lastMsg.role === role) {
      if (typeof lastMsg.content === 'string') {
        lastMsg.content += `\n${content}`;
      }
    } else {
      validMessages.push({ role, content });
    }
  }

  if (validMessages.length > 0 && validMessages[0].role !== 'user') {
    validMessages.unshift({ role: 'user', content: 'Hello' });
  }

  if (validMessages.length === 0) {
    validMessages.push({ role: 'user', content: 'Hello' });
  }

  return validMessages;
}

function resolveAnthropicModel(modelInput?: string): string {
  const envModel = process.env.ANTHROPIC_MODEL;
  const input = (modelInput || envModel || 'claude-3-5-sonnet-20241022').trim();
  const m = input.toLowerCase();

  if (
    input === 'claude-3-5-sonnet-20241022' ||
    input === 'claude-3-5-haiku-20241022' ||
    input === 'claude-3-7-sonnet-20250219' ||
    input === 'claude-3-opus-20240229' ||
    input === 'claude-3-haiku-20240307' ||
    input === 'claude-3-5-sonnet-latest'
  ) {
    return input;
  }

  if (m.includes('haiku')) return 'claude-3-5-haiku-20241022';
  if (m.includes('3.7') || m.includes('3-7')) return 'claude-3-7-sonnet-20250219';
  if (m.includes('opus')) return 'claude-3-opus-20240229';

  return 'claude-3-5-sonnet-20241022';
}

export async function generateResponse({
  model,
  systemPrompt,
  messages,
  temperature,
  maxTokens,
  apiKey,
}: GenerateResponseOptions): Promise<StandardizedAiResponse> {
  const targetModel = resolveAnthropicModel(model);
  const targetMaxTokens = maxTokens ?? 1024;
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  const lastMsgContent = messages[messages.length - 1]?.content || 'hi';

  if (!key || key.trim() === '') {
    const localContent = simulateLocalAIResponse(systemPrompt || '', lastMsgContent);
    return {
      id: 'local-' + Date.now(),
      role: 'assistant',
      content: localContent,
      model: 'local-fallback',
      stopReason: 'end_turn',
      usage: { inputTokens: 0, outputTokens: 0 }
    };
  }

  try {
    const anthropic = getAnthropicClient(key);
    const formattedMessages = normalizeMessages(messages);

    const response = await anthropic.messages.create({
      model: targetModel,
      max_tokens: targetMaxTokens,
      messages: formattedMessages,
      system: systemPrompt && systemPrompt.trim() ? systemPrompt.trim() : undefined,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
    });

    const extractedText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return {
      id: response.id,
      role: 'assistant',
      content: extractedText,
      model: response.model,
      stopReason: response.stop_reason,
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      },
    };
  } catch (error: any) {
    console.warn(`[Anthropic Service Error] Fallback triggered: ${error?.message || error}`);
    const localContent = simulateLocalAIResponse(systemPrompt || '', lastMsgContent);
    return {
      id: 'local-' + Date.now(),
      role: 'assistant',
      content: localContent,
      model: 'local-fallback',
      stopReason: 'end_turn',
      usage: { inputTokens: 0, outputTokens: 0 }
    };
  }
}

export async function* generateResponseStream({
  model,
  systemPrompt,
  messages,
  temperature,
  maxTokens,
  apiKey,
}: GenerateResponseOptions): AsyncGenerator<string, void, unknown> {
  const targetModel = resolveAnthropicModel(model);
  const targetMaxTokens = maxTokens ?? 1024;
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  const lastMsgContent = messages[messages.length - 1]?.content || 'hi';

  const yieldLocalFallback = async function* () {
    const replyText = simulateLocalAIResponse(systemPrompt || '', lastMsgContent);
    const words = replyText.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      yield words.slice(i, i + 3).join(' ') + ' ';
      await new Promise((r) => setTimeout(r, 15));
    }
  };

  if (!key || key.trim() === '') {
    console.warn(`[Anthropic Stream] No API Key set. Yielding intelligent local response.`);
    for await (const chunk of yieldLocalFallback()) {
      yield chunk;
    }
    return;
  }

  try {
    const anthropic = getAnthropicClient(key);
    const formattedMessages = normalizeMessages(messages);

    const stream = await anthropic.messages.create({
      model: targetModel,
      max_tokens: targetMaxTokens,
      messages: formattedMessages,
      system: systemPrompt && systemPrompt.trim() ? systemPrompt.trim() : undefined,
      temperature: typeof temperature === 'number' ? temperature : undefined,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
    return;
  } catch (error: any) {
    console.warn(`[Anthropic Stream Error]: ${error?.message || error}. Falling back to local response.`);
    for await (const chunk of yieldLocalFallback()) {
      yield chunk;
    }
  }
}
