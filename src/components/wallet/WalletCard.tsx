import React from 'react';
import { PointsIcon, TonIcon } from '@/components/icons/GameIcons';
import { useUser } from '@/contexts/UserContext';

export function WalletCard() {
  const { user } = useUser();
  const points = user?.zero_points ?? 0;
  const tonEquivalent = (points * 0.00001).toFixed(4);

  return (
    <div className="points-card animate-fade-in relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <PointsIcon className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground text-sm">Total Points</span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-bold font-display points-text">
            {points.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-lg">points</span>
        </div>
        
        <p className="text-muted-foreground mb-6">
          ≈ {tonEquivalent} TON
        </p>

        <div className="pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TonIcon className="w-6 h-6 text-blue-400" />
              <span className="text-muted-foreground">TON Balance</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Rate</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold font-display">0.0000 <span className="text-lg text-muted-foreground">TON</span></span>
            <span className="text-sm text-muted-foreground">10,000 pts = 1TON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
