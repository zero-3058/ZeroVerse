import React, { useState } from 'react';
import { RefreshCw, ArrowUpRight } from 'lucide-react';
import { WalletCard } from '@/components/wallet/WalletCard';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { TransactionList } from '@/components/wallet/TransactionList';
import { useUser } from '@/contexts/UserContext';

// ShadCN UI components
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function WalletScreen() {
  const { user, refreshUser } = useUser();
  const { transactions } = useUser();

  const [open, setOpen] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConvert = async () => {
    setErrorMsg('');

    const amount = Number(pointsToConvert);

    if (!amount || amount < 200) {
      setErrorMsg("Minimum 200 points required (1 ZRC).");
      return;
    }

    if (amount > (user?.zero_points ?? 0)) {
      setErrorMsg("You don't have enough points.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/convertToZrc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_id: user?.tg_id,
          pointsToConvert: amount,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setErrorMsg(data.error || "Conversion failed");
      } else {
        await refreshUser();
        setOpen(false);
        setPointsToConvert('');
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    }

    setLoading(false);
  };

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
        <button
          className="btn-primary"
          onClick={() => setOpen(true)}
        >
          <RefreshCw className="w-4 h-4" />
          Convert to Zero
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
        <h2 className="text-lg font-semibold font-display mb-3">
          Transaction History
        </h2>
        <TransactionList transactions={transactions} />
      </section>

      {/* Convert Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Convert Points to ZeroCoin (ZRC)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <p className="text-muted-foreground text-sm">
              You have <span className="font-semibold">{user?.zero_points}</span> points.
            </p>

            <Input
              type="number"
              placeholder="Enter points to convert"
              value={pointsToConvert}
              onChange={(e) => setPointsToConvert(e.target.value)}
            />

            {errorMsg && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              className="btn-primary w-full"
              disabled={loading}
              onClick={handleConvert}
            >
              {loading ? "Converting..." : "Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
