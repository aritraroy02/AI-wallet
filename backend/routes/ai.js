import express from 'express';
import { parseUserIntent, generateTransactionExplanation } from '../services/openaiService.js';
import { getSwapQuote, validateTransaction } from '../services/defiService.js';

const router = express.Router();

router.post('/parse-intent', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const intent = await parseUserIntent(message);
    
    res.json({
      success: true,
      intent
    });
  } catch (error) {
    console.error('Intent parsing error:', error);
    res.status(500).json({ error: 'Failed to parse intent' });
  }
});

router.post('/generate-transaction', async (req, res) => {
  try {
    const { intent, userBalance } = req.body;
    
    // Validate transaction
    const validation = validateTransaction(intent, userBalance);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Get quote for swap operations
    let quote = null;
    if (intent.action === 'swap') {
      quote = await getSwapQuote(intent.fromToken, intent.toToken, intent.amount);
    }
    
    // Generate explanation
    const explanation = await generateTransactionExplanation(intent, quote);
    
    res.json({
      success: true,
      transaction: {
        intent,
        quote,
        explanation,
        estimatedGas: '150000'
      }
    });
    
  } catch (error) {
    console.error('Transaction generation error:', error);
    res.status(500).json({ error: 'Failed to generate transaction' });
  }
});

export default router;