import React from 'react';
import { PointsIcon } from '@/components/icons/GameIcons';
import { useUser } from '@/contexts/UserContext';

export function PointsDisplay() {
  const { user } = useUser();
  const points = user?.zero_points ?? 0;
  const tonEquivalent = (points * 0.00001).toFixed(4);

  return (
    <div className="points-card animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <PointsIcon className="w-5 h-5 text-primary" />
        <span className="text-muted-foreground text-sm">Total Zero Points</span>
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold font-display points-text">
          {points.toLocaleString()}
        </span>
        <span className="text-muted-foreground">points</span>
      </div>
      
      <p className="text-muted-foreground text-sm">
        ≈ {tonEquivalent} TON
      </p>
    </div>
  );
}
