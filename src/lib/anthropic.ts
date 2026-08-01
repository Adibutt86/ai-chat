import Anthropic from '@anthropic-ai/sdk';

/**
 * Helper to get or create an Anthropic client instance using environment variables or a custom key.
 *
 * @param apiKey Optional custom API key. Defaults to process.env.ANTHROPIC_API_KEY.
 * @returns Configured Anthropic client instance.
 */
export function getAnthropicClient(apiKey?: string): Anthropic {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!key) {
    console.error('[Anthropic SDK Error] Missing ANTHROPIC_API_KEY in environment variables.');
    throw new Error('ANTHROPIC_API_KEY is not defined in environment variables.');
  }

  return new Anthropic({
    apiKey: key,
  });
}

/**
 * Lazy singleton instance of Anthropic client.
 */
let anthropicInstance: Anthropic | null = null;

export function getAnthropicSingleton(): Anthropic {
  if (!anthropicInstance) {
    anthropicInstance = getAnthropicClient();
  }
  return anthropicInstance;
}
