import React, { useEffect, useState } from 'react';
import { Wallet, Unplug, Copy, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { tonConnectUI } from '@/ton-connect';

export function ConnectWallet() {
  const { user, setWalletAddress } = useUser();
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Listen to wallet connection events
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        setWalletAddress(wallet.account.address);
        toast({
          title: "Wallet Connected",
          description: "Your TON wallet has been linked successfully.",
        });
      }
    });
    return unsubscribe;
  }, [setWalletAddress]);

  const handleConnect = async () => {
    setIsConnecting(true);
    await tonConnectUI.openModal(); // 💥 This opens the correct wallet modal
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setWalletAddress("");

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been unlinked.",
    });
  };

  const copyAddress = () => {
    if (user?.ton_wallet_address) {
      navigator.clipboard.writeText(user.ton_wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (user?.ton_wallet_address) {
    return (
      <div className="space-y-3">
        <div className="game-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="font-mono text-sm break-all">{user.ton_wallet_address}</p>
              </div>
            </div>
            <button
              onClick={copyAddress}
              className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button onClick={handleDisconnect} className="btn-secondary w-full">
          <Unplug className="w-4 h-4" />
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="btn-wallet w-full"
    >
      <Wallet className="w-5 h-5" />
      {isConnecting ? "Connecting..." : "Connect TON Wallet"}
    </button>
  );
}
