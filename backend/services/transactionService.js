import { ethers } from 'ethers';

export const simulateTransaction = async (transaction, signer) => {
  try {
    // For demo purposes, we'll simulate the transaction
    const gasEstimate = await signer.provider.estimateGas({
      to: transaction.to || signer.address,
      value: ethers.parseEther(transaction.value || "0"),
      data: transaction.data || "0x"
    });

    return {
      success: true,
      gasEstimate: gasEstimate.toString(),
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  } catch (error) {
    console.error('Transaction simulation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const executeSwap = async (fromToken, toToken, amount, signer) => {
  try {
    // This is a mock implementation for demo
    // In production, you'd integrate with Uniswap, 1inch, etc.
    
    console.log(`Simulating swap: ${amount} ${fromToken} -> ${toToken}`);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      outputAmount: (parseFloat(amount) * 0.99).toString() // Simulate slippage
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const createSwapTransaction = async (intent) => {
  // Mock Uniswap V2 Router address
  const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  
  // This would normally construct actual swap transaction data
  return {
    to: UNISWAP_ROUTER,
    value: intent.fromToken === 'ETH' ? ethers.parseEther(intent.amount) : '0',
    data: '0x', // Would contain actual swap call data
    gasLimit: '200000'
  };
};

export const validateTransactionSafety = (transaction, userBalance) => {
  const warnings = [];
  const errors = [];
  
  // Check if user has enough balance
  if (transaction.intent?.amount && parseFloat(transaction.intent.amount) > parseFloat(userBalance)) {
    errors.push('Insufficient balance for transaction');
  }
  
  // Check for high slippage
  if (transaction.quote?.priceImpact && parseFloat(transaction.quote.priceImpact) > 5) {
    warnings.push('High price impact detected (>5%)');
  }
  
  // Check for large amounts
  if (transaction.intent?.amount && parseFloat(transaction.intent.amount) > 10) {
    warnings.push('Large transaction amount - please verify');
  }
  
  return {
    safe: errors.length === 0,
    errors,
    warnings
  };
};