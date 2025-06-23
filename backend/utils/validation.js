import { ethers } from 'ethers';

export const validateTransactionIntent = (intent) => {
  const errors = [];
  
  if (!intent.action) {
    errors.push('Action is required');
  }
  
  if (intent.action === 'swap') {
    if (!intent.fromToken) {
      errors.push('Source token is required for swap');
    }
    if (!intent.toToken) {
      errors.push('Destination token is required for swap');
    }
    if (!intent.amount || parseFloat(intent.amount) <= 0) {
      errors.push('Valid amount is required for swap');
    }
    if (intent.fromToken === intent.toToken) {
      errors.push('Source and destination tokens cannot be the same');
    }
  }
  
  if (intent.action === 'send') {
    if (!intent.toAddress) {
      errors.push('Recipient address is required');
    } else if (!ethers.isAddress(intent.toAddress)) {
      errors.push('Invalid recipient address format');
    }
    if (!intent.amount || parseFloat(intent.amount) <= 0) {
      errors.push('Valid amount is required');
    }
    if (!intent.fromToken) {
      errors.push('Token to send is required');
    }
  }
  
  if (intent.action === 'stake' || intent.action === 'lend') {
    if (!intent.amount || parseFloat(intent.amount) <= 0) {
      errors.push('Valid amount is required');
    }
    if (!intent.fromToken) {
      errors.push('Token is required');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const validateAmount = (amount, balance) => {
  const numAmount = parseFloat(amount);
  const numBalance = parseFloat(balance);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (numAmount > numBalance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  
  return { valid: true };
};

export const validateTokenSupport = (token) => {
  const supportedTokens = ['ETH', 'WETH', 'USDC', 'DAI', 'USDT', 'LINK', 'UNI'];
  return supportedTokens.includes(token.toUpperCase());
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input.replace(/[<>'"]/g, '').trim();
};

export const validateSwapParameters = (fromToken, toToken, amount) => {
  const errors = [];
  
  if (!validateTokenSupport(fromToken)) {
    errors.push(`Token ${fromToken} is not supported`);
  }
  
  if (!validateTokenSupport(toToken)) {
    errors.push(`Token ${toToken} is not supported`);
  }
  
  if (fromToken === toToken) {
    errors.push('Cannot swap identical tokens');
  }
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push('Invalid swap amount');
  }
  
  if (numAmount > 1000) {
    errors.push('Swap amount too large (max: 1000)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};