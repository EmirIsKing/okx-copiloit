'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { InflowOutflowComparison } from '../../components/Charts';

export default function InsightsPage() {
  const { portfolioStats, transactions, web3State, connectWeb3, isLoadingTxs, liveGasPrice, alerts } = useApp();

  // ── Dynamically compute insights from real transaction data ─────────────
  const totalInflow = transactions
    .filter(tx => tx.type === 'inflow' && tx.status !== 'Flagged')
    .reduce((s, tx) => s + tx.amountUsd, 0);

  const totalOutflow = transactions
    .filter(tx => tx.type === 'outflow' && tx.status !== 'Flagged')
    .reduce((s, tx) => s + tx.amountUsd, 0);

  const gasTxs = transactions.filter(tx => tx.category === 'Gas Fees');
  const totalGasSpent = gasTxs.reduce((s, tx) => s + tx.amountUsd, 0);
  const avgGasGwei = gasTxs.length > 0
    ? gasTxs.reduce((s, tx) => s + (tx.gasGwei || 0), 0) / gasTxs.length
    : 0;
  const highGasTxs = gasTxs.filter(tx => (tx.gasGwei || 0) > 100);

  const flaggedTxs = transactions.filter(tx => tx.status === 'Flagged');
  const contractInteractions = transactions.filter(tx => tx.tags?.includes('Contract Call'));
  const transfersOut = transactions.filter(tx => tx.type === 'outflow' && tx.category === 'Transfers');

  const netFlow = totalInflow - totalOutflow;
  const cashflowTrend = netFlow >= 0 ? 'positive' : 'negative';

  // Build dynamic insights list
  interface DynamicInsight {
    id: string;
    icon: string;
    title: string;
    summary: string;
    details: string;
    trend: 'positive' | 'negative' | 'neutral';
    impact: number;
  }

  const dynamicInsights: DynamicInsight[] = [];

  if (transactions.length > 0) {
    // Cashflow insight
    dynamicInsights.push({
      id: 'cashflow',
      icon: netFlow >= 0 ? '📈' : '📉',
      title: 'Net Cashflow Summary',
      summary: netFlow >= 0
        ? `Your wallet has a positive net flow of $${netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })} across ${transactions.length} transactions.`
        : `Your wallet has a negative net flow of $${Math.abs(netFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })} — outflows are exceeding inflows.`,
      details: `Total received: $${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Total sent: $${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })} across ${transactions.length} on-chain operations.`,
      trend: cashflowTrend,
      impact: Math.abs(netFlow),
    });

    // Gas insight
    if (gasTxs.length > 0) {
      dynamicInsights.push({
        id: 'gas',
        icon: '⛽',
        title: 'Gas Fee Expenditure',
        summary: `You spent $${totalGasSpent.toFixed(2)} in gas fees across ${gasTxs.length} transactions, averaging ${avgGasGwei.toFixed(0)} Gwei per tx.`,
        details: `${highGasTxs.length} transaction(s) executed at over 100 Gwei — these were high-cost operations. ${liveGasPrice ? `Current network gas is ${liveGasPrice} Gwei.` : ''}`,
        trend: avgGasGwei > 100 ? 'negative' : 'neutral',
        impact: totalGasSpent,
      });
    }

    // Contract interactions
    if (contractInteractions.length > 0) {
      dynamicInsights.push({
        id: 'contracts',
        icon: '📜',
        title: 'Smart Contract Activity',
        summary: `You interacted with ${contractInteractions.length} smart contract(s). Each contract call carries risk if the contract is unverified.`,
        details: 'Review each contract interaction in the Ledger view. Revoke any approvals for contracts you no longer use to reduce attack surface.',
        trend: 'neutral',
        impact: contractInteractions.reduce((s, tx) => s + tx.amountUsd, 0),
      });
    }

    // Flagged transactions
    if (flaggedTxs.length > 0) {
      dynamicInsights.push({
        id: 'flagged',
        icon: '🚨',
        title: 'Failed or Flagged Transactions',
        summary: `${flaggedTxs.length} transaction(s) failed or were flagged on-chain. Failed transactions still consume gas fees.`,
        details: 'Check these in the Ledger to understand what went wrong. Failed transactions do not transfer value but you still paid the gas cost.',
        trend: 'negative',
        impact: flaggedTxs.reduce((s, tx) => s + tx.amountUsd, 0),
      });
    }

    // Outbound transfers
    if (transfersOut.length > 0) {
      const totalTransferred = transfersOut.reduce((s, tx) => s + tx.amountUsd, 0);
      dynamicInsights.push({
        id: 'transfers',
        icon: '📤',
        title: 'Outbound Transfers',
        summary: `${transfersOut.length} outbound transfer(s) totaling $${totalTransferred.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
        details: 'Review each recipient address to ensure all transfers went to intended destinations. Large transfers to unknown addresses are a common attack vector.',
        trend: totalTransferred > 1000 ? 'negative' : 'neutral',
        impact: totalTransferred,
      });
    }

    // Security alerts derived insight
    const unresolvedAlerts = alerts.filter(a => !a.isAcknowledged);
    if (unresolvedAlerts.length > 0) {
      dynamicInsights.push({
        id: 'security',
        icon: '🛡️',
        title: 'Unresolved Security Alerts',
        summary: `${unresolvedAlerts.length} active security alert(s) require your attention.`,
        details: unresolvedAlerts.slice(0, 3).map(a => `• ${a.title}: ${a.description}`).join('\n'),
        trend: 'negative',
        impact: 0,
      });
    }
  }

  // ── NOT CONNECTED: show connect prompt ───────────────────────────────────
  if (!web3State.isConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-header">
          <div className="page-title-section">
            <h1>AI Financial Insights</h1>
            <p>Plain-language reports on wallet cashflow, velocity, and risks</p>
          </div>
        </div>
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          borderRadius: '16px', border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No Wallet Data</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Connect your wallet to generate real AI-powered insights based on your actual on-chain transaction patterns.
          </p>
          <button onClick={connectWeb3} disabled={web3State.isConnecting} className="btn btn-navy" style={{ padding: '12px 32px' }}>
            {web3State.isConnecting ? '⏳ Connecting...' : '⚡ Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingTxs) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-header">
          <div className="page-title-section">
            <h1>AI Financial Insights</h1>
            <p>Analyzing your on-chain data...</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Fetching Transaction Data...</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Indexing your on-chain history from Etherscan. Insights will appear shortly.</p>
        </div>
      </div>
    );
  }

  // ── CONNECTED with real data ─────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>AI Financial Insights</h1>
          <p>Analysis of {transactions.length} on-chain transactions for {web3State.address?.substring(0, 6)}...{web3State.address?.substring(web3State.address.length - 4)}</p>
        </div>
        <button
          onClick={() => { const l = document.getElementById('copilot-launcher'); if (l) l.click(); }}
          className="btn btn-navy"
        >
          ✨ Consult Copilot
        </button>
      </div>

      {dynamicInsights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No Transaction Data Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            No transactions were found for this address. If you have on-chain activity, add your Etherscan API key in Settings to increase the data rate limit.
          </p>
          <Link href="/settings" className="btn btn-navy">⚙️ Configure API Keys</Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Left Column: Insights */}
          <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              On-Chain Analysis ({dynamicInsights.length} observations)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {dynamicInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`card insight-card ${insight.trend === 'positive' ? 'positive' : insight.trend === 'negative' ? 'negative' : 'neutral'}`}
                  style={{ transition: 'transform 0.15s ease' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px' }}>{insight.icon}</span>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{insight.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>
                          AI-generated · live data
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${insight.trend === 'positive' ? 'badge-success' : insight.trend === 'negative' ? 'badge-danger' : 'badge-secondary'}`}>
                      {insight.trend.toUpperCase()} IMPACT
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '16px', lineHeight: 1.5 }}>
                    {insight.summary}
                  </p>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {insight.details}
                  </p>

                  {insight.impact > 0 && (
                    <div className="insight-metrics">
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                        ESTIMATED VALUE IMPACT
                      </span>
                      <span className={`insight-impact ${insight.trend === 'positive' ? 'positive' : insight.trend === 'negative' ? 'negative' : 'neutral'}`}>
                        {insight.trend === 'positive' ? '+' : insight.trend === 'negative' ? '-' : ''}
                        ${insight.impact.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Cashflow Ratio */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '12px' }}>
                <h3 className="card-title">Cashflow Ratio</h3>
                <p className="card-subtitle">Inflow versus outflow balance</p>
              </div>
              <InflowOutflowComparison
                inflow={portfolioStats.monthlyInflowUsd}
                outflow={portfolioStats.monthlyOutflowUsd}
              />
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Net flow: <strong style={{ color: netFlow >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {netFlow >= 0 ? '+' : ''} ${netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Quick Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Total Transactions', value: transactions.length },
                  { label: 'Contract Calls', value: contractInteractions.length },
                  { label: 'Failed / Flagged', value: flaggedTxs.length },
                  { label: 'Avg Gas (Gwei)', value: avgGasGwei > 0 ? avgGasGwei.toFixed(0) : 'N/A' },
                  { label: 'Total Gas Spent', value: `$${totalGasSpent.toFixed(2)}` },
                  { label: 'Live Gas Price', value: liveGasPrice ? `${liveGasPrice} Gwei` : 'Fetching...' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="card" style={{ borderColor: 'var(--color-warning)', backgroundColor: '#FFFDF5' }}>
              <h3 className="card-title" style={{ color: 'var(--color-warning)', marginBottom: '16px' }}>
                🎯 Recommended Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                {flaggedTxs.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--color-danger)' }}>✗</span>
                    <span>Review {flaggedTxs.length} failed transaction(s) in the Ledger</span>
                  </div>
                )}
                {avgGasGwei > 100 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--color-warning)' }}>!</span>
                    <span>Avoid transacting when gas exceeds your threshold — batch or schedule operations</span>
                  </div>
                )}
                {contractInteractions.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--color-accent)' }}>→</span>
                    <span>Audit token approvals for all {contractInteractions.length} contract interaction(s)</span>
                  </div>
                )}
                {dynamicInsights.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Connect wallet and add API keys to generate personalized recommendations.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Link href="/alerts" className="btn btn-navy btn-sm" style={{ flex: 1 }}>
                  Security Center
                </Link>
                <Link href="/transactions" className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                  View Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
