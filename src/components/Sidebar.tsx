'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { wallets, activeWalletId, setActiveWalletId, alerts } = useApp();

  const activeAlertsCount = alerts.filter(a => !a.isAcknowledged).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Transactions', path: '/transactions', icon: '💸' },
    { name: 'Insights', path: '/insights', icon: '🧠' },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: '⚠️',
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined
    },
    { name: 'Wallets', path: '/wallets', icon: '💼' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">OKX</span>
          <span className="brand-text">.AI Copilot</span>
        </div>

        {/* Portfolio Selection Panel */}
        <div className="sidebar-section">
          <label className="sidebar-label">Select Workspace</label>
          <div className="wallet-select-container">
            <select
              value={activeWalletId || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                setActiveWalletId(val === 'all' ? null : val);
              }}
              className="sidebar-select"
            >
              <option value="all">🌐 All Wallets</option>
              {wallets
                .filter(w => w.status === 'connected')
                .map(w => (
                  <option key={w.id} value={w.id}>
                    {w.chain === 'Ethereum' ? '🛡️' : w.chain === 'Bitcoin' ? '🪙' : w.chain === 'Solana' ? '⚡' : w.chain === 'OKX Chain' ? '⬛' : '⚓'}{' '}
                    {w.name} (${(w.balanceUsd / 1000).toFixed(0)}k)
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="user-avatar">OK</div>
            <div className="user-info">
              <div className="user-name">OKX Contributor</div>
              <div className="user-role">DeFi Freelancer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-text">{item.name}</span>
              {item.badge !== undefined && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* CSS styling for sidebar injected globally or handled by globals.css */}
    </>
  );
};
