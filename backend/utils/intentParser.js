// Enhanced intent parsing utilities

export const parseUserMessage = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Action detection patterns
  const actionPatterns = {
    swap: /\b(swap|exchange|trade|convert)\b/,
    send: /\b(send|transfer|pay)\b/,
    stake: /\b(stake|staking)\b/,
    lend: /\b(lend|lending|deposit)\b/,
    withdraw: /\b(withdraw|unstake|remove)\b/,
    check: /\b(check|show|display|balance)\b/
  };
  
  // Amount detection
  const amountPattern = /(\d+(?:\.\d+)?|\bmax\b|\ball\b)/;
  const amountMatch = message.match(amountPattern);
  
  // Token detection
  const tokenPattern = /\b(ETH|BTC|USDC|DAI|WETH|USDT|LINK|UNI)\b/gi;
  const tokenMatches = message.match(tokenPattern) || [];
  
  // Detect action
  let detectedAction = 'unknown';
  for (const [action, pattern] of Object.entries(actionPatterns)) {
    if (pattern.test(lowercaseMessage)) {
      detectedAction = action;
      break;
    }
  }
  
  return {
    originalMessage: message,
    detectedAction,
    amount: amountMatch ? amountMatch[1] : null,
    tokens: tokenMatches.map(token => token.toUpperCase()),
    confidence: calculateConfidence(detectedAction, amountMatch, tokenMatches)
  };
};

const calculateConfidence = (action, amount, tokens) => {
  let confidence = 0.1; // Base confidence
  
  if (action !== 'unknown') confidence += 0.4;
  if (amount) confidence += 0.3;
  if (tokens.length > 0) confidence += 0.2;
  if (tokens.length >= 2 && action === 'swap') confidence += 0.1;
  
  return Math.min(confidence, 1.0);
};

export const validateIntent = (intent) => {
  const errors = [];
  
  if (!intent.action || intent.action === 'unknown') {
    errors.push('Could not determine the intended action');
  }
  
  if (intent.action === 'swap') {
    if (!intent.fromToken) {
      errors.push('Source token not specified');
    }
    if (!intent.toToken) {
      errors.push('Destination token not specified');
    }
    if (!intent.amount) {
      errors.push('Amount not specified');
    }
  }
  
  if (intent.action === 'send') {
    if (!intent.fromToken) {
      errors.push('Token to send not specified');
    }
    if (!intent.amount) {
      errors.push('Amount not specified');
    }
    if (!intent.recipient) {
      errors.push('Recipient address not specified');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};