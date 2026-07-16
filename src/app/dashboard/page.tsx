'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { PortfolioTrendChart, CategorySpendChart, InflowOutflowComparison } from '../../components/Charts';

export default function Dashboard() {
  const {
    portfolioStats,
    transactions,
    activeWalletId,
    wallets,
    alerts,
    setSelectedTransactionId
  } = useApp();

  const activeWallet = wallets.find(w => w.id === activeWalletId);

  // Filter transactions to only show active ones
  const activeWalletsList = wallets.filter(w => w.status === 'connected');
  const activeWalletIds = activeWalletId
    ? [activeWalletId]
    : activeWalletsList.map(w => w.id);

  const activeTransactions = transactions.filter(tx => activeWalletIds.includes(tx.walletId));

  // Get recent 5 transactions
  const recentTransactions = activeTransactions.slice(0, 5);

  // Get active alerts (unacknowledged)
  const activeAlerts = alerts.filter(a => !a.isAcknowledged);

  // Get recurring subscriptions
  const recurringCharges = activeTransactions.filter(tx => tx.isRecurring && tx.type === 'outflow');

  // Simulated 30 day historical data for portfolio line chart (slightly scaled per wallet balance)
  const baseHistory = [0.96, 0.95, 0.97, 0.96, 0.98, 0.99, 1.01, 1.0, 1.02, 1.015, 1.03, 1.04, 1.02, 1.025, 1.03, 1.05];
  const chartVal = portfolioStats.totalValueUsd || 329111.70;
  const historyData = baseHistory.map(multiplier => chartVal * multiplier);
  
  const chartLabels = [
    'Jun 15',
    'Jun 22',
    'Jun 29',
    'Jul 06',
    'Jul 15'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Financial Dashboard</h1>
          <p>
            {activeWallet
              ? `Workspace monitoring for ${activeWallet.name} (${activeWallet.chain})`
              : 'Unified aggregation across all connected Web3 wallets'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/transactions" className="btn btn-outline">
            Filter Ledger
          </Link>
          <button
            onClick={() => {
              const launcher = document.getElementById('copilot-launcher');
              if (launcher) launcher.click();
            }}
            className="btn btn-navy"
          >
            ✨ Ask Copilot
          </button>
        </div>
      </div>

      {/* Main Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Total Portfolio</span>
          <span className="metric-value">
            ${portfolioStats.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className={`metric-change ${portfolioStats.change24hPercent >= 0 ? 'positive' : 'negative'}`}>
            {portfolioStats.change24hPercent >= 0 ? '▲' : '▼'}{' '}
            {Math.abs(portfolioStats.change24hPercent).toFixed(2)}% (24h)
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Available / Liquid</span>
          <span className="metric-value">
            ${portfolioStats.availableBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className={`metric-change ${portfolioStats.change30dPercent >= 0 ? 'positive' : 'negative'}`}>
            {portfolioStats.change30dPercent >= 0 ? '▲' : '▼'}{' '}
            {Math.abs(portfolioStats.change30dPercent).toFixed(2)}% (30d)
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Inflows (30d)</span>
          <span className="metric-value" style={{ color: 'var(--color-success)' }}>
            +${portfolioStats.monthlyInflowUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="metric-change" style={{ color: 'var(--text-secondary)' }}>
            Net DAO & lending yield
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Outflows (30d)</span>
          <span className="metric-value" style={{ color: 'var(--color-danger)' }}>
            -${portfolioStats.monthlyOutflowUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="metric-change" style={{ color: 'var(--text-secondary)' }}>
            Includes transfers & gas
          </span>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-grid">
        {/* Left Side (Charts & Ledger) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Portfolio Performance Line Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Portfolio Trend (30d)</h3>
                <p className="card-subtitle">Real-time asset value calculations</p>
              </div>
              <span className="badge badge-success">Live Auditing</span>
            </div>
            <div style={{ marginTop: '10px' }}>
              <PortfolioTrendChart data={historyData} labels={chartLabels} />
            </div>
          </div>

          {/* Recent Transactions list */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Wallet Activities</h3>
                <p className="card-subtitle">Latest operations detected on-chain</p>
              </div>
              <Link href="/transactions" style={{ fontSize: '13px', fontWeight: 600 }}>
                View All Ledger ↗
              </Link>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>Activity</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Security</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} onClick={() => setSelectedTransactionId(tx.id)}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{tx.hash}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.description}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{tx.category}</span>
                      </td>
                      <td className={tx.type === 'inflow' ? 'value-positive' : 'value-negative'} style={{ fontWeight: 600 }}>
                        {tx.type === 'inflow' ? '+' : '-'}${tx.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        {tx.riskLevel !== 'None' ? (
                          <span className={`status-pill ${tx.status.toLowerCase()}`}>
                            {tx.riskLevel} Risk
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side (Insights, Breakdown & Subscriptions) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Insights Card - What Changed */}
          <div className="card" style={{ borderColor: 'var(--color-accent)', backgroundColor: '#F8FAFC' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>🧠</span>
              <h3 className="card-title" style={{ margin: 0 }}>What Changed This Month?</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', lineHeight: 1.5 }}>
              <p>
                <strong>Operational balance:</strong> Your operational balances increased by <strong>+$3,753.60</strong> this month.
              </p>
              <p>
                <strong>Anomalies flagged:</strong> We detected an interaction with a phishing drainer address involving <strong>0.5 ETH</strong> and a duplicate swap of <strong>50.00 USDT</strong>.
              </p>
              <p>
                <strong>Gas fee increase:</strong> Average gas fee expenses rose by <strong>42%</strong> due to a transaction executed during network spikes.
              </p>
            </div>
            <Link href="/insights" className="btn btn-navy btn-sm" style={{ marginTop: '16px' }}>
              Read Plain Language Audit
            </Link>
          </div>

          {/* Spend Categories bar charts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Spending Categories</h3>
            </div>
            <CategorySpendChart transactions={activeTransactions} />
          </div>

          {/* Alert Summaries Widget */}
          {activeAlerts.length > 0 && (
            <div className="card" style={{ borderColor: 'var(--color-danger)', backgroundColor: '#FEF2F2' }}>
              <div className="card-header" style={{ marginBottom: '12px' }}>
                <h3 className="card-title" style={{ color: 'var(--color-danger)' }}>
                  ⚠️ Unresolved Anomaly Threats ({activeAlerts.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeAlerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} style={{ fontSize: '12.5px', borderBottom: '1px solid #FCA5A5', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '12px' }}>{alert.description}</div>
                  </div>
                ))}
                <Link href="/alerts" className="btn btn-emerald btn-sm" style={{ marginTop: '4px' }}>
                  Open Security Center
                </Link>
              </div>
            </div>
          )}

          {/* Recurring Charges Widget */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recurring Subscriptions</h3>
            </div>
            {recurringCharges.length === 0 ? (
              <div className="empty-state" style={{ padding: '12px 0' }}>
                No active RPC or service node payments detected.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recurringCharges.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedTransactionId(rec.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    className="recurring-item-row"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{rec.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Monthly • {rec.cryptoSymbol} Payment
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-danger)' }}>
                      -${rec.amountUsd.toFixed(0)}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
