import { generateChatResponse } from '../src/lib/ai';

async function testTypoAI() {
  console.log('Testing AI Typo & Misspelling NLU handling...');

  const typoQuery = 'what is ur phon numbr and workin hour?';
  const context = `Official Business Contact & Office Location Information:
• Phone Support: +1 (800) 555-0199 / +1 (202) 555-0148
• Email Support: support@chatboxai.com

Official Business Working Hours (UTC):
• 🟢 Monday – Friday: 09:00 AM – 05:00 PM
• 🔴 Saturday & Sunday: Closed / Unavailable`;

  try {
    const response = await generateChatResponse(
      `You are an official Customer Support Representative for ChatBox AI.
STRICT ANSWERING RULES:
1. STRICT GROUNDING IN CONTEXT: Answer strictly using ONLY the provided Authoritative Website Knowledge Base.
2. TYPOS & MISSPELLINGS: Automatically interpret visitor questions even if they contain spelling mistakes or typos (e.g. "phon numbr", "workin hour").`,
      context,
      [],
      typoQuery
    );

    console.log(`\n--- TYPO QUERY: "${typoQuery}" ---`);
    console.log('--- AI DYNAMIC RESPONSE ---');
    console.log(response);
    console.log('-----------------------------\n');

    if (response.includes('+1 (800)') || response.includes('Monday')) {
      console.log('✅ CONFIRMED: AI effortlessly understands typos and misspellings!');
    } else {
      console.log('⚠️ Response output did not contain expected details.');
    }
  } catch (error) {
    console.error('❌ Error during typo test:', error);
  }
}

testTypoAI();
