import React, { useState } from 'react';

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-connect">
      <div className="connect-card">
        <h2>Connect Your Wallet</h2>
        <p>Connect your MetaMask wallet to start using AI-powered DeFi operations</p>
        
        <button 
          className="btn connect-btn"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
        </button>
        
        <div className="features">
          <div className="feature">
            <span>🤖</span>
            <p>AI-powered transaction analysis</p>
          </div>
          <div className="feature">
            <span>💰</span>
            <p>Automatic DeFi optimization</p>
          </div>
          <div className="feature">
            <span>🔒</span>
            <p>Secure and transparent</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .wallet-connect {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }
        
        .connect-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
        }
        
        .connect-btn {
          width: 100%;
          margin: 20px 0;
          font-size: 1.1rem;
          padding: 15px;
        }
        
        .features {
          display: flex;
          justify-content: space-around;
          margin-top: 30px;
          gap: 20px;
        }
        
        .feature {
          text-align: center;
        }
        
        .feature span {
          font-size: 2rem;
          display: block;
          margin-bottom: 10px;
        }
        
        .feature p {
          font-size: 0.9rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default WalletConnect;