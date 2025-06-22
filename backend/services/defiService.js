import axios from 'axios';
import { ethers } from 'ethers';

// Simple token list for demo
const TOKENS = {
  'ETH': { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
  'USDC': { address: '0xA0b86a33E6417b7C2C3FF1F7b0b2F4D8Dd90f4e3', decimals: 6 },
  'DAI': { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  'WETH': { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 }
};

export const getTokenPrice = async (tokenSymbol) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase()}&vs_currencies=usd`
    );
    return response.data[tokenSymbol.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error('Price fetch error:', error);
    return 0;
  }
};

export const getSwapQuote = async (fromToken, toToken, amount) => {
  try {
    // Simplified quote calculation (in real app, use 1inch or similar)
    const fromPrice = await getTokenPrice(fromToken);
    const toPrice = await getTokenPrice(toToken);
    
    const inputValue = parseFloat(amount) * fromPrice;
    const outputAmount = inputValue / toPrice;
    
    return {
      inputAmount: amount,
      outputAmount: outputAmount.toFixed(6),
      fromToken,
      toToken,
      priceImpact: '0.1%',
      gasEstimate: '150000'
    };
  } catch (error) {
    console.error('Quote error:', error);
    return null;
  }
};

export const validateTransaction = (intent, userBalance) => {
  const errors = [];
  
  if (!TOKENS[intent.fromToken]) {
    errors.push(`Token ${intent.fromToken} not supported`);
  }
  
  if (intent.action === 'swap' && !TOKENS[intent.toToken]) {
    errors.push(`Token ${intent.toToken} not supported`);
  }
  
  if (parseFloat(intent.amount) > parseFloat(userBalance)) {
    errors.push('Insufficient balance');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};