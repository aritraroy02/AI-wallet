import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const parseIntent = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai/parse-intent`, {
      message
    });
    
    return response.data;
  } catch (error) {
    console.error('Intent parsing failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to parse intent');
  }
};

export const generateTransaction = async (intent, userBalance) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai/generate-transaction`, {
      intent,
      userBalance
    });
    
    return response.data;
  } catch (error) {
    console.error('Transaction generation failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to generate transaction');
  }
};