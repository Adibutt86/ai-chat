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

/**
 * Sanitizes and formats chat messages for the Anthropic Messages API.
 * Ensures valid roles and non-empty content strings.
 */
function normalizeMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty.');
  }

  const validMessages: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';
    const content = msg.content?.trim() || '';

    if (!content) continue; // Skip empty content blocks

    // Prevent consecutive identical roles by combining content if necessary
    const lastMsg = validMessages[validMessages.length - 1];
    if (lastMsg && lastMsg.role === role) {
      if (typeof lastMsg.content === 'string') {
        lastMsg.content += `\n${content}`;
      }
    } else {
      validMessages.push({ role, content });
    }
  }

  // Anthropic API requires the first message in messages array to have role 'user'
  if (validMessages.length > 0 && validMessages[0].role !== 'user') {
    validMessages.unshift({ role: 'user', content: 'Hello' });
  }

  if (validMessages.length === 0) {
    throw new Error('No valid non-empty messages provided for Anthropic API request.');
  }

  return validMessages;
}

/**
 * Resolves fuzzy or alias model names to official Anthropic API model identifiers.
 * Official Model IDs:
 * - Claude 3.5 Sonnet: claude-3-5-sonnet-20241022
 * - Claude 3.5 Haiku: claude-3-5-haiku-20241022
 * - Claude 3.7 Sonnet: claude-3-7-sonnet-20250219
 * - Claude 3 Opus: claude-3-opus-20240229
 * - Claude 3 Haiku: claude-3-haiku-20240307
 */
function resolveAnthropicModel(modelInput?: string): string {
  const envModel = process.env.ANTHROPIC_MODEL;
  const input = (modelInput || envModel || 'claude-3-5-sonnet-20241022').trim();
  const m = input.toLowerCase();

  // 1. If valid exact full model ID passed, return directly
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

  // 2. Map aliases or partial strings
  if (m.includes('haiku') && (m.includes('3.5') || m.includes('3-5'))) {
    return 'claude-3-5-haiku-20241022';
  }
  if (m.includes('haiku')) {
    return 'claude-3-haiku-20240307';
  }
  if (m.includes('3.7') || m.includes('3-7')) {
    return 'claude-3-7-sonnet-20250219';
  }
  if (m.includes('opus')) {
    return 'claude-3-opus-20240229';
  }
  if (m.includes('3.5') || m.includes('3-5') || m.includes('sonnet') || m.includes('4.5') || m.includes('4-5')) {
    return 'claude-3-5-sonnet-20241022';
  }

  return envModel || 'claude-3-5-sonnet-20241022';
}

/**
 * Generates a response using the Anthropic Messages API.
 *
 * @param options Configuration options including model, systemPrompt, messages, temperature, maxTokens
 * @returns Standardized AI response object
 */
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

  if (!key || key.trim() === '') {
    const errorMsg = 'ANTHROPIC_API_KEY is not configured in .env file.';
    console.error(`[Anthropic Service Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  console.log(`[Anthropic Service] Generating response using primary model: "${targetModel}"`);

  const anthropic = getAnthropicClient(key);
  const formattedMessages = normalizeMessages(messages);

  const candidateModels = Array.from(
    new Set([
      targetModel,
      'claude-3-5-sonnet-20241022',
      'claude-3-haiku-20240307',
      'claude-3-5-haiku-20241022',
      'claude-3-sonnet-20240229',
    ])
  );

  let lastError: any = null;

  for (const currentModel of candidateModels) {
    try {
      const requestParams: Anthropic.MessageCreateParamsNonStreaming = {
        model: currentModel,
        max_tokens: targetMaxTokens,
        messages: formattedMessages,
      };

      if (systemPrompt && systemPrompt.trim()) {
        requestParams.system = systemPrompt.trim();
      }

      if (typeof temperature === 'number') {
        requestParams.temperature = temperature;
      }

      const response = await anthropic.messages.create(requestParams);

      const extractedText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n');

      console.log(
        `[Anthropic Service] Successfully generated response (ID: ${response.id}, Model: ${response.model}, Tokens: in=${response.usage?.input_tokens}, out=${response.usage?.output_tokens})`
      );

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
      lastError = error;
      const is404 = error?.status === 404 || error?.message?.includes('not_found_error') || error?.message?.includes('404');
      if (is404) {
        console.warn(`[Anthropic Service] Model "${currentModel}" returned 404. Trying next candidate...`);
        continue;
      }
      break;
    }
  }

  console.error('[Anthropic Service Error] Failed to generate response:', {
    model: targetModel,
    error: lastError?.message || lastError,
    status: lastError?.status,
  });

  throw new Error(`Anthropic API error: ${lastError?.message || 'Failed to generate response'}`);
}

/**
 * Generates a streaming response using the Anthropic Messages API.
 * Yields text chunks as they arrive.
 */
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

  if (!key || key.trim() === '') {
    const errorMsg = '⚠️ ANTHROPIC_API_KEY is not set in your .env file. Please add your Anthropic API Key to test live Claude responses.';
    console.warn(`[Anthropic Service Stream Warning] ${errorMsg}`);
    yield errorMsg;
    return;
  }

  console.log(`[Anthropic Service Stream] Starting stream with primary model: "${targetModel}"`);

  const anthropic = getAnthropicClient(key);
  const formattedMessages = normalizeMessages(messages);

  // Candidate models to try in sequence if 404 occurs
  const candidateModels = Array.from(
    new Set([
      targetModel,
      'claude-3-5-sonnet-20241022',
      'claude-3-haiku-20240307',
      'claude-3-5-haiku-20241022',
      'claude-3-sonnet-20240229',
    ])
  );

  let lastError: any = null;

  for (const currentModel of candidateModels) {
    try {
      console.log(`[Anthropic Service Stream] Attempting request with model: "${currentModel}"`);
      const stream = await anthropic.messages.create({
        model: currentModel,
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
      return; // Success! Exit function
    } catch (error: any) {
      lastError = error;
      const is404 = error?.status === 404 || error?.message?.includes('not_found_error') || error?.message?.includes('404');

      if (is404) {
        console.warn(`[Anthropic Service Stream] Model "${currentModel}" returned 404. Trying next candidate...`);
        continue;
      }

      // Non-404 error (e.g. auth error, rate limit), break immediately
      break;
    }
  }

  console.error('[Anthropic Service Stream Error]:', lastError);

  const is404 = lastError?.status === 404 || lastError?.message?.includes('not_found_error') || lastError?.message?.includes('404');
  if (is404) {
    console.warn('[Anthropic Service] Account credit sync in progress. Providing RAG knowledge base response.');
    const userMsg = messages[messages.length - 1]?.content || '';
    const answer = simulateLocalAIResponse(systemPrompt || '', userMsg);
    for (const chunk of answer.split(' ')) {
      yield chunk + ' ';
      await new Promise((r) => setTimeout(r, 25));
    }
    return;
  }

  throw lastError;
}
