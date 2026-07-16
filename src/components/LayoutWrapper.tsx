'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppProvider } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { CopilotChat } from './CopilotChat';
import { TransactionModal } from './TransactionModal';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <AppProvider>
        <main className="landing-layout-root" style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-primary)' }}>
          {children}
        </main>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
        <CopilotChat />
        <TransactionModal />
      </div>
    </AppProvider>
  );
};
