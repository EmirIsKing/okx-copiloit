'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet } from '../../data/mockData';

export default function WalletsPage() {
  const { wallets, toggleWalletConnection } = useApp();
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletChain, setNewWalletChain] = useState<Wallet['chain']>('Ethereum');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [localWallets, setLocalWallets] = useState<Wallet[]>([]);

  const handleConnectMockWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName || !newWalletAddress || !newWalletBalance) return;

    const balanceNum = parseFloat(newWalletBalance);
    const newWallet: Wallet = {
      id: `w-custom-${Date.now()}`,
      name: newWalletName,
      chain: newWalletChain,
      address: newWalletAddress,
      balanceUsd: balanceNum,
      balanceCrypto: balanceNum / 3100, // mock conversion
      symbol: newWalletChain === 'Ethereum' ? 'ETH' : newWalletChain === 'Bitcoin' ? 'BTC' : newWalletChain === 'Solana' ? 'SOL' : newWalletChain === 'OKX Chain' ? 'OKB' : 'USDC',
      color: newWalletChain === 'Ethereum' ? '#3C3C3D' : newWalletChain === 'Bitcoin' ? '#F7931A' : newWalletChain === 'Solana' ? '#14F195' : '#2563EB',
      performance24h: 0.0,
      status: 'connected'
    };

    // Note: We append this to local visual state for presentation, while connected wallets from AppContext are toggled
    setLocalWallets(prev => [...prev, newWallet]);
    
    // Reset form
    setNewWalletName('');
    setNewWalletAddress('');
    setNewWalletBalance('');
    setShowAddForm(false);
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'Ethereum': return '🛡️';
      case 'Bitcoin': return '🪙';
      case 'Solana': return '⚡';
      case 'OKX Chain': return '⬛';
      default: return '⚓';
    }
  };

  const allWallets = [...wallets, ...localWallets];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Connected Wallets</h1>
          <p>Manage RPC endpoints, Ledger addresses, and Web3 connection states</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-navy">
          {showAddForm ? 'Cancel Link' : 'Link Web3 Wallet +'}
        </button>
      </div>

      {/* Add Wallet Form Drawer */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--color-accent)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Link New Web3 Wallet</h3>
          <form onSubmit={handleConnectMockWallet} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Wallet Name</label>
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="e.g. MetaMask Hot Wallet"
                className="filter-input"
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 140px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Blockchain</label>
              <select
                value={newWalletChain}
                onChange={(e) => setNewWalletChain(e.target.value as Wallet['chain'])}
                className="filter-select"
                style={{ height: '38px' }}
              >
                <option value="Ethereum">Ethereum Mainnet</option>
                <option value="Bitcoin">Bitcoin Network</option>
                <option value="Solana">Solana Network</option>
                <option value="OKX Chain">OKX Chain</option>
                <option value="DeFi">Other (DeFi Vault)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 200px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Address</label>
              <input
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x... or ENS"
                className="filter-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 120px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Balance (USD)</label>
              <input
                type="number"
                value={newWalletBalance}
                onChange={(e) => setNewWalletBalance(e.target.value)}
                placeholder="5000"
                className="filter-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-emerald" style={{ height: '38px' }}>
              Establish Connection
            </button>
          </form>
        </div>
      )}

      {/* Grid of connected wallets */}
      <div className="dashboard-grid">
        {allWallets.map((wallet) => (
          <div key={wallet.id} className="col-4">
            <div
              className="card"
              style={{
                borderTop: '4px solid',
                borderTopColor: wallet.color,
                opacity: wallet.status === 'disconnected' ? 0.55 : 1,
                transition: 'opacity 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {wallet.chain.toUpperCase()}
                </span>
                <span className={`status-pill ${wallet.status === 'connected' ? 'completed' : 'pending'}`}>
                  {wallet.status === 'connected' ? 'Connected' : 'Paused'}
                </span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {getChainIcon(wallet.chain)} {wallet.name}
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                  {wallet.address}
                </span>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>BALANCE</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                    ${wallet.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-light)', display: 'block', marginTop: '2px' }}>
                    {wallet.balanceCrypto.toFixed(3)} {wallet.symbol}
                  </span>
                </div>
                
                {/* 24h change details */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PERFORMANCE</span>
                  <div
                    className={wallet.performance24h >= 0 ? 'value-positive' : 'value-negative'}
                    style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px' }}
                  >
                    {wallet.performance24h >= 0 ? '+' : ''}{wallet.performance24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => toggleWalletConnection(wallet.id)}
                  className={`btn btn-sm ${wallet.status === 'connected' ? 'btn-outline' : 'btn-navy'}`}
                  style={{ flex: 1 }}
                >
                  {wallet.status === 'connected' ? 'Disconnect RPC' : 'Reconnect RPC'}
                </button>
                <a
                  href={`https://etherscan.io/address/${wallet.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
