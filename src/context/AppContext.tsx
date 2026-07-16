'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Wallet,
  Transaction,
  Alert,
  Insight,
  getCopilotResponse
} from '../data/mockData';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface TransactionFilters {
  searchQuery: string;
  walletId: string; // 'all' or specific id
  category: string; // 'all' or specific
  type: string; // 'all', 'inflow', 'outflow'
  status: string; // 'all', 'Completed', 'Pending', 'Flagged'
  isRecurring: string; // 'all', 'yes', 'no'
  riskLevel: string; // 'all', 'None', 'Low', 'Medium', 'High'
  minAmount: number | '';
  maxAmount: number | '';
}

export interface SystemSettings {
  gasThreshold: number;
  largeTransferLimit: number;
  alchemyUrl: string;
  infuraKey: string;
  etherscanKey: string;
  geminiKey: string;
  notifyLargeTransfer: boolean;
  notifyPhishing: boolean;
  notifyDuplicate: boolean;
  notifyGasSpike: boolean;
}

export interface Web3WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balanceEth: number;
  balanceUsd: number;
  isConnecting: boolean;
  error: string | null;
}

interface AppContextType {
  wallets: Wallet[];
  transactions: Transaction[];
  alerts: Alert[];
  insights: Insight[];
  chatMessages: ChatMessage[];
  activeWalletId: string | null; // null means 'all wallets'
  selectedTransactionId: string | null;
  filters: TransactionFilters;
  portfolioStats: {
    totalValueUsd: number;
    availableBalanceUsd: number;
    change24hPercent: number;
    change30dPercent: number;
    monthlyInflowUsd: number;
    monthlyOutflowUsd: number;
  };
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  resetFilters: () => void;
  setActiveWalletId: (id: string | null) => void;
  setSelectedTransactionId: (id: string | null) => void;
  addChatMessage: (text: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
  updateTransactionCategory: (txId: string, category: Transaction['category']) => void;
  toggleWalletConnection: (walletId: string) => void;
  dismissTransactionWarning: (txId: string) => void;

  // Real Web3 Settings & Connection
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  web3State: Web3WalletState;
  connectWeb3: () => Promise<void>;
  disconnectWeb3: () => void;
  liveGasPrice: number | null;
  isLoadingTxs: boolean;
}

const defaultFilters: TransactionFilters = {
  searchQuery: '',
  walletId: 'all',
  category: 'all',
  type: 'all',
  status: 'all',
  isRecurring: 'all',
  riskLevel: 'all',
  minAmount: '',
  maxAmount: '',
};

// RPC helper to get native balance
async function fetchEthBalance(address: string, rpcUrl: string): Promise<number> {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });
    const json = await res.json();
    if (json.result) {
      const wei = BigInt(json.result);
      return Number(wei) / 1e18; // Wei to ETH
    }
  } catch (err) {
    console.error('Error fetching balance from RPC:', err);
  }
  return 0;
}

// RPC helper to get network gas price
async function fetchGasPrice(rpcUrl: string): Promise<number> {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 2,
      }),
    });
    const json = await res.json();
    if (json.result) {
      const wei = BigInt(json.result);
      return Number(wei / BigInt(1000000000)); // Wei to Gwei
    }
  } catch (err) {
    console.error('Error fetching gas price from RPC:', err);
  }
  return 0;
}

// Explorer API helper to fetch transactions
async function fetchTransactionsFromEtherscan(address: string, apiKey: string): Promise<any[]> {
  try {
    // Etherscan allows queries without API key at a low rate limit
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc${
      apiKey ? `&apikey=${apiKey}` : ''
    }`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === '1' && Array.isArray(json.result)) {
      return json.result;
    }
  } catch (err) {
    console.error('Error fetching Etherscan transactions:', err);
  }
  return [];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activeWalletId, setActiveWalletIdState] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi there! I am your OKX.AI financial copilot. Ask me questions about your transaction patterns, RPC subscriptions, gas spikes, or suspicious operations.',
      timestamp: new Date('2026-07-16T12:00:00Z')
    }
  ]);

  // Systems Configurations & API credentials
  const [settings, setSettings] = useState<SystemSettings>({
    gasThreshold: 80,
    largeTransferLimit: 10000,
    alchemyUrl: '',
    infuraKey: '',
    etherscanKey: '',
    geminiKey: '',
    notifyLargeTransfer: true,
    notifyPhishing: true,
    notifyDuplicate: true,
    notifyGasSpike: true,
  });

  // Real connected Web3 wallet state
  const [web3State, setWeb3State] = useState<Web3WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balanceEth: 0,
    balanceUsd: 0,
    isConnecting: false,
    error: null,
  });

  const [liveGasPrice, setLiveGasPrice] = useState<number | null>(null);
  const [isLoadingTxs, setIsLoadingTxs] = useState<boolean>(false);
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);
  const [dynamicAlerts, setDynamicAlerts] = useState<Alert[]>([]);

  // 1. SSR-safe LocalStorage initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('okx_copilot_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error(e);
        }
      }

      const savedSession = localStorage.getItem('okx_copilot_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.isConnected && session.address) {
            setWeb3State(prev => ({
              ...prev,
              isConnected: true,
              address: session.address,
              chainId: session.chainId || 1,
            }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('okx_copilot_settings', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // 2. Query Live Gas Price
  useEffect(() => {
    const getGas = async () => {
      const rpc = settings.alchemyUrl || 'https://cloudflare-eth.com';
      const price = await fetchGasPrice(rpc);
      if (price > 0) {
        setLiveGasPrice(price);
      }
    };
    getGas();
    const interval = setInterval(getGas, 20000);
    return () => clearInterval(interval);
  }, [settings.alchemyUrl]);

  // 3. Query Live Balance
  useEffect(() => {
    if (!web3State.isConnected || !web3State.address) return;

    const getBalance = async () => {
      const rpc = settings.alchemyUrl || 'https://cloudflare-eth.com';
      const ethVal = await fetchEthBalance(web3State.address!, rpc);
      const usdVal = ethVal * 3100; // Mock conversion
      setWeb3State(prev => ({
        ...prev,
        balanceEth: ethVal,
        balanceUsd: usdVal,
      }));
    };

    getBalance();
    const interval = setInterval(getBalance, 15000);
    return () => clearInterval(interval);
  }, [web3State.isConnected, web3State.address, settings.alchemyUrl]);

  // 4. Fetch real connected transactions from Etherscan
  useEffect(() => {
    if (!web3State.isConnected || !web3State.address) {
      setRealTransactions([]);
      return;
    }

    const loadTxs = async () => {
      setIsLoadingTxs(true);
      // Prefer .env key, fall back to settings
      const etherscanKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || settings.etherscanKey;
      const txs = await fetchTransactionsFromEtherscan(web3State.address!, etherscanKey);
      if (txs.length > 0) {
        const mapped = txs.map((tx: any) => {
          const isOutflow = tx.from.toLowerCase() === web3State.address!.toLowerCase();
          const valueEth = parseFloat(tx.value) / 1e18;
          const amountUsd = valueEth * 3100;
          const gasPriceGwei = parseInt(tx.gasPrice) / 1e9;
          const gasUsed = parseInt(tx.gasUsed);
          const gasFeeUsd = (gasUsed * parseInt(tx.gasPrice) / 1e18) * 3100;

          let category: Transaction['category'] = 'Other';
          let desc = 'Contract Interaction';
          if (tx.input === '0x') {
            desc = isOutflow ? `Transfer to ${tx.to.substring(0, 6)}...` : 'Received Native Token';
            category = isOutflow ? 'Transfers' : 'Income';
          } else {
            desc = `Contract Execution (${tx.to.substring(0, 6)}...)`;
            category = 'Trading';
          }

          if (gasPriceGwei > 150) {
            category = 'Gas Fees';
          }

          return {
            id: tx.hash,
            hash: `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            description: desc,
            category,
            type: isOutflow ? 'outflow' : 'inflow',
            amountUsd: category === 'Gas Fees' ? gasFeeUsd : amountUsd,
            amountCrypto: valueEth,
            cryptoSymbol: 'ETH',
            walletId: 'w-connected',
            status: tx.isError === '0' ? 'Completed' : 'Flagged',
            isRecurring: false,
            riskLevel: gasPriceGwei > settings.gasThreshold ? 'Medium' : amountUsd >= settings.largeTransferLimit ? 'Low' : 'None',
            tags: tx.input !== '0x' ? ['Contract Call'] : ['Transfer'],
            explanation: `On-chain transaction processed on Ethereum. Gas paid was ${gasPriceGwei.toFixed(0)} Gwei. Total gas fee spent: $${gasFeeUsd.toFixed(2)}.`,
            recommendedAction: gasPriceGwei > settings.gasThreshold ? 'Gas fee was abnormally high. Consider deploying transactions during lower-congestion windows.' : undefined,
            gasGwei: gasPriceGwei
          } as Transaction;
        });
        setRealTransactions(mapped);
      }
      setIsLoadingTxs(false);
    };

    loadTxs();
  }, [web3State.isConnected, web3State.address, settings.etherscanKey, settings.gasThreshold, settings.largeTransferLimit]);

  // 5. Connect Browser Wallet (OKX / MetaMask / EIP-1193)
  const connectWeb3 = async () => {
    if (typeof window === 'undefined') return;
    setWeb3State(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      const provider = (window as any).okxwallet?.ethereum || (window as any).ethereum;
      if (!provider) {
        throw new Error('No browser wallet detected. Please install OKX Wallet Extension.');
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts authorized.');
      }

      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const address = accounts[0];

      setWeb3State({
        isConnected: true,
        address,
        chainId,
        balanceEth: 0,
        balanceUsd: 0,
        isConnecting: false,
        error: null,
      });

      localStorage.setItem('okx_copilot_session', JSON.stringify({
        isConnected: true,
        address,
        chainId,
      }));

      // Listeners
      provider.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          disconnectWeb3();
        } else {
          setWeb3State(prev => ({ ...prev, address: newAccounts[0] }));
        }
      });

      provider.on('chainChanged', (newChainIdHex: string) => {
        const newChainId = parseInt(newChainIdHex, 16);
        setWeb3State(prev => ({ ...prev, chainId: newChainId }));
      });

    } catch (err: any) {
      setWeb3State(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Connection failed'
      }));
    }
  };

  const disconnectWeb3 = () => {
    setWeb3State({
      isConnected: false,
      address: null,
      chainId: null,
      balanceEth: 0,
      balanceUsd: 0,
      isConnecting: false,
      error: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('okx_copilot_session');
    }
  };

  const setActiveWalletId = (id: string | null) => {
    setActiveWalletIdState(id);
    setFilters(prev => ({ ...prev, walletId: id || 'all' }));
  };

  const resetFilters = () => {
    setFilters({
      ...defaultFilters,
      walletId: activeWalletId || 'all'
    });
  };

  // 6. Dynamic Alert Generator
  useEffect(() => {
    const generated: Alert[] = [];
    const activeTxs = [...realTransactions];

    activeTxs.forEach((tx) => {
      // 6.1 Large Transfer Alerts
      if (
        settings.notifyLargeTransfer &&
        tx.type === 'outflow' &&
        tx.amountUsd >= settings.largeTransferLimit &&
        tx.status !== 'Flagged'
      ) {
        generated.push({
          id: `alert-dyn-large-${tx.id}`,
          type: 'large_transfer',
          title: 'Large Transfer Alert',
          description: `Outbound transfer of ${tx.amountCrypto.toFixed(3)} ${tx.cryptoSymbol} ($${tx.amountUsd.toLocaleString()}) exceeds your configured large transfer limit ($${settings.largeTransferLimit.toLocaleString()}).`,
          severity: tx.amountUsd > settings.largeTransferLimit * 3 ? 'medium' : 'low',
          transactionId: tx.id,
          timestamp: tx.timestamp,
          isAcknowledged: false,
        });
      }

      // 6.2 Gas Spike Alerts
      const gweiVal = tx.gasGwei;
      if (
        settings.notifyGasSpike &&
        gweiVal &&
        gweiVal > settings.gasThreshold
      ) {
        generated.push({
          id: `alert-dyn-gas-${tx.id}`,
          type: 'gas_spike',
          title: 'Abnormally High Gas Fee Paid',
          description: `You paid ${gweiVal.toFixed(0)} Gwei in gas fees for this swap, which exceeds your settings threshold of ${settings.gasThreshold} Gwei.`,
          severity: 'medium',
          transactionId: tx.id,
          timestamp: tx.timestamp,
          isAcknowledged: false,
        });
      }

      // 6.3 Phishing Contract Alerts
      if (
        settings.notifyPhishing &&
        tx.category === 'Security Risk' &&
        tx.status === 'Flagged'
      ) {
        generated.push({
          id: `alert-dyn-phish-${tx.id}`,
          type: 'suspicious_address',
          title: 'High Risk Address Interaction',
          description: `Transfer made to a flagged drainer address. Revoke contract permissions immediately on OKX firewall settings.`,
          severity: 'high',
          transactionId: tx.id,
          timestamp: tx.timestamp,
          isAcknowledged: false,
        });
      }
    });

    setDynamicAlerts(generated);
  }, [transactions, realTransactions, settings]);

  const combinedAlerts = [...alerts, ...dynamicAlerts].map(alert => {
    if (acknowledgedAlertIds.includes(alert.id)) {
      return { ...alert, isAcknowledged: true };
    }
    return alert;
  });

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
      )
    );
    setAcknowledgedAlertIds(prev => [...prev, alertId]);
  };

  const updateTransactionCategory = (txId: string, category: Transaction['category']) => {
    const updateFunc = (tx: Transaction) => {
      if (tx.id === txId) {
        const newRisk: Transaction['riskLevel'] = category === 'Security Risk' ? 'High' : tx.riskLevel === 'High' ? 'Medium' : tx.riskLevel;
        return { ...tx, category, riskLevel: newRisk };
      }
      return tx;
    };
    setTransactions(prev => prev.map(updateFunc));
    setRealTransactions(prev => prev.map(updateFunc));
  };

  const toggleWalletConnection = (walletId: string) => {
    setWallets(prev =>
      prev.map(w =>
        w.id === walletId
          ? { ...w, status: w.status === 'connected' ? 'disconnected' : 'connected' }
          : w
      )
    );
  };

  const dismissTransactionWarning = (txId: string) => {
    const updateFunc = (tx: Transaction) =>
      tx.id === txId ? { ...tx, status: 'Completed' as const, riskLevel: 'None' as const } : tx;
    setTransactions(prev => prev.map(updateFunc));
    setRealTransactions(prev => prev.map(updateFunc));

    // Also acknowledge matching alerts
    combinedAlerts.forEach(alert => {
      if (alert.transactionId === txId) {
        acknowledgeAlert(alert.id);
      }
    });
  };

  // 7. Gemini-powered Copilot — builds live context and calls the API
  const addChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Show a typing indicator
    const thinkingId = `bot-thinking-${Date.now()}`;
    setChatMessages(prev => [...prev, {
      id: thinkingId,
      sender: 'bot',
      text: '...',
      timestamp: new Date(),
    }]);

    let responseText = '';

    // Prefer .env key, fall back to user-entered key from Settings
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || settings.geminiKey;

    if (!geminiKey) {
      responseText = `I need a **Gemini API key** to respond intelligently. Please go to **Settings** and paste your key from [Google AI Studio](https://aistudio.google.com/app/apikey) into the "Gemini API Key" field, then save.`;
    } else {
      try {
        // Build rich system context from live wallet state
        const activeAlertsCount = combinedAlerts.filter(a => !a.isAcknowledged).length;
        const totalGasSpent = realTransactions
          .filter(tx => tx.category === 'Gas Fees')
          .reduce((s, tx) => s + tx.amountUsd, 0);
        const recentTxSummary = realTransactions.slice(0, 5).map(tx =>
          `- ${tx.description}: ${tx.type === 'inflow' ? '+' : '-'}$${tx.amountUsd.toFixed(2)} (${tx.category}, ${tx.status})`
        ).join('\n');

        const systemPrompt = `You are OKX.AI Copilot, an expert Web3 financial analyst embedded in the OKX Financial Copilot app.

## User's Live Wallet State
- **Wallet Connected**: ${web3State.isConnected ? 'Yes' : 'No'}
- **Address**: ${web3State.address || 'Not connected'}
- **Network**: ${web3State.chainId === 1 ? 'Ethereum Mainnet' : web3State.chainId === 137 ? 'Polygon' : web3State.chainId === 56 ? 'BNB Chain' : web3State.chainId ? `Chain ID ${web3State.chainId}` : 'Unknown'}
- **ETH Balance**: ${web3State.balanceEth.toFixed(6)} ETH (~$${web3State.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })})
- **Total Portfolio Value**: $${portfolioStats.totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- **Total Inflows**: $${portfolioStats.monthlyInflowUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- **Total Outflows**: $${portfolioStats.monthlyOutflowUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- **Total Transactions**: ${realTransactions.length}
- **Total Gas Spent**: $${totalGasSpent.toFixed(2)}
- **Live Gas Price**: ${liveGasPrice ? `${liveGasPrice} Gwei` : 'Unavailable'}
- **Gas Alert Threshold**: ${settings.gasThreshold} Gwei
- **Unresolved Security Alerts**: ${activeAlertsCount}

## Recent Transactions (last 5)
${recentTxSummary || 'No transactions loaded yet.'}

## Active Security Alerts
${combinedAlerts.filter(a => !a.isAcknowledged).slice(0, 3).map(a => `- [${a.severity.toUpperCase()}] ${a.title}: ${a.description}`).join('\n') || 'None'}

## Instructions
- Be concise, helpful, and specific to the user's actual data above.
- Use markdown: **bold**, bullet lists, \`inline code\` for addresses/hashes.
- If the user asks something you cannot answer from the data, say so clearly.
- Do not make up data. If wallet is not connected, advise the user to connect first.
- Speak as a professional Web3 financial advisor, not a generic chatbot.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          const msg = err?.error?.message || `API error ${res.status}`;
          if (res.status === 400 && msg.includes('API_KEY')) {
            responseText = `❌ **Invalid Gemini API Key.** Please check your key in **Settings**. Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).`;
          } else {
            responseText = `❌ Gemini error: ${msg}`;
          }
        } else {
          const data = await res.json();
          responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text
            || 'No response from Gemini. Please try again.';
        }
      } catch (err: any) {
        responseText = `❌ Failed to reach Gemini API: ${err.message}. Check your internet connection.`;
      }
    }

    // Replace the thinking indicator with the real response
    setChatMessages(prev =>
      prev.map(msg =>
        msg.id === thinkingId
          ? { ...msg, text: responseText, timestamp: new Date() }
          : msg
      )
    );
  };

  // 8. Dynamic Portfolio Stats computations
  const [portfolioStats, setPortfolioStats] = useState({
    totalValueUsd: 0,
    availableBalanceUsd: 0,
    change24hPercent: 0,
    change30dPercent: 0,
    monthlyInflowUsd: 0,
    monthlyOutflowUsd: 0,
  });

  useEffect(() => {
    const connectedWalletObj: Wallet | null = web3State.isConnected && web3State.address
      ? {
          id: 'w-connected',
          name: 'OKX Connected Wallet',
          chain: web3State.chainId === 1 ? 'Ethereum' : 'OKX Chain',
          address: `${web3State.address.substring(0, 6)}...${web3State.address.substring(web3State.address.length - 4)}`,
          balanceUsd: web3State.balanceUsd,
          balanceCrypto: web3State.balanceEth,
          symbol: web3State.chainId === 1 ? 'ETH' : 'OKB',
          color: '#2563EB',
          performance24h: 1.82,
          status: 'connected',
        }
      : null;

    const allActiveWallets = connectedWalletObj
      ? [...wallets, connectedWalletObj]
      : wallets;

    const connectedWallets = allActiveWallets.filter(w => w.status === 'connected');
    const filteredByActive = activeWalletId
      ? connectedWallets.filter(w => w.id === activeWalletId)
      : connectedWallets;

    const totalVal = filteredByActive.reduce((sum, w) => sum + w.balanceUsd, 0);
    const available = filteredByActive
      .filter(w => w.chain !== 'DeFi' && w.chain !== 'Bitcoin')
      .reduce((sum, w) => sum + w.balanceUsd, 0);

    const weightedPerf = totalVal > 0 
      ? filteredByActive.reduce((sum, w) => sum + (w.performance24h * w.balanceUsd), 0) / totalVal
      : 0;

    const walletIds = filteredByActive.map(w => w.id);
    const activeTxs = realTransactions.filter(tx => walletIds.includes(tx.walletId));

    const monthlyInflow = activeTxs
      .filter(tx => tx.type === 'inflow' && tx.status !== 'Flagged')
      .reduce((sum, tx) => sum + tx.amountUsd, 0);

    const monthlyOutflow = activeTxs
      .filter(tx => tx.type === 'outflow' && tx.status !== 'Flagged')
      .reduce((sum, tx) => sum + tx.amountUsd, 0);

    setPortfolioStats({
      totalValueUsd: totalVal,
      availableBalanceUsd: available || totalVal * 0.35,
      change24hPercent: weightedPerf,
      change30dPercent: weightedPerf * 3.4,
      monthlyInflowUsd: monthlyInflow,
      monthlyOutflowUsd: monthlyOutflow,
    });
  }, [wallets, transactions, realTransactions, activeWalletId, web3State]);

  // Build live wallets from real connected wallet only (no mock data)
  const liveWallets: Wallet[] = web3State.isConnected && web3State.address
    ? [
        {
          id: 'w-connected',
          name: 'Connected Wallet',
          chain: (web3State.chainId === 1 ? 'Ethereum' : web3State.chainId === 137 ? 'OKX Chain' : 'OKX Chain') as Wallet['chain'],
          address: `${web3State.address.substring(0, 6)}...${web3State.address.substring(web3State.address.length - 4)}`,
          balanceUsd: web3State.balanceUsd,
          balanceCrypto: web3State.balanceEth,
          symbol: web3State.chainId === 1 ? 'ETH' : 'OKB',
          color: '#2563EB',
          performance24h: 0,
          status: 'connected' as const,
        }
      ]
    : [];

  return (
    <AppContext.Provider
      value={{
        wallets: liveWallets,
        transactions: realTransactions,
        alerts: combinedAlerts,
        insights,
        chatMessages,
        activeWalletId,
        selectedTransactionId,
        filters,
        portfolioStats,
        setFilters,
        resetFilters,
        setActiveWalletId,
        setSelectedTransactionId,
        addChatMessage,
        acknowledgeAlert,
        updateTransactionCategory,
        toggleWalletConnection,
        dismissTransactionWarning,

        settings,
        updateSettings,
        web3State,
        connectWeb3,
        disconnectWeb3,
        liveGasPrice,
        isLoadingTxs
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

