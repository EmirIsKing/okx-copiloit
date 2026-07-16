'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const CopilotChat: React.FC = () => {
  const { chatMessages, addChatMessage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addChatMessage(inputValue.trim());
    setInputValue('');
  };

  const handleQuickQuestion = (q: string) => {
    addChatMessage(q);
  };

  // Simple parser to render markdown bolding and bullet lists nicely in Vanilla CSS
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      // Handle list items
      const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const isNumberedItem = /^\d+\.\s/.test(line.trim());
      
      if (isListItem) {
        content = line.replace(/^[\s-*]+/, '');
      } else if (isNumberedItem) {
        content = line.replace(/^\d+\.\s+/, '');
      }

      // Handle bold
      const parts = content.split('**');
      const formatted = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} style={{ color: '#0B192C' }}>{part}</strong>;
        }
        // Handle inline code formatting like `0xbc9...ff12`
        if (part.includes('`')) {
          const subParts = part.split('`');
          return subParts.map((sub, j) => {
            if (j % 2 === 1) {
              return <code key={j} className="inline-code">{sub}</code>;
            }
            return sub;
          });
        }
        return part;
      });

      if (isListItem) {
        return (
          <li key={idx} className="chat-bullet-item">
            {formatted}
          </li>
        );
      }
      
      if (isNumberedItem) {
        const num = line.match(/^\d+/)?.[0] || '1';
        return (
          <div key={idx} className="chat-numbered-item">
            <span className="chat-number">{num}.</span>
            <span className="chat-number-text">{formatted}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="chat-para">
          {formatted}
        </p>
      );
    });
  };

  const quickPrompts = [
    { text: '📈 Why did my spending increase?', query: 'Why did my spending increase?' },
    { text: '🔄 What are my largest recurring outflows?', query: 'What are my largest recurring outflows?' },
    { text: '⚠️ Show suspicious activity this month', query: 'Show suspicious activity this month.' }
  ];

  return (
    <>
      {/* Floating Copilot Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`copilot-launcher-btn ${isOpen ? 'active' : ''}`}
        aria-label="Toggle OKX.AI Copilot"
        id="copilot-launcher"
      >
        <span className="launcher-icon">✨</span>
        <span className="launcher-text">Ask Copilot</span>
        {chatMessages.length > 1 && !isOpen && (
          <span className="launcher-dot" />
        )}
      </button>

      {/* Slide-out Chat Panel */}
      <div className={`copilot-panel-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
        <div className="copilot-panel" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-title">
              <span className="title-icon">✨</span>
              <div className="title-info">
                <h3>OKX.AI Copilot</h3>
                <span>Real-time blockchain auditor</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="copilot-close-btn">
              ✕
            </button>
          </div>

          {/* Messages Log */}
          <div className="copilot-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="chat-bubble">
                  <div className="chat-bubble-content">
                    {msg.sender === 'bot' ? (
                      <div className="parsed-content">{renderMessageText(msg.text)}</div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <span className="chat-timestamp">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          <div className="copilot-quick-prompts">
            <span className="prompts-label">Quick Queries</span>
            <div className="prompts-list">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(p.query)}
                  className="quick-prompt-btn"
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSubmit} className="copilot-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about gas fees, suspicious wallets..."
              className="copilot-input"
            />
            <button type="submit" className="copilot-send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
