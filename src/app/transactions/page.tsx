'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function TransactionsPage() {
  const {
    transactions,
    wallets,
    filters,
    setFilters,
    resetFilters,
    setSelectedTransactionId,
    web3State,
    connectWeb3,
    isLoadingTxs,
  } = useApp();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleSelectFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmountChange = (key: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setFilters(prev => ({ ...prev, [key]: numValue }));
  };

  // Filter logic applied client-side
  const filteredTransactions = transactions.filter(tx => {
    // 1. Search Query (hash or description)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchHash = tx.hash.toLowerCase().includes(q);
      const matchTag = tx.tags.some(t => t.toLowerCase().includes(q));
      if (!matchDesc && !matchHash && !matchTag) return false;
    }

    // 2. Wallet Filter
    if (filters.walletId !== 'all' && tx.walletId !== filters.walletId) {
      return false;
    }

    // 3. Category Filter
    if (filters.category !== 'all' && tx.category !== filters.category) {
      return false;
    }

    // 4. Type Filter
    if (filters.type !== 'all' && tx.type !== filters.type) {
      return false;
    }

    // 5. Status Filter
    if (filters.status !== 'all' && tx.status !== filters.status) {
      return false;
    }

    // 6. Risk Level Filter
    if (filters.riskLevel !== 'all' && tx.riskLevel !== filters.riskLevel) {
      return false;
    }

    // 7. Recurring Filter
    if (filters.isRecurring !== 'all') {
      const wantRecurring = filters.isRecurring === 'yes';
      if (tx.isRecurring !== wantRecurring) return false;
    }

    // 8. Amount limits
    if (filters.minAmount !== '' && tx.amountUsd < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== '' && tx.amountUsd > filters.maxAmount) {
      return false;
    }

    return true;
  });

  const categories = [
    'Income',
    'Trading',
    'Gas Fees',
    'Subscriptions',
    'Transfers',
    'Security Risk',
    'Food & Ent',
    'Other'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Transaction Ledger</h1>
          <p>Search, filter, and inspect your on-chain financial activities</p>
        </div>
        <button onClick={resetFilters} className="btn btn-outline">
          Reset All Filters
        </button>
      </div>

      {/* Advanced Filter Panel */}
      <div className="filter-bar">
        {/* Search */}
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearch}
          placeholder="Search by hash, description, or tag..."
          className="filter-input"
          style={{ flex: '1 1 240px' }}
        />

        {/* Wallet select */}
        <div className="filter-group">
          <label>Wallet</label>
          <select
            value={filters.walletId}
            onChange={(e) => handleSelectFilter('walletId', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Connected</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.chain})</option>
            ))}
          </select>
        </div>

        {/* Category select */}
        <div className="filter-group">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleSelectFilter('category', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Type select */}
        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleSelectFilter('type', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="inflow">Inflow (In)</option>
            <option value="outflow">Outflow (Out)</option>
          </select>
        </div>

        {/* Status select */}
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleSelectFilter('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>

        {/* Risk select */}
        <div className="filter-group">
          <label>Risk Level</label>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleSelectFilter('riskLevel', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Risks</option>
            <option value="None">None</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Recurring select */}
        <div className="filter-group">
          <label>Recurring</label>
          <select
            value={filters.isRecurring}
            onChange={(e) => handleSelectFilter('isRecurring', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Payments</option>
            <option value="yes">Recurring Only</option>
            <option value="no">Single Spend Only</option>
          </select>
        </div>

        {/* Amount range */}
        <div className="filter-group">
          <label>Min ($)</label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleAmountChange('minAmount', e.target.value)}
            placeholder="0"
            className="filter-input"
            style={{ width: '80px' }}
          />
        </div>
        <div className="filter-group">
          <label>Max ($)</label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
            placeholder="Max"
            className="filter-input"
            style={{ width: '100px' }}
          />
        </div>
      </div>

      {/* Total Filtered Count */}
      <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        Found <strong>{filteredTransactions.length}</strong> transactions matching current filters.
      </div>

      {/* Ledger Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {!web3State.isConnected ? (
          <div className="empty-state" style={{ padding: '48px' }}>
            <span className="empty-state-icon">🔗</span>
            <h3>No Wallet Connected</h3>
            <p style={{ marginTop: '8px', maxWidth: '360px', margin: '8px auto 16px' }}>
              Connect your wallet to see your real on-chain transaction history indexed from Etherscan.
            </p>
            <button onClick={connectWeb3} disabled={web3State.isConnecting} className="btn btn-navy btn-sm">
              {web3State.isConnecting ? '⏳ Connecting...' : '⚡ Connect Wallet'}
            </button>
          </div>
        ) : isLoadingTxs ? (
          <div className="empty-state" style={{ padding: '48px' }}>
            <span className="empty-state-icon">⏳</span>
            <h3>Loading Transactions...</h3>
            <p style={{ marginTop: '8px' }}>Fetching your transaction history from Etherscan.</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <h3>No Transactions Found</h3>
            <p style={{ marginTop: '8px', maxWidth: '360px', margin: '8px auto 16px' }}>
              {transactions.length === 0
                ? 'No transactions were found for your wallet. If you have transactions, add your Etherscan API key in Settings for better results.'
                : 'Your filters might be too restrictive. Try clearing search fields or widening balance parameters.'}
            </p>
            {transactions.length > 0 && (
              <button onClick={resetFilters} className="btn btn-navy btn-sm">Clear All Filters</button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>Timestamp</th>
                  <th>Activity Description</th>
                  <th>Category</th>
                  <th>Wallet</th>
                  <th>Amount</th>
                  <th>Risk Check</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const txWallet = wallets.find(w => w.id === tx.walletId);
                  return (
                    <tr key={tx.id} onClick={() => setSelectedTransactionId(tx.id)}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{tx.hash}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }} suppressHydrationWarning>
                        {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600 }}>{tx.description}</span>
                          {tx.isRecurring && (
                            <span
                              style={{
                                fontSize: '9px',
                                backgroundColor: '#EEF2F6',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                color: 'var(--color-accent)'
                              }}
                            >
                              🔄 RECURRING
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{tx.category}</span>
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: 500 }}>
                        {txWallet ? txWallet.name : 'DeFi Position'}
                      </td>
                      <td className={tx.type === 'inflow' ? 'value-positive' : 'value-negative'} style={{ fontWeight: 600 }}>
                        {tx.type === 'inflow' ? '+' : '-'}${tx.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        {tx.riskLevel === 'High' ? (
                          <span className="badge badge-danger">High Risk</span>
                        ) : tx.riskLevel === 'Medium' ? (
                          <span className="badge badge-warning">Medium Risk</span>
                        ) : tx.riskLevel === 'Low' ? (
                          <span className="badge badge-secondary" style={{ color: 'var(--color-accent)', backgroundColor: '#EFF6FF' }}>
                            Low Anomaly
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Standard</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
