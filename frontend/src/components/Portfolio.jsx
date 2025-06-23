import React, { useState, useEffect } from 'react';
import { getTokenPrice } from '../services/defiService';

const Portfolio = ({ walletInfo }) => {
  const [tokenPrices, setTokenPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const tokens = [
    { symbol: 'ETH', balance: walletInfo?.balance || '0', name: 'Ethereum' },
    { symbol: 'USDC', balance: '0', name: 'USD Coin' },
    { symbol: 'DAI', balance: '0', name: 'Dai Stablecoin' }
  ];

  useEffect(() => {
    fetchTokenPrices();
  }, []);

  const fetchTokenPrices = async () => {
    try {
      const prices = {};
      for (const token of tokens) {
        try {
          const priceData = await getTokenPrice(token.symbol.toLowerCase());
          prices[token.symbol] = priceData.price || 0;
        } catch (error) {
          console.error(`Failed to fetch price for ${token.symbol}:`, error);
          prices[token.symbol] = 0;
        }
      }
      setTokenPrices(prices);
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return tokens.reduce((total, token) => {
      const balance = parseFloat(token.balance) || 0;
      const price = tokenPrices[token.symbol] || 0;
      return total + (balance * price);
    }, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="portfolio">
        <h3>📊 Portfolio</h3>
        <div className="loading">Loading portfolio...</div>
        
        <style jsx>{`
          .portfolio {
            height: 100%;
          }
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="portfolio">
      <h3>📊 Portfolio</h3>
      
      <div className="total-value">
        <div className="total-label">Total Value</div>
        <div className="total-amount">{formatCurrency(calculateTotalValue())}</div>
      </div>

      <div className="token-list">
        {tokens.map(token => {
          const balance = parseFloat(token.balance) || 0;
          const price = tokenPrices[token.symbol] || 0;
          const value = balance * price;
          
          return (
            <div key={token.symbol} className="token-item">
              <div className="token-info">
                <div className="token-symbol">{token.symbol}</div>
                <div className="token-name">{token.name}</div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{balance.toFixed(4)}</div>
                <div className="balance-value">{formatCurrency(value)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="portfolio-actions">
        <button className="btn action-btn">
          📈 View Analytics
        </button>
        <button className="btn action-btn">
          🔄 Refresh
        </button>
      </div>

      <style jsx>{`
        .portfolio {
          height: 500px;
          display: flex;
          flex-direction: column;
        }
        
        .total-value {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        
        .total-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 5px;
        }
        
        .total-amount {
          font-size: 2rem;
          font-weight: bold;
          color: #4CAF50;
        }
        
        .token-list {
          flex: 1;
          overflow-y: auto;
        }
        
        .token-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin: 10px 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .token-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .token-info {
          display: flex;
          flex-direction: column;
        }
        
        .token-symbol {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .token-name {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        .token-balance {
          text-align: right;
        }
        
        .balance-amount {
          font-weight: bold;
        }
        
        .balance-value {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        .portfolio-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .action-btn {
          flex: 1;
          padding: 10px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Portfolio;