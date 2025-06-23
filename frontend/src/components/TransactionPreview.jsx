import React, { useState } from 'react';

const TransactionPreview = ({ transaction, onClose, walletInfo }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    
    try {
      // Simulate transaction execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExecuted(true);
      
      // Close after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Transaction execution failed:', error);
      alert('Transaction failed: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const { intent, quote, explanation, estimatedGas } = transaction;

  if (executed) {
    return (
      <div className="transaction-overlay">
        <div className="transaction-modal success">
          <div className="success-icon">✅</div>
          <h3>Transaction Successful!</h3>
          <p>Your transaction has been executed successfully.</p>
        </div>
        
        <style jsx>{`
          .transaction-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .transaction-modal.success {
            background: rgba(76, 175, 80, 0.1);
            backdrop-filter: blur(10px);
            border: 2px solid #4CAF50;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            text-align: center;
            color: white;
          }
          
          .success-icon {
            font-size: 4rem;
            margin-bottom: 20px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="transaction-overlay">
      <div className="transaction-modal">
        <div className="modal-header">
          <h3>🔍 Transaction Preview</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="transaction-info">
            <div className="info-row">
              <span className="label">Action:</span>
              <span className="value">{intent.action.toUpperCase()}</span>
            </div>
            
            {intent.action === 'swap' && (
              <>
                <div className="info-row">
                  <span className="label">From:</span>
                  <span className="value">{intent.amount} {intent.fromToken}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">To:</span>
                  <span className="value">{quote?.outputAmount} {intent.toToken}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Price Impact:</span>
                  <span className="value">{quote?.priceImpact}</span>
                </div>
              </>
            )}
            
            <div className="info-row">
              <span className="label">Gas Estimate:</span>
              <span className="value">{estimatedGas} gas</span>
            </div>
          </div>
          
          <div className="explanation">
            <h4>📝 Explanation</h4>
            <p>{explanation}</p>
          </div>
          
          <div className="risk-warning">
            <h4>⚠️ Risk Warning</h4>
            <p>
              DeFi transactions involve financial risk. Please review all details carefully 
              before proceeding. This is a demo application - do not use with real funds.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn execute-btn" 
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : '✨ Execute Transaction'}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .transaction-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .transaction-modal {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          color: white;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .modal-header h3 {
          margin: 0;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.3s ease;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .modal-body {
          padding: 30px;
        }
        
        .transaction-info {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .label {
          font-weight: bold;
          opacity: 0.8;
        }
        
        .value {
          font-weight: bold;
          color: #4CAF50;
        }
        
        .explanation, .risk-warning {
          margin: 20px 0;
          padding: 15px;
          border-radius: 10px;
        }
        
        .explanation {
          background: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
        }
        
        .risk-warning {
          background: rgba(255, 193, 7, 0.1);
          border-left: 4px solid #FFC107;
        }
        
        .explanation h4, .risk-warning h4 {
          margin: 0 0 10px 0;
          font-size: 1rem;
        }
        
        .explanation p, .risk-warning p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .modal-footer {
          display: flex;
          gap: 15px;
          padding: 20px 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .cancel-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .execute-btn {
          flex: 2;
          background: #4CAF50;
          color: white;
        }
        
        .execute-btn:hover {
          background: #45a049;
        }
        
        .execute-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default TransactionPreview;