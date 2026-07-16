'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();

  const [gasThreshold, setGasThreshold] = useState(settings.gasThreshold);
  const [largeTransferLimit, setLargeTransferLimit] = useState(settings.largeTransferLimit);
  const [alchemyUrl, setAlchemyUrl] = useState(settings.alchemyUrl);
  const [infuraKey, setInfuraKey] = useState(settings.infuraKey);
  const [etherscanKey, setEtherscanKey] = useState(settings.etherscanKey);
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey);
  const [notifyLargeTransfer, setNotifyLargeTransfer] = useState(settings.notifyLargeTransfer);
  const [notifyPhishing, setNotifyPhishing] = useState(settings.notifyPhishing);
  const [notifyDuplicate, setNotifyDuplicate] = useState(settings.notifyDuplicate);
  const [notifyGasSpike, setNotifyGasSpike] = useState(settings.notifyGasSpike);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state with Context when settings load (from localStorage on client)
  useEffect(() => {
    setGasThreshold(settings.gasThreshold);
    setLargeTransferLimit(settings.largeTransferLimit);
    setAlchemyUrl(settings.alchemyUrl);
    setInfuraKey(settings.infuraKey);
    setEtherscanKey(settings.etherscanKey);
    setGeminiKey(settings.geminiKey);
    setNotifyLargeTransfer(settings.notifyLargeTransfer);
    setNotifyPhishing(settings.notifyPhishing);
    setNotifyDuplicate(settings.notifyDuplicate);
    setNotifyGasSpike(settings.notifyGasSpike);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      gasThreshold,
      largeTransferLimit,
      alchemyUrl,
      infuraKey,
      etherscanKey,
      geminiKey,
      notifyLargeTransfer,
      notifyPhishing,
      notifyDuplicate,
      notifyGasSpike,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleDiscard = () => {
    setGasThreshold(settings.gasThreshold);
    setLargeTransferLimit(settings.largeTransferLimit);
    setAlchemyUrl(settings.alchemyUrl);
    setInfuraKey(settings.infuraKey);
    setEtherscanKey(settings.etherscanKey);
    setGeminiKey(settings.geminiKey);
    setNotifyLargeTransfer(settings.notifyLargeTransfer);
    setNotifyPhishing(settings.notifyPhishing);
    setNotifyDuplicate(settings.notifyDuplicate);
    setNotifyGasSpike(settings.notifyGasSpike);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>System Settings</h1>
          <p>Configure RPC integrations, auditing thresholds, and firewall rules</p>
        </div>
      </div>

      {saveSuccess && (
        <div
          className="badge badge-success"
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'block',
            textAlign: 'center',
            fontWeight: 600
          }}
        >
          ✓ System settings updated successfully. Local auditor re-indexing in background...
        </div>
      )}

      <form onSubmit={handleSave} className="dashboard-grid">
        {/* Left Column: Alerts & Thresholds */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Auditing Parameters */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>AI Firewall Thresholds</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Gas limit slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Gas Spike Alert Trigger</label>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {gasThreshold} Gwei
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={gasThreshold}
                  onChange={(e) => setGasThreshold(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--bg-dark)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Alerts are issued when a transaction's gas price exceeds this limit. Default is 80 Gwei.
                </span>
              </div>

              {/* Large transfer input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Large Transfer Alert Floor (USD)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={largeTransferLimit || ''}
                    onChange={(e) => setLargeTransferLimit(parseInt(e.target.value) || 0)}
                    className="filter-input"
                    style={{ width: '100%', paddingLeft: '28px' }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Transactions exceeding this threshold trigger a portfolio exposure warning.
                </span>
              </div>
            </div>
          </div>

          {/* RPC Integration Configuration */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Custom Node Providers (RPC)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Etherscan / Block Explorer API Key</label>
                <input
                  type="password"
                  value={etherscanKey}
                  onChange={(e) => setEtherscanKey(e.target.value)}
                  placeholder="Enter block explorer API Key for transaction lookup"
                  className="filter-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Used to index transactions of connected wallets. If empty, the app will request history from Etherscan without key parameters.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>EVM RPC Node URL (e.g. Alchemy, OKX Link, Cloudflare)</label>
                <input
                  type="text"
                  value={alchemyUrl}
                  onChange={(e) => setAlchemyUrl(e.target.value)}
                  placeholder="https://eth-mainnet.g.alchemy.com/v2/your-api-key"
                  className="filter-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Used to fetch native balances and gas price logs. Falls back to Cloudflare Ethereum RPC if not set.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Infura Project API Key (Optional)</label>
                <input
                  type="password"
                  value={infuraKey}
                  onChange={(e) => setInfuraKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="filter-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
                />
              </div>
            </div>

            {/* Gemini AI Key */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>
                🤖 Gemini API Key (AI Copilot)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="filter-input"
                style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Powers the AI Copilot chat with real intelligence. Get a free key at{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                  style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  aistudio.google.com
                </a>.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Notification Preferences & Privacy */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Notification toggles */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Notification Subscriptions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyLargeTransfer}
                  onChange={(e) => setNotifyLargeTransfer(e.target.checked)}
                  style={{ accentColor: 'var(--bg-dark)' }}
                />
                <span>Large outbound transaction alerts</span>
              </label>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyPhishing}
                  onChange={(e) => setNotifyPhishing(e.target.checked)}
                  style={{ accentColor: 'var(--bg-dark)' }}
                />
                <span>phishing Drainer threat alarms</span>
              </label>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyDuplicate}
                  onChange={(e) => setNotifyDuplicate(e.target.checked)}
                  style={{ accentColor: 'var(--bg-dark)' }}
                />
                <span>Duplicate contract execution retries</span>
              </label>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyGasSpike}
                  onChange={(e) => setNotifyGasSpike(e.target.checked)}
                  style={{ accentColor: 'var(--bg-dark)' }}
                />
                <span>Gas block utilization warnings</span>
              </label>
            </div>
          </div>

          {/* Privacy controls */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Security & Privacy Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--bg-dark)' }} />
                <span>Encrypt local indexing databases</span>
              </label>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--bg-dark)' }} />
                <span>Anonymize public address names</span>
              </label>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--bg-dark)' }} />
                <span>Block tracking RPC cookies</span>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-navy" style={{ flex: 1 }}>
              Save Configurations
            </button>
            <button type="button" onClick={handleDiscard} className="btn btn-outline" style={{ flex: 1 }}>
              Discard Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
