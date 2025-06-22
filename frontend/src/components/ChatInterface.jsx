import React, { useState, useRef, useEffect } from 'react';
import { parseIntent, generateTransaction } from '../services/aiService';

const ChatInterface = ({ walletInfo, onTransactionGenerated }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hi! I\'m your AI wallet assistant. You can ask me to swap tokens, check balances, or help with DeFi operations. Try saying something like "swap 1 ETH for USDC"'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Parse user intent
      const intentResponse = await parseIntent(input.trim());
      
      if (!intentResponse.success) {
        throw new Error('Failed to parse intent');
      }

      const { intent } = intentResponse;

      // Add AI thinking message
      const thinkingMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I understand you want to ${intent.action}. Let me prepare this transaction for you...`
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // Generate transaction
      const transactionResponse = await generateTransaction(intent, walletInfo.balance);
      
      if (!transactionResponse.success) {
        throw new Error(transactionResponse.errors?.join(', ') || 'Failed to generate transaction');
      }

      const { transaction } = transactionResponse;

      // Add AI response
      const aiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: transaction.explanation
      };
      setMessages(prev => [...prev, aiMessage]);

      // Trigger transaction preview
      onTransactionGenerated(transaction);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 3,
        type: 'ai',
        content: `Sorry, I encountered an error: ${error.message}. Please try again or rephrase your request.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>💬 Chat with AI Assistant</h3>
      </div>
      
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to swap tokens, check balance, or help with DeFi..."
          className="input"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="btn send-btn"
          disabled={!input.trim() || isProcessing}
        >
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-interface {
          height: 500px;
          display: flex;
          flex-direction: column;
        }
        
        .chat-header {
          padding: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .chat-header h3 {
          margin: 0;
        }
        
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .message {
          max-width: 70%;
        }
        
        .message.user {
          align-self: flex-end;
        }
        
        .message.ai {
          align-self: flex-start;
        }
        
        .message-content {
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
        }
        
        .message.user .message-content {
          background: #4CAF50;
          color: white;
        }
        
        .message.ai .message-content {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .chat-input {
          padding: 15px;
          display: flex;
          gap: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .chat-input .input {
          flex: 1;
        }
        
        .send-btn {
          padding: 12px 20px;
          white-space: nowrap;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;