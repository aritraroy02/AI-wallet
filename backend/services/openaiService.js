import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const parseUserIntent = async (message) => {
  try {
    const prompt = `
    Parse this user message into a structured intent for DeFi operations:
    "${message}"
    
    Respond with JSON only:
    {
      "action": "swap|stake|lend|withdraw|check_balance",
      "amount": "number or 'max'",
      "fromToken": "token symbol",
      "toToken": "token symbol",
      "confidence": "0-1 score",
      "explanation": "brief explanation"
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      action: "unknown",
      confidence: 0,
      explanation: "Could not parse intent"
    };
  }
};

export const generateTransactionExplanation = async (intent, quote) => {
  try {
    const prompt = `
    Explain this DeFi transaction in simple terms:
    Action: ${intent.action}
    Amount: ${intent.amount} ${intent.fromToken}
    Expected: ${quote.outputAmount} ${intent.toToken}
    
    Keep it under 100 words and user-friendly.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Explanation generation error:', error);
    return "Transaction explanation unavailable";
  }
};