import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import ChatInterface from './components/ChatInterface';
import Portfolio from './components/Portfolio';
import TransactionPreview from './components/TransactionPreview';
import { connectWallet, getWalletInfo } from './services/walletService';
import './App.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [pendingTransaction, setPendingTransaction] = useState(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const info = await getWalletInfo();
      if (info) {
        setWalletConnected(true);
        setWalletInfo(info);
      }
    } catch (error) {
      console.error('Wallet check failed:', error);
    }
  };

  const handleWalletConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.success) {
        setWalletConnected(true);
        setWalletInfo(result.walletInfo);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleTransactionGenerated = (transaction) => {
    setPendingTransaction(transaction);
  };

  const handleTransactionClose = () => {
    setPendingTransaction(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧠 AI Smart Wallet</h1>
        {walletConnected && walletInfo && (
          <div className="wallet-info">
            <span>Connected: {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}</span>
            <span>Balance: {walletInfo.balance} ETH</span>
          </div>
        )}
      </header>

      <main className="App-main">
        {!walletConnected ? (
          <WalletConnect onConnect={handleWalletConnect} />
        ) : (
          <div className="app-grid">
            <div className="chat-section">
              <ChatInterface 
                walletInfo={walletInfo}
                onTransactionGenerated={handleTransactionGenerated}
              />
            </div>
            <div className="portfolio-section">
              <Portfolio walletInfo={walletInfo} />
            </div>
          </div>
        )}
      </main>

      {pendingTransaction && (
        <TransactionPreview 
          transaction={pendingTransaction}
          onClose={handleTransactionClose}
          walletInfo={walletInfo}
        />
      )}
    </div>
  );
}

export default App;