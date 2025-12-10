import React from 'react';
import { PointsIcon } from '@/components/icons/GameIcons';
import { useUser } from '@/contexts/UserContext';

export function WalletCard() {
  const { user } = useUser();
  const points = user?.zero_points ?? 0;

  // ZRC Conversion (200 pts = 1 ZRC)
  const zrcBalance = (points / 200).toFixed(2);

  return (
    <div className="space-y-3">
      {/* WALLET CARD */}
      <div className="points-card animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
        
        <div className="relative z-10">
          {/* Total Points */}
          <div className="flex items-center gap-2 mb-3">
            <PointsIcon className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground text-sm">Total Points</span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold font-display points-text">
              {points.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-lg">pts</span>
          </div>

          {/* ZRC BALANCE */}
          <p className="text-muted-foreground mb-6">
            ≈ {zrcBalance} ZRC
          </p>

          {/* ZeroCoin Details Section */}
          <div className="pt-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">ZRC</span>
                <span className="text-muted-foreground">ZeroCoin Balance</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Rate</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold font-display">
                {zrcBalance} <span className="text-lg text-muted-foreground">ZRC</span>
              </span>

              <span className="text-sm text-muted-foreground">
                200 pts = 1 ZRC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ ZRC LAUNCH DATE SECTION */}
      <p className="text-center text-muted-foreground text-sm animate-fade-in">
        🚀 Official ZeroCoin (ZRC) release on March 2026
      </p>
    </div>
  );
}
