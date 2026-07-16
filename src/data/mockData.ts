export interface Wallet {
  id: string;
  name: string;
  chain: 'Ethereum' | 'Bitcoin' | 'Solana' | 'OKX Chain' | 'Polygon' | 'BNB Chain' | 'Arbitrum' | 'Optimism' | 'Base' | 'DeFi';
  address: string;
  balanceUsd: number;
  balanceCrypto: number;
  symbol: string;
  color: string;
  performance24h: number; // percentage
  status: 'connected' | 'disconnected';
}

export interface Transaction {
  id: string;
  hash: string;
  timestamp: string; // ISO String
  description: string;
  category: 'Income' | 'Trading' | 'Gas Fees' | 'Subscriptions' | 'Transfers' | 'Security Risk' | 'Food & Ent' | 'Other';
  type: 'inflow' | 'outflow';
  amountUsd: number;
  amountCrypto: number;
  cryptoSymbol: string;
  walletId: string;
  status: 'Completed' | 'Pending' | 'Flagged';
  isRecurring: boolean;
  riskLevel: 'None' | 'Low' | 'Medium' | 'High';
  tags: string[];
  explanation: string;
  recommendedAction?: string;
  gasGwei?: number;
}

export interface Alert {
  id: string;
  type: 'duplicate' | 'large_transfer' | 'gas_spike' | 'suspicious_address';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  transactionId: string;
  timestamp: string;
  isAcknowledged: boolean;
}

export interface Insight {
  id: string;
  category: 'spending' | 'recurring' | 'security' | 'portfolio';
  title: string;
  summary: string;
  details: string;
  impactUsd: number;
  trend: 'positive' | 'negative' | 'neutral';
}

export const mockWallets: Wallet[] = [
  {
    id: 'w1',
    name: 'Primary Ledger',
    chain: 'Ethereum',
    address: '0x71C...8976',
    balanceUsd: 84250.40,
    balanceCrypto: 26.54,
    symbol: 'ETH',
    color: '#3C3C3D',
    performance24h: 2.45,
    status: 'connected',
  },
  {
    id: 'w2',
    name: 'Bitcoin Cold Vault',
    chain: 'Bitcoin',
    address: 'bc1q9...83d2',
    balanceUsd: 145890.00,
    balanceCrypto: 2.51,
    symbol: 'BTC',
    color: '#F7931A',
    performance24h: -0.82,
    status: 'connected',
  },
  {
    id: 'w3',
    name: 'Solana Active',
    chain: 'Solana',
    address: 'DeZ8w...Hj89',
    balanceUsd: 18450.80,
    balanceCrypto: 128.25,
    symbol: 'SOL',
    color: '#14F195',
    performance24h: 5.12,
    status: 'connected',
  },
  {
    id: 'w4',
    name: 'OKX Web3 Wallet',
    chain: 'OKX Chain',
    address: '0x3fA...77b1',
    balanceUsd: 29420.50,
    balanceCrypto: 588.41,
    symbol: 'OKB',
    color: '#000000',
    performance24h: 1.15,
    status: 'connected',
  },
  {
    id: 'w5',
    name: 'Aave Yield Position',
    chain: 'DeFi',
    address: '0x992...c81d',
    balanceUsd: 52100.00,
    balanceCrypto: 52100.00,
    symbol: 'USDC',
    color: '#2775CA',
    performance24h: 0.05,
    status: 'connected',
  }
];

export const mockTransactions: Transaction[] = [
  // Anomalies / Alerts first to make them easily visible
  {
    id: 'tx-anomaly-1',
    hash: '0x2d3a...f98e',
    timestamp: '2026-07-15T09:42:00Z',
    description: 'Transfer to Phishing Address',
    category: 'Security Risk',
    type: 'outflow',
    amountUsd: 1585.00,
    amountCrypto: 0.5,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Flagged',
    isRecurring: false,
    riskLevel: 'High',
    tags: ['Suspicious Receiver', 'High Risk'],
    explanation: 'This address (0xbc9...ff12) is flagged on-chain for matching phishing/drainer patterns. This transfer was executed without contract interactions or standard DeFi routing.',
    recommendedAction: 'Verify receiver. Enable OKX.AI Firewall extension to automatically intercept calls to unverified addresses.'
  },
  {
    id: 'tx-anomaly-2',
    hash: '0x5c8e...8b4a',
    timestamp: '2026-07-14T18:24:00Z',
    description: 'Uniswap V3 Swap Gas Fee',
    category: 'Gas Fees',
    type: 'outflow',
    amountUsd: 182.40,
    amountCrypto: 0.057,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'Medium',
    tags: ['Gas Spike', 'Swap'],
    explanation: 'Gas price paid (220 Gwei) was 450% higher than the 7-day average network gas price. The transaction was submitted during peak Ethereum block utilization.',
    recommendedAction: 'Use Next-Block Gas estimator or queue non-urgent swaps in the OKX.AI smart scheduler to execute when Gwei drops below 35.',
    gasGwei: 220
  },
  {
    id: 'tx-anomaly-3a',
    hash: '0x9c42...3bb2',
    timestamp: '2026-07-13T14:05:00Z',
    description: 'QuickSwap Swap to USDT',
    category: 'Trading',
    type: 'outflow',
    amountUsd: 50.00,
    amountCrypto: 50.00,
    cryptoSymbol: 'USDT',
    walletId: 'w4',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'Medium',
    tags: ['Duplicate Candidate'],
    explanation: 'Detected identical amount of 50.00 USDT sent to the same smart contract within 3 seconds of another transaction. This suggests a double-click or client UI retry error.',
    recommendedAction: 'Check QuickSwap activity history. If this was a contract error, contact support or submit an RPC revert request.'
  },
  {
    id: 'tx-anomaly-3b',
    hash: '0x9c42...3bb5',
    timestamp: '2026-07-13T14:05:03Z',
    description: 'QuickSwap Swap to USDT (Duplicate)',
    category: 'Trading',
    type: 'outflow',
    amountUsd: 50.00,
    amountCrypto: 50.00,
    cryptoSymbol: 'USDT',
    walletId: 'w4',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'Medium',
    tags: ['Duplicate Candidate'],
    explanation: 'Detected identical amount of 50.00 USDT sent to the same smart contract within 3 seconds of transaction 0x9c42...3bb2. Suggests contract client re-submission.',
    recommendedAction: 'Compare transaction logs. Keep this flagged to filter duplicate outlays from tax calculations.'
  },
  {
    id: 'tx-anomaly-4',
    hash: '0xbcde...11a9',
    timestamp: '2026-07-12T11:00:00Z',
    description: 'Large OTC Transfer Out',
    category: 'Transfers',
    type: 'outflow',
    amountUsd: 25000.00,
    amountCrypto: 25000.00,
    cryptoSymbol: 'USDC',
    walletId: 'w5',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'Low',
    tags: ['Large Transfer', 'USDC'],
    explanation: 'Transfer of 25,000 USDC represents 48% of the Aave yield portfolio balance. This transfer was sent to a known OTC address.',
    recommendedAction: 'Acknowledge transfer to remove the portfolio anomaly flag.'
  },

  // Recurring Subscriptions
  {
    id: 'tx-rec-1',
    hash: '0x811a...3c2e',
    timestamp: '2026-07-15T00:00:00Z',
    description: 'Infura RPC Endpoint Node',
    category: 'Subscriptions',
    type: 'outflow',
    amountUsd: 220.00,
    amountCrypto: 220.00,
    cryptoSymbol: 'USDC',
    walletId: 'w4',
    status: 'Completed',
    isRecurring: true,
    riskLevel: 'None',
    tags: ['Developer Tools', 'Recurring'],
    explanation: 'Monthly billing for custom RPC endpoints. Charged automatically on the 15th of each month.',
    recommendedAction: 'Review node utilization. Consider migrating to OKX Developer Cloud which offers free tiers up to 10M requests.'
  },
  {
    id: 'tx-rec-2',
    hash: '0x76c1...9d8a',
    timestamp: '2026-07-10T08:00:00Z',
    description: 'Vercel Pro Team hosting',
    category: 'Subscriptions',
    type: 'outflow',
    amountUsd: 40.00,
    amountCrypto: 0.013,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Completed',
    isRecurring: true,
    riskLevel: 'None',
    tags: ['Hosting', 'Recurring'],
    explanation: 'Monthly hosting fee for production web apps. Automated recurring transaction.',
    recommendedAction: 'Consolidate multiple team workspaces if possible.'
  },
  {
    id: 'tx-rec-3',
    hash: '0x32ba...112e',
    timestamp: '2026-07-01T00:05:00Z',
    description: 'GitBook Workspace Premium',
    category: 'Subscriptions',
    type: 'outflow',
    amountUsd: 15.00,
    amountCrypto: 15.00,
    cryptoSymbol: 'USDT',
    walletId: 'w4',
    status: 'Completed',
    isRecurring: true,
    riskLevel: 'None',
    tags: ['Documentation', 'Recurring'],
    explanation: 'Monthly workspace access for documentation tools. Recurring automatically.'
  },

  // Inflows (Income / Yield)
  {
    id: 'tx-in-1',
    hash: '0xda23...92ff',
    timestamp: '2026-07-10T12:00:00Z',
    description: 'Superfluid Core Contributor Salary',
    category: 'Income',
    type: 'inflow',
    amountUsd: 6500.00,
    amountCrypto: 2.15,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Completed',
    isRecurring: true,
    riskLevel: 'None',
    tags: ['Salary', 'Superfluid', 'DAO'],
    explanation: 'Monthly streaming salary for DAO contributions, successfully closed and settled for the June-July pay cycle.'
  },
  {
    id: 'tx-in-2',
    hash: '0x55bb...aefc',
    timestamp: '2026-07-05T18:30:00Z',
    description: 'Aave Lending Yield Accrual',
    category: 'Income',
    type: 'inflow',
    amountUsd: 198.50,
    amountCrypto: 198.50,
    cryptoSymbol: 'USDC',
    walletId: 'w5',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'None',
    tags: ['DeFi Yield', 'Aave'],
    explanation: 'Yield auto-harvested from lending pools. Cumulative monthly yield accrued.'
  },
  {
    id: 'tx-in-3',
    hash: '0xe12a...98aa',
    timestamp: '2026-07-02T14:50:00Z',
    description: 'Jupiter Swap Profit - JUP/USDC',
    category: 'Trading',
    type: 'inflow',
    amountUsd: 840.00,
    amountCrypto: 840.00,
    cryptoSymbol: 'USDC',
    walletId: 'w3',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'None',
    tags: ['Profit Take', 'Solana'],
    explanation: 'Profitable execution on Jupiter swap aggregator routing JUP token to USDC during the token price breakout.'
  },

  // Normal Outflows
  {
    id: 'tx-out-1',
    hash: '0x33e5...8c4d',
    timestamp: '2026-07-14T20:15:00Z',
    description: 'Gas Fee for Token Approval',
    category: 'Gas Fees',
    type: 'outflow',
    amountUsd: 12.50,
    amountCrypto: 0.004,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'None',
    tags: ['Approval', 'Gas'],
    explanation: 'Ethereum network transaction fee to approve USDC smart contract allowance on Uniswap. Average network gas: 15 Gwei.'
  },
  {
    id: 'tx-out-2',
    hash: '0x77ef...029c',
    timestamp: '2026-07-11T16:00:00Z',
    description: 'ENS Domain Registration',
    category: 'Other',
    type: 'outflow',
    amountUsd: 45.00,
    amountCrypto: 0.015,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'None',
    tags: ['ENS', 'Identity'],
    explanation: 'Registered okxcopilot.eth domain name for 1 year. Gas fees: $8.40.'
  },
  {
    id: 'tx-out-3',
    hash: '0xba22...73de',
    timestamp: '2026-07-08T19:40:00Z',
    description: 'Coinbase NFT Purchase',
    category: 'Food & Ent',
    type: 'outflow',
    amountUsd: 280.00,
    amountCrypto: 0.092,
    cryptoSymbol: 'ETH',
    walletId: 'w1',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'None',
    tags: ['Collectible', 'NFT'],
    explanation: 'Acquisition of community NFT pass. Standard secondary market trade.'
  },
  {
    id: 'tx-out-4',
    hash: '0x144a...63bb',
    timestamp: '2026-07-04T10:15:00Z',
    description: 'Jupiter Limit Order - SOL Buy',
    category: 'Trading',
    type: 'outflow',
    amountUsd: 1200.00,
    amountCrypto: 8.5,
    cryptoSymbol: 'SOL',
    walletId: 'w3',
    status: 'Completed',
    isRecurring: false,
    riskLevel: 'None',
    tags: ['Limit Order', 'Jupiter'],
    explanation: 'Executed limit order on Solana Jupiter exchange to accumulate SOL at target price.'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'suspicious_address',
    title: 'High Risk Address Interaction',
    description: 'Transfer of 0.5 ETH made to a flagged drainer contract (0xbc9...ff12). Immediate review is advised.',
    severity: 'high',
    transactionId: 'tx-anomaly-1',
    timestamp: '2026-07-15T09:42:00Z',
    isAcknowledged: false,
  },
  {
    id: 'alert-2',
    type: 'gas_spike',
    title: 'Abnormally High Gas Fee Paid',
    description: 'You paid $182.40 (220 Gwei) in gas fees for a swap, which is 450% higher than average network fees.',
    severity: 'medium',
    transactionId: 'tx-anomaly-2',
    timestamp: '2026-07-14T18:24:00Z',
    isAcknowledged: false,
  },
  {
    id: 'alert-3',
    type: 'duplicate',
    title: 'Duplicate Transaction Detected',
    description: 'Two identical transfers of 50.00 USDT sent to QuickSwap within 3 seconds of each other. Possible double charge.',
    severity: 'medium',
    transactionId: 'tx-anomaly-3b',
    timestamp: '2026-07-13T14:05:03Z',
    isAcknowledged: false,
  },
  {
    id: 'alert-4',
    type: 'large_transfer',
    title: 'Large Transfer Alert',
    description: 'A transfer of 25,000 USDC represents 48% of Aave vault balance. Confirm this was authorized.',
    severity: 'low',
    transactionId: 'tx-anomaly-4',
    timestamp: '2026-07-12T11:00:00Z',
    isAcknowledged: true,
  }
];

export const mockInsights: Insight[] = [
  {
    id: 'ins-1',
    category: 'spending',
    title: 'Gas fee consumption spiked',
    summary: 'You spent $194.90 on transaction gas this month, up 42% from June.',
    details: 'The bulk of this increase was driven by a single transaction on Uniswap (0x5c8e...8b4a) where you paid 220 Gwei due to high block demand. Gas optimization can prevent these outflows.',
    impactUsd: 194.90,
    trend: 'negative'
  },
  {
    id: 'ins-2',
    category: 'recurring',
    title: 'Active subscriptions detected',
    summary: 'You have 3 recurring developer and workspace subscriptions totaling $275.00/mo.',
    details: 'These include Infura RPC ($220.00/mo), Vercel Pro ($40.00/mo), and GitBook Workspace ($15.00/mo). Node requests on Infura are at 18% capacity; you could downsize to save $200.00/mo.',
    impactUsd: 275.00,
    trend: 'neutral'
  },
  {
    id: 'ins-3',
    category: 'security',
    title: 'High priority threat intercepted',
    summary: 'OKX Firewall flagged 1 high-risk transaction to an active drainer address.',
    details: 'A transfer of 0.5 ETH was sent to 0xbc9...ff12 which matches phishing lists. The wallet is now secured, but we recommend checking approved contract allowances on your Ledger.',
    impactUsd: 1585.00,
    trend: 'negative'
  },
  {
    id: 'ins-4',
    category: 'portfolio',
    title: 'Inflow outpaces outflow',
    summary: 'Total monthly inflows ($7,538.50) exceeded outflows ($28,784.90 including OTC transfer).',
    details: 'Excluding the $25,000 OTC transfer (which was a wallet relocation), your net operational cashflow was positive by +$3,753.60. Excellent cashflow stability driven by DAO contributions.',
    impactUsd: 3753.60,
    trend: 'positive'
  }
];

// Predefined AI copilot Q&A
export const copilotQA = [
  {
    keywords: ['why did my spending increase', 'spending increase', 'spending increase?', 'why is spending up'],
    answer: `Your spending increased by **$182.40** primarily due to:
1. **Gas Fee Spike**: On July 14, you paid $182.40 in gas fees for a swap on Uniswap. This occurred because of sudden network congestion where gas prices reached 220 Gwei.
2. **Duplicate Swap**: On July 13, you had a duplicate swap of 50.00 USDT on QuickSwap. This was likely a retry error, creating an extra 50.00 USDT outflow.

*Recommendation*: We suggest scheduling swaps for lower-congestion windows (typically 02:00-06:00 UTC) and canceling one of the duplicate QuickSwap transactions.`
  },
  {
    keywords: ['recurring', 'subscriptions', 'recurring outflows', 'what are my subscriptions'],
    answer: `We identified **3 active recurring subscriptions** in your wallets totaling **$275.00 per month**:
1. **Infura RPC Node**: $220.00 USDC / month (withdrawn on the 15th, Ethereum network).
2. **Vercel Pro Team**: $40.00 USD (0.013 ETH) / month (withdrawn on the 10th).
3. **GitBook Premium**: $15.00 USDT / month (withdrawn on the 1st).

*Optimization TIP*: Infura logs show you are only using 18% of your node request quota. You can downgrade to their Developer tier ($50/mo) or switch to OKX Web3 RPC endpoints (free) to save up to **$220.00/mo**.`
  },
  {
    keywords: ['suspicious', 'anomaly', 'phishing', 'threats', 'alerts', 'danger'],
    answer: `There is **1 high-risk warning** and **2 medium-risk anomalies** this month:
1. **High Risk (Security)**: A transfer of 0.5 ETH ($1,585.00) on July 15 was sent to a known phishing/drainer address (\`0xbc9...ff12\`).
2. **Medium Risk (Duplicate)**: Two identical transfers of 50 USDT to QuickSwap within 3 seconds of each other on July 13.
3. **Medium Risk (Gas Spike)**: You paid $182.40 in gas fees for a single swap, which was 450% higher than average.

*Immediate Actions*:
- Revoke smart contract allowances for \`0xbc9...ff12\` immediately on [OKX Allowance Manager](https://okx.com/web3/approval).
- Review duplicate charges on QuickSwap.`
  },
  {
    keywords: ['help', 'what can you do', 'options', 'features'],
    answer: `I am your **OKX.AI Financial Copilot**. I can help you analyze your blockchain footprint. Ask me things like:
- *"Why did my spending increase this month?"*
- *"Show suspicious activity in my wallets."*
- *"List all my recurring subscriptions."*
- *"Explain the gas fee spike on July 14."*`
  }
];

export const getCopilotResponse = (message: string): string => {
  const normalized = message.toLowerCase();
  for (const item of copilotQA) {
    if (item.keywords.some(keyword => normalized.includes(keyword))) {
      return item.answer;
    }
  }
  return `I analyzed your query: "${message}". I couldn't find a exact matches in the database, but looking at your portfolios:
- Total Portfolio Balance is **$329,111.70** across 5 connected accounts.
- You have **1 unresolved high-priority alert** (phishing contract interaction of 0.5 ETH).
- Your net operational cashflow this month is **+$3,753.60** (excluding transfers).

Would you like me to highlight the *suspicious activity* or show *recurring subscriptions*?`;
};
