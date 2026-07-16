'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet } from '../../data/mockData';

export default function WalletsPage() {
  const { wallets, toggleWalletConnection, connectWeb3, disconnectWeb3, web3State } = useApp();
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-outline">
            {showAddForm ? 'Cancel Link' : 'Add Sandbox Account +'}
          </button>
          <button
            onClick={web3State.isConnected ? disconnectWeb3 : connectWeb3}
            className="btn btn-navy"
            disabled={web3State.isConnecting}
          >
            {web3State.isConnected ? 'Disconnect Wallet' : 'Connect OKX Wallet'}
          </button>
        </div>
      </div>

      {/* Browser Connection Card */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          borderColor: web3State.isConnected ? 'var(--color-success)' : 'var(--border-color)',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          padding: '20px 24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> Web3 Browser Integration
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Integrate with standard EVM wallet providers (OKX Browser Extension or MetaMask) to pull real accounts, inspect active balances, and index real-time transaction details.
            </p>
          </div>
          <div>
            {web3State.isConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-success">CONNECTED</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                  {web3State.address?.substring(0, 6)}...{web3State.address?.substring(web3State.address.length - 4)}
                </span>
                <button onClick={disconnectWeb3} className="btn btn-outline btn-sm">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWeb3}
                disabled={web3State.isConnecting}
                className="btn btn-navy btn-sm"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--text-white)' }}
              >
                {web3State.isConnecting ? 'Connecting...' : 'Connect Wallet Extension ↗'}
              </button>
            )}
          </div>
        </div>
        {web3State.error && (
          <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '12px', fontWeight: 600 }}>
            ⚠️ Error: {web3State.error}
          </div>
        )}
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
      {allWallets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          borderRadius: '16px', border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No Wallets Connected</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Use the &ldquo;Connect OKX Wallet&rdquo; button above to link your browser wallet extension and view your real balances.
          </p>
          <button
            onClick={connectWeb3}
            disabled={web3State.isConnecting}
            className="btn btn-navy"
            style={{ padding: '12px 32px', fontSize: '15px' }}
          >
            {web3State.isConnecting ? '⏳ Connecting...' : '⚡ Connect Wallet Now'}
          </button>
        </div>
      ) : (
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
                      {wallet.balanceCrypto.toFixed(6)} {wallet.symbol}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  {wallet.id === 'w-connected' ? (
                    <button onClick={disconnectWeb3} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleWalletConnection(wallet.id)}
                      className={`btn btn-sm ${wallet.status === 'connected' ? 'btn-outline' : 'btn-navy'}`}
                      style={{ flex: 1 }}
                    >
                      {wallet.status === 'connected' ? 'Disconnect RPC' : 'Reconnect RPC'}
                    </button>
                  )}
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
      )}
    </div>
  );
}
