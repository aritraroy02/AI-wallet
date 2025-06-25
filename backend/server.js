// server.js - Complete fixed backend
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Constants
const SUPPORTED_TOKENS = {
  'ETH': { id: 'ethereum', decimals: 18 },
  'WETH': { id: 'wrapped-ethereum', decimals: 18 },
  'USDC': { id: 'usd-coin', decimals: 6 },
  'DAI': { id: 'dai', decimals: 18 },
  'USDT': { id: 'tether', decimals: 6 },
  'LINK': { id: 'chainlink', decimals: 18 },
  'UNI': { id: 'uniswap', decimals: 18 }
};

// Mock prices for fallback
const FALLBACK_PRICES = {
  'ethereum': 2000,
  'wrapped-ethereum': 2000,
  'usd-coin': 1,
  'dai': 1,
  'tether': 1,
  'chainlink': 15,
  'uniswap': 8
};

// Utility Functions
const parseIntent = (message) => {
  const msg = message.toLowerCase();
  const amountMatch = message.match(/(\d+(?:\.\d+)?|\bmax\b|\ball\b)/i);
  const tokenMatches = message.match(/\b(eth|weth|usdc|dai|usdt|link|uni)\b/gi);
  const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
  
  // Detect actions
  if (msg.includes('swap') || msg.includes('exchange') || msg.includes('trade')) {
    return {
      action: 'swap',
      amount: amountMatch?.[1] || '1',
      fromToken: tokenMatches?.[0]?.toUpperCase() || 'ETH',
      toToken: tokenMatches?.[1]?.toUpperCase() || 'USDC',
      confidence: 0.8,
      explanation: 'Detected swap operation'
    };
  }
  
  if (msg.includes('send') || msg.includes('transfer')) {
    return {
      action: 'send',
      amount: amountMatch?.[1] || '1',
      fromToken: tokenMatches?.[0]?.toUpperCase() || 'ETH',
      toAddress: addressMatch?.[0] || null,
      confidence: 0.7,
      explanation: 'Detected send operation'
    };
  }
  
  if (msg.includes('balance') || msg.includes('check')) {
    return {
      action: 'check_balance',
      confidence: 0.9,
      explanation: 'Detected balance check'
    };
  }
  
  if (msg.includes('stake')) {
    return {
      action: 'stake',
      amount: amountMatch?.[1] || '1',
      fromToken: tokenMatches?.[0]?.toUpperCase() || 'ETH',
      confidence: 0.7,
      explanation: 'Detected staking operation'
    };
  }
  
  return {
    action: 'unknown',
    confidence: 0.1,
    explanation: 'Could not parse intent'
  };
};

const getTokenPrice = async (tokenSymbol) => {
  try {
    const tokenInfo = SUPPORTED_TOKENS[tokenSymbol.toUpperCase()];
    if (!tokenInfo) return FALLBACK_PRICES['ethereum'];
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenInfo.id}&vs_currencies=usd`,
      { timeout: 5000 }
    );
    
    return response.data[tokenInfo.id]?.usd || FALLBACK_PRICES[tokenInfo.id];
  } catch (error) {
    console.warn(`Price fetch failed for ${tokenSymbol}, using fallback`);
    const tokenInfo = SUPPORTED_TOKENS[tokenSymbol.toUpperCase()];
    return FALLBACK_PRICES[tokenInfo?.id] || FALLBACK_PRICES['ethereum'];
  }
};

const generateSwapQuote = async (fromToken, toToken, amount) => {
  try {
    const fromPrice = await getTokenPrice(fromToken);
    const toPrice = await getTokenPrice(toToken);
    
    const inputValue = parseFloat(amount) * fromPrice;
    const outputAmount = (inputValue / toPrice * 0.997).toFixed(6); // 0.3% slippage
    
    return {
      inputAmount: amount,
      outputAmount,
      fromToken,
      toToken,
      priceImpact: '0.3%',
      gasEstimate: '150000',
      route: [`${fromToken} → ${toToken}`]
    };
  } catch (error) {
    console.error('Quote generation failed:', error);
    return null;
  }
};

const validateTransaction = (intent, userBalance = 1000) => {
  const errors = [];
  
  if (!SUPPORTED_TOKENS[intent.fromToken]) {
    errors.push(`Token ${intent.fromToken} not supported`);
  }
  
  if (intent.action === 'swap' && !SUPPORTED_TOKENS[intent.toToken]) {
    errors.push(`Token ${intent.toToken} not supported`);
  }
  
  if (intent.amount && parseFloat(intent.amount) > userBalance) {
    errors.push('Insufficient balance');
  }
  
  if (intent.action === 'send' && intent.toAddress) {
    if (intent.toAddress.length !== 42 || !intent.toAddress.startsWith('0x')) {
      errors.push('Invalid recipient address');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const generateExplanation = (intent, quote) => {
  switch (intent.action) {
    case 'swap':
      return `You're swapping ${intent.amount} ${intent.fromToken} for approximately ${quote?.outputAmount || 'unknown'} ${intent.toToken}. ${quote?.priceImpact ? `Price impact: ${quote.priceImpact}.` : ''} Gas fees will apply.`;
    
    case 'send':
      return `You're sending ${intent.amount} ${intent.fromToken} to ${intent.toAddress ? intent.toAddress.slice(0,6) + '...' : 'specified address'}. This transfer cannot be reversed.`;
    
    case 'stake':
      return `You're staking ${intent.amount} ${intent.fromToken}. Staked tokens earn rewards but may have lock-up periods.`;
    
    case 'check_balance':
      return 'Checking your wallet balance and token holdings.';
    
    default:
      return `Performing ${intent.action} operation. Please review carefully.`;
  }
};

// API Routes

// AI Intent Parsing
app.post('/api/ai/parse-intent', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const intent = parseIntent(message);
    
    res.json({
      success: true,
      intent
    });
  } catch (error) {
    console.error('Intent parsing error:', error);
    res.status(500).json({ error: 'Failed to parse intent' });
  }
});

// Generate Transaction
app.post('/api/ai/generate-transaction', async (req, res) => {
  try {
    const { intent, userBalance = 1000 } = req.body;
    
    // Validate transaction
    const validation = validateTransaction(intent, userBalance);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Generate quote for swaps
    let quote = null;
    if (intent.action === 'swap') {
      quote = await generateSwapQuote(intent.fromToken, intent.toToken, intent.amount);
    }
    
    // Generate explanation
    const explanation = generateExplanation(intent, quote);
    
    res.json({
      success: true,
      transaction: {
        intent,
        quote,
        explanation,
        estimatedGas: '150000',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Transaction generation error:', error);
    res.status(500).json({ error: 'Failed to generate transaction' });
  }
});

// DeFi Price Endpoint
app.get('/api/defi/price/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const price = await getTokenPrice(token);
    
    res.json({
      success: true,
      token: token.toUpperCase(),
      price,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// DeFi Quote Endpoint
app.post('/api/defi/quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount } = req.body;
    
    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const quote = await generateSwapQuote(fromToken, toToken, amount);
    
    if (!quote) {
      return res.status(500).json({ error: 'Failed to generate quote' });
    }
    
    res.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

// Wallet Address Validation
app.post('/api/wallet/validate-address', (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const isValid = address.length === 42 && address.startsWith('0x');
    
    res.json({
      success: true,
      valid: isValid,
      address: isValid ? address : null
    });
  } catch (error) {
    console.error('Address validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Get Supported Tokens
app.get('/api/tokens', (req, res) => {
  try {
    const tokens = Object.keys(SUPPORTED_TOKENS).map(symbol => ({
      symbol,
      name: symbol,
      decimals: SUPPORTED_TOKENS[symbol].decimals
    }));
    
    res.json({
      success: true,
      tokens
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 DeFi Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});