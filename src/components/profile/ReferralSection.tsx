import React, { useState } from 'react';
import { Copy, Check, Users, Gift } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const BOT_NAME = 'ZeroVerseBot'; // Replace with actual bot name

export function ReferralSection() {
  const { user, transactions } = useUser();
  const [copied, setCopied] = useState(false);
  
  const tgId = user?.tg_id || '123456789';
  const referralLink = `https://t.me/${BOT_NAME}?start=${tgId}`;
  
  // Calculate referral stats
  const referralTransactions = transactions.filter(t => t.type === 'referral');
  const referralCount = referralTransactions.length;
  const referralEarnings = referralTransactions.reduce((sum, t) => sum + t.amount, 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Share it with your friends to earn 200 zero points each."
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold font-display">Invite Friends</h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="game-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold font-display">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Friends Invited</p>
          </div>
        </div>
        <div className="game-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold font-display points-text">{referralEarnings}</p>
            <p className="text-xs text-muted-foreground">Points Earned</p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="game-card">
        <p className="text-sm text-muted-foreground mb-2">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background rounded-lg px-3 py-2 text-sm font-mono truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="btn-primary py-2 px-4"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Earn <span className="points-text font-semibold">200 zero points</span> for each friend who joins!
        </p>
      </div>
    </div>
  );
}
