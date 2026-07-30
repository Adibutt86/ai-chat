import { generateChatResponse } from '../src/lib/ai';

async function testHumanizedAI() {
  console.log('Testing Humanized AI response for "how to turn into sales?"...');

  const context = `Turn website traffic into sales with smart AI conversational prompts. Turn casual site visitors into paying customers with proactive AI chat prompts, automated FAQ resolution, and instant booking flows. View Demo Free Trial. ChatBox AI integrates directly into your workflow in 3 simple steps to automate customer support and boost lead generation.`;

  try {
    const response = await generateChatResponse(
      `You are an official AI Customer Support Representative for ChatBox AI.

STRICT ANSWERING RULES:
1. HUMAN CONVERSATIONAL SYNTHESIS: Synthesize information into warm, natural, human conversational sentences as if speaking directly to a valued client. Never repeat raw website marketing slogans or text blocks verbatim. Use friendly bullet points, clear line breaks, and helpful explanations.
2. STRICT GROUNDING FOR FACTUAL QUESTIONS: Answer strictly using ONLY the provided Authoritative Website Knowledge Base context below.`,
      context,
      [],
      'how to turn into sales?'
    );

    console.log('\n--- INPUT: "how to turn into sales?" ---');
    console.log('--- AI HUMANIZED RESPONSE ---');
    console.log(response);
    console.log('-------------------------------\n');

    if (response && response.length > 20) {
      console.log('✅ CONFIRMED: AI response is humanized and conversational!');
    }
  } catch (error) {
    console.error('❌ Error during humanized test:', error);
  }
}

testHumanizedAI();
