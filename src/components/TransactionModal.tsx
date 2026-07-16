'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../data/mockData';

export const TransactionModal: React.FC = () => {
  const {
    transactions,
    selectedTransactionId,
    setSelectedTransactionId,
    updateTransactionCategory,
    dismissTransactionWarning,
    wallets
  } = useApp();

  if (!selectedTransactionId) return null;

  const transaction = transactions.find(t => t.id === selectedTransactionId);
  if (!transaction) return null;

  const wallet = wallets.find(w => w.id === transaction.walletId);

  const categories: Transaction['category'][] = [
    'Income',
    'Trading',
    'Gas Fees',
    'Subscriptions',
    'Transfers',
    'Security Risk',
    'Food & Ent',
    'Other'
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTransactionCategory(transaction.id, e.target.value as Transaction['category']);
  };

  const getRiskBadgeClass = (risk: Transaction['riskLevel']) => {
    switch (risk) {
      case 'High': return 'badge-danger';
      case 'Medium': return 'badge-warning';
      case 'Low': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getChainName = (walletChain?: string) => {
    return walletChain || 'Ethereum';
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedTransactionId(null)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="modal-title-icon">
              {transaction.type === 'inflow' ? '📥' : '📤'}
            </span>
            <div>
              <h3>Transaction Detail</h3>
              <span className="modal-hash">{transaction.hash}</span>
            </div>
          </div>
          <button onClick={() => setSelectedTransactionId(null)} className="modal-close-btn">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Main Stats */}
          <div className="modal-stats-grid">
            <div className="modal-stat-card">
              <span className="stat-label">Amount (USD)</span>
              <span className={`stat-value ${transaction.type === 'inflow' ? 'value-positive' : 'value-negative'}`}>
                {transaction.type === 'inflow' ? '+' : '-'}${transaction.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="modal-stat-card">
              <span className="stat-label">Crypto Quantity</span>
              <span className="stat-value text-dark">
                {transaction.amountCrypto} {transaction.cryptoSymbol}
              </span>
            </div>
          </div>

          {/* Quick Details List */}
          <div className="modal-details-list">
            <div className="modal-detail-row">
              <span className="row-label">Wallet / Account</span>
              <span className="row-value">{wallet ? `${wallet.name} (${wallet.chain})` : 'Unknown Wallet'}</span>
            </div>
            <div className="modal-detail-row">
              <span className="row-label">Timestamp</span>
              <span className="row-value">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
            <div className="modal-detail-row">
              <span className="row-label">Risk Level</span>
              <span className={`badge ${getRiskBadgeClass(transaction.riskLevel)}`}>
                {transaction.riskLevel}
              </span>
            </div>
            <div className="modal-detail-row">
              <span className="row-label">Category</span>
              <div className="select-wrapper">
                <select
                  value={transaction.category}
                  onChange={handleCategoryChange}
                  className="modal-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-detail-row">
              <span className="row-label">Status</span>
              <span className={`status-pill ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Copilot Plain English Audit */}
          <div className="copilot-audit-section">
            <h4 className="audit-section-title">
              <span className="section-icon">✨</span> Copilot Plain-English Explanation
            </h4>
            <p className="audit-text">{transaction.explanation}</p>
            
            {transaction.tags.length > 0 && (
              <div className="audit-tags-container">
                {transaction.tags.map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Action Card */}
          {transaction.recommendedAction && (
            <div className={`action-card ${transaction.riskLevel === 'High' ? 'action-high-risk' : ''}`}>
              <div className="action-header">
                <span className="action-icon">🎯</span>
                <span className="action-title">Recommended Copilot Action</span>
              </div>
              <p className="action-description">{transaction.recommendedAction}</p>
              
              <div className="action-buttons-group">
                {transaction.category === 'Security Risk' && transaction.status === 'Flagged' ? (
                  <button
                    onClick={() => {
                      dismissTransactionWarning(transaction.id);
                      setSelectedTransactionId(null);
                    }}
                    className="btn btn-emerald"
                  >
                    Mark Wallet Secured & Clear Alert
                  </button>
                ) : transaction.category === 'Trading' && transaction.tags.includes('Duplicate Candidate') ? (
                  <button
                    onClick={() => {
                      dismissTransactionWarning(transaction.id);
                      setSelectedTransactionId(null);
                    }}
                    className="btn btn-emerald"
                  >
                    Acknowledge Duplicate & Ignore
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      dismissTransactionWarning(transaction.id);
                      setSelectedTransactionId(null);
                    }}
                    className="btn btn-navy"
                  >
                    Mark Audited & Acknowledge
                  </button>
                )}
                
                <a
                  href={`https://etherscan.io/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  View on {getChainName(wallet?.chain)} Scan ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
