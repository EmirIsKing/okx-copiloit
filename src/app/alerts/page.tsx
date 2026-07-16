'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function AlertsPage() {
  const { alerts, transactions, acknowledgeAlert, setSelectedTransactionId, web3State, connectWeb3 } = useApp();

  const activeAlerts = alerts.filter(a => !a.isAcknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.isAcknowledged);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'suspicious_address': return '🛡️';
      case 'gas_spike': return '⛽';
      case 'duplicate': return '👥';
      case 'large_transfer': return '🐋';
      default: return '⚠️';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Security Alerts</h1>
          <p>Real-time threat monitoring and on-chain capital shielding</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-danger" style={{ fontSize: '13px', padding: '6px 12px' }}>
            {activeAlerts.length} Unresolved Warnings
          </span>
        </div>
      </div>

      {/* Not connected state */}
      {!web3State.isConnected && alerts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF 100%)',
          borderRadius: '16px', border: '1px solid #FCA5A5', marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No Wallet Connected</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Connect your wallet to monitor real-time security alerts, gas anomalies, and suspicious transactions.
          </p>
          <button onClick={connectWeb3} disabled={web3State.isConnecting} className="btn btn-navy">
            {web3State.isConnecting ? '⏳ Connecting...' : '⚡ Connect Wallet'}
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Main Column: Active Alerts */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Active Warnings</h2>

          {activeAlerts.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <span className="empty-state-icon">✅</span>
                <h3>All Clear</h3>
                <p style={{ marginTop: '8px' }}>No pending safety risks or anomalies flagged in your active wallets.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeAlerts.map((alert) => {
                const tx = transactions.find(t => t.id === alert.transactionId);
                return (
                  <div
                    key={alert.id}
                    className="card"
                    style={{
                      borderLeft: '4px solid',
                      borderLeftColor: alert.severity === 'high' ? 'var(--color-danger)' : alert.severity === 'medium' ? 'var(--color-warning)' : 'var(--text-secondary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>{getAlertIcon(alert.type)}</span>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{alert.title}</h3>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }} suppressHydrationWarning>
                            Detected: {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                        {alert.severity.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '14px', lineHeight: 1.5 }}>
                      {alert.description}
                    </p>

                    {/* Action Panel inside alert card */}
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <button
                        onClick={() => setSelectedTransactionId(alert.transactionId)}
                        className="btn btn-outline btn-sm"
                      >
                        Inspect Associated Tx Details 🔎
                      </button>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {alert.type === 'suspicious_address' ? (
                          <a
                            href="https://okx.com/web3/approval"
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-emerald btn-sm"
                          >
                            Revoke Contract Approvals 🛡️
                          </a>
                        ) : null}
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="btn btn-navy btn-sm"
                        >
                          Acknowledge & Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historical / Acknowledged Alerts */}
          {acknowledgedAlerts.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Audited & Acknowledged Risks
              </h2>
              {acknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="card"
                  style={{ opacity: 0.65, backgroundColor: 'var(--bg-primary)', padding: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px' }}>✓</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', textDecoration: 'line-through' }}>
                          {alert.title}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }} suppressHydrationWarning>
                          Audited on {new Date(alert.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="badge badge-secondary">ARCHIVED</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Firewall Shield info */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-white)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛡️</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '8px' }}>
              OKX.AI Firewall Active
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '16px' }}>
              Your connected wallets are audited by the OKX.AI Firewall engine. We automatically inspect target receiver contracts, gas fee block parameters, and duplicate payload queues.
            </p>
            <div style={{ borderTop: '1px solid var(--border-color-dark)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>On-chain lists loaded:</span>
                <span style={{ fontWeight: 600 }}>188,402 contracts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Security scanning latency:</span>
                <span style={{ fontWeight: 600 }}>&lt; 40ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Automatic threat intercept:</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>ENABLED</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '12px' }}>Understanding Risk Flags</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', lineHeight: 1.4 }}>
              <div>
                <strong style={{ color: 'var(--color-danger)' }}>High Risk (Red):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Direct matches on drainer databases, phishing patterns, or transfer calls to zero-interaction addresses.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-warning)' }}>Medium Risk (Orange):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Duplicate transaction submissions within short blocks or gas prices paid &gt; 350% above average.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-accent)' }}>Low Risk (Blue):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Large capital relocations representing &gt; 40% of a connected wallet's assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
