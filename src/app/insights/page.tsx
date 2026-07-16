'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { InflowOutflowComparison } from '../../components/Charts';

export default function InsightsPage() {
  const { insights, portfolioStats, transactions } = useApp();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➡️';
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'positive': return 'positive';
      case 'negative': return 'negative';
      default: return 'neutral';
    }
  };

  // Find high priority actions
  const actionableInsights = insights.filter(ins => ins.trend === 'negative' || ins.category === 'recurring');

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>AI Financial Insights</h1>
          <p>Plain-language reports on wallet cashflow, velocity, and risks</p>
        </div>
        <button
          onClick={() => {
            const launcher = document.getElementById('copilot-launcher');
            if (launcher) launcher.click();
          }}
          className="btn btn-navy"
        >
          ✨ Consult Copilot
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: List of Insights */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Plain-Language Ledger Observations
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`card insight-card ${getTrendClass(insight.trend)}`}
                style={{ transition: 'transform 0.15s ease' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>{getTrendIcon(insight.trend)}</span>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{insight.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>
                        Category: {insight.category}
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

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                  {insight.details}
                </p>

                <div className="insight-metrics">
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                    ESTIMATED VALUE CYCLE IMPACT
                  </span>
                  <span className={`insight-impact ${getTrendClass(insight.trend)}`}>
                    {insight.trend === 'positive' ? '+' : insight.trend === 'negative' ? '-' : ''}
                    ${insight.impactUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Inflows/Outflows & Recommendations */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Monthly Cashflow Ratio */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h3 className="card-title">Cashflow Ratio</h3>
              <p className="card-subtitle">Inflow versus outflow balance</p>
            </div>
            <InflowOutflowComparison
              inflow={portfolioStats.monthlyInflowUsd}
              outflow={portfolioStats.monthlyOutflowUsd}
            />
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Note:</strong> Outflow figures include a one-time <strong>$25,000 OTC Transfer</strong> which was a wallet rebalance. Adjusting for this, net cashflow stands at <strong>+${(portfolioStats.monthlyInflowUsd - (portfolioStats.monthlyOutflowUsd - 25000)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>.
            </div>
          </div>

          {/* Actionable recommendations checklist */}
          <div className="card" style={{ borderColor: 'var(--color-warning)', backgroundColor: '#FFFDF5' }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <h3 className="card-title" style={{ color: 'var(--color-warning)' }}>
                🎯 Recommended Next Steps
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {actionableInsights.map((ins, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-warning)' }}>✓</span>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ins.category === 'spending' ? 'Optimize Network Swaps' : ins.category === 'recurring' ? 'Consolidate Subscriptions' : 'Verify Security Threats'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                      {ins.category === 'spending' ? 'Review Ethereum gas swap. Target <25 Gwei.' : ins.category === 'recurring' ? 'Downgrade Infura node capacity. Potential savings: $170/mo.' : 'Revoke approved contract limits on drainer address.'}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Link href="/alerts" className="btn btn-navy btn-sm" style={{ flex: 1 }}>
                  Review Security Risks
                </Link>
                <Link href="/transactions" className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                  Inspect Subscriptions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
