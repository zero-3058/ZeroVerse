import React from 'react';
import { RefreshCw, ArrowUpRight } from 'lucide-react';
import { WalletCard } from '@/components/wallet/WalletCard';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { TransactionList } from '@/components/wallet/TransactionList';
import { useUser } from '@/contexts/UserContext';

export function WalletScreen() {
  const { transactions } = useUser();

  return (
    <div className="pb-24 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold font-display mb-1">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings</p>
      </div>

      {/* Points Card */}
      <WalletCard />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-primary">
          <RefreshCw className="w-4 h-4" />
          Convert to TON
        </button>
        <button className="btn-secondary">
          <ArrowUpRight className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      {/* Connect Wallet */}
      <ConnectWallet />

      {/* Transaction History */}
      <section>
        <h2 className="text-lg font-semibold font-display mb-3">Transaction History</h2>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
}
