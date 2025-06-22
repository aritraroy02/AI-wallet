import express from 'express';

const router = express.Router();

router.post('/validate-address', (req, res) => {
  try {
    const { address } = req.body;
    
    // Simple validation (in real app, use ethers.js validation)
    const isValid = address && address.length === 42 && address.startsWith('0x');
    
    res.json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

export default router;