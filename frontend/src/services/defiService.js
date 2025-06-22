import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getTokenPrice = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/defi/price/${token}`);
    return response.data;
  } catch (error) {
    console.error('Price fetch failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch price');
  }
};

export const getSwapQuote = async (fromToken, toToken, amount) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/defi/quote`, {
      fromToken,
      toToken,
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Quote fetch failed:', error);
    throw new Error(error.response?.data?.error || 'Failed to get quote');
  }
};