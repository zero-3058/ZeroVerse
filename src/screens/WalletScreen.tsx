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
  DialogOverlay
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function WalletScreen() {
  const { user, transactions, refreshUser } = useUser();

  // Convert modal state
  const [convertOpen, setConvertOpen] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertErrorMsg, setConvertErrorMsg] = useState('');

  // Withdraw modal state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState('');

  // ❗ EXTRA POPUP FOR LOCKED WITHDRAWAL
  const [infoPopup, setInfoPopup] = useState("");

  const handleConvert = async () => {
    setConvertErrorMsg('');

    const amount = Number(pointsToConvert);

    if (!amount || amount < 200) {
      setConvertErrorMsg('Minimum 200 points required (1 ZRC).');
      return;
    }

    if (amount > (user?.zero_points ?? 0)) {
      setConvertErrorMsg("You don't have enough points.");
      return;
    }

    setConvertLoading(true);

    try {
      const res = await fetch('/api/convertToZrc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tg_id: user?.tg_id,
          pointsToConvert: amount,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setConvertErrorMsg(data.error || 'Conversion failed');
      } else {
        await refreshUser();
        setConvertOpen(false);
        setPointsToConvert('');
      }
    } catch (err) {
      setConvertErrorMsg('Something went wrong.');
    }

    setConvertLoading(false);
  };

  // ⭐ NEW WITHDRAW VALIDATION
  const beforeOpenWithdraw = () => {
    const wallet = user?.ton_wallet_address;
    const zrcLaunchDate = new Date("2026-03-01");
    const today = new Date();

    // 1️⃣ Wallet Not Connected
    if (!wallet) {
      setInfoPopup("Please connect your TON wallet to withdraw ZRC.");
      return;
    }

    // 2️⃣ Coin Not Launched Yet
    if (today < zrcLaunchDate) {
      setInfoPopup("Withdrawals will open after ZeroCoin (ZRC) launches in March 2026.");
      return;
    }

    // ✔ Allowed
    setWithdrawOpen(true);
  };

  const handleWithdraw = async () => {
    setWithdrawErrorMsg('');

    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      setWithdrawErrorMsg('Enter a valid amount (minimum 1 ZRC).');
      return;
    }

    if (amount < 1) {
      setWithdrawErrorMsg('Minimum withdrawal is 1 ZRC.');
      return;
    }

    if (amount > (user?.zrc_balance ?? 0)) {
      setWithdrawErrorMsg("You don't have enough ZRC.");
      return;
    }

    setWithdrawLoading(true);

    try {
      const res = await fetch('/api/createWithdrawRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tg_id: user?.tg_id,
          zrcAmount: amount,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setWithdrawErrorMsg(data.error || 'Withdrawal failed');
      } else {
        await refreshUser();
        setWithdrawOpen(false);
        setWithdrawAmount('');
      }
    } catch (err) {
      setWithdrawErrorMsg('Something went wrong.');
    }

    setWithdrawLoading(false);
  };

  const zrcBalance = user?.zrc_balance ?? 0;
  const walletAddress = user?.ton_wallet_address ?? 'Not connected';

  return (
    <div className="pb-24 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold font-display mb-1">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings</p>
      </div>

      {/* Points / ZRC Card */}
      <WalletCard />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-primary" onClick={() => setConvertOpen(true)}>
          <RefreshCw className="w-4 h-4" />
          Convert to Zero(ZRC)
        </button>

        <button className="btn-secondary" onClick={beforeOpenWithdraw}>
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

      {/* Convert Modal */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Convert Points to ZeroCoin (ZRC)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <p className="text-muted-foreground text-sm">
              You have <span className="font-semibold">{user?.zero_points ?? 0}</span> points.
            </p>

            <p className="text-muted-foreground text-xs">
              Rate: <span className="font-semibold">200 pts = 1 ZRC</span>
            </p>

            <Input
              type="number"
              placeholder="Enter points to convert"
              value={pointsToConvert}
              onChange={(e) => setPointsToConvert(e.target.value)}
            />

            {convertErrorMsg && (
              <p className="text-red-500 text-sm">{convertErrorMsg}</p>
            )}
          </div>

          <DialogFooter>
            <Button className="btn-primary w-full" disabled={convertLoading} onClick={handleConvert}>
              {convertLoading ? 'Converting...' : 'Convert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Withdraw ZeroCoin (ZRC)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <p className="text-muted-foreground text-sm">
              ZRC Balance: <span className="font-semibold">{zrcBalance.toFixed(2)} ZRC</span>
            </p>

            <p className="text-muted-foreground text-xs">
              Minimum withdrawal: <span className="font-semibold">1 ZRC</span>
            </p>

            <p className="text-muted-foreground text-xs">
              Connected Wallet:{' '}
              <span className="font-mono text-xs">{walletAddress || 'Not connected'}</span>
            </p>

            <Input
              type="number"
              placeholder="Enter ZRC to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />

            {withdrawErrorMsg && (
              <p className="text-red-500 text-sm">{withdrawErrorMsg}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              className="btn-secondary w-full"
              disabled={withdrawLoading}
              onClick={handleWithdraw}
            >
              {withdrawLoading ? 'Submitting...' : 'Submit Withdrawal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INFO POPUP (NO WALLET / NOT LAUNCHED) */}
      <Dialog open={!!infoPopup} onOpenChange={() => setInfoPopup("")}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Notice</DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground">{infoPopup}</p>

          <DialogFooter>
            <Button className="btn-primary w-full" onClick={() => setInfoPopup("")}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
