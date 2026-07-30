import { generateChatResponse } from '../src/lib/ai';

async function testActiveLiveAI() {
  console.log('Testing Live AI response using active Gemini key...');

  const context = `Official Business Contact & Office Location Information:
• Phone Support: +1 (800) 555-0199 / +1 (202) 555-0148
• Email Support: support@chatboxai.com`;

  try {
    const response = await generateChatResponse(
      `You are an official AI Customer Support Representative for ChatBox AI.
STRICT ANSWERING RULES:
1. GREETINGS & PLEASANTRIES: For greetings, respond warmly.
2. HUMAN CONVERSATIONAL SYNTHESIS: Synthesize information into warm, natural sentences.
3. STRICT GROUNDING FOR FACTUAL QUESTIONS: Answer strictly using ONLY the provided context below.`,
      context,
      [],
      'what is your phone number?'
    );

    console.log('\n--- INPUT: "what is your phone number?" ---');
    console.log('--- LIVE AI STREAM RESPONSE ---');
    console.log(response);
    console.log('-------------------------------------------\n');

    if (response.includes('+1 (800)') || response.includes('555-0199')) {
      console.log('🎉 CONFIRMED: LIVE AI IS 100% WORKING & RESPONDING DYNAMICALLY!');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testActiveLiveAI();
