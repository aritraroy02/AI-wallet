import express from 'express';
import { getTokenPrice, getSwapQuote } from '../services/defiService.js';

const router = express.Router();

router.get('/price/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const price = await getTokenPrice(token);
    
    res.json({
      success: true,
      token,
      price
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

router.post('/quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount } = req.body;
    const quote = await getSwapQuote(fromToken, toToken, amount);
    
    res.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

export default router;