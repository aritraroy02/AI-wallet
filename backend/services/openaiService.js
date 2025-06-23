// backend/services/openaiService.js (Enhanced version)
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

export const parseUserIntent = async (message) => {
  try {
    // If no API key, use fallback parsing
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here') {
      return fallbackIntentParsing(message);
    }

    const prompt = `
    Parse this user message into a structured intent for DeFi operations:
    "${message}"
    
    Supported actions: swap, send, stake, lend, withdraw, check_balance
    Supported tokens: ETH, WETH, USDC, DAI, USDT, LINK, UNI
    
    Respond with JSON only:
    {
      "action": "swap|stake|lend|withdraw|check_balance|send",
      "amount": "number or 'max'",
      "fromToken": "token symbol",
      "toToken": "token symbol (for swap)",
      "toAddress": "recipient address (for send)",
      "confidence": "0-1 score",
      "explanation": "brief explanation"
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a DeFi transaction parser. Always respond with valid JSON only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 200
    });

    const response = completion.choices[0].message.content.trim();
    
    // Clean up response if it has markdown formatting
    const cleanResponse = response.replace(/```json\n?|```/g, '').trim();
    
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return fallbackIntentParsing(message);
  }
};

// Fallback intent parsing for demo without API key
const fallbackIntentParsing = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Extract numbers and tokens from message
  const amountMatch = message.match(/(\d+(?:\.\d+)?|\bmax\b|\ball\b)/i);
  const tokenMatches = message.match(/\b(ETH|BTC|USDC|DAI|WETH|USDT|LINK|UNI)\b/gi);
  const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
  
  // Detect swap operations
  if (lowercaseMessage.includes('swap') || lowercaseMessage.includes('exchange') || lowercaseMessage.includes('trade')) {
    return {
      action: "swap",
      amount: amountMatch ? amountMatch[1] : "1",
      fromToken: tokenMatches ? tokenMatches[0]?.toUpperCase() : "ETH",
      toToken: tokenMatches && tokenMatches[1] ? tokenMatches[1].toUpperCase() : "USDC",
      confidence: 0.8,
      explanation: "Detected swap operation - exchanging tokens"
    };
  }
  
  // Detect send operations
  if (lowercaseMessage.includes('send') || lowercaseMessage.includes('transfer') || lowercaseMessage.includes('pay')) {
    return {
      action: "send",
      amount: amountMatch ? amountMatch[1] : "1",
      fromToken: tokenMatches ? tokenMatches[0]?.toUpperCase() : "ETH",
      toAddress: addressMatch ? addressMatch[0] : null,
      confidence: 0.7,
      explanation: "Detected send operation - transferring tokens"
    };
  }
  
  // Detect balance check
  if (lowercaseMessage.includes('balance') || lowercaseMessage.includes('check') || lowercaseMessage.includes('show')) {
    return {
      action: "check_balance",
      confidence: 0.9,
      explanation: "Detected balance check request"
    };
  }
  
  // Detect staking
  if (lowercaseMessage.includes('stake') || lowercaseMessage.includes('staking')) {
    return {
      action: "stake",
      amount: amountMatch ? amountMatch[1] : "1",
      fromToken: tokenMatches ? tokenMatches[0]?.toUpperCase() : "ETH",
      confidence: 0.7,
      explanation: "Detected staking operation"
    };
  }
  
  // Detect lending
  if (lowercaseMessage.includes('lend') || lowercaseMessage.includes('deposit') || lowercaseMessage.includes('supply')) {
    return {
      action: "lend",
      amount: amountMatch ? amountMatch[1] : "1",
      fromToken: tokenMatches ? tokenMatches[0]?.toUpperCase() : "ETH",
      confidence: 0.7,
      explanation: "Detected lending operation"
    };
  }
  
  // Default fallback
  return {
    action: "unknown",
    confidence: 0.1,
    explanation: "Could not parse intent. Try: 'swap 1 ETH for USDC', 'check balance', or 'send 10 USDC to 0x...'"
  };
};

export const generateTransactionExplanation = async (intent, quote) => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here') {
      return generateFallbackExplanation(intent, quote);
    }

    const prompt = `
    Explain this DeFi transaction in simple, user-friendly terms:
    
    Action: ${intent.action}
    Amount: ${intent.amount} ${intent.fromToken || ''}
    ${intent.toToken ? `To Token: ${intent.toToken}` : ''}
    ${intent.toAddress ? `To Address: ${intent.toAddress}` : ''}
    ${quote ? `Expected Output: ${quote.outputAmount} ${intent.toToken}` : ''}
    ${quote ? `Price Impact: ${quote.priceImpact}` : ''}
    
    Explain what will happen, any risks, and estimated costs.
    Keep it under 100 words and beginner-friendly.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful DeFi assistant. Explain transactions clearly and mention important risks."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Explanation generation error:', error);
    return generateFallbackExplanation(intent, quote);
  }
};

const generateFallbackExplanation = (intent, quote) => {
  switch (intent.action) {
    case 'swap':
      return `You're swapping ${intent.amount} ${intent.fromToken} for approximately ${quote?.outputAmount || 'unknown amount of'} ${intent.toToken}. This exchange happens at current market rates. ${quote?.priceImpact ? `Price impact: ${quote.priceImpact}` : ''} Gas fees will apply.`;
    
    case 'send':
      return `You're sending ${intent.amount} ${intent.fromToken} to ${intent.toAddress ? intent.toAddress.slice(0,6) + '...' + intent.toAddress.slice(-4) : 'the specified address'}. This is a direct transfer that cannot be reversed. Gas fees will apply.`;
    
    case 'stake':
      return `You're staking ${intent.amount} ${intent.fromToken}. Staked tokens will earn rewards but may have a lock-up period. You can unstake later, subject to protocol terms.`;
    
    case 'lend':
      return `You're lending ${intent.amount} ${intent.fromToken} to earn interest. Your tokens will be supplied to a lending pool and you'll receive interest over time. You can withdraw anytime if liquidity allows.`;
    
    case 'check_balance':
      return `Checking your wallet balance and token holdings. This will show your current assets and their values.`;
    
    default:
      return `You're performing a ${intent.action} operation. Please review the details carefully before confirming.`;
  }
};

// Helper function to analyze transaction risk
export const analyzeTransactionRisk = async (intent, quote, userBalance) => {
  const risks = [];
  const warnings = [];
  
  // Check balance
  if (intent.amount && parseFloat(intent.amount) > parseFloat(userBalance)) {
    warnings.push('Insufficient balance for this transaction');
  }
  
  // Check for high amounts
  if (intent.amount && parseFloat(intent.amount) > 10) {
    warnings.push('Large transaction amount - please double-check');
  }
  
  // Check price impact for swaps
  if (quote?.priceImpact && parseFloat(quote.priceImpact) > 3) {
    risks.push(`High price impact: ${quote.priceImpact}`);
  }
  
  // Check for suspicious addresses
  if (intent.toAddress && intent.toAddress.toLowerCase().includes('0x000')) {
    risks.push('Suspicious recipient address detected');
  }
  
  return {
    riskLevel: risks.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low',
    risks,
    warnings
  };
};