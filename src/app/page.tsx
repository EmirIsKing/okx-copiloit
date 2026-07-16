'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      {/* Landing Header / Navbar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid var(--border-color)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="brand-icon">OKX</span>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>.AI Copilot</span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="landing-nav-links">
          <a href="#features" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Features</a>
          <a href="#security" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Security</a>
          <a href="#hackathon" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Hackathon</a>
          <Link href="/dashboard" className="btn btn-navy btn-sm">
            Launch Platform
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <span className="hero-badge">🔒 Secure DeFi Auditor</span>
        <h1>Understand Your Web3 Finances In Plain English</h1>
        <p>
          OKX.AI Copilot aggregates your multi-chain wallets, auto-categorizes on-chain activities, monitors recurring developer subscriptions, and shields your capital by flagging drainer contracts.
        </p>

        <div className="hero-ctas">
          <Link href="/dashboard?connect=true" className="btn btn-navy" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Connect OKX Wallet
          </Link>
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Explore Sandbox Demo ↗
          </Link>
        </div>

        {/* Dashboard Live Preview Block */}
        <div className="landing-preview" id="features">
          <div className="preview-header">
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span style={{ fontSize: '11px', color: 'var(--text-light)', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>
              app.okx.ai/copilot/sandbox
            </span>
          </div>

          <div style={{ padding: '12px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PORTFOLIO BALANCE</div>
                <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>$329,111.70</div>
                <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>▲ 2.15% (24h)</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>MONTHLY CASHFLOW</div>
                <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>+$3,753.60</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Excluding Relocations</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', borderColor: 'var(--color-danger)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 600 }}>SECURITY WARNINGS</div>
                <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: 'var(--color-danger)' }}>1 Unresolved</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Phishing Contract drainer</div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>✨</span>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>OKX.AI Audit Note</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                "We detected a duplicate fee charge of 50.00 USDT on QuickSwap. Gas prices paid (220 Gwei) for Uniswap swap was 450% higher than average. Review of contract allowances is recommended."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section style={{ backgroundColor: 'var(--bg-primary)', padding: '60px 40px' }} id="security">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '40px' }}>
            Built for Serious Web3 Operators
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="features-grid">
            <div className="card">
              <span style={{ fontSize: '24px', marginBottom: '16px' }}>📊</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Unified Portfolio View</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Connect Ethereum, Solana, Bitcoin, and DeFi vaults. Monitor balances and track changes across all addresses under a single dashboard.
              </p>
            </div>
            <div className="card">
              <span style={{ fontSize: '24px', marginBottom: '16px' }}>🏷️</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Auto-Categorization</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                OKX.AI parses transaction hashes and classifies on-chain transactions into categories like Gas Fees, Subscriptions, Trading, and Salaries automatically.
              </p>
            </div>
            <div className="card">
              <span style={{ fontSize: '24px', marginBottom: '16px' }}>🛡️</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Anomaly Threat Shielding</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Receive instant visual warnings for abnormal spikes in gas fees, double-click transaction retries, or transfers to phishing drainer contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '30px 40px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-light)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
        id="hackathon"
      >
        <p>© 2026 OKX.AI Hackathon Submission. Built as a production-grade Web3 Copilot ASP.</p>
      </footer>
    </div>
  );
}
