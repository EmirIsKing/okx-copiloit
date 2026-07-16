'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Wallet,
  Transaction,
  Alert,
  Insight,
  mockWallets,
  mockTransactions,
  mockAlerts,
  mockInsights,
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
  addChatMessage: (text: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  updateTransactionCategory: (txId: string, category: Transaction['category']) => void;
  toggleWalletConnection: (walletId: string) => void;
  dismissTransactionWarning: (txId: string) => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [activeWalletId, setActiveWalletIdState] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi there! I am your OKX.AI financial copilot. Ask me questions about your transaction patterns, RPC subscriptions, gas spikes, or suspicious operations.',
      timestamp: new Date()
    }
  ]);

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

  const addChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simulate typing delay
    setTimeout(() => {
      const responseText = getCopilotResponse(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
      )
    );
  };

  const updateTransactionCategory = (txId: string, category: Transaction['category']) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id === txId) {
          // If moving away from 'Security Risk', we can downgrade its risk level
          const newRisk = category === 'Security Risk' ? 'High' : tx.riskLevel === 'High' ? 'Medium' : tx.riskLevel;
          return { ...tx, category, riskLevel: newRisk };
        }
        return tx;
      })
    );
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
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === txId ? { ...tx, status: 'Completed', riskLevel: 'None' } : tx
      )
    );
    // Also acknowledge matching alerts
    setAlerts(prev =>
      prev.map(alert =>
        alert.transactionId === txId ? { ...alert, isAcknowledged: true } : alert
      )
    );
  };

  // Compute stats based on active/connected wallets
  const [portfolioStats, setPortfolioStats] = useState({
    totalValueUsd: 0,
    availableBalanceUsd: 0,
    change24hPercent: 0,
    change30dPercent: 0,
    monthlyInflowUsd: 0,
    monthlyOutflowUsd: 0,
  });

  useEffect(() => {
    const connectedWallets = wallets.filter(w => w.status === 'connected');
    const filteredByActive = activeWalletId
      ? connectedWallets.filter(w => w.id === activeWalletId)
      : connectedWallets;

    const totalVal = filteredByActive.reduce((sum, w) => sum + w.balanceUsd, 0);
    // Aave Yield or Cold vault might be less liquid, available balance represents web3 wallets and ledger liquid balances
    const available = filteredByActive
      .filter(w => w.chain !== 'DeFi' && w.chain !== 'Bitcoin')
      .reduce((sum, w) => sum + w.balanceUsd, 0);

    // Weighted performance
    const weightedPerf = totalVal > 0 
      ? filteredByActive.reduce((sum, w) => sum + (w.performance24h * w.balanceUsd), 0) / totalVal
      : 0;

    // Filter transactions associated with active connected wallets
    const walletIds = filteredByActive.map(w => w.id);
    const activeTxs = transactions.filter(tx => walletIds.includes(tx.walletId));

    // Calculate Inflows / Outflows
    const monthlyInflow = activeTxs
      .filter(tx => tx.type === 'inflow' && tx.status !== 'Flagged')
      .reduce((sum, tx) => sum + tx.amountUsd, 0);

    const monthlyOutflow = activeTxs
      .filter(tx => tx.type === 'outflow' && tx.status !== 'Flagged')
      .reduce((sum, tx) => sum + tx.amountUsd, 0);

    setPortfolioStats({
      totalValueUsd: totalVal,
      availableBalanceUsd: available || totalVal * 0.35, // default fallback if no liquid wallet
      change24hPercent: weightedPerf,
      change30dPercent: weightedPerf * 3.4, // Estimate 30d relative to 24h for visual context
      monthlyInflowUsd: monthlyInflow,
      monthlyOutflowUsd: monthlyOutflow,
    });
  }, [wallets, transactions, activeWalletId]);

  return (
    <AppContext.Provider
      value={{
        wallets,
        transactions,
        alerts,
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
